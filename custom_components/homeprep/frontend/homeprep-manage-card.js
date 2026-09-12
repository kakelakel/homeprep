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

    this.addEventListener(
      "click",
      (event) => this.handleClick(event)
    );

    this.addEventListener(
      "change",
      (event) => this.handleChange(event)
    );
  }

  setConfig(config) {
    this.config = config || {};
  }

  set hass(hass) {
    const firstLoad = !this._hass;

    this._hass = hass;

    if (firstLoad) {
      this.loadData();
    }
  }

  getCardSize() {
    return 8;
  }

  escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  getClickedElement(event) {
    const path = event.composedPath();

    return path.find((element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      return (
        element.id === "refresh" ||
        element.id === "add-item" ||
        element.id === "cancel-editor" ||
        element.id === "cancel-editor-bottom" ||
        element.id === "save-editor" ||
        element.dataset?.action
      );
    });
  }

  async handleClick(event) {
    const target =
      this.getClickedElement(event);

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

    if (target.dataset.action === "edit") {
      this.openEditForm(
        target.dataset.id
      );
      return;
    }

    if (target.dataset.action === "delete") {
      await this.deleteItem(
        target.dataset.id
      );
    }
  }

  handleChange(event) {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    if (target.id !== "hp-category") {
      return;
    }

    const unitSelect =
      this.querySelector("#hp-unit");

    if (!unitSelect) {
      return;
    }

    const currentUnit =
      unitSelect.value;

    unitSelect.innerHTML =
      this.renderUnitOptions(
        target.value,
        currentUnit
      );

    unitSelect.value =
      currentUnit;
  }

  async loadData() {
    if (!this._hass || this._loading) {
      return;
    }

    this._loading = true;
    this._error = null;

    this.render();

    try {
      const [
        itemsResult,
        taxonomyResult,
      ] = await Promise.all([
        this._hass.callWS({
          type: "homeprep/items",
        }),

        this._hass.callWS({
          type: "homeprep/taxonomy",
        }),
      ]);

      this._items =
        itemsResult.items ?? [];

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
        (entry) =>
          entry.id === categoryId
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

  getItemTypeLabel(itemTypeId) {
    return (
      this._taxonomy.item_types.find(
        (entry) =>
          entry.id === itemTypeId
      )?.label
      ?? itemTypeId
      ?? "Unknown"
    );
  }

  getUnit(unitId) {
    return (
      this._taxonomy.units.find(
        (entry) =>
          entry.id === unitId
      ) ?? null
    );
  }

  getUnitDisplay(unitId) {
    const unit =
      this.getUnit(unitId);

    if (!unit) {
      return unitId ?? "";
    }

    return (
      unit.symbol ||
      unit.label
    );
  }

  openAddForm() {
    const firstCategory =
      this._taxonomy.categories[0];

    const categoryId =
      firstCategory?.id ?? "other";

    const defaultUnit =
      firstCategory?.default_unit
      ?? "piece";

    this._editingItem = {
      name: "",
      category: categoryId,
      item_type:
        this._taxonomy.item_types[0]
          ?.id ?? "consumable",
      quantity: 1,
      unit: defaultUnit,
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
        (entry) =>
          entry.id === itemId
      );

    if (!item) {
      return;
    }

    this._editingItem = {
      ...item,
      expires_at:
        item.expires_at ?? "",
      last_checked:
        item.last_checked ?? "",
      next_check_at:
        item.next_check_at ?? "",
      notes:
        item.notes ?? "",
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
        this.querySelector(
          "#hp-name"
        )?.value.trim() ?? "",

      category:
        this.querySelector(
          "#hp-category"
        )?.value ?? "other",

      item_type:
        this.querySelector(
          "#hp-type"
        )?.value ?? "consumable",

      quantity: Number(
        this.querySelector(
          "#hp-quantity"
        )?.value ?? 0
      ),

      unit:
        this.querySelector(
          "#hp-unit"
        )?.value ?? "piece",

      expires_at:
        this.querySelector(
          "#hp-expires"
        )?.value || "",

      last_checked:
        this.querySelector(
          "#hp-last-checked"
        )?.value || "",

      next_check_at:
        this.querySelector(
          "#hp-next-check"
        )?.value || "",

      notes:
        this.querySelector(
          "#hp-notes"
        )?.value.trim() ?? "",
    };
  }

  async saveForm() {
    const data =
      this.readForm();

    if (!data.name) {
      window.alert(
        "Name is required."
      );
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
      name:
        data.name,
      category:
        data.category,
      item_type:
        data.item_type,
      quantity:
        data.quantity,
      unit:
        data.unit,
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
      serviceData.notes =
        data.notes;
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
        (entry) =>
          entry.id === itemId
      );

    if (!item) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${item.name}" from HomePrep?`
      );

    if (!confirmed) {
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
      const group =
        entry.group || "Other";

      if (!groups.has(group)) {
        groups.set(
          group,
          []
        );
      }

      groups.get(group).push(
        entry
      );
    });

    return groups;
  }

  renderCategoryOptions(
    selectedId
  ) {
    const groups =
      this.groupEntries(
        this._taxonomy.categories
      );

    return [...groups.entries()]
      .map(
        ([groupName, entries]) => `
          <optgroup
            label="${this.escapeHtml(
              groupName
            )}"
          >
            ${entries
              .map((entry) => `
                <option
                  value="${this.escapeHtml(
                    entry.id
                  )}"
                  ${
                    entry.id === selectedId
                      ? "selected"
                      : ""
                  }
                >
                  ${this.escapeHtml(
                    entry.label
                  )}
                </option>
              `)
              .join("")}
          </optgroup>
        `
      )
      .join("");
  }

  renderItemTypeOptions(
    selectedId
  ) {
    return this._taxonomy.item_types
      .map((entry) => `
        <option
          value="${this.escapeHtml(
            entry.id
          )}"
          ${
            entry.id === selectedId
              ? "selected"
              : ""
          }
        >
          ${this.escapeHtml(
            entry.label
          )}
        </option>
      `)
      .join("");
  }

  renderUnitOption(
    unit,
    selectedId
  ) {
    let label =
      unit.label;

    if (unit.symbol) {
      label +=
        ` (${unit.symbol})`;
    }

    return `
      <option
        value="${this.escapeHtml(
          unit.id
        )}"
        ${
          unit.id === selectedId
            ? "selected"
            : ""
        }
      >
        ${this.escapeHtml(
          label
        )}
      </option>
    `;
  }

  renderUnitOptions(
    categoryId,
    selectedId
  ) {
    const category =
      this.getCategory(
        categoryId
      );

    const preferredIds =
      category?.preferred_units
      ?? [];

    const recommended =
      preferredIds
        .map((unitId) =>
          this.getUnit(unitId)
        )
        .filter(Boolean);

    const recommendedIds =
      new Set(
        recommended.map(
          (unit) => unit.id
        )
      );

    const remainingUnits =
      this._taxonomy.units.filter(
        (unit) =>
          !recommendedIds.has(
            unit.id
          )
      );

    let html = "";

    if (recommended.length) {
      html += `
        <optgroup
          label="Recommended for ${this.escapeHtml(
            category?.label
            ?? "category"
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
      this.groupEntries(
        remainingUnits
      );

    html += [...groups.entries()]
      .map(
        ([groupName, entries]) => `
          <optgroup
            label="${this.escapeHtml(
              groupName
            )}"
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
    const name =
      this.escapeHtml(
        item.name ||
        "Unnamed item"
      );

    const category =
      this.escapeHtml(
        this.getCategoryLabel(
          item.category
        )
      );

    const type =
      this.escapeHtml(
        this.getItemTypeLabel(
          item.item_type
        )
      );

    const quantity =
      this.escapeHtml(
        item.quantity ?? ""
      );

    const unit =
      this.escapeHtml(
        this.getUnitDisplay(
          item.unit
        )
      );

    return `
      <div class="item">
        <div class="item-main">
          <div class="item-icon">
            <ha-icon
              icon="${
                item.item_type ===
                "equipment"
                  ? "mdi:tools"
                  : "mdi:package-variant"
              }"
            ></ha-icon>
          </div>

          <div class="item-content">
            <div class="item-name">
              ${name}
            </div>

            <div class="item-meta">
              ${category} • ${type}
            </div>

            <div class="item-quantity">
              ${quantity} ${unit}
            </div>
          </div>
        </div>

        <div class="item-actions">
          <button
            type="button"
            class="icon-button"
            data-action="edit"
            data-id="${this.escapeHtml(
              item.id
            )}"
            title="Edit"
          >
            <ha-icon
              icon="mdi:pencil"
            ></ha-icon>
          </button>

          <button
            type="button"
            class="icon-button delete"
            data-action="delete"
            data-id="${this.escapeHtml(
              item.id
            )}"
            title="Delete"
          >
            <ha-icon
              icon="mdi:delete"
            ></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  renderForm() {
    if (!this._editingItem) {
      return "";
    }

    const item =
      this._editingItem;

    const title =
      this._formMode === "add"
        ? "Add item"
        : "Edit item";

    const saveLabel =
      this._formMode === "add"
        ? "Add item"
        : "Save changes";

    return `
      <div class="editor">
        <div class="editor-header">
          <div class="editor-title">
            ${title}
          </div>

          <button
            type="button"
            id="cancel-editor"
            class="icon-button"
          >
            <ha-icon
              icon="mdi:close"
            ></ha-icon>
          </button>
        </div>

        <div class="form-grid">
          <label class="field field-wide">
            <span>Name</span>

            <input
              id="hp-name"
              type="text"
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
                item.quantity ?? 1
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

          <label class="field">
            <span>Expiration date</span>

            <input
              id="hp-expires"
              type="date"
              value="${this.escapeHtml(
                item.expires_at ?? ""
              )}"
            >
          </label>

          <label class="field">
            <span>Last checked</span>

            <input
              id="hp-last-checked"
              type="date"
              value="${this.escapeHtml(
                item.last_checked ?? ""
              )}"
            >
          </label>

          <label class="field">
            <span>Next check</span>

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
            type="button"
            id="cancel-editor-bottom"
            class="secondary-button"
          >
            Cancel
          </button>

          <button
            type="button"
            id="save-editor"
            class="primary-button"
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

    let content = "";

    if (this._loading) {
      content = `
        <div class="message">
          Loading inventory...
        </div>
      `;
    } else if (this._error) {
      content = `
        <div class="message error">
          Could not load HomePrep inventory.
        </div>
      `;
    } else if (!this._items.length) {
      content = `
        <div class="empty">
          No items yet
        </div>
      `;
    } else {
      content = `
        <div class="inventory">
          ${this._items
            .map(
              (item) =>
                this.renderItem(item)
            )
            .join("")}
        </div>
      `;
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
            width: 36px;
            height: 36px;
            border: 0;
            border-radius: 50%;
            cursor: pointer;
            color:
              var(--primary-text-color);
            background:
              rgba(128,128,128,.10);
          }

          .add-button {
            width: 100%;
            padding: 10px;
            margin-bottom: 14px;
            border: 0;
            border-radius: 10px;
            cursor: pointer;
            color: white;
            background: #2196f3;
            font-weight: 600;
          }

          .inventory {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .item {
            display: flex;
            justify-content:
              space-between;
            align-items: center;
            gap: 10px;
            padding: 11px 10px;
            border:
              1px solid
              var(--divider-color);
            border-radius: 12px;
          }

          .item-main {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .item-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            color: #42a5f5;
            background:
              rgba(66,165,245,.12);
          }

          .item-name {
            font-size: 13px;
            font-weight: 700;
          }

          .item-meta {
            margin-top: 2px;
            font-size: 10px;
            color:
              var(--secondary-text-color);
          }

          .item-quantity {
            margin-top: 3px;
            font-size: 11px;
          }

          .item-actions {
            display: flex;
            gap: 4px;
          }

          .delete {
            color:
              var(
                --error-color,
                #db4437
              );
          }

          .editor {
            margin-bottom: 14px;
            padding: 14px;
            border:
              1px solid
              var(--divider-color);
            border-radius: 12px;
            background:
              rgba(128,128,128,.05);
          }

          .editor-header {
            display: flex;
            justify-content:
              space-between;
            align-items: center;
            margin-bottom: 14px;
          }

          .editor-title {
            font-size: 15px;
            font-weight: 700;
          }

          .form-grid {
            display: grid;
            grid-template-columns:
              repeat(
                2,
                minmax(0,1fr)
              );
            gap: 10px;
          }

          .field {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }

          .field-wide {
            grid-column: 1 / -1;
          }

          .field span {
            font-size: 10px;
            color:
              var(--secondary-text-color);
          }

          .field input,
          .field select,
          .field textarea {
            width: 100%;
            box-sizing: border-box;
            padding: 9px 10px;
            border:
              1px solid
              var(--divider-color);
            border-radius: 8px;
            color:
              var(--primary-text-color);
            background:
              var(
                --card-background-color
              );
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
            border:
              1px solid
              var(--divider-color);
            background: transparent;
            color:
              var(--primary-text-color);
          }

          .message,
          .empty {
            padding: 24px;
            text-align: center;
          }

          .error {
            color:
              var(
                --error-color,
                #db4437
              );
          }

          @media (
            max-width: 500px
          ) {
            .form-grid {
              grid-template-columns: 1fr;
            }

            .field-wide {
              grid-column: auto;
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
            >
              ↻
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

          ${content}
        </div>
      </ha-card>
    `;
  }
}


if (
  !customElements.get(
    "homeprep-manage-card"
  )
) {
  customElements.define(
    "homeprep-manage-card",
    HomePrepManageCard
  );
}


window.customCards =
  window.customCards || [];

window.customCards.push({
  type: "homeprep-manage-card",
  name: "HomePrep Inventory",
  description:
    "Manage your HomePrep preparedness inventory",
});
