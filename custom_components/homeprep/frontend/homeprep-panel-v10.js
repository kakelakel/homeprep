import "./homeprep-panel-v9.js?v=2";
import { getHomePrepLanguage } from "./homeprep-i18n.js?v=3";

const HomePrepPanel = customElements.get("homeprep-panel");

const CONTAINER_TYPES = [
  ["bag", "Bag", "mdi:bag-personal-outline"],
  ["box_crate", "Box / crate", "mdi:archive-outline"],
  ["water_container", "Water container", "mdi:water-outline"],
  ["cabinet_storage", "Cabinet / storage", "mdi:locker-multiple"],
  ["vehicle_storage", "Vehicle storage", "mdi:car-emergency"],
  ["other", "Other", "mdi:shape-outline"],
];

const SV = {
  "Bag": "Väska",
  "Box / crate": "Låda / back",
  "Water container": "Vattenbehållare",
  "Cabinet / storage": "Skåp / förvaring",
  "Vehicle storage": "Fordonsförvaring",
  "Other": "Övrigt",
  "Recurring container check": "Återkommande behållarkontroll",
  "Create a recurring task for checking this container.": "Skapa en återkommande uppgift för kontroll av behållaren.",
  "Review interval": "Intervall för genomgång",
  "Review every": "Gå igenom var",
  "Next review": "Nästa genomgång",
  "Last reviewed": "Senast genomgången",
  "Mark reviewed": "Markera genomgången",
  "Review required": "Genomgång krävs",
  "Checklist item": "Checklistpunkt",
  "Description / instructions": "Beskrivning / instruktion",
  "Linked inventory": "Länkat inventarie",
  "Linked containers": "Länkade behållare",
  "Save checklist item": "Spara checklistpunkt",
  "Edit checklist item": "Redigera checklistpunkt",
  "No linked resources": "Inga länkade resurser",
  "Containers": "Behållare",
  "Plans": "Planer",
};

function t(panel, text) {
  if (getHomePrepLanguage(panel?._hass) === "sv") return SV[text] || text;
  return text;
}

function esc(panel, value) {
  return panel.esc ? panel.esc(value) : String(value ?? "");
}

function optionList(values, selected) {
  const selectedSet = new Set(selected || []);
  return values.map((value) => `<option value="${value.id}" ${selectedSet.has(value.id) ? "selected" : ""}>${value.label}</option>`).join("");
}

