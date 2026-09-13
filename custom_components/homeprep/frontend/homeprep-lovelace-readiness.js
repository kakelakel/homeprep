import { hpT } from "./homeprep-i18n.js?v=3";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function overallStatus(...statuses) {
  if (statuses.includes("critical")) return "critical";
  if (statuses.includes("attention")) return "attention";
  return "ok";
}

async function loadExtendedSummary(card) {
  if (!card._hass) return;
  try {
    const [containers, plans] = await Promise.all([
      card._hass.callWS({ type: "homeprep/containers" }),
      card._hass.callWS({ type: "homeprep/plans" }),
    ]);
    card._containerSummary = containers?.summary || null;
    card._planSummary = plans?.summary || null;
  } catch (error) {
    console.error("HomePrep extended summary load failed", error);
    card._containerSummary = null;
    card._planSummary = null;
  }
}

for (const tag of ["homeprep-card", "homeprep-mini-card"]) {
  customElements.whenDefined(tag).then(() => {
    const cls = customElements.get(tag);
    if (!cls || cls.prototype.__homePrepReadinessPatched) return;
    const proto = cls.prototype;
    proto.__homePrepReadinessPatched = true;

    const oldLoad = proto.load;
    proto.load = async function load(...args) {
      await oldLoad.apply(this, args);
      await loadExtendedSummary(this);
      this.render();
    };

    proto.combinedStatus = function combinedStatus() {
      return overallStatus(
        this._summary?.status || "ok",
        this._taskSummary?.status || "ok",
        this._containerSummary?.status || "ok",
        this._planSummary?.status || "ok",
      );
    };
  });
}

