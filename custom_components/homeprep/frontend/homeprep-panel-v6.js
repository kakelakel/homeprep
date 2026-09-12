import "./homeprep-panel-v5.js?v=5";

const HomePrepPanel = customElements.get("homeprep-panel");

if (HomePrepPanel) {
  const oldLoadData = HomePrepPanel.prototype.loadData;
  HomePrepPanel.prototype.loadData = async function loadData() {
    await oldLoadData.call(this);
    if (!this._hass || !this._loaded) return;

    try {
      const notifications = await this._hass.callWS({ type: "homeprep/notifications" });
      this._notificationSettings = notifications.settings || {};
      this._notificationTargets = notifications.targets || [];
      this._notificationError = null;
    } catch (error) {
      console.error("HomePrep notifications load failed", error);
      this._notificationError = error;
      this._notificationSettings = this._notificationSettings || {};
      this._notificationTargets = this._notificationTargets || [];
    }

    this.render();
  };

  const oldHandleSubmit = HomePrepPanel.prototype.handleSubmit;
  HomePrepPanel.prototype.handleSubmit = async function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "hp-notification-form") {
      return oldHandleSubmit.call(this, event);
    }

    event.preventDefault();
    const data = new FormData(form);
    const settings = {
      enabled: data.get("notifications_enabled") === "on",
      targets: data.getAll("notification_target").map(String),
      expiry_warning_days: Number(data.get("expiry_warning_days") || 30),
      events: {
        inventory_expiring: data.get("event_inventory_expiring") === "on",
        inventory_expired: data.get("event_inventory_expired") === "on",
        task_reminder: data.get("event_task_reminder") === "on",
        task_due: data.get("event_task_due") === "on",
        task_overdue: data.get("event_task_overdue") === "on",
      },
    };

    try {
      this._notificationSettings = await this._hass.callWS({
        type: "homeprep/notifications/update",
        settings,
      });
      this.render();
    } catch (error) {
      console.error("HomePrep notification settings failed", error);
      alert(`HomePrep: ${error?.message || error}`);
    }
  };

  const oldHandleClick = HomePrepPanel.prototype.handleClick;
  HomePrepPanel.prototype.handleClick = async function handleClick(event) {
    const target = event.composedPath().find(
      (el) => el instanceof HTMLElement && el.dataset?.action === "test-notification"
    );

    if (!target) return oldHandleClick.call(this, event);

    target.disabled = true;
    try {
      const result = await this._hass.callWS({ type: "homeprep/notifications/test" });
      if (result.sent > 0) {
        alert(`HomePrep test notification sent to ${result.sent} recipient${result.sent === 1 ? "" : "s"}.`);
      } else {
        alert("HomePrep could not send a test notification. Select and save at least one available recipient first.");
      }
    } catch (error) {
      console.error("HomePrep test notification failed", error);
      alert(`HomePrep: ${error?.message || error}`);
    } finally {
      target.disabled = false;
    }
  };

  const oldRenderSettings = HomePrepPanel.prototype.renderSettings;
  HomePrepPanel.prototype.renderSettings = function renderSettings() {
    const appearance = oldRenderSettings.call(this);
    const settings = this._notificationSettings || {
      enabled: false,
      targets: [],
      expiry_warning_days: 30,
      events: {},
    };
    const selectedTargets = new Set(settings.targets || []);
    const events = settings.events || {};
    const targets = this._notificationTargets || [];

    const recipients = targets.length
      ? `<div class="notification-targets">${targets.map((notificationTarget) => `
          <label class="notification-choice">
            <input type="checkbox" name="notification_target" value="${this.esc(notificationTarget.id)}" ${selectedTargets.has(notificationTarget.id) ? "checked" : ""}>
            <span><strong>${this.esc(notificationTarget.label)}</strong><small>notify.${this.esc(notificationTarget.id)}</small></span>
          </label>`).join("")}</div>`
      : `<div class="hint notification-empty">No notification recipients were found. Connect the Home Assistant Companion App on a phone or add a notify service, then refresh HomePrep.</div>`;

    return `${appearance}
      <div class="page-title notification-title"><div><h2>Notifications</h2><p>Choose what HomePrep should notify you about and which Home Assistant notification targets should receive it.</p></div></div>
      <section class="panel-card form-card notification-card">
        <form id="hp-notification-form">
          <label class="notification-master"><input type="checkbox" name="notifications_enabled" ${settings.enabled ? "checked" : ""}><span><strong>Enable HomePrep notifications</strong><small>HomePrep checks inventory and tasks in the background and avoids sending the same event repeatedly.</small></span></label>

          <div class="notification-section">
            <h3>Recipients</h3>
            ${recipients}
          </div>

          <div class="notification-grid">
            <div class="notification-section">
              <h3>Inventory</h3>
              <label class="notification-choice"><input type="checkbox" name="event_inventory_expiring" ${events.inventory_expiring !== false ? "checked" : ""}><span><strong>Expiring soon</strong><small>Notify before an inventory item's expiry date.</small></span></label>
              <label class="notification-choice"><input type="checkbox" name="event_inventory_expired" ${events.inventory_expired !== false ? "checked" : ""}><span><strong>Expired</strong><small>Notify when an inventory item has passed its expiry date.</small></span></label>
              <label class="notification-days"><span>Expiring-soon window</span><div><input type="number" name="expiry_warning_days" min="1" max="365" value="${this.esc(settings.expiry_warning_days ?? 30)}"><span>days</span></div></label>
            </div>

            <div class="notification-section">
              <h3>Tasks & inspections</h3>
              <label class="notification-choice"><input type="checkbox" name="event_task_reminder" ${events.task_reminder !== false ? "checked" : ""}><span><strong>Reminder</strong><small>Uses each task's own “reminder before due” setting.</small></span></label>
              <label class="notification-choice"><input type="checkbox" name="event_task_due" ${events.task_due !== false ? "checked" : ""}><span><strong>Due today</strong><small>Notify on the task's due date.</small></span></label>
              <label class="notification-choice"><input type="checkbox" name="event_task_overdue" ${events.task_overdue !== false ? "checked" : ""}><span><strong>Overdue</strong><small>Notify once when a task becomes overdue.</small></span></label>
            </div>
          </div>

          <div class="actions notification-actions">
            <button type="submit" class="primary">Save notification settings</button>
            <button type="button" data-action="test-notification">Send test notification</button>
          </div>
        </form>
      </section>`;
  };

  const oldStyles = HomePrepPanel.prototype.styles;
  HomePrepPanel.prototype.styles = function styles() {
    return `${oldStyles.call(this)}
      .notification-title{margin-top:26px}.notification-card{max-width:none}.notification-master,.notification-choice{display:flex;align-items:flex-start;gap:10px;cursor:pointer}.notification-master{padding:12px;border:1px solid var(--hp-panel-border);border-radius:11px;background:color-mix(in srgb,var(--hp-panel-accent) 5%,transparent)}.notification-master input,.notification-choice input{width:auto;margin-top:2px;accent-color:var(--hp-panel-accent)}.notification-master span,.notification-choice span{display:flex;flex-direction:column;gap:2px}.notification-master strong,.notification-choice strong{font-size:11px}.notification-master small,.notification-choice small{font-size:8px;color:var(--hp-panel-muted)}.notification-section{margin-top:18px}.notification-section h3{font-size:12px;margin-bottom:10px}.notification-targets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.notification-choice{padding:9px 10px;border:1px solid var(--hp-panel-border);border-radius:9px}.notification-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.notification-grid .notification-section{display:flex;flex-direction:column;gap:7px}.notification-grid .notification-section h3{margin-bottom:3px}.notification-days{margin-top:2px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;border:1px solid var(--hp-panel-border);border-radius:9px}.notification-days>span{font-size:10px}.notification-days div{display:flex;align-items:center;gap:6px}.notification-days input{width:72px;padding:7px 8px;border:1px solid var(--hp-panel-border);border-radius:7px;background:var(--hp-panel-bg);color:var(--hp-panel-text)}.notification-days div span{font-size:9px;color:var(--hp-panel-muted)}.notification-actions{margin-top:18px}.notification-empty{padding:12px;border:1px dashed var(--hp-panel-border);border-radius:9px}@media(max-width:800px){.notification-targets,.notification-grid{grid-template-columns:1fr}}
    `;
  };
}
