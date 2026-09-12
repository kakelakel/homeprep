class HomePrepManageCard extends HTMLElement {
  constructor() {
    super();
    this._items = [];
    this._tasks = [];
    this._taxonomy = { categories: [], item_types: [], units: [] };
    this._editingItem = null;
    this._formMode = null;
    this._inventoryCollapsed = false;
    this._collapsedCategories = new Set();
    this.addEventListener("click", (e) => this._onClick(e));
    this.addEventListener("change", (e) => this._onChange(e));
  }

  static getConfigElement() {
    return document.createElement("homeprep-card-editor");
  }

  static getStubConfig() {
    return { inventory_collapsed: false };
  }

  setConfig(config) {
    this.config = config || {};
    this._inventoryCollapsed = this.config.inventory_collapsed === true;
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._load();
  }

  getCardSize() { return 12; }

  _esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  async _load() {
    if (!this._hass || this._loading) return;
    this._loading = true;
    try {
      const [items, taxonomy, tasks] = await Promise.all([
        this._hass.callWS({ type: "homeprep/items" }),
        this._hass.callWS({ type: "homeprep/taxonomy" }),
        this._hass.callWS({ type: "homeprep/tasks" }),
      ]);
      this._items = items.items ?? [];
      this._tasks = tasks.tasks ?? [];
      this._taxonomy = {
        categories: taxonomy.categories ?? [],
        item_types: taxonomy.item_types ?? [],
        units: taxonomy.units ?? [],
      };
      this._error = null;
    } catch (error) {
      console.error("HomePrep manage load failed", error);
      this._error = error;
    }
    this._loading = false;
    this._render();
  }

  _category(id) { return this._taxonomy.categories.find((x) => x.id === id) || null; }
  _unit(id) { return this._taxonomy.units.find((x) => x.id === id) || null; }
  _type(id) { return this._taxonomy.item_types.find((x) => x.id === id) || null; }
  _inspection(itemId) {
    return this._tasks.find((t) => t.linked_item_id === itemId && t.task_kind === "inspection") || null;
  }

  _onClick(event) {
    const target = event.composedPath().find((el) => el instanceof HTMLElement && (el.id || el.dataset?.action));
    if (!target) return;
    if (target.id === "add-item") return this._openAdd();
    if (target.id === "save-editor") return this._save();
    if (target.id === "cancel-editor" || target.id === "cancel-editor-bottom") return this._close();
    if (target.id === "toggle-inventory") {
      this._inventoryCollapsed = !this._inventoryCollapsed;
      return this._render();
    }
    if (target.dataset.action === "toggle-category") {
      const id = target.dataset.category;
      this._collapsedCategories.has(id) ? this._collapsedCategories.delete(id) : this._collapsedCategories.add(id);
      return this._render();
    }
    if (target.dataset.action === "edit") return this._openEdit(target.dataset.id);
    if (target.dataset.action === "delete") return this._delete(target.dataset.id);
  }

  _onChange(event) {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.id === "hp-inspection-enabled") {
      const enabled = target.checked;
      this.querySelectorAll("[data-inspection-control]").forEach((el) => { el.disabled = !enabled; });
      this.querySelector("#inspection-settings")?.classList.toggle("inspection-disabled", !enabled);
      return;
    }
    if (!(target instanceof HTMLSelectElement) || target.id !== "hp-category") return;
    const unit = this.querySelector("#hp-unit");
    if (!unit) return;
    const current = unit.value;
    unit.innerHTML = this._unitOptions(target.value, current);
    if ([...unit.options].some((o) => o.value === current)) unit.value = current;
  }

  _openAdd() {
    const c = this._taxonomy.categories[0];
    this._editingItem = {
      name: "", category: c?.id || "other",
      item_type: this._taxonomy.item_types[0]?.id || "consumable",
      quantity: 1, unit: c?.default_unit || "piece",
      expires_at: "", last_checked: "", next_check_at: "", notes: "",
      inspection_enabled: false,
      inspection_recurrence_type: "months",
      inspection_recurrence_interval: 1,
      inspection_reschedule_mode: "scheduled",
      inspection_reminder_before_days: 7,
    };
    this._formMode = "add";
    this._render();
  }

  _openEdit(id) {
    const item = this._items.find((x) => x.id === id);
    if (!item) return;
    const task = this._inspection(id);
    this._editingItem = {
      ...item,
      expires_at: item.expires_at || "",
      last_checked: item.last_checked || "",
      next_check_at: task?.next_due_at || item.next_check_at || "",
      notes: item.notes || "",
      inspection_enabled: task?.enabled === true,
      inspection_recurrence_type: task?.recurrence_type || "months",
      inspection_recurrence_interval: task?.recurrence_interval || 1,
      inspection_reschedule_mode: task?.reschedule_mode || "scheduled",
      inspection_reminder_before_days: task?.reminder_before_days ?? 7,
    };
    this._formMode = "edit";
    this._render();
  }

  _close() {
    this._editingItem = null;
    this._formMode = null;
    this._render();
  }

  _read() {
    const q = (id) => this.querySelector(id);
    return {
      name: q("#hp-name")?.value.trim() || "",
      category: q("#hp-category")?.value || "other",
      item_type: q("#hp-type")?.value || "consumable",
      quantity: Number(q("#hp-quantity")?.value || 0),
      unit: q("#hp-unit")?.value || "piece",
      expires_at: q("#hp-expires")?.value || "",
      last_checked: q("#hp-last-checked")?.value || "",
      next_check_at: q("#hp-next-check")?.value || "",
      notes: q("#hp-notes")?.value.trim() || "",
      inspection_enabled: q("#hp-inspection-enabled")?.checked === true,
      inspection_recurrence_type: q("#hp-inspection-recurrence-type")?.value || "months",
      inspection_recurrence_interval: Number(q("#hp-inspection-recurrence-interval")?.value || 1),
      inspection_reschedule_mode: q("#hp-inspection-reschedule-mode")?.value || "scheduled",
      inspection_reminder_before_days: Number(q("#hp-inspection-reminder")?.value || 0),
    };
  }

  async _save() {
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
    ["expires_at", "last_checked", "next_check_at", "notes"].forEach((k) => {
      if (d[k]) payload[k] = d[k];
    });
    try {
      if (this._formMode === "add") {
        await this._hass.callService("homeprep", "add_item", payload);
      } else {
        await this._hass.callService("homeprep", "update_item", { item_id: this._editingItem.id, ...payload });
      }
      this._editingItem = null;
      this._formMode = null;
      await this._load();
    } catch (error) {
      console.error(error);
      alert("HomePrep could not save the item.");
    }
  }

  async _delete(id) {
    const item = this._items.find((x) => x.id === id);
    if (!item || !confirm(`Delete "${item.name}"?`)) return;
    await this._hass.callService("homeprep", "delete_item", { item_id: id });
    await this._load();
  }

  _categoryOptions(selected) {
    return this._taxonomy.categories.map((x) => `<option value="${this._esc(x.id)}" ${x.id === selected ? "selected" : ""}>${this._esc(x.label)}</option>`).join("");
  }

  _typeOptions(selected) {
    return this._taxonomy.item_types.map((x) => `<option value="${this._esc(x.id)}" ${x.id === selected ? "selected" : ""}>${this._esc(x.label)}</option>`).join("");
  }

  _unitOptions(categoryId, selected) {
    const c = this._category(categoryId);
    const preferred = new Set(c?.preferred_units || []);
    const ordered = [
      ...this._taxonomy.units.filter((u) => preferred.has(u.id)),
      ...this._taxonomy.units.filter((u) => !preferred.has(u.id)),
    ];
    return ordered.map((u) => `<option value="${this._esc(u.id)}" ${u.id === selected ? "selected" : ""}>${this._esc(u.label + (u.symbol ? ` (${u.symbol})` : ""))}</option>`).join("");
  }

  _form() {
    const i = this._editingItem;
    if (!i) return "";
    const checked = i.inspection_enabled ? "checked" : "";
    const disabled = i.inspection_enabled ? "" : "disabled";
    const recurrenceOptions = [["days","Days"],["weeks","Weeks"],["months","Months"],["years","Years"]]
      .map(([v,l]) => `<option value="${v}" ${i.inspection_recurrence_type === v ? "selected" : ""}>${l}</option>`).join("");
    return `
      <div class="editor">
        <div class="editor-head"><strong>${this._formMode === "add" ? "Add item" : "Edit item"}</strong><button id="cancel-editor" class="icon-button"><ha-icon icon="mdi:close"></ha-icon></button></div>
        <div class="form-grid">
          <label class="field wide"><span>Name</span><input id="hp-name" value="${this._esc(i.name)}"></label>
          <label class="field"><span>Category</span><select id="hp-category">${this._categoryOptions(i.category)}</select></label>
          <label class="field"><span>Item type</span><select id="hp-type">${this._typeOptions(i.item_type)}</select></label>
          <label class="field"><span>Quantity</span><input id="hp-quantity" type="number" min="0" step="any" value="${this._esc(i.quantity)}"></label>
          <label class="field"><span>Unit</span><select id="hp-unit">${this._unitOptions(i.category, i.unit)}</select></label>
          <label class="field"><span>Expires</span><input id="hp-expires" type="date" value="${this._esc(i.expires_at)}"></label>
          <label class="field"><span>Last checked</span><input id="hp-last-checked" type="date" value="${this._esc(i.last_checked)}"></label>
          <label class="field"><span>Next check</span><input id="hp-next-check" type="date" value="${this._esc(i.next_check_at)}"></label>
          <div class="inspection-panel wide">
            <label class="inspection-toggle"><input id="hp-inspection-enabled" type="checkbox" ${checked}><span><strong>Recurring inspection</strong><small>Automatically schedule the next check after completion.</small></span></label>
            <div id="inspection-settings" class="inspection-settings ${i.inspection_enabled ? "" : "inspection-disabled"}">
              <label class="field"><span>Repeat every</span><div class="recurrence-row"><input id="hp-inspection-recurrence-interval" data-inspection-control type="number" min="1" value="${this._esc(i.inspection_recurrence_interval)}" ${disabled}><select id="hp-inspection-recurrence-type" data-inspection-control ${disabled}>${recurrenceOptions}</select></div></label>
              <label class="field"><span>After completion</span><select id="hp-inspection-reschedule-mode" data-inspection-control ${disabled}><option value="scheduled" ${i.inspection_reschedule_mode === "scheduled" ? "selected" : ""}>Keep planned cadence</option><option value="completion" ${i.inspection_reschedule_mode === "completion" ? "selected" : ""}>Schedule from completion date</option></select></label>
              <label class="field"><span>Reminder before due</span><div class="suffix-input"><input id="hp-inspection-reminder" data-inspection-control type="number" min="0" value="${this._esc(i.inspection_reminder_before_days)}" ${disabled}><span>days</span></div></label>
              <div class="inspection-note">The <strong>Next check</strong> date is the first due date. Completing the task automatically schedules the next occurrence.</div>
            </div>
          </div>
          <label class="field wide"><span>Notes</span><textarea id="hp-notes" rows="3">${this._esc(i.notes)}</textarea></label>
        </div>
        <div class="editor-actions"><button id="cancel-editor-bottom" class="secondary">Cancel</button><button id="save-editor" class="primary">Save</button></div>
      </div>`;
  }

  _inventory() {
    if (this._inventoryCollapsed) return "";
    return this._taxonomy.categories.map((c) => {
      const items = this._items.filter((i) => i.category === c.id);
      if (!items.length) return "";
      const collapsed = this._collapsedCategories.has(c.id);
      return `<div class="category"><button class="category-head" data-action="toggle-category" data-category="${this._esc(c.id)}"><span class="circle"><ha-icon icon="${this._esc(c.icon)}"></ha-icon></span><strong>${this._esc(c.label)}</strong><small>${items.length}</small><ha-icon icon="mdi:chevron-${collapsed ? "down" : "up"}"></ha-icon></button>${collapsed ? "" : items.map((i) => {
        const u = this._unit(i.unit);
        const inspection = this._inspection(i.id);
        return `<div class="item"><span class="circle"><ha-icon icon="${this._esc(c.icon)}"></ha-icon></span><div class="item-main"><strong>${this._esc(i.name)}</strong><small>${this._esc(this._type(i.item_type)?.label || i.item_type)} • ${this._esc(i.quantity)} ${this._esc(u?.symbol || u?.label || i.unit)}${inspection?.enabled ? ` • inspection ${this._esc(inspection.status || "")}` : ""}</small></div><button class="icon-button" data-action="edit" data-id="${this._esc(i.id)}"><ha-icon icon="mdi:pencil"></ha-icon></button><button class="icon-button danger" data-action="delete" data-id="${this._esc(i.id)}"><ha-icon icon="mdi:delete"></ha-icon></button></div>`;
      }).join("")}</div>`;
    }).join("");
  }

  _render() {
    if (!this._hass || !window.HomePrepUI) return;
    const styleVars = window.HomePrepUI.styleVars(this.config);
    this.innerHTML = `<ha-card style="${styleVars}">${window.HomePrepUI.baseStyles()}<style>
      .wrap{padding:var(--hp-pad)} .header{display:flex;align-items:center;gap:10px;margin-bottom:12px}.logo{width:38px;height:38px}.header-text{flex:1}.title{font-size:16px;font-weight:700}.subtitle,.item small,.category-head small{font-size:9px;color:var(--hp-secondary)}
      button,input,select,textarea{font:inherit}.add,.primary{border:0;color:white;background:var(--hp-accent);font-weight:700}.add{width:100%;padding:10px;border-radius:calc(var(--hp-radius) - 4px)}button{cursor:pointer}.inventory-toggle,.category-head{width:100%;display:flex;align-items:center;gap:9px;color:var(--hp-primary);background:color-mix(in srgb,var(--hp-bg) 94%,var(--hp-primary) 6%);border:1px solid var(--hp-border)}.inventory-toggle{justify-content:space-between;margin:10px 0;padding:9px 10px;border-radius:calc(var(--hp-radius) - 4px)}
      .category{margin-top:8px;border:1px solid var(--hp-border);border-radius:calc(var(--hp-radius) - 3px);overflow:hidden}.category-head{padding:10px;text-align:left;border-width:0}.category-head strong,.item-main{flex:1}.circle{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:var(--hp-accent);background:color-mix(in srgb,var(--hp-accent) 14%,transparent)}.item{display:flex;align-items:center;gap:9px;padding:9px 10px;border-top:1px solid var(--hp-border)}.item-main{display:flex;flex-direction:column;min-width:0}.icon-button{width:34px;height:34px;border:0;border-radius:50%;color:var(--hp-primary);background:color-mix(in srgb,var(--hp-primary) 9%,transparent)}.danger{color:var(--hp-critical)}
      .editor{margin-top:10px;padding:12px;border:1px solid var(--hp-border);border-radius:calc(var(--hp-radius) - 3px)}.editor-head,.editor-actions{display:flex;align-items:center;justify-content:space-between}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}.field{display:flex;flex-direction:column;gap:5px}.field span{font-size:9px;color:var(--hp-secondary)}.field input,.field select,.field textarea{width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid var(--hp-border);border-radius:8px;color:var(--hp-primary);background:var(--hp-bg)}.wide{grid-column:1/-1}.editor-actions{justify-content:flex-end;gap:8px;margin-top:12px}.primary,.secondary{padding:9px 12px;border-radius:8px}.secondary{border:1px solid var(--hp-border);color:var(--hp-primary);background:transparent}
      .inspection-panel{padding:11px;border:1px solid color-mix(in srgb,var(--hp-accent) 28%,var(--hp-border));border-radius:calc(var(--hp-radius) - 3px);background:color-mix(in srgb,var(--hp-accent) 6%,transparent)}.inspection-toggle{display:flex;gap:10px;align-items:flex-start}.inspection-toggle input{width:auto}.inspection-toggle span{display:flex;flex-direction:column}.inspection-toggle small,.inspection-note{font-size:9px;color:var(--hp-secondary)}.inspection-settings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.inspection-disabled{opacity:.45}.recurrence-row{display:grid;grid-template-columns:72px minmax(0,1fr);gap:7px}.suffix-input{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:7px}.inspection-note{grid-column:1/-1;padding:8px 9px;background:color-mix(in srgb,var(--hp-primary) 5%,transparent);border-radius:8px}
      @media(max-width:500px){.form-grid,.inspection-settings{grid-template-columns:1fr}.wide,.inspection-note{grid-column:auto}}
    </style><div class="wrap"><div class="header"><img class="logo" src="/api/homeprep/frontend/icon.png"><div class="header-text"><div class="title">${this._esc(this.config?.title || "Inventory")}</div><div class="subtitle">Manage your HomePrep items</div></div></div><button id="add-item" class="add">+ Add item</button>${this._form()}<button id="toggle-inventory" class="inventory-toggle"><span>Inventory • ${this._items.length} ${this._items.length === 1 ? "item" : "items"}</span><ha-icon icon="mdi:chevron-${this._inventoryCollapsed ? "down" : "up"}"></ha-icon></button>${this._inventory()}</div></ha-card>`;
  }
}

if (!customElements.get("homeprep-manage-card")) {
  customElements.define("homeprep-manage-card", HomePrepManageCard);
}