if (HomePrepPanel && !HomePrepPanel.prototype.__homePrepV10Applied) {
  const proto = HomePrepPanel.prototype;
  proto.__homePrepV10Applied = true;

  proto.containerTypeLabel = function containerTypeLabel(type) {
    return t(this, CONTAINER_TYPES.find(([id]) => id === type)?.[1] || "Other");
  };

  proto.containerTypeIcon = function containerTypeIcon(type) {
    return CONTAINER_TYPES.find(([id]) => id === type)?.[2] || "mdi:shape-outline";
  };

  proto.containerInspection = function containerInspection(containerId) {
    return (this._tasks || []).find((task) => task.task_kind === "container_inspection" && task.linked_container_id === containerId) || null;
  };

  proto.renderContainerForm = function renderContainerForm(container) {
    const inspection = container ? this.containerInspection(container.id) : null;
    const recurring = Boolean(inspection?.enabled);
    const value = (key, fallback = "") => esc(this, container?.[key] ?? fallback);
    const typeOptions = CONTAINER_TYPES.map(([id, label]) => `<option value="${id}" ${container?.container_type === id || (!container && id === "other") ? "selected" : ""}>${t(this, label)}</option>`).join("");
    return `<div class="page-title"><div><h2>${container ? "Edit container" : "Add container"}</h2><p>Group supplies by where they are stored or what they are packed for.</p></div></div>
      <section class="panel-card form-card"><form id="hp-container-form" ${container ? `data-container-id="${esc(this, container.id)}"` : ""} class="form-grid">
        <label class="wide"><span>Name</span><input name="name" value="${value("name")}" required></label>
        <label><span>Container type</span><select name="container_type">${typeOptions}</select></label>
        <label><span>Location</span><input name="location" value="${value("location")}" placeholder="Hallway cabinet, basement, car…"></label>
        <label><span>Last checked</span><input type="date" name="last_checked_at" value="${value("last_checked_at")}"></label>
        <label><span>Next check</span><input type="date" name="next_check_at" value="${value("next_check_at")}"></label>
        <label class="wide check-box"><input name="container_inspection_enabled" type="checkbox" ${recurring ? "checked" : ""}><span>${t(this, "Recurring container check")}</span></label>
        <div class="inspection-grid wide">
          <label><span>Repeat every</span><input name="container_inspection_interval" type="number" min="1" value="${esc(this, inspection?.recurrence_interval ?? 6)}"></label>
          <label><span>Period</span><select name="container_inspection_type"><option value="weeks" ${inspection?.recurrence_type === "weeks" ? "selected" : ""}>Weeks</option><option value="months" ${inspection?.recurrence_type === "months" || !inspection ? "selected" : ""}>Months</option><option value="years" ${inspection?.recurrence_type === "years" ? "selected" : ""}>Years</option></select></label>
          <label><span>After completion</span><select name="container_inspection_reschedule"><option value="scheduled" ${inspection?.reschedule_mode === "scheduled" || !inspection ? "selected" : ""}>Keep planned cadence</option><option value="completion" ${inspection?.reschedule_mode === "completion" ? "selected" : ""}>Schedule from completion</option></select></label>
          <label><span>Reminder before due</span><input name="container_inspection_reminder" type="number" min="0" value="${esc(this, inspection?.reminder_before_days ?? 7)}"></label>
        </div>
        <div class="wide hint">${t(this, "Create a recurring task for checking this container.")}</div>
        <label class="wide"><span>Description</span><textarea name="description" rows="2">${value("description")}</textarea></label>
        <label class="wide"><span>Notes</span><textarea name="notes" rows="2">${value("notes")}</textarea></label>
        <div class="wide actions"><button class="primary" type="submit">Save container</button><button type="button" data-action="cancel-container">Cancel</button></div>
      </form></section>`;
  };

  proto.renderPlanForm = function renderPlanForm(plan) {
    const types = [["fire","Fire"],["flood","Flood / water"],["evacuation","Evacuation"],["power_outage","Power outage"],["communication","Communication"],["shelter","Shelter in place"],["other","Other"]];
    const options = types.map(([id,label]) => `<option value="${id}" ${plan?.plan_type === id || (!plan && id === "other") ? "selected" : ""}>${label}</option>`).join("");
    return `<div class="page-title"><div><h2>${plan ? "Edit plan" : "Add plan"}</h2><p>Use checklists for the things your household needs to know or have ready before an emergency happens.</p></div></div><section class="panel-card form-card"><form id="hp-plan-form" ${plan ? `data-plan-id="${esc(this, plan.id)}"` : ""} class="form-grid">
      <label class="wide"><span>Name</span><input name="name" value="${esc(this, plan?.name || "")}" required></label>
      <label><span>Plan type</span><select name="plan_type">${options}</select></label>
      <label><span>Meeting point</span><input name="meeting_point" value="${esc(this, plan?.meeting_point || "")}"></label>
      <label><span>${t(this, "Review every")}</span><div class="suffix-input"><input name="review_interval_months" type="number" min="0" value="${esc(this, plan?.review_interval_months ?? 6)}"><span>months</span></div></label>
      <label><span>${t(this, "Next review")}</span><input value="${esc(this, plan?.next_review_at || "Not scheduled")}" disabled></label>
      <label class="wide"><span>Description</span><textarea name="description" rows="2">${esc(this, plan?.description || "")}</textarea></label>
      <label class="check-box"><input type="checkbox" name="enabled" ${plan?.enabled !== false ? "checked" : ""}><span>Enabled</span></label>
      <label class="wide"><span>Notes</span><textarea name="notes" rows="2">${esc(this, plan?.notes || "")}</textarea></label>
      <div class="wide actions"><button class="primary" type="submit">Save plan</button><button type="button" data-action="cancel-plan">Cancel</button></div>
    </form></section>`;
  };

  proto.renderPlanItemForm = function renderPlanItemForm(plan, item = null) {
    const invValues = (this._items || []).map((value) => ({ id: value.id, label: esc(this, `${value.name} · ${this.category(value.category)?.label || value.category}`) }));
    const containerValues = (this._containers || []).map((value) => ({ id: value.id, label: esc(this, `${value.name}${value.location ? ` · ${value.location}` : ""}`) }));
    return `<section class="panel-card form-card hp-plan-item-editor"><div class="section-head"><h3>${t(this, item ? "Edit checklist item" : "Checklist item")}</h3></div><form id="hp-plan-item-form" data-plan-id="${esc(this, plan.id)}" ${item ? `data-item-id="${esc(this, item.id)}"` : ""} class="form-grid">
      <label class="wide"><span>Name</span><input name="label" value="${esc(this, item?.label || "")}" required></label>
      <label class="wide"><span>${t(this, "Description / instructions")}</span><textarea name="description" rows="3">${esc(this, item?.description || "")}</textarea></label>
      <label><span>${t(this, "Linked inventory")}</span><select name="linked_inventory_item_ids" multiple size="6">${optionList(invValues, item?.linked_inventory_item_ids)}</select></label>
      <label><span>${t(this, "Linked containers")}</span><select name="linked_container_ids" multiple size="6">${optionList(containerValues, item?.linked_container_ids)}</select></label>
      <div class="wide hint">Link the equipment or packed supplies that prove this checklist item is ready. Assets can be linked here in a later release.</div>
      <div class="wide actions"><button class="primary" type="submit">${t(this, "Save checklist item")}</button><button type="button" data-action="cancel-plan-item">Cancel</button></div>
    </form></section>`;
  };

  const oldHandleSubmit = proto.handleSubmit;
  proto.handleSubmit = async function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return oldHandleSubmit.call(this, event);

    if (form.id === "hp-container-form") {
      event.preventDefault();
      const data = new FormData(form);
      const containerPayload = {
        name: String(data.get("name") || "").trim(),
        container_type: String(data.get("container_type") || "other"),
        location: String(data.get("location") || "").trim() || null,
        description: String(data.get("description") || "").trim() || null,
        last_checked_at: String(data.get("last_checked_at") || "") || null,
        next_check_at: String(data.get("next_check_at") || "") || null,
        notes: String(data.get("notes") || "").trim() || null,
      };
      const existingId = form.dataset.containerId || null;
      const saved = existingId
        ? await this._hass.callWS({ type: "homeprep/container/update", container_id: existingId, updates: containerPayload })
        : await this._hass.callWS({ type: "homeprep/container/add", container: containerPayload });
      const containerId = existingId || saved.id;
      const existingTask = this.containerInspection(containerId);
      const enabled = data.get("container_inspection_enabled") === "on";
      if (enabled) {
        const task = {
          name: `Check ${containerPayload.name}`,
          task_kind: "container_inspection",
          category: "other",
          linked_container_id: containerId,
          recurrence_type: String(data.get("container_inspection_type") || "months"),
          recurrence_interval: Number(data.get("container_inspection_interval") || 6),
          reschedule_mode: String(data.get("container_inspection_reschedule") || "scheduled"),
          next_due_at: containerPayload.next_check_at,
          reminder_before_days: Number(data.get("container_inspection_reminder") || 7),
          enabled: true,
        };
        if (existingTask) await this._hass.callWS({ type: "homeprep/task/update", task_id: existingTask.id, updates: task });
        else await this._hass.callWS({ type: "homeprep/task/add", task });
      } else if (existingTask) {
        await this._hass.callWS({ type: "homeprep/task/update", task_id: existingTask.id, updates: { enabled: false } });
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
        review_interval_months: Number(data.get("review_interval_months") || 0),
        enabled: data.get("enabled") === "on",
        notes: String(data.get("notes") || "").trim() || null,
      };
      if (form.dataset.planId) await this._hass.callWS({ type: "homeprep/plan/update", plan_id: form.dataset.planId, updates: payload });
      else await this._hass.callWS({ type: "homeprep/plan/add", plan: { ...payload, checklist: [] } });
      this._editingPlan = null;
      this._creatingPlan = false;
      await this.loadData();
      return;
    }

    if (form.id === "hp-plan-item-form") {
      event.preventDefault();
      const data = new FormData(form);
      const linkedInventory = [...form.querySelector('[name="linked_inventory_item_ids"]').selectedOptions].map((option) => option.value);
      const linkedContainers = [...form.querySelector('[name="linked_container_ids"]').selectedOptions].map((option) => option.value);
      const payload = {
        label: String(data.get("label") || "").trim(),
        description: String(data.get("description") || "").trim() || null,
        linked_inventory_item_ids: linkedInventory,
        linked_container_ids: linkedContainers,
      };
      if (form.dataset.itemId) {
        await this._hass.callWS({ type: "homeprep/plan/update_item", plan_id: form.dataset.planId, item_id: form.dataset.itemId, updates: payload });
      } else {
        await this._hass.callWS({ type: "homeprep/plan/add_item", plan_id: form.dataset.planId, ...payload });
      }
      this._editingPlanItem = null;
      await this.loadData();
      return;
    }

    return oldHandleSubmit.call(this, event);
  };

  const oldHandleClick = proto.handleClick;
  proto.handleClick = async function handleClick(event) {
    const target = event.composedPath().find((el) => el instanceof HTMLElement && (el.dataset?.action || el.dataset?.templateId));
    const action = target?.dataset?.action;
    if (action === "add-plan-item") {
      this._editingPlanItem = { planId: target.dataset.id, itemId: null };
      this.render();
      return;
    }
    if (action === "edit-plan-item") {
      this._editingPlanItem = { planId: target.dataset.planId, itemId: target.dataset.itemId };
      this.render();
      return;
    }
    if (action === "cancel-plan-item") {
      this._editingPlanItem = null;
      this.render();
      return;
    }
    if (action === "mark-plan-reviewed") {
      await this._hass.callWS({ type: "homeprep/plan/mark_reviewed", plan_id: target.dataset.id });
      await this.loadData();
      return;
    }
    return oldHandleClick.call(this, event);
  };

  proto.renderPlans = function renderPlans() {
    if (this._creatingPlan) return this.renderPlanForm(null);
    if (this._editingPlan) return this.renderPlanForm(this.planById(this._editingPlan));
    const existingTypes = new Set((this._plans || []).map((plan) => plan.plan_type));
    const templates = (this._planTemplates || []).filter((template) => !existingTypes.has(template.plan_type)).map((template) => `<button data-action="add-plan-template" data-template-id="${esc(this, template.id)}"><ha-icon icon="mdi:file-document-plus-outline"></ha-icon> ${t(this, template.name)}</button>`).join("");
    const cards = (this._plans || []).map((plan) => {
      const status = plan.status || "attention";
      const checklist = plan.checklist || [];
      const itemEditor = this._editingPlanItem?.planId === plan.id
        ? this.renderPlanItemForm(plan, checklist.find((item) => item.id === this._editingPlanItem.itemId) || null)
        : "";
      return `<section class="panel-card hp-plan-card"><div class="target-top"><div><h3>${t(this, plan.name)}</h3><p>${plan.meeting_point ? `Meeting point: ${esc(this, plan.meeting_point)}` : esc(this, plan.description || "")}</p></div><span class="badge ${this.statusClass(status)} hp-status-pill">${plan.review_required ? t(this, "Review required") : status === "ok" ? "Ready" : "Needs attention"}</span></div>
        <div class="hp-plan-review"><span>${plan.last_reviewed_at ? `${t(this, "Last reviewed")}: <strong>${esc(this, plan.last_reviewed_at)}</strong>` : "Never reviewed"}</span><span>${plan.next_review_at ? `${t(this, "Next review")}: <strong>${esc(this, plan.next_review_at)}</strong>` : "No review schedule"}</span></div>
        <div class="readiness-summary"><strong>${plan.completed_count || 0} / ${plan.check_count || 0}</strong><span>Checklist</span></div>
        <div class="requirements">${checklist.map((item) => {
          const links = [
            ...(item.linked_inventory_items || []).map((linked) => `<span><ha-icon icon="mdi:package-variant"></ha-icon>${esc(this, linked.name)}</span>`),
            ...(item.linked_containers || []).map((linked) => `<span><ha-icon icon="mdi:archive-outline"></ha-icon>${esc(this, linked.name)}</span>`),
          ].join("");
          return `<div class="hp-plan-check-row"><button class="requirement ${item.completed ? "done" : ""}" data-action="toggle-plan-item" data-plan-id="${esc(this, plan.id)}" data-item-id="${esc(this, item.id)}"><ha-icon icon="${item.completed ? "mdi:check-circle" : "mdi:checkbox-blank-circle-outline"}"></ha-icon><span><strong>${esc(this, item.label)}</strong>${item.description ? `<small>${esc(this, item.description)}</small>` : ""}${links ? `<small class="hp-resource-links">${links}</small>` : ""}</span></button><div class="hp-plan-item-actions"><button class="icon-button" data-action="edit-plan-item" data-plan-id="${esc(this, plan.id)}" data-item-id="${esc(this, item.id)}" title="Edit checklist item"><ha-icon icon="mdi:pencil-outline"></ha-icon></button><button class="icon-button danger" data-action="delete-plan-item" data-plan-id="${esc(this, plan.id)}" data-item-id="${esc(this, item.id)}" title="Delete checklist item"><ha-icon icon="mdi:delete-outline"></ha-icon></button></div></div>`;
        }).join("") || '<div class="hint">No checklist items yet.</div>'}</div>
        ${itemEditor}
        <div class="actions"><button data-action="add-plan-item" data-id="${esc(this, plan.id)}"><ha-icon icon="mdi:plus"></ha-icon> Add checklist item</button><button data-action="mark-plan-reviewed" data-id="${esc(this, plan.id)}"><ha-icon icon="mdi:calendar-check"></ha-icon> ${t(this, "Mark reviewed")}</button><button data-action="edit-plan" data-id="${esc(this, plan.id)}">Edit</button><button class="danger" data-action="delete-plan" data-id="${esc(this, plan.id)}">Delete</button></div>
      </section>`;
    }).join("");
    return `<div class="page-title"><div><h2>Preparedness plans</h2><p>Use checklists for the things your household needs to know or have ready before an emergency happens.</p></div><button class="primary" data-action="add-plan"><ha-icon icon="mdi:plus"></ha-icon> Add plan</button></div>${templates ? `<section class="panel-card"><div class="section-head"><h3>Start from a template</h3></div><div class="actions">${templates}</div></section>` : ""}<div class="target-stack">${cards || '<section class="panel-card"><div class="empty">No plans yet.</div></section>'}</div>`;
  };

  const oldRenderOverview = proto.renderOverview;
  proto.renderOverview = function renderOverview() {
    const planning = this._planning || {};
    const ps = planning.summary || {};
    const ts = this._taskSummary || {};
    const cs = this._containerSummary || {};
    const pls = this._planSummary || {};
    const today = new Date().toISOString().slice(0, 10);
    const inventoryProblems = this._items.filter((item) => (item.expires_at && item.expires_at < today) || (item.next_check_at && item.next_check_at <= today)).length;
    const states = [ps.status, ts.status, cs.status, pls.status];
    const overall = states.includes("critical") || inventoryProblems ? "critical" : states.includes("attention") ? "attention" : "ok";
    const label = overall === "critical" ? "Action required" : overall === "attention" ? "Needs attention" : "Preparedness looks good";
    return `<section class="hero"><div class="hero-icon ${overall}"><ha-icon icon="mdi:shield-home"></ha-icon></div><div><h2>${label}</h2><p>HomePrep combines supplies, storage, recurring checks and household readiness plans.</p></div></section>
      <div class="metrics hp-overview-metrics">
        ${this.metric("Inventory", this._items.length, `${inventoryProblems} require action`, inventoryProblems ? "critical" : "ok", "inventory")}
        ${this.metric("Containers", cs.containers ?? 0, `${(cs.critical ?? 0) + (cs.attention ?? 0)} need attention`, cs.status || "ok", "containers")}
        ${this.metric("Tasks", ts.tasks ?? 0, `${(ts.overdue ?? 0) + (ts.due ?? 0) + (ts.upcoming ?? 0)} need attention`, ts.status || "ok", "tasks")}
        ${this.metric("Plans", pls.plans ?? 0, `${pls.attention ?? 0} need attention`, pls.status || "ok", "plans")}
        ${this.metric("Targets", ps.targets ?? 0, `${(ps.below_minimum ?? 0) + (ps.below_target ?? 0) + (ps.unknown ?? 0)} not fully ready`, ps.status || "ok", "targets")}
        ${this.metric("Guidance", this._recommendations.length, this.profileForCountry(planning.household?.country_code)?.unofficial ? "General baseline" : "Official profile", "ok", "recommendations")}
      </div>
      <div class="section-grid"><section class="panel-card"><div class="section-head"><h3>Next actions</h3><button data-view="tasks">View tasks</button></div>${this._tasks.filter((task) => ["overdue", "due", "upcoming"].includes(task.status)).slice(0, 5).map((task) => this.taskRow(task, true)).join("") || '<div class="empty">No task needs attention.</div>'}</section><section class="panel-card"><div class="section-head"><h3>Readiness</h3></div><div class="row"><div class="row-main"><strong>${pls.attention ?? 0} plans need attention</strong><small>${pls.review_required ?? 0} require review</small></div></div><div class="row"><div class="row-main"><strong>${cs.critical ?? 0} critical containers</strong><small>${cs.attention ?? 0} additional containers need attention</small></div></div></section></div>`;
  };

  const oldStyles = proto.styles;
  proto.styles = function styles() {
    return `${oldStyles.call(this)}
      .hp-status-pill{display:inline-flex!important;align-items:center;justify-content:center;min-height:28px;width:auto!important;max-width:160px;text-align:center;line-height:1.1;padding:6px 10px!important}
      .hp-plan-review{display:flex;gap:14px;flex-wrap:wrap;margin:10px 0;font-size:9px;color:var(--hp-panel-muted)}
      .hp-plan-review strong{color:var(--hp-panel-text)}
      .hp-plan-item-actions{display:flex;gap:4px}
      .hp-resource-links{display:flex!important;gap:8px;flex-wrap:wrap;margin-top:5px!important}
      .hp-resource-links span{display:inline-flex;align-items:center;gap:3px;color:var(--hp-panel-accent)}
      .hp-resource-links ha-icon{width:13px;height:13px}
      .hp-plan-item-editor{margin-top:10px;border-color:color-mix(in srgb,var(--hp-panel-accent) 40%,var(--hp-panel-border))}
      .hp-plan-item-editor select[multiple]{min-height:130px}
      .hp-overview-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}
      @media(max-width:800px){.hp-overview-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;
  };
}
