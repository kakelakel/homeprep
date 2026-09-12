import { hpT } from "./homeprep-i18n.js?v=3";

class HomePrepMainBase extends HTMLElement {
  static getConfigElement() {
    return document.createElement("homeprep-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  constructor() {
    super();
    this._summary = null;
    this._taskSummary = null;
    this._loading = false;
    this._timer = null;
  }

  setConfig(config) {
    this.config = config || {};
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this.load();
  }

  connectedCallback() {
    if (!this._timer) {
      this._timer = window.setInterval(() => this.load(), 30000);
    }
  }

  disconnectedCallback() {
    if (this._timer) {
      window.clearInterval(this._timer);
      this._timer = null;
    }
  }

  async load() {
    if (!this._hass || this._loading) return;
    this._loading = true;

    try {
      const [inventorySummary, taskData] = await Promise.all([
        this._hass.callWS({ type: "homeprep/summary" }),
        this._hass.callWS({ type: "homeprep/tasks" }),
      ]);
      this._summary = inventorySummary;
      this._taskSummary = taskData?.summary || null;
    } catch (error) {
      console.error("HomePrep summary card load failed", error);
      this._summary = null;
      this._taskSummary = null;
    }

    this._loading = false;
    this.render();
  }

  t(text) {
    return hpT(text, this._hass);
  }

  esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  combinedStatus() {
    const inventory = this._summary?.status || "ok";
    const tasks = this._taskSummary?.status || "ok";
    if (inventory === "critical" || tasks === "critical") return "critical";
    if (inventory === "attention" || tasks === "attention") return "attention";
    return "ok";
  }

  statusLabel(status) {
    if (!this._summary && !this._taskSummary) return this.t("Unknown");
    if (status === "critical") return this.t("Action required");
    if (status === "attention") return this.t("Requires attention");
    return this.t("Home is ready");
  }

  baseCss() {
    return `
      ${window.HomePrepUI.baseStyles()}
      <style>
        .wrap{padding:var(--hp-pad)}
        .head{display:flex;align-items:center;gap:10px}
        .logo{width:40px;height:40px}
        .title{font-size:16px;font-weight:700}
        .sub{margin-top:2px;font-size:9px;color:var(--hp-secondary)}
        .status{margin-top:10px;padding:10px;border-radius:calc(var(--hp-radius) - 4px);font-size:12px;font-weight:700}
        .status.ok{color:var(--hp-ok);background:color-mix(in srgb,var(--hp-ok) 12%,transparent)}
        .status.attention{color:var(--hp-attention);background:color-mix(in srgb,var(--hp-attention) 12%,transparent)}
        .status.critical{color:var(--hp-critical);background:color-mix(in srgb,var(--hp-critical) 12%,transparent)}
        .section-label{display:flex;align-items:center;gap:6px;margin-top:12px;font-size:10px;font-weight:700;color:var(--hp-secondary);text-transform:uppercase;letter-spacing:.06em}
        .section-label ha-icon{width:15px;height:15px;color:var(--hp-accent)}
        .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:7px}
        .metric{padding:9px;border:1px solid var(--hp-border);border-radius:calc(var(--hp-radius) - 5px);min-width:0}
        .metric strong{display:block;font-size:18px}
        .metric span{display:block;font-size:9px;color:var(--hp-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .mini-stats{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
        .mini-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 7px;border:1px solid var(--hp-border);border-radius:999px;font-size:9px;color:var(--hp-secondary)}
        .mini-chip strong{color:var(--hp-primary);font-size:10px}
        .mini-chip.attention strong{color:var(--hp-attention)}
        .mini-chip.critical strong{color:var(--hp-critical)}
        @media(max-width:520px){.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
      </style>
    `;
  }

  shell(content) {
    return `
      <ha-card style="${window.HomePrepUI.styleVars(this.config)}">
        ${this.baseCss()}
        ${content}
      </ha-card>
    `;
  }

  metric(label, value) {
    return `<div class="metric"><strong>${this.esc(value ?? 0)}</strong><span>${this.esc(this.t(label))}</span></div>`;
  }
}

class HomePrepCard extends HomePrepMainBase {
  render() {
    if (!this._hass) return;

    const inventory = this._summary;
    const tasks = this._taskSummary;

    if (!inventory && !tasks) {
      this.innerHTML = this.shell(`<div class="wrap">${this.esc(this.t("HomePrep unavailable"))}</div>`);
      return;
    }

    const status = this.combinedStatus();
    const label = this.statusLabel(status);

    this.innerHTML = this.shell(`
      <div class="wrap">
        <div class="head">
          <img class="logo" src="/api/homeprep/frontend/icon.png">
          <div>
            <div class="title">${this.esc(this.config?.title || "HomePrep")}</div>
            <div class="sub">PREPARE • MONITOR • BE READY</div>
          </div>
        </div>

        <div class="status ${status}">${this.esc(label)}</div>

        <div class="section-label"><ha-icon icon="mdi:package-variant-closed"></ha-icon>${this.esc(this.t("Inventory"))}</div>
        <div class="metrics">
          ${this.metric("Inventory", inventory?.items)}
          ${this.metric("Expired", inventory?.expired)}
          ${this.metric("Expiring soon", inventory?.expiring_soon)}
          ${this.metric("Check required", inventory?.due_for_check)}
        </div>

        <div class="section-label"><ha-icon icon="mdi:clipboard-check-outline"></ha-icon>${this.esc(this.t("Tasks"))}</div>
        <div class="metrics">
          ${this.metric("Tasks", tasks?.tasks)}
          ${this.metric("Overdue", tasks?.overdue)}
          ${this.metric("Due today", tasks?.due)}
          ${this.metric("Upcoming", tasks?.upcoming)}
        </div>
      </div>
    `);
  }
}

class HomePrepMiniCard extends HomePrepMainBase {
  render() {
    if (!this._hass) return;

    const status = this.combinedStatus();
    const label = this.statusLabel(status);
    const inventoryCount = this._summary?.items ?? 0;
    const taskCount = this._taskSummary?.tasks ?? 0;
    const overdue = this._taskSummary?.overdue ?? 0;
    const due = this._taskSummary?.due ?? 0;
    const upcoming = this._taskSummary?.upcoming ?? 0;

    this.innerHTML = this.shell(`
      <div class="wrap">
        <div class="head">
          <img class="logo" src="/api/homeprep/frontend/icon.png">
          <div style="flex:1;min-width:0">
            <div class="title">${this.esc(this.config?.title || "HomePrep")}</div>
            <div class="sub">${this.esc(label)}</div>
          </div>
          <div class="status ${status}" style="margin-top:0;padding:7px 9px">${this.esc(label)}</div>
        </div>
        <div class="mini-stats">
          <span class="mini-chip"><ha-icon icon="mdi:package-variant-closed"></ha-icon><strong>${this.esc(inventoryCount)}</strong>${this.esc(this.t("Inventory"))}</span>
          <span class="mini-chip"><ha-icon icon="mdi:clipboard-check-outline"></ha-icon><strong>${this.esc(taskCount)}</strong>${this.esc(this.t("Tasks"))}</span>
          ${overdue ? `<span class="mini-chip critical"><strong>${this.esc(overdue)}</strong>${this.esc(this.t("Overdue"))}</span>` : ""}
          ${due ? `<span class="mini-chip attention"><strong>${this.esc(due)}</strong>${this.esc(this.t("Due today"))}</span>` : ""}
          ${upcoming ? `<span class="mini-chip attention"><strong>${this.esc(upcoming)}</strong>${this.esc(this.t("Upcoming"))}</span>` : ""}
        </div>
      </div>
    `);
  }
}

[
  ["homeprep-card", HomePrepCard, "HomePrep"],
  ["homeprep-mini-card", HomePrepMiniCard, "HomePrep Mini"],
].forEach(([tag, cls, name]) => {
  if (!customElements.get(tag)) customElements.define(tag, cls);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: tag,
    name,
    description: `${name} card`,
  });
});
