export function applyHomePrepV8(HomePrepPanel) {
  if (!HomePrepPanel || HomePrepPanel.prototype.__homeprepV8Applied) return;
  HomePrepPanel.prototype.__homeprepV8Applied = true;

  HomePrepPanel.prototype.imageUrl = function imageUrl(item) {
    if (!item?.image_id || !item?.image_token) return null;
    return `/api/homeprep/media/${encodeURIComponent(item.image_id)}/${encodeURIComponent(item.image_token)}`;
  };

  HomePrepPanel.prototype.inventoryVisual = function inventoryVisual(item, category, extraClass = "") {
    const url = this.imageUrl(item);
    if (url) {
      return `<div class="inventory-visual ${extraClass}"><img src="${this.esc(url)}" alt="${this.esc(item.name)}"></div>`;
    }
    return `<div class="inventory-visual fallback ${extraClass}"><ha-icon icon="${this.esc(category?.icon || "mdi:package-variant")}"></ha-icon></div>`;
  };

  const previousHandleClick = HomePrepPanel.prototype.handleClick;
  HomePrepPanel.prototype.handleClick = async function handleClick(event) {
    const target = event.composedPath().find(
      (el) => el instanceof HTMLElement && el.dataset?.action
    );

    if (target?.dataset.action === "manage-linked-item") {
      const task = this.taskById(target.dataset.id);
      if (task?.linked_item_id) {
        this._active = "inventory";
        this.resetEditors();
        this._editingItem = task.linked_item_id;
        this.render();
      }
      return;
    }

    if (target?.dataset.action === "remove-item-image") {
      const itemId = target.dataset.id;
      if (!itemId || !confirm("Remove this image from the inventory item?")) return;
      target.disabled = true;
      try {
        await this._hass.callWS({ type: "homeprep/image/remove", item_id: itemId });
        await this.loadData();
        this._editingItem = itemId;
        this.render();
      } catch (error) {
        console.error("HomePrep image removal failed", error);
        alert(`HomePrep: ${error?.message || error}`);
      }
      return;
    }

    return previousHandleClick.call(this, event);
  };

  const previousHandleChange = HomePrepPanel.prototype.handleChange;
  HomePrepPanel.prototype.handleChange = async function handleChange(event) {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.name === "inventory_image") {
      const itemId = target.dataset.itemId;
      const file = target.files?.[0];
      if (!itemId || !file) return;
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        alert("HomePrep supports JPEG, PNG and WebP images.");
        target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("HomePrep inventory images can be up to 5 MB.");
        target.value = "";
        return;
      }

      const status = this.querySelector(".inventory-image-status");
      if (status) status.textContent = "Uploading…";
      target.disabled = true;
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        await this._hass.callWS({
          type: "homeprep/image/set",
          item_id: itemId,
          content_type: file.type,
          filename: file.name,
          data: btoa(binary),
        });
        await this.loadData();
        this._editingItem = itemId;
        this.render();
      } catch (error) {
        console.error("HomePrep image upload failed", error);
        alert(`HomePrep: ${error?.message || error}`);
        target.disabled = false;
        if (status) status.textContent = "Upload failed";
      }
      return;
    }
    return previousHandleChange.call(this, event);
  };

  const previousHandleSubmit = HomePrepPanel.prototype.handleSubmit;
  HomePrepPanel.prototype.handleSubmit = async function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "hp-task-form") {
      return previousHandleSubmit.call(this, event);
    }

    event.preventDefault();
    const data = new FormData(form);
    const existing = form.dataset.taskId ? this.taskById(form.dataset.taskId) : null;
    const inspection = existing?.task_kind === "inspection";
    const task = {
      name: String(data.get("name") || "").trim(),
      task_kind: existing?.task_kind || "general",
      category: String(data.get("category") || "other"),
      recurrence_type: String(data.get("recurrence_type") || "months"),
      recurrence_interval: Number(data.get("recurrence_interval") || 1),
      reschedule_mode: String(data.get("reschedule_mode") || "completion"),
      next_due_at: String(data.get("next_due_at") || "") || null,
      reminder_before_days: Number(data.get("reminder_before_days") || 0),
      enabled: inspection ? existing.enabled !== false : data.get("enabled") === "on",
      notes: String(data.get("notes") || "") || null,
    };
    if (existing?.linked_item_id) task.linked_item_id = existing.linked_item_id;

    try {
      if (form.dataset.taskId) {
        await this._hass.callWS({ type: "homeprep/task/update", task_id: form.dataset.taskId, updates: task });
      } else {
        await this._hass.callWS({ type: "homeprep/task/add", task });
      }
      this._editingTask = null;
      this._creatingTask = false;
      await this.loadData();
    } catch (error) {
      console.error("HomePrep task form failed", error);
      alert(`HomePrep: ${error?.message || error}`);
    }
  };

  HomePrepPanel.prototype.taskRow = function taskRow(task, compact = false) {
    const category = this.category(task.category);
    const inspection = task.task_kind === "inspection";
    const linkedItem = task.linked_item_id ? this.itemById(task.linked_item_id) : null;
    const visual = linkedItem
      ? this.inventoryVisual(linkedItem, category, "task-visual")
      : `<div class="row-icon ${this.statusClass(task.status)}"><ha-icon icon="${this.esc(category?.icon || "mdi:clipboard-check-outline")}"></ha-icon></div>`;
    const inspectionLabel = inspection ? "Linked inspection" : "Standalone task";
    const actions = compact ? "" : `<div class="row-actions">
      <button data-action="edit-task" data-id="${this.esc(task.id)}">Edit</button>
      ${task.enabled ? `<button class="primary small" data-action="complete-task" data-id="${this.esc(task.id)}">Complete</button>` : ""}
      ${inspection
        ? `<button data-action="manage-linked-item" data-id="${this.esc(task.id)}" title="Inspection tasks are managed from their inventory item">Manage item</button>`
        : `<button class="danger small" data-action="delete-task" data-id="${this.esc(task.id)}">Delete</button>`}
    </div>`;
    return `<div class="row task-row">${visual}<div class="row-main"><strong>${this.esc(task.name)}</strong><small>${this.esc(linkedItem?.name || inspectionLabel)} · ${this.esc(task.next_due_at || "No due date")}${inspection ? " · Managed from inventory" : ""}</small></div><span class="badge ${this.statusClass(task.status)}">${this.esc(task.status)}</span>${actions}</div>`;
  };

  HomePrepPanel.prototype.renderInventory = function renderInventory() {
    if (this._creatingItem) return this.renderItemForm(null);
    if (this._editingItem) return this.renderItemForm(this.itemById(this._editingItem));
    const groups = new Map();
    this._items.forEach((item) => {
      const key = item.category || "other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return `<div class="page-title"><div><h2>Inventory</h2><p>${this._items.length} items currently tracked.</p></div><button class="primary" data-action="add-item"><ha-icon icon="mdi:plus"></ha-icon> Add item</button></div><div class="section-grid">${[...groups.entries()].map(([categoryId, items]) => {
      const cat = this.category(categoryId);
      return `<section class="panel-card"><div class="section-head"><h3><ha-icon icon="${this.esc(cat?.icon || "mdi:package-variant")}"></ha-icon> ${this.esc(cat?.label || categoryId)}</h3><span>${items.length}</span></div>${items.map((item) => `<div class="row inventory-row">${this.inventoryVisual(item, cat)}<div class="row-main"><strong>${this.esc(item.name)}</strong><small>${this.esc(item.quantity)} ${this.esc(item.unit)}${item.next_check_at ? ` · Next check ${this.esc(item.next_check_at)}` : ""}${item.expires_at ? ` · Expires ${this.esc(item.expires_at)}` : ""}</small></div><div class="row-actions"><button data-action="edit-item" data-id="${this.esc(item.id)}">Edit</button><button class="danger small" data-action="delete-item" data-id="${this.esc(item.id)}">Delete</button></div></div>`).join("")}</section>`;
    }).join("") || '<section class="panel-card"><div class="empty">No inventory items yet. Use Add item to get started.</div></section>'}</div>`;
  };

  const previousRenderItemForm = HomePrepPanel.prototype.renderItemForm;
  HomePrepPanel.prototype.renderItemForm = function renderItemForm(item) {
    let html = previousRenderItemForm.call(this, item);
    const marker = '<label class="wide"><span>Notes</span>';
    const category = this.category(item?.category || "other");
    const imageSection = item
      ? `<div class="wide inventory-image-editor"><div class="inventory-image-preview">${this.inventoryVisual(item, category, "editor-visual")}</div><div class="inventory-image-controls"><strong>Item image <span class="optional">Optional</span></strong><small>JPEG, PNG or WebP · max 5 MB. The image replaces the category icon where HomePrep can show a thumbnail.</small><label class="image-upload-button">${item.image_id ? "Replace image" : "Add image"}<input type="file" name="inventory_image" data-item-id="${this.esc(item.id)}" accept="image/jpeg,image/png,image/webp"></label>${item.image_id ? `<button type="button" class="danger small" data-action="remove-item-image" data-id="${this.esc(item.id)}">Remove image</button>` : ""}<span class="inventory-image-status"></span></div></div>`
      : `<div class="wide inventory-image-editor empty-image"><div class="inventory-visual fallback editor-visual"><ha-icon icon="mdi:image-plus"></ha-icon></div><div class="inventory-image-controls"><strong>Item image <span class="optional">Optional</span></strong><small>Save the item first, then open Edit to add an image. Images are stored separately from HomePrep's inventory data.</small></div></div>`;
    if (html.includes(marker)) html = html.replace(marker, `${imageSection}${marker}`);
    return html;
  };

  const previousStyles = HomePrepPanel.prototype.styles;
  HomePrepPanel.prototype.styles = function styles() {
    return `${previousStyles.call(this)}
      .inventory-visual{width:42px;height:42px;border-radius:10px;overflow:hidden;flex:0 0 42px;background:color-mix(in srgb,var(--hp-panel-accent) 10%,transparent);display:flex;align-items:center;justify-content:center;border:1px solid var(--hp-panel-border)}
      .inventory-visual img{width:100%;height:100%;object-fit:cover;display:block}.inventory-visual.fallback ha-icon{width:22px;height:22px;color:var(--hp-panel-accent)}
      .inventory-row,.task-row{gap:11px}.task-visual{width:34px;height:34px;flex-basis:34px;border-radius:8px}.task-visual img{width:100%;height:100%;object-fit:cover}
      .inventory-image-editor{display:flex;gap:16px;align-items:center;padding:13px;border:1px solid var(--hp-panel-border);border-radius:11px;background:color-mix(in srgb,var(--hp-panel-accent) 4%,transparent)}
      .editor-visual{width:82px;height:82px;flex-basis:82px;border-radius:14px}.editor-visual.fallback ha-icon{width:34px;height:34px}.inventory-image-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;flex:1}.inventory-image-controls strong,.inventory-image-controls small{width:100%}.inventory-image-controls small{color:var(--hp-panel-muted);font-size:9px}.optional{font-weight:400;color:var(--hp-panel-muted);font-size:9px}
      .image-upload-button{display:inline-flex!important;width:auto!important;align-items:center;justify-content:center;padding:7px 10px;border-radius:8px;background:var(--hp-panel-accent);color:white;font-size:10px;font-weight:700;cursor:pointer}.image-upload-button input{display:none}.inventory-image-status{font-size:9px;color:var(--hp-panel-muted)}
      @media(max-width:600px){.inventory-image-editor{align-items:flex-start}.editor-visual{width:64px;height:64px;flex-basis:64px}.inventory-visual{width:38px;height:38px;flex-basis:38px}}
    `;
  };
}
