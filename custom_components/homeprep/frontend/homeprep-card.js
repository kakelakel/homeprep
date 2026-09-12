class HomePrepCard extends HTMLElement {
  setConfig(config) {
    this.config = {
      show_actions: true,
      ...config,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return this.config?.show_actions ? 6 : 4;
  }

  escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  getStatusEntity() {
    return this._hass.states["sensor.homeprep_status"];
  }

  getStatusData() {
    const status = this.getStatusEntity()?.state ?? "unknown";

    if (status === "critical") {
      return {
        label: "Action required",
        detail: "One or more items require your attention",
        color: "var(--error-color, #db4437)",
        background: "rgba(219, 68, 55, 0.12)",
        icon: "mdi:shield-alert",
      };
    }

    if (status === "attention") {
      return {
        label: "Requires attention",
        detail: "Some items should be checked soon",
        color: "var(--warning-color, #ff9800)",
        background: "rgba(255, 152, 0, 0.12)",
        icon: "mdi:alert",
      };
    }

    if (status === "ok") {
      return {
        label: "Home is ready",
        detail: "Nothing requires attention right now",
        color: "var(--success-color, #43a047)",
        background: "rgba(67, 160, 71, 0.12)",
        icon: "mdi:shield-check",
      };
    }

    return {
      label: "Status unknown",
      detail: "HomePrep could not read the current status",
      color: "var(--secondary-text-color)",
      background: "rgba(128, 128, 128, 0.12)",
      icon: "mdi:help-circle",
    };
  }

  getState(entityId) {
    return this._hass.states[entityId]?.state ?? "0";
  }

  plural(value, singular, plural) {
    return Number(value) === 1 ? singular : plural;
  }

  getActionItems() {
    const attributes = this.getStatusEntity()?.attributes ?? {};

    const expired = attributes.expired_items ?? [];
    const due = attributes.due_for_check_items ?? [];
    const expiring = attributes.expiring_soon_items ?? [];

    const items = new Map();

    const getItem = (item) => {
      const key = item.id ?? `${item.name}-${Math.random()}`;

      if (!items.has(key)) {
        items.set(key, {
          id: key,
          name: item.name ?? "Unnamed item",
          alerts: [],
          priority: 0,
          icon: "mdi:alert",
          color: "var(--warning-color, #ff9800)",
          background: "rgba(255, 152, 0, 0.12)",
        });
      }

      return items.get(key);
    };

    expired.forEach((item) => {
      const target = getItem(item);
      const days = Number(item.days_overdue ?? 0);

      target.priority = Math.max(target.priority, 3);
      target.icon = "mdi:calendar-remove";
      target.color = "var(--error-color, #db4437)";
      target.background = "rgba(219, 68, 55, 0.12)";

      target.alerts.push(
        days <= 0
          ? "Expired"
          : `Expired ${days} ${this.plural(days, "day", "days")} ago`
      );
    });

    due.forEach((item) => {
      const target = getItem(item);
      const days = Number(item.days_overdue ?? 0);

      if (target.priority < 3) {
        target.icon = "mdi:clipboard-alert";
        target.color = "var(--error-color, #db4437)";
        target.background = "rgba(219, 68, 55, 0.12)";
      }

      target.priority = Math.max(target.priority, 3);

      target.alerts.push(
        days === 0
          ? "Check due today"
          : `Check overdue by ${days} ${this.plural(days, "day", "days")}`
      );
    });

    expiring.forEach((item) => {
      const target = getItem(item);
      const days = Number(item.days_remaining ?? 0);

      if (target.priority < 2) {
        target.priority = 2;
        target.icon = "mdi:calendar-alert";
        target.color = "var(--warning-color, #ff9800)";
        target.background = "rgba(255, 152, 0, 0.12)";
      }

      target.alerts.push(
        days === 0
          ? "Expires today"
          : `Expires in ${days} ${this.plural(days, "day", "days")}`
      );
    });

    return [...items.values()].sort(
      (a, b) =>
        b.priority - a.priority ||
        a.name.localeCompare(b.name)
    );
  }

  renderActionSection() {
    if (!this.config.show_actions) {
      return "";
    }

    const actions = this.getActionItems();

    if (actions.length === 0) {
      return "";
    }

    const rows = actions
      .map((item) => {
        const name = this.escapeHtml(item.name);
        const details = item.alerts
          .map((alert) => this.escapeHtml(alert))
          .join(" • ");

        return `
          <div class="action-row">
            <div
              class="action-icon"
              style="
                color:${item.color};
                background:${item.background};
              "
            >
              <ha-icon icon="${item.icon}"></ha-icon>
            </div>

            <div class="action-content">
              <div class="action-name">
                ${name}
              </div>

              <div class="action-detail">
                ${details}
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="actions">
        <div class="actions-header">
          <div class="actions-title">
            Requires attention
          </div>

          <div class="actions-count">
            ${actions.length}
          </div>
        </div>

        <div class="action-list">
          ${rows}
        </div>
      </div>
    `;
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

          .actions {
            margin-top: 14px;
            padding-top: 14px;
            border-top: 1px solid var(--divider-color);
          }

          .actions-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 9px;
          }

          .actions-title {
            font-size: 13px;
            font-weight: 700;
          }

          .actions-count {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 22px;
            height: 22px;
            padding: 0 6px;
            border-radius: 11px;
            box-sizing: border-box;
            font-size: 11px;
            font-weight: 700;
            color: var(--primary-text-color);
            background: rgba(128, 128, 128, 0.14);
          }

          .action-list {
            display: flex;
            flex-direction: column;
            gap: 7px;
          }

          .action-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 10px;
            border-radius: 10px;
            background: rgba(128, 128, 128, 0.06);
          }

          .action-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .action-icon ha-icon {
            --mdc-icon-size: 19px;
          }

          .action-content {
            min-width: 0;
          }

          .action-name {
            font-size: 12px;
            font-weight: 700;
            line-height: 1.2;
          }

          .action-detail {
            margin-top: 3px;
            font-size: 10px;
            color: var(--secondary-text-color);
            line-height: 1.3;
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
                  Inventory
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
                  Expired
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
                  Expiring soon
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
                  Check required
                </div>
              </div>
            </div>
          </div>

          ${this.renderActionSection()}
        </div>
      </ha-card>
    `;
  }
}


class HomePrepMiniCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return 1;
  }

  getStatusData() {
    const entity = this._hass.states["sensor.homeprep_status"];
    const status = entity?.state ?? "unknown";

    if (status === "critical") {
      return {
        label: "Requires attention",
        color: "var(--error-color, #db4437)",
        background: "rgba(219, 68, 55, 0.12)",
        icon: "mdi:alert-circle",
      };
    }

    if (status === "attention") {
      return {
        label: "Requires attention",
        color: "var(--warning-color, #ff9800)",
        background: "rgba(255, 152, 0, 0.12)",
        icon: "mdi:alert",
      };
    }

    if (status === "ok") {
      return {
        label: "OK",
        color: "var(--success-color, #43a047)",
        background: "rgba(67, 160, 71, 0.12)",
        icon: "mdi:check-circle",
      };
    }

    return {
      label: "Unknown",
      color: "var(--secondary-text-color)",
      background: "rgba(128, 128, 128, 0.12)",
      icon: "mdi:help-circle",
    };
  }

  render() {
    if (!this._hass) {
      return;
    }

    const status = this.getStatusData();

    this.innerHTML = `
      <ha-card>
        <style>
          .mini {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
          }

          .logo {
            width: 34px;
            height: 34px;
            object-fit: contain;
            flex-shrink: 0;
          }

          .text {
            flex: 1;
            min-width: 0;
          }

          .title {
            font-size: 14px;
            font-weight: 700;
            line-height: 1.1;
          }

          .status {
            margin-top: 2px;
            font-size: 11px;
            font-weight: 600;
            color: ${status.color};
          }

          .status-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: ${status.background};
            color: ${status.color};
            flex-shrink: 0;
          }

          .status-icon ha-icon {
            --mdc-icon-size: 19px;
          }
        </style>

        <div class="mini">
          <img
            class="logo"
            src="/api/homeprep/frontend/icon.png"
            alt="HomePrep"
          >

          <div class="text">
            <div class="title">
              HomePrep
            </div>

            <div class="status">
              ${status.label}
            </div>
          </div>

          <div class="status-icon">
            <ha-icon icon="${status.icon}"></ha-icon>
          </div>
        </div>
      </ha-card>
    `;
  }
}


if (!customElements.get("homeprep-card")) {
  customElements.define(
    "homeprep-card",
    HomePrepCard
  );
}

if (!customElements.get("homeprep-mini-card")) {
  customElements.define(
    "homeprep-mini-card",
    HomePrepMiniCard
  );
}


window.customCards = window.customCards || [];

window.customCards.push({
  type: "homeprep-card",
  name: "HomePrep",
  description: "HomePrep preparedness overview",
});

window.customCards.push({
  type: "homeprep-mini-card",
  name: "HomePrep Mini",
  description: "Compact HomePrep status card",
});
