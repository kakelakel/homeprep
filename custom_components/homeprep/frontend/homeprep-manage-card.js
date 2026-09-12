class HomePrepManageCard extends HTMLElement {
  constructor() {
    super();

    this._items = [];
    this._taxonomy = {
      categories: [],
      item_types: [],
      units: [],
    };

    this._loading = false;
    this._error = null;
    this._editingItem = null;
    this._formMode = null;

    this._inventoryCollapsed = false;
    this._collapsedCategories = new Set();

    this.addEventListener("click", (event) => this.handleClick(event));
    this.addEventListener("change", (event) => this.handleChange(event));
  }

  setConfig(config) {
    this.config = config || {};

    if (typeof this.config.inventory_collapsed === "boolean") {
      this._inventoryCollapsed = this.config.inventory_collapsed;
    }
  }

  set hass(hass) {
    const firstLoad = !this._hass;
    this._hass = hass;

    if (firstLoad) {
      this.loadData();
    }
  }

  getCardSize() {
    return 12;
  }

  escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  parseDate(value) {
    if (!value) return null;

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  today() {
    const now = new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
  }

  daysBetween(a, b) {
    return Math.round(
      (b.getTime() - a.getTime())
      / 86400000
    );
  }

  getItemStatus(item) {
    const today = this.today();
    const expires = this.parseDate(item.expires_at);
    const nextCheck = this.parseDate(item.next_check_at);

    if (expires && expires < today) {
      return {
        level: "critical",
        label: "Expired",
        detail: `${Math.abs(this.daysBetween(today, expires))} d overdue`,
      };
    }

    if (nextCheck && nextCheck <= today) {
      return {
        level: "critical",
        label: "Check due",
        detail:
          nextCheck < today
            ? `${Math.abs(this.daysBetween(today, nextCheck))} d overdue`
            : "Due today",
      };
    }

    if (expires) {
      const days = this.daysBetween(today, expires);

      if (days >= 0 && days <= 30) {
        return {
          level: "attention",
          label: "Expiring",
          detail: `${days} d`,
        };
      }
    }

    return {
      level: "ok",
      label: "OK",
      detail: "",
    };
  }

  getClickedElement(event) {
    return event.composedPath().find((element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      return (
        element.id === "refresh" ||
        element.id === "add-item" ||
        element.id === "cancel-editor" ||
        element.id === "cancel-editor-bottom" ||
        element.id === "save-editor" ||
        element.id === "toggle-inventory" ||
        element.id === "expand-all" ||
        element.id === "collapse-all" ||
        element.dataset?.action
      );
    });
  }

  async handleClick(event) {
    const target = this.getClickedElement(event);

    if (!target) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (target.id === "refresh") {
      await this.loadData();
      return;
    }

    if (target.id === "add-item") {
      this.openAddForm();
      return;
    }

    if (
      target.id === "cancel-editor" ||
      target.id === "cancel-editor-bottom"
    ) {
      this.closeForm();
      return;
    }

    if (target.id === "save-editor") {
      await this.saveForm();
      return;
    }

    if (target.id === "toggle-inventory") {
      this._inventoryCollapsed = !this._inventoryCollapsed;
      this.render();
      return;
    }

    if (target.id === "expand-all") {
      this._collapsedCategories.clear();
      this._inventoryCollapsed = false;
      this.render();
      return;
    }

    if (target.id === "collapse-all") {
      this._taxonomy.categories.forEach(
        (category) =>
          this._collapsedCategories.add(category.id)
      );
      this.render();
      return;
    }

    if (target.dataset.action === "toggle-category") {
      const categoryId = target.dataset.category;

      if (this._collapsedCategories.has(categoryId)) {
        this._collapsedCategories.delete(categoryId);
      } else {
        this._collapsedCategories.add(categoryId);
      }

      this.render();
      return;
    }

    if (target.dataset.action === "edit") {
      this.openEditForm(target.dataset.id);
      return;
    }

    if (target.dataset.action === "delete") {
      await this.deleteItem(target.dataset.id);
    }
  }

  handleChange(event) {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    if (
      target.id !== "hp-category" &&
      target.id !== "hp-type"
    ) {
      return;
    }

    const categorySelect =
      this.querySelector("#hp-category");

    const typeSelect =
      this.querySelector("#hp-type");

    if (!categorySelect || !typeSelect) {
      return;
    }

    if (target.id === "hp-category") {
      const unitSelect =
        this.querySelector("#hp-unit");

      if (unitSelect) {
        const currentUnit = unitSelect.value;

        unitSelect.innerHTML =
          this.renderUnitOptions(
            categorySelect.value,
            currentUnit
          );

        unitSelect.value = currentUnit;
      }
    }

    this.updateSmartForm(
      categorySelect.value,
      typeSelect.value
    );
  }

  async loadData() {
    if (!this._hass || this._loading) {
      return;
    }

    this._loading = true;
    this._error = null;
    this.render();

    try {
      const [itemsResult, taxonomyResult] =
        await Promise.all([
          this._hass.callWS({
            type: "homeprep/items",
          }),
          this._hass.callWS({
            type: "homeprep/taxonomy",
          }),
        ]);

      this._items = itemsResult.items ?? [];

      this._taxonomy = {
        categories:
          taxonomyResult.categories ?? [],
        item_types:
          taxonomyResult.item_types ?? [],
        units:
          taxonomyResult.units ?? [],
      };
    } catch (error) {
      console.error(
        "HomePrep: Failed to load inventory data",
        error
      );

      this._error = error;
      this._items = [];
    }

    this._loading = false;
    this.render();
  }

  getCategory(categoryId) {
    return (
      this._taxonomy.categories.find(
        (entry) => entry.id === categoryId
      ) ?? null
    );
  }

  getCategoryLabel(categoryId) {
    return (
      this.getCategory(categoryId)?.label
      ?? categoryId
      ?? "Unknown"
    );
  }

  getCategoryIcon(categoryId) {
    return (
      this.getCategory(categoryId)?.icon
      ?? "mdi:package-variant"
    );
  }

  getItemTypeLabel(itemTypeId) {
    return (
      this._taxonomy.item_types.find(
        (entry) => entry.id === itemTypeId
      )?.label
      ?? itemTypeId
      ?? "Unknown"
    );
  }

  getUnit(unitId) {
    return (
      this._taxonomy.units.find(
        (entry) => entry.id === unitId
      ) ?? null
    );
  }

  getUnitDisplay(unitId) {
    const unit = this.getUnit(unitId);

    if (!unit) {
      return unitId ?? "";
    }

    return unit.symbol || unit.label;
  }

  getSmartState(categoryId, itemType) {
    const category = this.getCategory(categoryId);
    const profile =
      category?.form_profile ?? "balanced";

    let expirationRecommended = false;
    let inspectionRecommended = false;

    if (profile === "expiry") {
      expirationRecommended = true;
    }

    if (profile === "inspection") {
      inspectionRecommended = true;
    }

    if (profile === "balanced") {
      expirationRecommended =
        itemType === "consumable";

      inspectionRecommended =
        itemType === "equipment";
    }

    if (itemType === "consumable") {
      expirationRecommended = true;
    }

    if (itemType === "equipment") {
      inspectionRecommended = true;
    }

    let message =
      "Use the lifecycle fields that make sense for this item.";

    if (
      expirationRecommended &&
      inspectionRecommended
    ) {
      message =
        "Expiration and inspection tracking are both useful for this item.";
    } else if (expirationRecommended) {
      message =
        "Expiration tracking is especially useful for this item.";
    } else if (inspectionRecommended) {
      message =
        "Regular inspection tracking is especially useful for this item.";
    }

    return {
      category,
      expirationRecommended,
      inspectionRecommended,
      message,
    };
  }

  updateSmartForm(categoryId, itemType) {
    const state =
      this.getSmartState(categoryId, itemType);

    const icon =
      this.querySelector("#smart-category-icon");

    const title =
      this.querySelector("#smart-category-title");

    const message =
      this.querySelector("#smart-category-message");

    if (icon) {
      icon.setAttribute(
        "icon",
        state.category?.icon
        ?? "mdi:package-variant"
      );
    }

    if (title) {
      title.textContent =
        state.category?.label ?? "HomePrep";
    }

    if (message) {
      message.textContent = state.message;
    }

    this.setFieldRecommended(
      "expiration-field",
      state.expirationRecommended
    );

    this.setFieldRecommended(
      "last-check-field",
      state.inspectionRecommended
    );

    this.setFieldRecommended(
      "next-check-field",
      state.inspectionRecommended
    );
  }

  setFieldRecommended(fieldId, recommended) {
    const field =
      this.querySelector(`#${fieldId}`);

    if (!field) {
      return;
    }

    field.classList.toggle(
      "recommended-field",
      recommended
    );

    const badge =
      field.querySelector(".recommended-badge");

    if (badge) {
      badge.style.display =
        recommended ? "inline-flex" : "none";
    }
  }

  openAddForm() {
    const firstCategory =
      this._taxonomy.categories[0];

    this._editingItem = {
      name: "",
      category:
        firstCategory?.id ?? "other",
      item_type:
        this._taxonomy.item_types[0]?.id
        ?? "consumable",
      quantity: 1,
      unit:
        firstCategory?.default_unit
        ?? "piece",
      expires_at: "",
      last_checked: "",
      next_check_at: "",
      notes: "",
    };

    this._formMode = "add";
    this.render();
  }

  openEditForm(itemId) {
    const item =
      this._items.find(
        (entry) => entry.id === itemId
      );

    if (!item) {
      return;
    }

    this._editingItem = {
      ...item,
      expires_at: item.expires_at ?? "",
      last_checked: item.last_checked ?? "",
      next_check_at:
        item.next_check_at ?? "",
      notes: item.notes ?? "",
    };

    this._formMode = "edit";
    this.render();
  }

  closeForm() {
    this._editingItem = null;
    this._formMode = null;
    this.render();
  }

  readForm() {
    return {
      name:
        this.querySelector("#hp-name")
          ?.value.trim() ?? "",
      category:
        this.querySelector("#hp-category")
          ?.value ?? "other",
      item_type:
        this.querySelector("#hp-type")
          ?.value ?? "consumable",
      quantity: Number(
        this.querySelector("#hp-quantity")
          ?.value ?? 0
      ),
      unit:
        this.querySelector("#hp-unit")
          ?.value ?? "piece",
      expires_at:
        this.querySelector("#hp-expires")
          ?.value || "",
      last_checked:
        this.querySelector("#hp-last-checked")
          ?.value || "",
      next_check_at:
        this.querySelector("#hp-next-check")
          ?.value || "",
      notes:
        this.querySelector("#hp-notes")
          ?.value.trim() ?? "",
    };
  }

  async saveForm() {
    const data = this.readForm();

    if (!data.name) {
      window.alert("Name is required.");
      return;
    }

    if (
      Number.isNaN(data.quantity) ||
      data.quantity < 0
    ) {
      window.alert(
        "Quantity must be a valid number."
      );
      return;
    }

    const serviceData = {
      name: data.name,
      category: data.category,
      item_type: data.item_type,
      quantity: data.quantity,
      unit: data.unit,
    };

    if (data.expires_at) {
      serviceData.expires_at =
        data.expires_at;
    }

    if (data.last_checked) {
      serviceData.last_checked =
        data.last_checked;
    }

    if (data.next_check_at) {
      serviceData.next_check_at =
        data.next_check_at;
    }

    if (data.notes) {
      serviceData.notes = data.notes;
    }

    try {
      if (this._formMode === "add") {
        await this._hass.callService(
          "homeprep",
          "add_item",
          serviceData
        );
      }

      if (
        this._formMode === "edit" &&
        this._editingItem?.id
      ) {
        await this._hass.callService(
          "homeprep",
          "update_item",
          {
            item_id:
              this._editingItem.id,
            ...serviceData,
          }
        );
      }

      this._editingItem = null;
      this._formMode = null;

      await this.loadData();
    } catch (error) {
      console.error(
        "HomePrep: Failed to save item",
        error
      );

      window.alert(
        "HomePrep could not save the item."
      );
    }
  }

  async deleteItem(itemId) {
    const item =
      this._items.find(
        (entry) => entry.id === itemId
      );

    if (!item) {
      return;
    }

    if (
      !window.confirm(
        `Delete "${item.name}" from HomePrep?`
      )
    ) {
      return;
    }

    try {
      await this._hass.callService(
        "homeprep",
        "delete_item",
        {
          item_id: itemId,
        }
      );

      await this.loadData();
    } catch (error) {
      console.error(
        "HomePrep: Failed to delete item",
        error
      );

      window.alert(
        "HomePrep could not delete the item."
      );
    }
  }

  groupEntries(entries) {
    const groups = new Map();

    entries.forEach((entry) => {
      const group = entry.group || "Other";

      if (!groups.has(group)) {
        groups.set(group, []);
      }

      groups.get(group).push(entry);
    });

    return groups;
  }

  renderCategoryOptions(selectedId) {
    const groups =
      this.groupEntries(
        this._taxonomy.categories
      );

    return [...groups.entries()]
      .map(
        ([groupName, entries]) => `
          <optgroup
            label="${this.escapeHtml(groupName)}"
          >
            ${entries
              .map((entry) => `
                <option
                  value="${this.escapeHtml(entry.id)}"
                  ${
                    entry.id === selectedId
                      ? "selected"
                      : ""
                  }
                >
                  ${this.escapeHtml(entry.label)}
                </option>
              `)
              .join("")}
          </optgroup>
        `
      )
      .join("");
  }

  renderItemTypeOptions(selectedId) {
    return this._taxonomy.item_types
      .map((entry) => `
        <option
          value="${this.escapeHtml(entry.id)}"
          ${
            entry.id === selectedId
              ? "selected"
              : ""
          }
        >
          ${this.escapeHtml(entry.label)}
        </option>
      `)
      .join("");
  }

  renderUnitOption(unit, selectedId) {
    let label = unit.label;

    if (unit.symbol) {
      label += ` (${unit.symbol})`;
    }

    return `
      <option
        value="${this.escapeHtml(unit.id)}"
        ${
          unit.id === selectedId
            ? "selected"
            : ""
        }
      >
        ${this.escapeHtml(label)}
      </option>
    `;
  }

  renderUnitOptions(categoryId, selectedId) {
    const category =
      this.getCategory(categoryId);

    const preferredIds =
      category?.preferred_units ?? [];

    const recommended =
      preferredIds
        .map((id) => this.getUnit(id))
        .filter(Boolean);

    const recommendedIds =
      new Set(
        recommended.map((unit) => unit.id)
      );

    const remaining =
      this._taxonomy.units.filter(
        (unit) =>
          !recommendedIds.has(unit.id)
      );

    let html = "";

    if (recommended.length) {
      html += `
        <optgroup
          label="Recommended for ${this.escapeHtml(
            category?.label ?? "category"
          )}"
        >
          ${recommended
            .map((unit) =>
              this.renderUnitOption(
                unit,
                selectedId
              )
            )
            .join("")}
        </optgroup>
      `;
    }

    const groups =
      this.groupEntries(remaining);

    html += [...groups.entries()]
      .map(
        ([groupName, entries]) => `
          <optgroup
            label="${this.escapeHtml(groupName)}"
          >
            ${entries
              .map((unit) =>
                this.renderUnitOption(
                  unit,
                  selectedId
                )
              )
              .join("")}
          </optgroup>
        `
      )
      .join("");

    return html;
  }

  renderItem(item) {
    const status =
      this.getItemStatus(item);

    return `
      <div class="item">
        <div class="item-main">
          <div class="item-icon">
            <ha-icon
              icon="${this.escapeHtml(
                this.getCategoryIcon(
                  item.category
                )
              )}"
            ></ha-icon>
          </div>

          <div class="item-content">
            <div class="item-name">
              ${this.escapeHtml(item.name)}
            </div>

            <div class="item-meta">
              ${this.escapeHtml(
                this.getItemTypeLabel(
                  item.item_type
                )
              )}
              •
              ${this.escapeHtml(
                item.quantity
              )}
              ${this.escapeHtml(
                this.getUnitDisplay(
                  item.unit
                )
              )}
            </div>
          </div>
        </div>

        <div class="item-status status-${status.level}">
          <span>${this.escapeHtml(status.label)}</span>
          ${
            status.detail
              ? `<small>${this.escapeHtml(status.detail)}</small>`
              : ""
          }
        </div>

        <div class="item-actions">
          <button
            type="button"
            class="icon-button"
            data-action="edit"
            data-id="${this.escapeHtml(item.id)}"
            title="Edit"
          >
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>

          <button
            type="button"
            class="icon-button delete"
            data-action="delete"
            data-id="${this.escapeHtml(item.id)}"
            title="Delete"
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  renderInventory() {
    if (this._inventoryCollapsed) {
      return "";
    }

    const categoryBlocks =
      this._taxonomy.categories
        .map((category) => {
          const items =
            this._items.filter(
              (item) =>
                item.category === category.id
            );

          if (!items.length) {
            return "";
          }

          const collapsed =
            this._collapsedCategories.has(
              category.id
            );

          const attention =
            items.filter(
              (item) =>
                this.getItemStatus(item).level
                !== "ok"
            ).length;

          return `
            <section class="category-section">
              <button
                type="button"
                class="category-header"
                data-action="toggle-category"
                data-category="${this.escapeHtml(
                  category.id
                )}"
              >
                <div class="category-heading">
                  <div class="category-icon">
                    <ha-icon
                      icon="${this.escapeHtml(
                        category.icon
                        ?? "mdi:package-variant"
                      )}"
                    ></ha-icon>
                  </div>

                  <div>
                    <div class="category-title">
                      ${this.escapeHtml(
                        category.label
                      )}
                    </div>

                    <div class="category-subtitle">
                      ${items.length}
                      ${items.length === 1 ? "item" : "items"}
                      ${
                        attention
                          ? ` • ${attention} require attention`
                          : " • All OK"
                      }
                    </div>
                  </div>
                </div>

                <ha-icon
                  icon="${
                    collapsed
                      ? "mdi:chevron-down"
                      : "mdi:chevron-up"
                  }"
                ></ha-icon>
              </button>

              ${
                collapsed
                  ? ""
                  : `
                    <div class="category-items">
                      ${items
                        .map(
                          (item) =>
                            this.renderItem(item)
                        )
                        .join("")}
                    </div>
                  `
              }
            </section>
          `;
        })
        .join("");

    if (!categoryBlocks.trim()) {
      return `
        <div class="empty">
          No items yet
        </div>
      `;
    }

    return `
      <div class="inventory-controls">
        <button
          type="button"
          id="expand-all"
          class="small-button"
        >
          Expand all
        </button>

        <button
          type="button"
          id="collapse-all"
          class="small-button"
        >
          Collapse all
        </button>
      </div>

      <div class="inventory">
        ${categoryBlocks}
      </div>
    `;
  }

  renderForm() {
    if (!this._editingItem) {
      return "";
    }

    const item =
      this._editingItem;

    const smart =
      this.getSmartState(
        item.category,
        item.item_type
      );

    return `
      <div class="editor">
        <div class="editor-header">
          <div class="editor-title">
            ${
              this._formMode === "add"
                ? "Add item"
                : "Edit item"
            }
          </div>

          <button
            id="cancel-editor"
            class="icon-button"
            type="button"
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>

        <div class="smart-context">
          <div class="smart-icon">
            <ha-icon
              id="smart-category-icon"
              icon="${this.escapeHtml(
                smart.category?.icon
                ?? "mdi:package-variant"
              )}"
            ></ha-icon>
          </div>

          <div>
            <div
              id="smart-category-title"
              class="smart-title"
            >
              ${this.escapeHtml(
                smart.category?.label
                ?? "HomePrep"
              )}
            </div>

            <div
              id="smart-category-message"
              class="smart-message"
            >
              ${this.escapeHtml(
                smart.message
              )}
            </div>
          </div>
        </div>

        <div class="form-grid">
          <label class="field field-wide">
            <span>Name</span>

            <input
              id="hp-name"
              value="${this.escapeHtml(
                item.name
              )}"
            >
          </label>

          <label class="field">
            <span>Category</span>

            <select id="hp-category">
              ${this.renderCategoryOptions(
                item.category
              )}
            </select>
          </label>

          <label class="field">
            <span>Item type</span>

            <select id="hp-type">
              ${this.renderItemTypeOptions(
                item.item_type
              )}
            </select>
          </label>

          <label class="field">
            <span>Quantity</span>

            <input
              id="hp-quantity"
              type="number"
              min="0"
              step="any"
              value="${this.escapeHtml(
                item.quantity
              )}"
            >
          </label>

          <label class="field">
            <span>Unit</span>

            <select id="hp-unit">
              ${this.renderUnitOptions(
                item.category,
                item.unit
              )}
            </select>
          </label>

          <label
            id="expiration-field"
            class="field ${
              smart.expirationRecommended
                ? "recommended-field"
                : ""
            }"
          >
            <span>
              Expiration date
              <em
                class="recommended-badge"
                style="${
                  smart.expirationRecommended
                    ? ""
                    : "display:none"
                }"
              >
                Recommended
              </em>
            </span>

            <input
              id="hp-expires"
              type="date"
              value="${this.escapeHtml(
                item.expires_at ?? ""
              )}"
            >
          </label>

          <label
            id="last-check-field"
            class="field ${
              smart.inspectionRecommended
                ? "recommended-field"
                : ""
            }"
          >
            <span>
              Last checked
              <em
                class="recommended-badge"
                style="${
                  smart.inspectionRecommended
                    ? ""
                    : "display:none"
                }"
              >
                Recommended
              </em>
            </span>

            <input
              id="hp-last-checked"
              type="date"
              value="${this.escapeHtml(
                item.last_checked ?? ""
              )}"
            >
          </label>

          <label
            id="next-check-field"
            class="field ${
              smart.inspectionRecommended
                ? "recommended-field"
                : ""
            }"
          >
            <span>
              Next check
              <em
                class="recommended-badge"
                style="${
                  smart.inspectionRecommended
                    ? ""
                    : "display:none"
                }"
              >
                Recommended
              </em>
            </span>

            <input
              id="hp-next-check"
              type="date"
              value="${this.escapeHtml(
                item.next_check_at ?? ""
              )}"
            >
          </label>

          <label class="field field-wide">
            <span>Notes</span>

            <textarea
              id="hp-notes"
              rows="3"
            >${this.escapeHtml(
              item.notes ?? ""
            )}</textarea>
          </label>
        </div>

        <div class="editor-actions">
          <button
            id="cancel-editor-bottom"
            class="secondary-button"
            type="button"
          >
            Cancel
          </button>

          <button
            id="save-editor"
            class="primary-button"
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    `;
  }

  render() {
    if (!this._hass) {
      return;
    }

    let body = "";

    if (this._loading) {
      body = `
        <div class="message">
          Loading inventory...
        </div>
      `;
    } else if (this._error) {
      body = `
        <div class="message error">
          Could not load HomePrep inventory.
        </div>
      `;
    } else {
      body = this.renderInventory();
    }

    this.innerHTML = `
      <ha-card>
        <style>
          .homeprep-manage {
            padding: 16px;
          }

          .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }

          .logo {
            width: 42px;
            height: 42px;
          }

          .header-text {
            flex: 1;
            min-width: 0;
          }

          .title {
            font-size: 20px;
            font-weight: 700;
          }

          .subtitle {
            margin-top: 3px;
            font-size: 11px;
            color:
              var(--secondary-text-color);
          }

          button,
          input,
          select,
          textarea {
            font: inherit;
          }

          .icon-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border: 0;
            border-radius: 50%;
            padding: 0;
            cursor: pointer;
            color:
              var(--primary-text-color);
            background:
              rgba(128,128,128,.10);
          }

          .add-button {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            border: 0;
            border-radius: 10px;
            cursor: pointer;
            color: white;
            background: #2196f3;
            font-weight: 600;
          }

          .inventory-toggle {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 9px 11px;
            margin-bottom: 14px;
            border: 1px solid
              var(--divider-color);
            border-radius: 10px;
            cursor: pointer;
            color:
              var(--primary-text-color);
            background:
              rgba(128,128,128,.05);
          }

          .inventory-controls {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-bottom: 9px;
          }

          .small-button {
            padding: 6px 9px;
            border: 1px solid
              var(--divider-color);
            border-radius: 8px;
            cursor: pointer;
            color:
              var(--secondary-text-color);
            background: transparent;
            font-size: 10px;
          }

          .inventory {
            display: flex;
            flex-direction: column;
            gap: 9px;
          }

          .category-section {
            overflow: hidden;
            border: 1px solid
              var(--divider-color);
            border-radius: 12px;
          }

          .category-header {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            padding: 11px;
            border: 0;
            cursor: pointer;
            color:
              var(--primary-text-color);
            background:
              rgba(128,128,128,.04);
            text-align: left;
          }

          .category-heading {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .category-icon,
          .item-icon,
          .smart-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            color: #2196f3;
            background:
              rgba(33,150,243,.12);
          }

          .category-icon {
            width: 36px;
            height: 36px;
          }

          .category-title {
            font-size: 13px;
            font-weight: 700;
          }

          .category-subtitle {
            margin-top: 2px;
            font-size: 9px;
            color:
              var(--secondary-text-color);
          }

          .category-items {
            display: flex;
            flex-direction: column;
            gap: 1px;
            border-top: 1px solid
              var(--divider-color);
          }

          .item {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr)
              auto
              auto;
            align-items: center;
            gap: 10px;
            padding: 10px;
          }

          .item + .item {
            border-top: 1px solid
              var(--divider-color);
          }

          .item-main {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
          }

          .item-icon {
            width: 34px;
            height: 34px;
            flex-shrink: 0;
          }

          .item-content {
            min-width: 0;
          }

          .item-name {
            font-size: 12px;
            font-weight: 700;
          }

          .item-meta {
            margin-top: 2px;
            font-size: 9px;
            color:
              var(--secondary-text-color);
          }

          .item-status {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 1px;
            min-width: 62px;
            font-size: 9px;
            font-weight: 700;
          }

          .item-status small {
            font-size: 8px;
            font-weight: 400;
            color:
              var(--secondary-text-color);
          }

          .status-ok {
            color:
              var(--success-color,#4caf50);
          }

          .status-attention {
            color:
              var(--warning-color,#ff9800);
          }

          .status-critical {
            color:
              var(--error-color,#f44336);
          }

          .item-actions {
            display: flex;
            gap: 4px;
          }

          .delete {
            color:
              var(--error-color,#db4437);
          }

          .editor {
            margin-bottom: 14px;
            padding: 14px;
            border: 1px solid
              var(--divider-color);
            border-radius: 12px;
            background:
              rgba(128,128,128,.05);
          }

          .editor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .editor-title {
            font-size: 15px;
            font-weight: 700;
          }

          .smart-context {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 14px;
            padding: 10px;
            border-radius: 10px;
            background:
              rgba(33,150,243,.08);
          }

          .smart-icon {
            width: 34px;
            height: 34px;
            flex-shrink: 0;
          }

          .smart-title {
            font-size: 12px;
            font-weight: 700;
          }

          .smart-message {
            margin-top: 2px;
            font-size: 10px;
            color:
              var(--secondary-text-color);
          }

          .form-grid {
            display: grid;
            grid-template-columns:
              repeat(2,minmax(0,1fr));
            gap: 10px;
          }

          .field {
            display: flex;
            flex-direction: column;
            gap: 5px;
            padding: 7px;
            border-radius: 9px;
          }

          .field-wide {
            grid-column: 1 / -1;
          }

          .field span {
            font-size: 10px;
            color:
              var(--secondary-text-color);
          }

          .recommended-field {
            background:
              rgba(33,150,243,.06);
            box-shadow:
              inset 0 0 0 1px
              rgba(33,150,243,.18);
          }

          .recommended-badge {
            display: inline-flex;
            margin-left: 4px;
            padding: 1px 5px;
            border-radius: 999px;
            font-size: 8px;
            font-style: normal;
            font-weight: 700;
            color: #2196f3;
            background:
              rgba(33,150,243,.12);
          }

          .field input,
          .field select,
          .field textarea {
            width: 100%;
            box-sizing: border-box;
            padding: 9px 10px;
            border: 1px solid
              var(--divider-color);
            border-radius: 8px;
            color:
              var(--primary-text-color);
            background:
              var(--card-background-color);
          }

          .editor-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 14px;
          }

          .primary-button,
          .secondary-button {
            padding: 10px 14px;
            border-radius: 10px;
            cursor: pointer;
          }

          .primary-button {
            border: 0;
            color: white;
            background: #2196f3;
          }

          .secondary-button {
            border: 1px solid
              var(--divider-color);
            color:
              var(--primary-text-color);
            background: transparent;
          }

          .message,
          .empty {
            padding: 24px;
            text-align: center;
          }

          .error {
            color:
              var(--error-color,#db4437);
          }

          @media (max-width: 600px) {
            .form-grid {
              grid-template-columns: 1fr;
            }

            .field-wide {
              grid-column: auto;
            }

            .item {
              grid-template-columns:
                minmax(0, 1fr)
                auto;
            }

            .item-status {
              grid-column: 1;
              align-items: flex-start;
              padding-left: 44px;
            }

            .item-actions {
              grid-column: 2;
              grid-row: 1 / span 2;
            }
          }
        </style>

        <div class="homeprep-manage">
          <div class="header">
            <img
              class="logo"
              src="/api/homeprep/frontend/icon.png"
              alt="HomePrep"
            >

            <div class="header-text">
              <div class="title">
                Inventory
              </div>

              <div class="subtitle">
                Manage your HomePrep items
              </div>
            </div>

            <button
              id="refresh"
              class="icon-button"
              type="button"
              title="Refresh"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>

          <button
            id="add-item"
            class="add-button"
            type="button"
          >
            + Add item
          </button>

          ${this.renderForm()}

          <button
            id="toggle-inventory"
            class="inventory-toggle"
            type="button"
          >
            <span>
              Inventory
              •
              ${this._items.length}
              ${
                this._items.length === 1
                  ? "item"
                  : "items"
              }
            </span>

            <ha-icon
              icon="${
                this._inventoryCollapsed
                  ? "mdi:chevron-down"
                  : "mdi:chevron-up"
              }"
            ></ha-icon>
          </button>

          ${body}
        </div>
      </ha-card>
    `;
  }
}


if (!customElements.get("homeprep-manage-card")) {
  customElements.define(
    "homeprep-manage-card",
    HomePrepManageCard
  );
}

window.customCards =
  window.customCards || [];

window.customCards.push({
  type: "homeprep-manage-card",
  name: "HomePrep Inventory Manager",
  description:
    "Add, edit and manage the complete HomePrep inventory",
});
