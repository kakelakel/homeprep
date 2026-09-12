(() => {
  const imageUrl = (item) => {
    if (!item?.image_id || !item?.image_token) return null;
    return `/api/homeprep/media/${encodeURIComponent(item.image_id)}/${encodeURIComponent(item.image_token)}`;
  };

  const fileToBase64 = async (file) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    const chunk = 0x8000;
    for (let index = 0; index < bytes.length; index += chunk) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
    }
    return btoa(binary);
  };

  async function patchDashboardCards() {
    const tagNames = [
      "homeprep-status-card",
      "homeprep-category-card",
      "homeprep-group-card",
      "homeprep-attention-card",
      "homeprep-inventory-card",
    ];

    await Promise.all(tagNames.map((tag) => customElements.whenDefined(tag)));
    const CardClass = customElements.get("homeprep-inventory-card") || customElements.get("homeprep-category-card");
    const Base = CardClass ? Object.getPrototypeOf(CardClass) : null;
    const proto = Base?.prototype;
    if (!proto || proto.__homeprepImagesApplied) return;
    proto.__homeprepImagesApplied = true;

    proto.imageUrl = imageUrl;
    proto.renderItemVisual = function renderItemVisual(item, category) {
      const url = imageUrl(item);
      if (url) {
        return `<div class="hp-item-icon hp-item-image"><img src="${this.esc(url)}" alt="${this.esc(item.name)}"></div>`;
      }
      return `<div class="hp-item-icon"><ha-icon icon="${this.esc(category?.icon || "mdi:package-variant")}"></ha-icon></div>`;
    };

    const previousRenderItem = proto.renderItem;
    proto.renderItem = function renderItem(item) {
      const category = this.getCategory(item.category);
      const status = this.getItemStatus(item);
      return `
        <div class="hp-item">
          ${this.renderItemVisual(item, category)}
          <div class="hp-item-main">
            <div class="hp-item-name">${this.esc(item.name)}</div>
            <div class="hp-item-meta">${this.esc(category?.label || item.category)} • ${this.esc(item.quantity)} ${this.esc(this.getUnitDisplay(item.unit))}</div>
          </div>
          <div class="hp-item-status hp-${status.level}-text">${this.esc(status.label)}</div>
        </div>`;
    };

    const previousCommonStyles = proto.commonStyles;
    proto.commonStyles = function commonStyles() {
      return `${previousCommonStyles.call(this)}
        <style>
          .hp-item-image{overflow:hidden;background:transparent!important;border-radius:8px!important}
          .hp-item-image img{width:100%;height:100%;object-fit:cover;display:block}
        </style>`;
    };

    void previousRenderItem;
  }

  async function patchManageCard() {
    await customElements.whenDefined("homeprep-manage-card");
    const Manage = customElements.get("homeprep-manage-card");
    if (!Manage || Manage.prototype.__homeprepImagesApplied) return;
    const proto = Manage.prototype;
    proto.__homeprepImagesApplied = true;
    proto._imageUrl = imageUrl;
    proto._itemVisual = function _itemVisual(item, category) {
      const url = imageUrl(item);
      if (url) {
        return `<span class="circle hp-manage-image"><img src="${this._esc(url)}" alt="${this._esc(item.name)}"></span>`;
      }
      return `<span class="circle"><ha-icon icon="${this._esc(category?.icon || "mdi:package-variant")}"></ha-icon></span>`;
    };

    const previousOnClick = proto._onClick;
    proto._onClick = async function _onClick(event) {
      const target = event.composedPath().find((el) => el instanceof HTMLElement && (el.id || el.dataset?.action));
      if (target?.dataset?.action === "remove-image") {
        const itemId = target.dataset.id;
        if (!itemId || !confirm("Remove this image from the inventory item?")) return;
        target.disabled = true;
        try {
          await this._hass.callWS({ type: "homeprep/image/remove", item_id: itemId });
          await this._load();
          this._openEdit(itemId);
        } catch (error) {
          console.error("HomePrep image removal failed", error);
          alert(`HomePrep: ${error?.message || error}`);
        }
        return;
      }
      return previousOnClick.call(this, event);
    };

    const previousOnChange = proto._onChange;
    proto._onChange = async function _onChange(event) {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.id === "hp-item-image") {
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
        const status = this.querySelector("#hp-image-status");
        if (status) status.textContent = "Uploading…";
        target.disabled = true;
        try {
          await this._hass.callWS({
            type: "homeprep/image/set",
            item_id: itemId,
            content_type: file.type,
            filename: file.name,
            data: await fileToBase64(file),
          });
          await this._load();
          this._openEdit(itemId);
        } catch (error) {
          console.error("HomePrep image upload failed", error);
          alert(`HomePrep: ${error?.message || error}`);
          target.disabled = false;
          if (status) status.textContent = "Upload failed";
        }
        return;
      }
      return previousOnChange.call(this, event);
    };

    const previousForm = proto._form;
    proto._form = function _form() {
      let html = previousForm.call(this);
      const item = this._editingItem;
      if (!item) return html;
      const category = this._category(item.category);
      const marker = '<label class="field wide"><span>Notes</span>';
      const section = this._formMode === "edit"
        ? `<div class="field wide hp-image-editor"><div class="hp-image-preview">${this._itemVisual(item, category)}</div><div class="hp-image-controls"><strong>Item image <small>Optional</small></strong><span>JPEG, PNG or WebP · max 5 MB</span><label class="hp-image-upload">${item.image_id ? "Replace image" : "Add image"}<input id="hp-item-image" data-item-id="${this._esc(item.id)}" type="file" accept="image/jpeg,image/png,image/webp"></label>${item.image_id ? `<button type="button" class="secondary" data-action="remove-image" data-id="${this._esc(item.id)}">Remove image</button>` : ""}<em id="hp-image-status"></em></div></div>`
        : `<div class="field wide hp-image-editor"><div class="hp-image-preview"><span class="circle"><ha-icon icon="mdi:image-plus"></ha-icon></span></div><div class="hp-image-controls"><strong>Item image <small>Optional</small></strong><span>Save the item first, then edit it to add an image.</span></div></div>`;
      if (html.includes(marker)) html = html.replace(marker, `${section}${marker}`);
      return html;
    };

    const previousInventory = proto._inventory;
    proto._inventory = function _inventory() {
      if (this._inventoryCollapsed) return "";
      return this._taxonomy.categories.map((category) => {
        const items = this._items.filter((item) => item.category === category.id);
        if (!items.length) return "";
        const collapsed = this._collapsedCategories.has(category.id);
        return `<div class="category"><button class="category-head" data-action="toggle-category" data-category="${this._esc(category.id)}"><span class="circle"><ha-icon icon="${this._esc(category.icon)}"></ha-icon></span><strong>${this._esc(category.label)}</strong><small>${items.length}</small><ha-icon icon="mdi:chevron-${collapsed ? "down" : "up"}"></ha-icon></button>${collapsed ? "" : items.map((item) => {
          const unit = this._unit(item.unit);
          const inspection = this._inspection(item.id);
          return `<div class="item">${this._itemVisual(item, category)}<div class="item-main"><strong>${this._esc(item.name)}</strong><small>${this._esc(this._type(item.item_type)?.label || item.item_type)} • ${this._esc(item.quantity)} ${this._esc(unit?.symbol || unit?.label || item.unit)}${inspection?.enabled ? ` • inspection ${this._esc(inspection.status || "")}` : ""}</small></div><button class="icon-button" data-action="edit" data-id="${this._esc(item.id)}"><ha-icon icon="mdi:pencil"></ha-icon></button><button class="icon-button danger" data-action="delete" data-id="${this._esc(item.id)}"><ha-icon icon="mdi:delete"></ha-icon></button></div>`;
        }).join("")}</div>`;
      }).join("");
    };
    void previousInventory;

    const previousRender = proto._render;
    proto._render = function _render() {
      previousRender.call(this);
      if (!this.querySelector("#hp-lovelace-image-styles")) {
        const style = document.createElement("style");
        style.id = "hp-lovelace-image-styles";
        style.textContent = `
          .hp-manage-image{overflow:hidden;background:transparent!important}
          .hp-manage-image img{width:100%;height:100%;object-fit:cover;display:block}
          .hp-image-editor{display:flex!important;gap:14px;align-items:center;padding:12px;border:1px solid var(--hp-border);border-radius:10px}
          .hp-image-preview .circle{width:72px;height:72px;border-radius:12px;overflow:hidden}
          .hp-image-preview .circle img{width:100%;height:100%;object-fit:cover;display:block}
          .hp-image-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;flex:1}
          .hp-image-controls strong,.hp-image-controls>span{width:100%}.hp-image-controls>span,.hp-image-controls small,#hp-image-status{font-size:9px;color:var(--hp-secondary)}
          .hp-image-upload{display:inline-flex!important;width:auto!important;padding:7px 10px;border-radius:8px;background:var(--hp-accent);color:white;font-size:10px;font-weight:700;cursor:pointer}.hp-image-upload input{display:none}
        `;
        this.appendChild(style);
      }
    };
  }

  async function patchTasksCard() {
    await customElements.whenDefined("homeprep-tasks-card");
    const Tasks = customElements.get("homeprep-tasks-card");
    if (!Tasks || Tasks.prototype.__homeprepImagesApplied) return;
    const proto = Tasks.prototype;
    proto.__homeprepImagesApplied = true;

    const previousRenderTask = proto.renderTask;
    proto.renderTask = function renderTask(task) {
      const html = previousRenderTask.call(this, task);
      const linked = task.linked_item;
      const url = imageUrl(linked);
      if (!url) return html;
      const image = `<div class="hp-task-icon hp-task-image"><img src="${this.esc(url)}" alt="${this.esc(linked.name || task.name)}"></div>`;
      return html.replace(/<div class="hp-task-icon">[\s\S]*?<\/div>/, image);
    };

    const previousStyles = proto.styles;
    proto.styles = function styles() {
      return `${previousStyles.call(this)}
        <style>.hp-task-image{overflow:hidden;background:transparent!important;border-radius:8px!important}.hp-task-image img{width:100%;height:100%;object-fit:cover;display:block}</style>`;
    };
  }

  patchDashboardCards().catch((error) => console.error("HomePrep Lovelace image patch failed", error));
  patchManageCard().catch((error) => console.error("HomePrep manage image patch failed", error));
  patchTasksCard().catch((error) => console.error("HomePrep task image patch failed", error));
})();
