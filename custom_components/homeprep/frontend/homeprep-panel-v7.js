import "./homeprep-panel-v6.js?v=7";
import { applyHomePrepV8 } from "./homeprep-panel-v8.js?v=1";
import {
  HOME_PREP_LANGUAGE_NAMES,
  HOME_PREP_LANGUAGES,
  getHomePrepLanguageOverride,
  hpT,
  setHomePrepLanguageOverride,
} from "./homeprep-i18n.js?v=2";

const HomePrepPanel = customElements.get("homeprep-panel");

function localizeLiveDom(root, hass) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const original = node.nodeValue || "";
    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    const core = original.trim();
    if (!core) continue;
    const translated = hpT(core, hass);
    if (translated !== core) node.nodeValue = `${leading}${translated}${trailing}`;
  }
  root.querySelectorAll?.("[placeholder],[title],[aria-label]").forEach((el) => {
    ["placeholder", "title", "aria-label"].forEach((attr) => {
      if (!el.hasAttribute(attr)) return;
      const value = el.getAttribute(attr);
      const translated = hpT(value, hass);
      if (translated !== value) el.setAttribute(attr, translated);
    });
  });
}

function languageOptions(hass) {
  const selected = getHomePrepLanguageOverride();
  return HOME_PREP_LANGUAGES.map((code) => {
    const label = code === "auto"
      ? hpT(HOME_PREP_LANGUAGE_NAMES.auto, hass)
      : HOME_PREP_LANGUAGE_NAMES[code];
    return `<option value="${code}" ${selected === code ? "selected" : ""}>${label}</option>`;
  }).join("");
}

if (HomePrepPanel) {
  const oldHandleSubmit = HomePrepPanel.prototype.handleSubmit;
  HomePrepPanel.prototype.handleSubmit = async function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "hp-notification-form") {
      return oldHandleSubmit.call(this, event);
    }

    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const previousText = button?.textContent || hpT("Save notification settings", this._hass);

    if (button) {
      button.disabled = true;
      button.textContent = hpT("Saving…", this._hass);
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

  const oldHandleChange = HomePrepPanel.prototype.handleChange;
  HomePrepPanel.prototype.handleChange = async function handleChange(event) {
    const target = event.target;
    if (target instanceof HTMLSelectElement && target.name === "homeprep_language") {
      setHomePrepLanguageOverride(target.value);
      this.render();
      return;
    }
    return oldHandleChange.call(this, event);
  };

  const oldRenderSettings = HomePrepPanel.prototype.renderSettings;
  HomePrepPanel.prototype.renderSettings = function renderSettings() {
    let html = oldRenderSettings.call(this);
    const state = this._notificationSaveState;

    const feedback = state === "saved"
      ? `<span class="notification-save-feedback saved"><ha-icon icon="mdi:check-circle"></ha-icon> ${hpT("Settings saved", this._hass)}</span>`
      : state === "error"
        ? `<span class="notification-save-feedback error"><ha-icon icon="mdi:alert-circle"></ha-icon> ${hpT("Could not save settings", this._hass)}</span>`
        : state === "saving"
          ? `<span class="notification-save-feedback"><ha-icon icon="mdi:loading" class="spin"></ha-icon> ${hpT("Saving…", this._hass)}</span>`
          : "";

    html = html.replace(
      '<button type="submit" class="primary">Save notification settings</button>',
      `<button type="submit" class="primary" ${state === "saving" ? "disabled" : ""}>${state === "saving" ? hpT("Saving…", this._hass) : state === "saved" ? hpT("Saved", this._hass) : hpT("Save notification settings", this._hass)}</button>${feedback}`,
    );

    const languageCard = `<section class="panel-card form-card hp-language-card">
      <div class="section-head"><h3><ha-icon icon="mdi:translate"></ha-icon> ${hpT("Language", this._hass)}</h3></div>
      <label><span>${hpT("Language", this._hass)}</span><select name="homeprep_language">${languageOptions(this._hass)}</select></label>
    </section>`;

    return html.replace(
      /(<div class="page-title">[\s\S]*?<\/div><\/div>)/,
      `$1${languageCard}`,
    );
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
      .hp-language-card{margin:0 0 16px}
      .hp-language-card label{display:grid;gap:6px;max-width:420px}
      .hp-language-card select{min-height:40px;border-radius:8px;padding:0 10px;background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color)}

      /* Consistent HomePrep action buttons. Navigation controls stay neutral. */
      .row-actions button,
      .actions button,
      .section-head button,
      .notification-actions button,
      .form-card .actions button,
      button.primary,
      .image-upload-button {
        background:var(--hp-panel-accent)!important;
        color:#fff!important;
        border:1px solid color-mix(in srgb,var(--hp-panel-accent) 82%,#000)!important;
        border-radius:8px!important;
        font-weight:700!important;
        box-shadow:none!important;
        transition:filter .15s ease,transform .08s ease,opacity .15s ease;
      }
      .row-actions button:hover,.actions button:hover,.section-head button:hover,.notification-actions button:hover,.form-card .actions button:hover,button.primary:hover,.image-upload-button:hover{filter:brightness(1.08)}
      .row-actions button:active,.actions button:active,.section-head button:active,.notification-actions button:active,.form-card .actions button:active,button.primary:active{transform:translateY(1px)}
      button.danger,.row-actions button.danger,.actions button.danger,.form-card .actions button.danger,.inventory-image-controls button.danger{
        background:color-mix(in srgb,var(--hp-panel-critical,#f44336) 82%,#5b0b0b)!important;
        color:#fff!important;
        border-color:color-mix(in srgb,var(--hp-panel-critical,#f44336) 76%,#000)!important;
      }
      .row-actions button:disabled,.actions button:disabled,.section-head button:disabled,.notification-actions button:disabled,.form-card .actions button:disabled,button.primary:disabled{opacity:.55!important;cursor:not-allowed!important;filter:saturate(.65)!important}
    `;
  };

  applyHomePrepV8(HomePrepPanel);

  const oldRender = HomePrepPanel.prototype.render;
  HomePrepPanel.prototype.render = function render() {
    const result = oldRender.call(this);
    localizeLiveDom(this.shadowRoot || this, this._hass);
    return result;
  };
}
