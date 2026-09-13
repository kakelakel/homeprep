import "./homeprep-panel-v7.js?v=11";
import { getHomePrepLanguage } from "./homeprep-i18n.js?v=3";

const HomePrepPanel = customElements.get("homeprep-panel");

const SV = {
  Containers: "Behållare",
  Plans: "Planer",
  "Preparedness containers": "Beredskapsbehållare",
  "Group supplies by where they are stored or what they are packed for.": "Gruppera förnödenheter efter var de förvaras eller vad de är packade för.",
  "Add container": "Lägg till behållare",
  "Edit container": "Redigera behållare",
  "Container type": "Typ av behållare",
  Location: "Plats",
  "Last checked": "Senast kontrollerad",
  "Next check": "Nästa kontroll",
  "Mark checked": "Markera kontrollerad",
  "No containers yet.": "Inga behållare ännu.",
  "Go bag": "Go-bag",
  "Prep crate": "Beredskapslåda",
  "Water container": "Vattenbehållare",
  "First aid kit": "Första hjälpen-kit",
  "Vehicle kit": "Fordonskit",
  Storage: "Förvaring",
  Other: "Övrigt",
  Container: "Behållare",
  "No container": "Ingen behållare",
  "Preparedness plans": "Beredskapsplaner",
  "Use checklists for the things your household needs to know or have ready before an emergency happens.": "Använd checklistor för det hushållet behöver känna till eller ha klart innan en nödsituation inträffar.",
  "Add plan": "Lägg till plan",
  "Fire safety plan": "Brandsäkerhetsplan",
  "Flood and water damage plan": "Plan för översvämning och vattenskada",
  "Rapid evacuation plan": "Plan för snabb utrymning",
  "Start from a template": "Skapa från mall",
  "No plans yet.": "Inga planer ännu.",
  "Checklist": "Checklista",
  "Add checklist item": "Lägg till checklistpunkt",
  "Meeting point": "Samlingsplats",
  "Ready": "Redo",
  "Needs attention": "Behöver uppmärksamhet",
  "items": "artiklar",
  "Save container": "Spara behållare",
  "Save plan": "Spara plan",
};

function t(panel, text) {
  if (getHomePrepLanguage(panel?._hass) === "sv") return SV[text] || text;
  return text;
}

const CONTAINER_TYPES = [
  ["go_bag", "Go bag", "mdi:bag-personal-outline"],
  ["prep_crate", "Prep crate", "mdi:archive-outline"],
  ["water_container", "Water container", "mdi:water-outline"],
  ["first_aid_kit", "First aid kit", "mdi:medical-bag"],
  ["vehicle_kit", "Vehicle kit", "mdi:car-emergency"],
  ["storage", "Storage", "mdi:package-variant-closed"],
  ["other", "Other", "mdi:shape-outline"],
];

function esc(panel, value) {
  return panel.esc ? panel.esc(value) : String(value ?? "");
}

