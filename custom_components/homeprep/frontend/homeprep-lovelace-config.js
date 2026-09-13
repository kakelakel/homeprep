import { hpT } from "./homeprep-i18n.js?v=3";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const DEFAULT_ORDER = {
  inventory: 1,
  containers: 2,
  shopping: 3,
  tasks: 4,
  assets: 5,
  plans: 6,
};

function sectionOrder(config, id) {
  const key = `section_${id}`;
  const value = config?.[key];
  if (value === "hidden" || value === 0 || value === "0") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_ORDER[id];
}

customElements.whenDefined("homeprep-card").then(() => {
  const cls = customElements.get("homeprep-card");
  if (!cls || cls.prototype.__homePrepConfigurablePatched) return;
  const proto = cls.prototype;
  proto.__homePrepConfigurablePatched = true;

  proto.render = function render() {
    if (!this._hass) return;
    const summaries = {
      inventory: this._summary,
      tasks: this._taskSummary,
      containers: this._containerSummary,
      plans: this._planSummary,
      assets: this._assetSummary,
      shopping: this._shoppingSummary,
    };
    if (!Object.values(summaries).some(Boolean)) {
      this.innerHTML = this.shell(`<div class="wrap">${esc(hpT("HomePrep unavailable", this._hass))}</div>`);
      return;
    }
    const sections = [
      {
        id: "inventory", icon: "mdi:package-variant-closed", label: "Inventory", cls: "",
        body: `<div class="metrics">${this.metric("Inventory", summaries.inventory?.items)}${this.metric("Expired", summaries.inventory?.expired)}${this.metric("Expiring soon", summaries.inventory?.expiring_soon)}${this.metric("Check required", summaries.inventory?.due_for_check)}</div>`,
      },
      {
        id: "containers", icon: "mdi:archive-outline", label: "Containers", cls: "hp-two-metrics",
        body: `<div class="metrics hp-two-metrics">${this.metric("Containers", summaries.containers?.containers)}${this.metric("Needs attention", (summaries.containers?.critical ?? 0) + (summaries.containers?.attention ?? 0))}</div>`,
      },
      {
        id: "shopping", icon: "mdi:cart-outline", label: "Shopping List", cls: "hp-two-metrics",
        body: `<div class="metrics hp-two-metrics">${this.metric("To buy", summaries.shopping?.pending)}${this.metric("Purchased", summaries.shopping?.purchased)}</div>`,
      },
      {
        id: "tasks", icon: "mdi:clipboard-check-outline", label: "Tasks", cls: "",
        body: `<div class="metrics">${this.metric("Tasks", summaries.tasks?.tasks)}${this.metric("Overdue", summaries.tasks?.overdue)}${this.metric("Due today", summaries.tasks?.due)}${this.metric("Upcoming", summaries.tasks?.upcoming)}</div>`,
      },
      {
        id: "assets", icon: "mdi:home-cog", label: "Assets", cls: "hp-two-metrics",
        body: `<div class="metrics hp-two-metrics">${this.metric("Assets", summaries.assets?.assets)}${this.metric("Checks due", summaries.assets?.critical)}</div>`,
      },
      {
        id: "plans", icon: "mdi:clipboard-list-outline", label: "Plans", cls: "hp-three-metrics",
        body: `<div class="metrics hp-three-metrics">${this.metric("Plans", summaries.plans?.plans)}${this.metric("Needs attention", summaries.plans?.attention)}${this.metric("Review required", summaries.plans?.review_required)}</div>`,
      },
    ]
      .map((section, index) => ({ ...section, order: sectionOrder(this.config, section.id), index }))
      .filter((section) => section.order !== null)
      .sort((a, b) => a.order - b.order || a.index - b.index);

    const status = this.combinedStatus();
    const label = this.statusLabel(status);
    const showStatus = this.config?.show_status !== false;
    this.innerHTML = this.shell(`
      <div class="wrap hp-readiness-card">
        <div class="head"><img class="logo" src="/api/homeprep/frontend/icon.png"><div><div class="title">${esc(this.config?.title || "HomePrep")}</div><div class="sub">PREPARE • MONITOR • BE READY</div></div></div>
        ${showStatus ? `<div class="status ${status}">${esc(label)}</div>` : ""}
        ${sections.map((section) => `<div class="section-label"><ha-icon icon="${section.icon}"></ha-icon><span>${esc(hpT(section.label, this._hass))}</span></div>${section.body}`).join("")}
      </div>
      <style>
        .hp-readiness-card .section-label{gap:9px!important}
        .hp-readiness-card .section-label ha-icon{margin-right:1px}
        .hp-two-metrics{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        .hp-three-metrics{grid-template-columns:repeat(3,minmax(0,1fr))!important}
        @media(max-width:520px){.hp-three-metrics{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
      </style>`);
  };
});

customElements.whenDefined("homeprep-mini-card").then(() => {
  const cls = customElements.get("homeprep-mini-card");
  if (!cls || cls.prototype.__homePrepAssetIconPatched) return;
  const proto = cls.prototype;
  proto.__homePrepAssetIconPatched = true;
  const oldRender = proto.render;
  proto.render = function render(...args) {
    const result = oldRender.apply(this, args);
    this.querySelectorAll('ha-icon[icon="mdi:home-cog-outline"]').forEach((icon) => icon.setAttribute("icon", "mdi:home-cog"));
    return result;
  };
});

customElements.whenDefined("homeprep-card-editor").then(() => {
  const cls = customElements.get("homeprep-card-editor");
  if (!cls || cls.prototype.__homePrepSummaryEditorPatched) return;
  const proto = cls.prototype;
  proto.__homePrepSummaryEditorPatched = true;
  const oldRenderContentSettings = proto.renderContentSettings;
  proto.renderContentSettings = function renderContentSettings() {
    if ((this._config?.type || "") !== "custom:homeprep-card") return oldRenderContentSettings.call(this);
    const title = `<label class="field"><span>Title</span><input data-path="title" type="text" value="${this.esc(this._config.title || "")}" placeholder="Default title"></label>`;
    const options = (id) => {
      const current = sectionOrder(this._config, id);
      return [`<option value="hidden" ${current === null ? "selected" : ""}>Hidden</option>`, ...[1,2,3,4,5,6].map((n) => `<option value="${n}" ${current === n ? "selected" : ""}>${n}</option>`)].join("");
    };
    const rows = [
      ["inventory", "Inventory"], ["containers", "Containers"], ["shopping", "Shopping List"],
      ["tasks", "Tasks"], ["assets", "Assets"], ["plans", "Plans"],
    ].map(([id, label]) => `<label class="field"><span>${label}</span><select data-path="section_${id}">${options(id)}</select></label>`).join("");
    return `${title}<div class="section-title">Sections & order</div><div class="hint">Choose which HomePrep sections are visible and their display order. Duplicate positions are allowed and keep the default relative order.</div><div class="two-col">${rows}</div><label class="toggle"><input data-path="show_status" type="checkbox" ${this.checked(this._config.show_status !== false)}><span>Show overall status banner</span></label>`;
  };
});
