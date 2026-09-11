class HomePrepCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return 4;
  }

  getStatusData() {
    const statusEntity = this._hass.states["sensor.homeprep_status"];
    const status = statusEntity?.state ?? "unknown";

    if (status === "critical") {
      return {
        label: "Åtgärd krävs",
        detail: "En eller flera saker kräver din uppmärksamhet",
        color: "var(--error-color, #db4437)",
        background: "rgba(219, 68, 55, 0.12)",
        icon: "mdi:shield-alert",
      };
    }

    if (status === "attention") {
      return {
        label: "Behöver ses över",
        detail: "Några saker bör kontrolleras snart",
        color: "var(--warning-color, #ff9800)",
        background: "rgba(255, 152, 0, 0.12)",
        icon: "mdi:alert",
      };
    }

    if (status === "ok") {
      return {
        label: "Hemmet är redo",
        detail: "Inget kräver åtgärd just nu",
        color: "var(--success-color, #43a047)",
        background: "rgba(67, 160, 71, 0.12)",
        icon: "mdi:shield-check",
      };
    }

    return {
      label: "Status okänd",
      detail: "HomePrep kunde inte läsa aktuell status",
      color: "var(--secondary-text-color)",
      background: "rgba(128, 128, 128, 0.12)",
      icon: "mdi:help-circle",
    };
  }

  getState(entityId) {
    return this._hass.states[entityId]?.state ?? "0";
  }

  render() {
    if (!this._hass) {
      return;
    }

    const status = this.getStatusData();

    const items = this.getState("sensor.homeprep_items");
    const expired = this.getState("sensor.homeprep_expired");
    const expiringSoon = this.getState(
      "sensor.homeprep_expiring_soon"
    );
    const dueForCheck = this.getState(
      "sensor.homeprep_due_for_check"
    );

    this.innerHTML = `
      <ha-card>
        <style>
          .homeprep {
            padding: 16px;
          }

          .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 14px;
          }

          .logo {
            width: 44px;
            height: 44px;
            object-fit: contain;
            flex-shrink: 0;
          }

          .brand {
            min-width: 0;
          }

          .brand-title {
            font-size: 20px;
            font-weight: 700;
            line-height: 1.1;
          }

          .brand-tagline {
            margin-top: 4px;
            font-size: 9px;
            letter-spacing: 1px;
            color: var(--secondary-text-color);
          }

          .status {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 13px 14px;
            border-radius: 12px;
            margin-bottom: 12px;
            background: ${status.background};
          }

          .status-icon {
            color: ${status.color};
          }

          .status-icon ha-icon {
            --mdc-icon-size: 28px;
          }

          .status-text {
            min-width: 0;
          }

          .status-title {
            color: ${status.color};
            font-size: 15px;
            font-weight: 700;
          }

          .status-detail {
            margin-top: 2px;
            font-size: 12px;
            color: var(--secondary-text-color);
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .metric {
            display: flex;
            align-items: center;
            gap: 10px;
            min-height: 62px;
            padding: 12px;
            border-radius: 12px;
            background: var(
              --ha-card-background,
              var(--card-background-color)
            );
            border: 1px solid var(--divider-color);
          }

          .metric-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .metric-icon ha-icon {
            --mdc-icon-size: 22px;
          }

          .metric-value {
            font-size: 18px;
            font-weight: 700;
            line-height: 1;
          }

          .metric-label {
            margin-top: 4px;
            font-size: 11px;
            color: var(--secondary-text-color);
          }

          .blue {
            color: #42a5f5;
            background: rgba(66, 165, 245, 0.12);
          }

          .red {
            color: var(--error-color, #db4437);
            background: rgba(219, 68, 55, 0.12);
          }

          .orange {
            color: var(--warning-color, #ff9800);
            background: rgba(255, 152, 0, 0.12);
          }

          .amber {
            color: #f9a825;
            background: rgba(249, 168, 37, 0.12);
          }
        </style>

        <div class="homeprep">
          <div class="header">
            <img
              class="logo"
              src="/api/homeprep/frontend/icon.png"
              alt="HomePrep"
            >

            <div class="brand">
              <div class="brand-title">
                HomePrep
              </div>

              <div class="brand-tagline">
                PREPARE • MONITOR • BE READY
              </div>
            </div>
          </div>

          <div class="status">
            <div class="status-icon">
              <ha-icon icon="${status.icon}"></ha-icon>
            </div>

            <div class="status-text">
              <div class="status-title">
                ${status.label}
              </div>

              <div class="status-detail">
                ${status.detail}
              </div>
            </div>
          </div>

          <div class="grid">
            <div class="metric">
              <div class="metric-icon blue">
                <ha-icon icon="mdi:package-variant"></ha-icon>
              </div>

              <div>
                <div class="metric-value">
                  ${items}
                </div>

                <div class="metric-label">
                  Inventarie
                </div>
              </div>
            </div>

            <div class="metric">
              <div class="metric-icon red">
                <ha-icon icon="mdi:calendar-remove"></ha-icon>
              </div>

              <div>
                <div class="metric-value">
                  ${expired}
                </div>

                <div class="metric-label">
                  Utgånget
                </div>
              </div>
            </div>

            <div class="metric">
              <div class="metric-icon orange">
                <ha-icon icon="mdi:calendar-alert"></ha-icon>
              </div>

              <div>
                <div class="metric-value">
                  ${expiringSoon}
                </div>

                <div class="metric-label">
                  Snart utgående
                </div>
              </div>
            </div>

            <div class="metric">
              <div class="metric-icon amber">
                <ha-icon icon="mdi:clipboard-alert"></ha-icon>
              </div>

              <div>
                <div class="metric-value">
                  ${dueForCheck}
                </div>

                <div class="metric-label">
                  Kontroll krävs
                </div>
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }
}

customElements.define(
  "homeprep-card",
  HomePrepCard
);

window.customCards = window.customCards || [];

window.customCards.push({
  type: "homeprep-card",
  name: "HomePrep",
  description: "HomePrep preparedness overview",
});

class HomePrepCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return 4;
  }

  getStatusData() {
    const statusEntity = this._hass.states["sensor.homeprep_status"];
    const status = statusEntity?.state ?? "unknown";

    if (status === "critical") {
      return {
        label: "Åtgärd krävs",
        detail: "En eller flera saker kräver din uppmärksamhet",
        color: "var(--error-color, #db4437)",
        background: "rgba(219, 68, 55, 0.12)",
        icon: "mdi:shield-alert",
      };
    }

    if (status === "attention") {
      return {
        label: "Behöver ses över",
        detail: "Några saker bör kontrolleras snart",
        color: "var(--warning-color, #ff9800)",
        background: "rgba(255, 152, 0, 0.12)",
        icon: "mdi:alert",
      };
    }

    if (status === "ok") {
      return {
        label: "Hemmet är redo",
        detail: "Inget kräver åtgärd just nu",
        color: "var(--success-color, #43a047)",
        background: "rgba(67, 160, 71, 0.12)",
        icon: "mdi:shield-check",
      };
    }

    return {
      label: "Status okänd",
      detail: "HomePrep kunde inte läsa aktuell status",
      color: "var(--secondary-text-color)",
      background: "rgba(128, 128, 128, 0.12)",
      icon: "mdi:help-circle",
    };
  }

  getState(entityId) {
    return this._hass.states[entityId]?.state ?? "0";
  }

  render() {
    if (!this._hass) {
      return;
    }

    const status = this.getStatusData();

    const items = this.getState("sensor.homeprep_items");
    const expired = this.getState("sensor.homeprep_expired");
    const expiringSoon = this.getState(
      "sensor.homeprep_expiring_soon"
    );
    const dueForCheck = this.getState(
      "sensor.homeprep_due_for_check"
    );

    this.innerHTML = `
      <ha-card>
        <style>
          .homeprep {
            padding: 16px;
          }

          .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 14px;
          }

          .logo {
            width: 44px;
            height: 44px;
            object-fit: contain;
            flex-shrink: 0;
          }

          .brand {
            min-width: 0;
          }

          .brand-title {
            font-size: 20px;
            font-weight: 700;
            line-height: 1.1;
          }

          .brand-tagline {
            margin-top: 4px;
            font-size: 9px;
            letter-spacing: 1px;
            color: var(--secondary-text-color);
          }

          .status {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 13px 14px;
            border-radius: 12px;
            margin-bottom: 12px;
            background: ${status.background};
          }

          .status-icon {
            color: ${status.color};
          }

          .status-icon ha-icon {
            --mdc-icon-size: 28px;
          }

          .status-text {
            min-width: 0;
          }

          .status-title {
            color: ${status.color};
            font-size: 15px;
            font-weight: 700;
          }

          .status-detail {
            margin-top: 2px;
            font-size: 12px;
            color: var(--secondary-text-color);
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .metric {
            display: flex;
            align-items: center;
            gap: 10px;
            min-height: 62px;
            padding: 12px;
            border-radius: 12px;
            background: var(
              --ha-card-background,
              var(--card-background-color)
            );
            border: 1px solid var(--divider-color);
          }

          .metric-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .metric-icon ha-icon {
            --mdc-icon-size: 22px;
          }

          .metric-value {
            font-size: 18px;
            font-weight: 700;
            line-height: 1;
          }

          .metric-label {
            margin-top: 4px;
            font-size: 11px;
            color: var(--secondary-text-color);
          }

          .blue {
            color: #42a5f5;
            background: rgba(66, 165, 245, 0.12);
          }

          .red {
            color: var(--error-color, #db4437);
            background: rgba(219, 68, 55, 0.12);
          }

          .orange {
            color: var(--warning-color, #ff9800);
            background: rgba(255, 152, 0, 0.12);
          }

          .amber {
            color: #f9a825;
            background: rgba(249, 168, 37, 0.12);
          }
        </style>

        <div class="homeprep">
          <div class="header">
            <img
              class="logo"
              src="/api/homeprep/frontend/icon.png"
              alt="HomePrep"
            >

            <div class="brand">
              <div class="brand-title">
                HomePrep
              </div>

              <div class="brand-tagline">
                PREPARE • MONITOR • BE READY
              </div>
            </div>
          </div>

          <div class="status">
            <div class="status-icon">
              <ha-icon icon="${status.icon}"></ha-icon>
            </div>

            <div class="status-text">
              <div class="status-title">
                ${status.label}
              </div>

              <div class="status-detail">
                ${status.detail}
              </div>
            </div>
          </div>

          <div class="grid">
            <div class="metric">
              <div class="metric-icon blue">
                <ha-icon icon="mdi:package-variant"></ha-icon>
              </div>

              <div>
                <div class="metric-value">
                  ${items}
                </div>

                <div class="metric-label">
                  Inventarie
                </div>
              </div>
            </div>

            <div class="metric">
              <div class="metric-icon red">
                <ha-icon icon="mdi:calendar-remove"></ha-icon>
              </div>

              <div>
                <div class="metric-value">
                  ${expired}
                </div>

                <div class="metric-label">
                  Utgånget
                </div>
              </div>
            </div>

            <div class="metric">
              <div class="metric-icon orange">
                <ha-icon icon="mdi:calendar-alert"></ha-icon>
              </div>

              <div>
                <div class="metric-value">
                  ${expiringSoon}
                </div>

                <div class="metric-label">
                  Snart utgående
                </div>
              </div>
            </div>

            <div class="metric">
              <div class="metric-icon amber">
                <ha-icon icon="mdi:clipboard-alert"></ha-icon>
              </div>

              <div>
                <div class="metric-value">
                  ${dueForCheck}
                </div>

                <div class="metric-label">
                  Kontroll krävs
                </div>
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }
}

customElements.define(
  "homeprep-card",
  HomePrepCard
);

window.customCards = window.customCards || [];

window.customCards.push({
  type: "homeprep-card",
  name: "HomePrep",
  description: "HomePrep preparedness overview",
});
