import "./homeprep-panel-v6.js?v=7";

const HomePrepPanel = customElements.get("homeprep-panel");

if (HomePrepPanel) {
  const oldHandleSubmit = HomePrepPanel.prototype.handleSubmit;
  HomePrepPanel.prototype.handleSubmit = async function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "hp-notification-form") {
      return oldHandleSubmit.call(this, event);
    }

    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const previousText = button?.textContent || "Save notification settings";

    if (button) {
      button.disabled = true;
      button.textContent = "Saving…";
    }

    this._notificationSaveState = "saving";

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
      this._notificationSaveState = "saved";
      this.render();

      window.clearTimeout(this._notificationSaveTimer);
      this._notificationSaveTimer = window.setTimeout(() => {
        if (this._notificationSaveState === "saved") {
          this._notificationSaveState = null;
          this.render();
        }
      }, 3000);
    } catch (error) {
      console.error("HomePrep notification settings failed", error);
      this._notificationSaveState = "error";
      if (button) {
        button.disabled = false;
        button.textContent = previousText;
      }
      this.render();
    }
  };

  const oldRenderSettings = HomePrepPanel.prototype.renderSettings;
  HomePrepPanel.prototype.renderSettings = function renderSettings() {
    let html = oldRenderSettings.call(this);
    const state = this._notificationSaveState;

    const feedback = state === "saved"
      ? '<span class="notification-save-feedback saved"><ha-icon icon="mdi:check-circle"></ha-icon> Settings saved</span>'
      : state === "error"
        ? '<span class="notification-save-feedback error"><ha-icon icon="mdi:alert-circle"></ha-icon> Could not save settings</span>'
        : state === "saving"
          ? '<span class="notification-save-feedback"><ha-icon icon="mdi:loading" class="spin"></ha-icon> Saving…</span>'
          : "";

    html = html.replace(
      '<button type="submit" class="primary">Save notification settings</button>',
      `<button type="submit" class="primary" ${state === "saving" ? "disabled" : ""}>${state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "Save notification settings"}</button>${feedback}`,
    );

    return html;
  };

  const oldStyles = HomePrepPanel.prototype.styles;
  HomePrepPanel.prototype.styles = function styles() {
    return `${oldStyles.call(this)}
      .notification-save-feedback{display:inline-flex;align-items:center;gap:5px;font-size:10px;color:var(--hp-panel-muted)}
      .notification-save-feedback ha-icon{width:17px;height:17px}
      .notification-save-feedback.saved{color:#4caf50;font-weight:700}
      .notification-save-feedback.error{color:#f44336;font-weight:700}
      .notification-actions button:disabled{opacity:.65;cursor:wait}
      .notification-save-feedback .spin{animation:hp-notification-spin .8s linear infinite}
      @keyframes hp-notification-spin{to{transform:rotate(360deg)}}
    `;
  };
}