customElements.whenDefined("homeprep-card").then(() => {
  const cls = customElements.get("homeprep-card");
  const proto = cls.prototype;
  proto.render = function render() {
    if (!this._hass) return;
    const inventory = this._summary;
    const tasks = this._taskSummary;
    const containers = this._containerSummary;
    const plans = this._planSummary;
    if (!inventory && !tasks && !containers && !plans) {
      this.innerHTML = this.shell(`<div class="wrap">${esc(hpT("HomePrep unavailable", this._hass))}</div>`);
      return;
    }
    const status = this.combinedStatus();
    const label = this.statusLabel(status);
    this.innerHTML = this.shell(`
      <div class="wrap hp-readiness-card">
        <div class="head"><img class="logo" src="/api/homeprep/frontend/icon.png"><div><div class="title">${esc(this.config?.title || "HomePrep")}</div><div class="sub">PREPARE • MONITOR • BE READY</div></div></div>
        <div class="status ${status}">${esc(label)}</div>
        <div class="section-label"><ha-icon icon="mdi:package-variant-closed"></ha-icon><span>${esc(hpT("Inventory", this._hass))}</span></div>
        <div class="metrics">${this.metric("Inventory", inventory?.items)}${this.metric("Expired", inventory?.expired)}${this.metric("Expiring soon", inventory?.expiring_soon)}${this.metric("Check required", inventory?.due_for_check)}</div>
        <div class="section-label"><ha-icon icon="mdi:clipboard-check-outline"></ha-icon><span>${esc(hpT("Tasks", this._hass))}</span></div>
        <div class="metrics">${this.metric("Tasks", tasks?.tasks)}${this.metric("Overdue", tasks?.overdue)}${this.metric("Due today", tasks?.due)}${this.metric("Upcoming", tasks?.upcoming)}</div>
        <div class="section-label"><ha-icon icon="mdi:archive-outline"></ha-icon><span>${esc(hpT("Containers", this._hass))}</span></div>
        <div class="metrics hp-two-metrics">${this.metric("Containers", containers?.containers)}${this.metric("Needs attention", (containers?.critical ?? 0) + (containers?.attention ?? 0))}</div>
        <div class="section-label"><ha-icon icon="mdi:clipboard-list-outline"></ha-icon><span>${esc(hpT("Plans", this._hass))}</span></div>
        <div class="metrics hp-three-metrics">${this.metric("Plans", plans?.plans)}${this.metric("Needs attention", plans?.attention)}${this.metric("Review required", plans?.review_required)}</div>
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
  const proto = cls.prototype;
  proto.render = function render() {
    if (!this._hass) return;
    const status = this.combinedStatus();
    const label = this.statusLabel(status);
    const containerAttention = (this._containerSummary?.critical ?? 0) + (this._containerSummary?.attention ?? 0);
    const planAttention = this._planSummary?.attention ?? 0;
    const planReviewRequired = this._planSummary?.review_required ?? 0;
    const containerState = this._containerSummary?.status === "critical" ? "critical" : containerAttention ? "attention" : "";
    const planState = planAttention || planReviewRequired ? "attention" : "";
    this.innerHTML = this.shell(`
      <div class="wrap">
        <div class="head"><img class="logo" src="/api/homeprep/frontend/icon.png"><div style="flex:1;min-width:0"><div class="title">${esc(this.config?.title || "HomePrep")}</div><div class="sub">${esc(label)}</div></div><div class="status ${status}" style="margin-top:0;padding:7px 9px">${esc(label)}</div></div>
        <div class="mini-stats">
          <span class="mini-chip"><ha-icon icon="mdi:package-variant-closed"></ha-icon><strong>${esc(this._summary?.items ?? 0)}</strong>${esc(hpT("Inventory", this._hass))}</span>
          <span class="mini-chip"><ha-icon icon="mdi:clipboard-check-outline"></ha-icon><strong>${esc(this._taskSummary?.tasks ?? 0)}</strong>${esc(hpT("Tasks", this._hass))}</span>
          <span class="mini-chip ${containerState}"><ha-icon icon="mdi:archive-outline"></ha-icon><strong>${esc(this._containerSummary?.containers ?? 0)}</strong>${esc(hpT("Containers", this._hass))}</span>
          <span class="mini-chip ${planState}"><ha-icon icon="mdi:clipboard-list-outline"></ha-icon><strong>${esc(this._planSummary?.plans ?? 0)}</strong>${esc(hpT("Plans", this._hass))}</span>
          ${(this._taskSummary?.overdue ?? 0) ? `<span class="mini-chip critical"><strong>${esc(this._taskSummary.overdue)}</strong>${esc(hpT("Overdue", this._hass))}</span>` : ""}
          ${(this._taskSummary?.due ?? 0) ? `<span class="mini-chip attention"><strong>${esc(this._taskSummary.due)}</strong>${esc(hpT("Due today", this._hass))}</span>` : ""}
          ${(this._taskSummary?.upcoming ?? 0) ? `<span class="mini-chip attention"><strong>${esc(this._taskSummary.upcoming)}</strong>${esc(hpT("Upcoming", this._hass))}</span>` : ""}
          ${planReviewRequired ? `<span class="mini-chip attention"><strong>${esc(planReviewRequired)}</strong>${esc(hpT("Review required", this._hass))}</span>` : ""}
        </div>
      </div>`);
  };
});

customElements.whenDefined("homeprep-status-card").then(() => {
  const cls = customElements.get("homeprep-status-card");
  if (!cls || cls.prototype.__homePrepReadinessPatched) return;
  const proto = cls.prototype;
  proto.__homePrepReadinessPatched = true;
  const oldLoad = proto.loadData;
  proto.loadData = async function loadData(...args) {
    await oldLoad.apply(this, args);
    await loadExtendedSummary(this);
    this.render();
  };
  proto.render = function render() {
    if (!this._hass) return;
    if (!this._summary) return;
    const status = overallStatus(this._summary.status || "ok", this._containerSummary?.status || "ok", this._planSummary?.status || "ok");
    const label = status === "critical" ? "Action required" : status === "attention" ? "Requires attention" : "Home is ready";
    this.innerHTML = this.wrap(`${this.renderHeader(this.config?.title || "HomePrep", "Preparedness overview", "mdi:shield-home")}<div class="hp-status-banner hp-${status}">${esc(label)}</div><div class="hp-grid">${[["Inventory",this._summary.items],["Containers",this._containerSummary?.containers ?? 0],["Plans",this._planSummary?.plans ?? 0],["Needs attention",(this._containerSummary?.critical ?? 0)+(this._containerSummary?.attention ?? 0)+(this._planSummary?.attention ?? 0)]].map(([labelText,value])=>`<div class="hp-metric"><div class="hp-metric-value">${value ?? 0}</div><div class="hp-metric-label">${esc(labelText)}</div></div>`).join("")}</div>`);
  };
});

customElements.whenDefined("homeprep-manage-card").then(() => {
  const cls = customElements.get("homeprep-manage-card");
  if (!cls || cls.prototype.__homePrepContainerPatched) return;
  const proto = cls.prototype;
  proto.__homePrepContainerPatched = true;

  const oldLoad = proto._load;
  proto._load = async function _load(...args) {
    await oldLoad.apply(this, args);
    try {
      const result = await this._hass.callWS({ type: "homeprep/containers" });
      this._containers = result?.containers || [];
    } catch (error) {
      console.error("HomePrep container list load failed", error);
      this._containers = [];
    }
    this._render();
  };

  const oldOpenAdd = proto._openAdd;
  proto._openAdd = function _openAdd(...args) {
    oldOpenAdd.apply(this, args);
    this._editingItem.container_id = null;
    this._render();
  };

  const oldOpenEdit = proto._openEdit;
  proto._openEdit = function _openEdit(...args) {
    oldOpenEdit.apply(this, args);
    if (this._editingItem) this._editingItem.container_id = this._items.find((item) => item.id === this._editingItem.id)?.container_id || null;
    this._render();
  };

  const oldRead = proto._read;
  proto._read = function _read(...args) {
    return { ...oldRead.apply(this, args), container_id: this.querySelector("#hp-container")?.value || null };
  };

  proto._containerOptions = function _containerOptions(selected) {
    return `<option value="">No container</option>${(this._containers || []).map((container) => `<option value="${esc(container.id)}" ${container.id === selected ? "selected" : ""}>${esc(container.name)}${container.location ? ` · ${esc(container.location)}` : ""}</option>`).join("")}`;
  };

  const oldForm = proto._form;
  proto._form = function _form(...args) {
    let html = oldForm.apply(this, args);
    if (!this._editingItem) return html;
    const field = `<label class="field"><span>Container</span><select id="hp-container">${this._containerOptions(this._editingItem.container_id)}</select></label>`;
    html = html.replace('<label class="field"><span>Expires</span>', `${field}<label class="field"><span>Expires</span>`);
    return html;
  };

  proto._save = async function _save() {
    const d = this._read();
    if (!d.name) return alert("Name is required.");
    const payload = {
      name: d.name, category: d.category, item_type: d.item_type,
      quantity: d.quantity, unit: d.unit,
      inspection_enabled: d.inspection_enabled,
      inspection_recurrence_type: d.inspection_recurrence_type,
      inspection_recurrence_interval: d.inspection_recurrence_interval,
      inspection_reschedule_mode: d.inspection_reschedule_mode,
      inspection_reminder_before_days: d.inspection_reminder_before_days,
    };
    ["expires_at", "last_checked", "next_check_at", "notes"].forEach((key) => { if (d[key]) payload[key] = d[key]; });
    try {
      const beforeIds = new Set((this._items || []).map((item) => item.id));
      let itemId = this._formMode === "edit" ? this._editingItem.id : null;
      if (this._formMode === "add") await this._hass.callService("homeprep", "add_item", payload);
      else await this._hass.callService("homeprep", "update_item", { item_id: itemId, ...payload });
      if (!itemId) {
        const items = await this._hass.callWS({ type: "homeprep/items" });
        itemId = (items.items || []).find((item) => !beforeIds.has(item.id))?.id || null;
      }
      if (itemId) await this._hass.callWS({ type: "homeprep/container/assign_item", item_id: itemId, container_id: d.container_id });
      this._editingItem = null;
      this._formMode = null;
      await this._load();
    } catch (error) {
      console.error(error);
      alert("HomePrep could not save the item.");
    }
  };
});