if (HomePrepPanel && !HomePrepPanel.prototype.__homePrepV9Applied) {
  const proto = HomePrepPanel.prototype;
  proto.__homePrepV9Applied = true;

  proto.containerById = function containerById(id) {
    return (this._containers || []).find((container) => container.id === id) || null;
  };

  proto.planById = function planById(id) {
    return (this._plans || []).find((plan) => plan.id === id) || null;
  };

  proto.containerTypeLabel = function containerTypeLabel(type) {
    return t(this, CONTAINER_TYPES.find(([id]) => id === type)?.[1] || "Other");
  };

  proto.containerTypeIcon = function containerTypeIcon(type) {
    return CONTAINER_TYPES.find(([id]) => id === type)?.[2] || "mdi:shape-outline";
  };

  proto.containerOptions = function containerOptions(selected = "") {
    return `<option value="">${t(this, "No container")}</option>${(this._containers || [])
      .map((container) => `<option value="${esc(this, container.id)}" ${container.id === selected ? "selected" : ""}>${esc(this, container.name)}${container.location ? ` · ${esc(this, container.location)}` : ""}</option>`)
      .join("")}`;
  };

  const oldLoadData = proto.loadData;
  proto.loadData = async function loadData(...args) {
    const result = await oldLoadData.apply(this, args);
    if (!this._hass || this._loading) return result;
    try {
      const [containers, plans] = await Promise.all([
        this._hass.callWS({ type: "homeprep/containers" }),
        this._hass.callWS({ type: "homeprep/plans" }),
      ]);
      this._containers = containers?.containers || [];
      this._containerSummary = containers?.summary || {};
      this._plans = plans?.plans || [];
      this._planSummary = plans?.summary || {};
      this._planTemplates = plans?.templates || [];
    } catch (error) {
      console.error("HomePrep containers/plans load failed", error);
      this._containers = this._containers || [];
      this._plans = this._plans || [];
      this._planTemplates = this._planTemplates || [];
    }
    this.render();
    return result;
  };

  const oldResetEditors = proto.resetEditors;
  proto.resetEditors = function resetEditors() {
    oldResetEditors.call(this);
    this._editingContainer = null;
    this._creatingContainer = false;
    this._editingPlan = null;
    this._creatingPlan = false;
  };

  const oldRenderItemForm = proto.renderItemForm;
  proto.renderItemForm = function renderItemForm(item) {
    let html = oldRenderItemForm.call(this, item);
    const field = `<label><span>${t(this, "Container")}</span><select name="container_id">${this.containerOptions(item?.container_id || "")}</select></label>`;
    html = html.replace('<label><span>Expires</span>', `${field}<label><span>Expires</span>`);
    return html;
  };

  const oldHandleSubmit = proto.handleSubmit;
  proto.handleSubmit = async function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return oldHandleSubmit.call(this, event);

    if (form.id === "hp-container-form") {
      event.preventDefault();
      const data = new FormData(form);
      const payload = {
        name: String(data.get("name") || "").trim(),
        container_type: String(data.get("container_type") || "other"),
        location: String(data.get("location") || "").trim() || null,
        description: String(data.get("description") || "").trim() || null,
        last_checked_at: String(data.get("last_checked_at") || "") || null,
        next_check_at: String(data.get("next_check_at") || "") || null,
        notes: String(data.get("notes") || "").trim() || null,
      };
      if (form.dataset.containerId) {
        await this._hass.callWS({ type: "homeprep/container/update", container_id: form.dataset.containerId, updates: payload });
      } else {
        await this._hass.callWS({ type: "homeprep/container/add", container: payload });
      }
      this._editingContainer = null;
      this._creatingContainer = false;
      await this.loadData();
      return;
    }

    if (form.id === "hp-plan-form") {
      event.preventDefault();
      const data = new FormData(form);
      const payload = {
        name: String(data.get("name") || "").trim(),
        plan_type: String(data.get("plan_type") || "other"),
        description: String(data.get("description") || "").trim() || null,
        meeting_point: String(data.get("meeting_point") || "").trim() || null,
        enabled: data.get("enabled") === "on",
        notes: String(data.get("notes") || "").trim() || null,
      };
      if (form.dataset.planId) {
        await this._hass.callWS({ type: "homeprep/plan/update", plan_id: form.dataset.planId, updates: payload });
      } else {
        await this._hass.callWS({ type: "homeprep/plan/add", plan: { ...payload, checklist: [] } });
      }
      this._editingPlan = null;
      this._creatingPlan = false;
      await this.loadData();
      return;
    }

    if (form.id === "hp-item-form") {
      const data = new FormData(form);
      const containerId = String(data.get("container_id") || "") || null;
      const existingId = form.dataset.itemId || null;
      const beforeIds = new Set((this._items || []).map((item) => item.id));
      const result = await oldHandleSubmit.call(this, event);
      let itemId = existingId;
      if (!itemId) itemId = (this._items || []).find((item) => !beforeIds.has(item.id))?.id || null;
      if (itemId) {
        await this._hass.callWS({ type: "homeprep/container/assign_item", item_id: itemId, container_id: containerId });
        await this.loadData();
      }
      return result;
    }

    return oldHandleSubmit.call(this, event);
  };

  const oldHandleClick = proto.handleClick;
  proto.handleClick = async function handleClick(event) {
    const target = event.composedPath().find((el) => el instanceof HTMLElement && (el.dataset?.action || el.dataset?.templateId));
    const action = target?.dataset?.action;

    try {
      if (action === "add-container") { this._creatingContainer = true; this._editingContainer = null; this.render(); return; }
      if (action === "edit-container") { this._editingContainer = target.dataset.id; this._creatingContainer = false; this.render(); return; }
      if (action === "cancel-container") { this._editingContainer = null; this._creatingContainer = false; this.render(); return; }
      if (action === "delete-container") {
        if (!confirm("Delete this container? Inventory items will be kept but become unassigned.")) return;
        await this._hass.callWS({ type: "homeprep/container/delete", container_id: target.dataset.id });
        await this.loadData(); return;
      }
      if (action === "mark-container-checked") {
        await this._hass.callWS({ type: "homeprep/container/mark_checked", container_id: target.dataset.id });
        await this.loadData(); return;
      }
      if (action === "add-plan") { this._creatingPlan = true; this._editingPlan = null; this.render(); return; }
      if (action === "edit-plan") { this._editingPlan = target.dataset.id; this._creatingPlan = false; this.render(); return; }
      if (action === "cancel-plan") { this._editingPlan = null; this._creatingPlan = false; this.render(); return; }
      if (action === "delete-plan") {
        if (!confirm("Delete this preparedness plan?")) return;
        await this._hass.callWS({ type: "homeprep/plan/delete", plan_id: target.dataset.id });
        await this.loadData(); return;
      }
      if (action === "add-plan-template") {
        await this._hass.callWS({ type: "homeprep/plan/add_template", template_id: target.dataset.templateId });
        await this.loadData(); return;
      }
      if (action === "toggle-plan-item") {
        await this._hass.callWS({ type: "homeprep/plan/toggle_item", plan_id: target.dataset.planId, item_id: target.dataset.itemId });
        await this.loadData(); return;
      }
      if (action === "add-plan-item") {
        const label = window.prompt("Checklist item");
        if (!label?.trim()) return;
        await this._hass.callWS({ type: "homeprep/plan/add_item", plan_id: target.dataset.id, label: label.trim() });
        await this.loadData(); return;
      }
      if (action === "delete-plan-item") {
        await this._hass.callWS({ type: "homeprep/plan/delete_item", plan_id: target.dataset.planId, item_id: target.dataset.itemId });
        await this.loadData(); return;
      }
    } catch (error) {
      console.error("HomePrep container/plan action failed", error);
      alert(`HomePrep: ${error?.message || error}`);
      return;
    }

    return oldHandleClick.call(this, event);
  };

  proto.renderContainerForm = function renderContainerForm(container) {
    const value = (key, fallback = "") => esc(this, container?.[key] ?? fallback);
    const typeOptions = CONTAINER_TYPES.map(([id, label]) => `<option value="${id}" ${container?.container_type === id || (!container && id === "other") ? "selected" : ""}>${t(this, label)}</option>`).join("");
    return `<div class="page-title"><div><h2>${t(this, container ? "Edit container" : "Add container")}</h2><p>${t(this, "Group supplies by where they are stored or what they are packed for.")}</p></div></div>
      <section class="panel-card form-card"><form id="hp-container-form" ${container ? `data-container-id="${esc(this, container.id)}"` : ""} class="form-grid">
        <label class="wide"><span>Name</span><input name="name" value="${value("name")}" required></label>
        <label><span>${t(this, "Container type")}</span><select name="container_type">${typeOptions}</select></label>
        <label><span>${t(this, "Location")}</span><input name="location" value="${value("location")}" placeholder="Hallway cabinet, basement, car…"></label>
        <label><span>${t(this, "Last checked")}</span><input type="date" name="last_checked_at" value="${value("last_checked_at")}"></label>
        <label><span>${t(this, "Next check")}</span><input type="date" name="next_check_at" value="${value("next_check_at")}"></label>
        <label class="wide"><span>Description</span><textarea name="description" rows="2">${value("description")}</textarea></label>
        <label class="wide"><span>Notes</span><textarea name="notes" rows="2">${value("notes")}</textarea></label>
        <div class="wide actions"><button class="primary" type="submit">${t(this, "Save container")}</button><button type="button" data-action="cancel-container">Cancel</button></div>
      </form></section>`;
  };

  proto.renderContainers = function renderContainers() {
    if (this._creatingContainer) return this.renderContainerForm(null);
    if (this._editingContainer) return this.renderContainerForm(this.containerById(this._editingContainer));
    const cards = (this._containers || []).map((container) => {
      const status = container.status || "ok";
      const statusText = status === "ok" ? t(this, "Ready") : t(this, "Needs attention");
      const items = container.items || [];
      return `<section class="panel-card hp-container-card">
        <div class="target-top"><div class="recommendation-head"><div class="row-icon ${this.statusClass(status)}"><ha-icon icon="${this.containerTypeIcon(container.container_type)}"></ha-icon></div><div><h3>${esc(this, container.name)}</h3><p>${t(this, this.containerTypeLabel(container.container_type))}${container.location ? ` · ${esc(this, container.location)}` : ""}</p></div></div><span class="badge ${this.statusClass(status)}">${statusText}</span></div>
        <div class="hp-container-meta"><span><strong>${items.length}</strong> ${t(this, "items")}</span>${container.last_checked_at ? `<span>${t(this, "Last checked")}: <strong>${esc(this, container.last_checked_at)}</strong></span>` : ""}${container.next_check_at ? `<span>${t(this, "Next check")}: <strong>${esc(this, container.next_check_at)}</strong></span>` : ""}</div>
        <div class="hp-container-items">${items.map((item) => `<div class="row"><div class="row-main"><strong>${esc(this, item.name)}</strong><small>${esc(this, item.quantity)} ${esc(this, item.unit || "")}${item.expires_at ? ` · Expires ${esc(this, item.expires_at)}` : ""}</small></div></div>`).join("") || '<div class="empty">No inventory items assigned.</div>'}</div>
        <div class="actions"><button data-action="edit-container" data-id="${esc(this, container.id)}">Edit</button><button data-action="mark-container-checked" data-id="${esc(this, container.id)}">${t(this, "Mark checked")}</button><button class="danger" data-action="delete-container" data-id="${esc(this, container.id)}">Delete</button></div>
      </section>`;
    }).join("");
    return `<div class="page-title"><div><h2>${t(this, "Preparedness containers")}</h2><p>${t(this, "Group supplies by where they are stored or what they are packed for.")}</p></div><button class="primary" data-action="add-container"><ha-icon icon="mdi:plus"></ha-icon> ${t(this, "Add container")}</button></div><div class="target-stack">${cards || `<section class="panel-card"><div class="empty">${t(this, "No containers yet.")}</div></section>`}</div>`;
  };

  proto.renderPlanForm = function renderPlanForm(plan) {
    const types = [["fire","Fire"],["flood","Flood / water"],["evacuation","Evacuation"],["power_outage","Power outage"],["communication","Communication"],["shelter","Shelter in place"],["other","Other"]];
    const options = types.map(([id,label]) => `<option value="${id}" ${plan?.plan_type === id || (!plan && id === "other") ? "selected" : ""}>${label}</option>`).join("");
    return `<div class="page-title"><div><h2>${plan ? "Edit plan" : t(this, "Add plan")}</h2><p>${t(this, "Use checklists for the things your household needs to know or have ready before an emergency happens.")}</p></div></div><section class="panel-card form-card"><form id="hp-plan-form" ${plan ? `data-plan-id="${esc(this, plan.id)}"` : ""} class="form-grid">
      <label class="wide"><span>Name</span><input name="name" value="${esc(this, plan?.name || "")}" required></label>
      <label><span>Plan type</span><select name="plan_type">${options}</select></label>
      <label><span>${t(this, "Meeting point")}</span><input name="meeting_point" value="${esc(this, plan?.meeting_point || "")}"></label>
      <label class="wide"><span>Description</span><textarea name="description" rows="2">${esc(this, plan?.description || "")}</textarea></label>
      <label class="check-box"><input type="checkbox" name="enabled" ${plan?.enabled !== false ? "checked" : ""}><span>Enabled</span></label>
      <label class="wide"><span>Notes</span><textarea name="notes" rows="2">${esc(this, plan?.notes || "")}</textarea></label>
      <div class="wide actions"><button class="primary" type="submit">${t(this, "Save plan")}</button><button type="button" data-action="cancel-plan">Cancel</button></div>
    </form></section>`;
  };

  proto.renderPlans = function renderPlans() {
    if (this._creatingPlan) return this.renderPlanForm(null);
    if (this._editingPlan) return this.renderPlanForm(this.planById(this._editingPlan));
    const existingTypes = new Set((this._plans || []).map((plan) => plan.plan_type));
    const templates = (this._planTemplates || []).filter((template) => !existingTypes.has(template.plan_type)).map((template) => `<button data-action="add-plan-template" data-template-id="${esc(this, template.id)}"><ha-icon icon="mdi:file-document-plus-outline"></ha-icon> ${t(this, template.name)}</button>`).join("");
    const cards = (this._plans || []).map((plan) => {
      const status = plan.status || "attention";
      const checklist = plan.checklist || [];
      return `<section class="panel-card hp-plan-card"><div class="target-top"><div><h3>${t(this, plan.name)}</h3><p>${plan.meeting_point ? `${t(this, "Meeting point")}: ${esc(this, plan.meeting_point)}` : esc(this, plan.description || "")}</p></div><span class="badge ${this.statusClass(status)}">${status === "ok" ? t(this, "Ready") : t(this, "Needs attention")}</span></div>
        <div class="readiness-summary"><strong>${plan.completed_count || 0} / ${plan.check_count || 0}</strong><span>${t(this, "Checklist")}</span></div>
        <div class="requirements">${checklist.map((item) => `<div class="hp-plan-check-row"><button class="requirement ${item.completed ? "done" : ""}" data-action="toggle-plan-item" data-plan-id="${esc(this, plan.id)}" data-item-id="${esc(this, item.id)}"><ha-icon icon="${item.completed ? "mdi:check-circle" : "mdi:checkbox-blank-circle-outline"}"></ha-icon><span><strong>${esc(this, item.label)}</strong>${item.description ? `<small>${esc(this, item.description)}</small>` : ""}</span></button><button class="icon-button danger" data-action="delete-plan-item" data-plan-id="${esc(this, plan.id)}" data-item-id="${esc(this, item.id)}" title="Delete checklist item"><ha-icon icon="mdi:delete-outline"></ha-icon></button></div>`).join("") || '<div class="hint">No checklist items yet.</div>'}</div>
        <div class="actions"><button data-action="add-plan-item" data-id="${esc(this, plan.id)}"><ha-icon icon="mdi:plus"></ha-icon> ${t(this, "Add checklist item")}</button><button data-action="edit-plan" data-id="${esc(this, plan.id)}">Edit</button><button class="danger" data-action="delete-plan" data-id="${esc(this, plan.id)}">Delete</button></div>
      </section>`;
    }).join("");
    return `<div class="page-title"><div><h2>${t(this, "Preparedness plans")}</h2><p>${t(this, "Use checklists for the things your household needs to know or have ready before an emergency happens.")}</p></div><button class="primary" data-action="add-plan"><ha-icon icon="mdi:plus"></ha-icon> ${t(this, "Add plan")}</button></div>${templates ? `<section class="panel-card"><div class="section-head"><h3>${t(this, "Start from a template")}</h3></div><div class="actions">${templates}</div></section>` : ""}<div class="target-stack">${cards || `<section class="panel-card"><div class="empty">${t(this, "No plans yet.")}</div></section>`}</div>`;
  };

  const oldStyles = proto.styles;
  proto.styles = function styles() {
    return `${oldStyles.call(this)}
      .hp-container-meta{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0 12px;font-size:9px;color:var(--hp-panel-muted)}
      .hp-container-meta strong{color:var(--hp-panel-text)}
      .hp-container-items{border-top:1px solid var(--hp-panel-border);border-bottom:1px solid var(--hp-panel-border);margin:10px 0 12px}
      .hp-plan-check-row{display:grid;grid-template-columns:1fr auto;gap:6px;align-items:stretch}
      .hp-plan-check-row .requirement{margin:0}
      .hp-plan-check-row .icon-button{align-self:stretch}
    `;
  };

  const oldRender = proto.render;
  proto.render = function render() {
    const result = oldRender.call(this);
    const nav = this.querySelector(".tabs");
    if (nav && !nav.querySelector('[data-view="containers"]')) {
      const tasks = nav.querySelector('[data-view="tasks"]');
      const containerButton = `<button class="${this._active === "containers" ? "active" : ""}" data-view="containers"><ha-icon icon="mdi:package-variant"></ha-icon><span>${t(this, "Containers")}</span></button>`;
      const planButton = `<button class="${this._active === "plans" ? "active" : ""}" data-view="plans"><ha-icon icon="mdi:clipboard-list-outline"></ha-icon><span>${t(this, "Plans")}</span></button>`;
      if (tasks) tasks.insertAdjacentHTML("beforebegin", `${containerButton}${planButton}`);
      else nav.insertAdjacentHTML("beforeend", `${containerButton}${planButton}`);
    }
    const main = this.querySelector("main");
    if (main && this._loaded && !this._error) {
      if (this._active === "containers") main.innerHTML = this.renderContainers();
      if (this._active === "plans") main.innerHTML = this.renderPlans();
    }
    return result;
  };
}
