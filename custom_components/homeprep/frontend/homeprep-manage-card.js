class HomePrepManageCard extends HTMLElement {
  constructor() {
    super();

    this._items = [];
    this._taxonomy = {
      categories: [],
      item_types: [],
      units: []
    };

    this._loading = false;
    this._error = null;
    this._editingItem = null;
    this._formMode = null;
    this._inventoryCollapsed = false;
    this._collapsedCategories =
      new Set();

    this.addEventListener(
      "click",
      (event) =>
        this.handleClick(event)
    );

    this.addEventListener(
      "change",
      (event) =>
        this.handleChange(event)
    );
  }

  static getConfigElement() {
    return document.createElement(
      "homeprep-card-editor"
    );
  }

  static getStubConfig() {
    return {
      inventory_collapsed: false
    };
  }

  setConfig(config) {
    this.config = config || {};

    this._inventoryCollapsed =
      this.config
        .inventory_collapsed
      === true;
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;

    if (first) {
      this.loadData();
    }
  }

  getCardSize() {
    return 12;
  }

  esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  async loadData() {
    if (!this._hass || this._loading) {
      return;
    }

    this._loading = true;

    try {
      const [items, taxonomy] =
        await Promise.all([
          this._hass.callWS({
            type: "homeprep/items"
          }),
          this._hass.callWS({
            type: "homeprep/taxonomy"
          })
        ]);

      this._items =
        items.items ?? [];

      this._taxonomy = {
        categories:
          taxonomy.categories ?? [],
        item_types:
          taxonomy.item_types ?? [],
        units:
          taxonomy.units ?? []
      };

      this._error = null;
    } catch (error) {
      console.error(
        "HomePrep manage load failed",
        error
      );

      this._error = error;
    }

    this._loading = false;
    this.render();
  }

  getCategory(id) {
    return (
      this._taxonomy.categories.find(
        (x) => x.id === id
      ) || null
    );
  }

  getUnit(id) {
    return (
      this._taxonomy.units.find(
        (x) => x.id === id
      ) || null
    );
  }

  getItemType(id) {
    return (
      this._taxonomy.item_types.find(
        (x) => x.id === id
      ) || null
    );
  }

  getUnitDisplay(id) {
    const u = this.getUnit(id);

    return u
      ? (u.symbol || u.label)
      : id || "";
  }

  handleClick(event) {
    const target =
      event.composedPath().find(
        (el) =>
          el instanceof HTMLElement &&
          (
            el.id ||
            el.dataset?.action
          )
      );

    if (!target) return;

    if (target.id === "add-item") {
      this.openAddForm();
      return;
    }

    if (
      target.id === "cancel-editor" ||
      target.id
        === "cancel-editor-bottom"
    ) {
      this.closeForm();
      return;
    }

    if (
      target.id === "save-editor"
    ) {
      this.saveForm();
      return;
    }

    if (
      target.id ===
      "toggle-inventory"
    ) {
      this._inventoryCollapsed =
        !this._inventoryCollapsed;

      this.render();
      return;
    }

    if (
      target.dataset.action
      === "toggle-category"
    ) {
      const id =
        target.dataset.category;

      if (
        this._collapsedCategories
          .has(id)
      ) {
        this._collapsedCategories
          .delete(id);
      } else {
        this._collapsedCategories
          .add(id);
      }

      this.render();
      return;
    }

    if (
      target.dataset.action
      === "edit"
    ) {
      this.openEditForm(
        target.dataset.id
      );
      return;
    }

    if (
      target.dataset.action
      === "delete"
    ) {
      this.deleteItem(
        target.dataset.id
      );
    }
  }

  handleChange(event) {
    const target = event.target;

    if (
      !(
        target
        instanceof HTMLSelectElement
      )
    ) {
      return;
    }

    if (
      target.id !== "hp-category"
    ) {
      return;
    }

    const unit =
      this.querySelector(
        "#hp-unit"
      );

    if (!unit) return;

    const current = unit.value;

    unit.innerHTML =
      this.renderUnitOptions(
        target.value,
        current
      );

    unit.value = current;
  }

  openAddForm() {
    const c =
      this._taxonomy.categories[0];

    this._editingItem = {
      name: "",
      category:
        c?.id || "other",
      item_type:
        this._taxonomy
          .item_types[0]?.id
        || "consumable",
      quantity: 1,
      unit:
        c?.default_unit
        || "piece",
      expires_at: "",
      last_checked: "",
      next_check_at: "",
      notes: ""
    };

    this._formMode = "add";
    this.render();
  }

  openEditForm(id) {
    const item =
      this._items.find(
        (x) => x.id === id
      );

    if (!item) return;

    this._editingItem = {
      ...item,
      expires_at:
        item.expires_at || "",
      last_checked:
        item.last_checked || "",
      next_check_at:
        item.next_check_at || "",
      notes:
        item.notes || ""
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
    const q = (id) =>
      this.querySelector(id);

    return {
      name:
        q("#hp-name")
          ?.value.trim()
        || "",
      category:
        q("#hp-category")
          ?.value
        || "other",
      item_type:
        q("#hp-type")
          ?.value
        || "consumable",
      quantity:
        Number(
          q("#hp-quantity")
            ?.value
          || 0
        ),
      unit:
        q("#hp-unit")
          ?.value
        || "piece",
      expires_at:
        q("#hp-expires")
          ?.value
        || "",
      last_checked:
        q("#hp-last-checked")
          ?.value
        || "",
      next_check_at:
        q("#hp-next-check")
          ?.value
        || "",
      notes:
        q("#hp-notes")
          ?.value.trim()
        || ""
    };
  }

  async saveForm() {
    const data =
      this.readForm();

    if (!data.name) {
      alert("Name is required.");
      return;
    }

    const payload = {
      name: data.name,
      category: data.category,
      item_type: data.item_type,
      quantity: data.quantity,
      unit: data.unit
    };

    [
      "expires_at",
      "last_checked",
      "next_check_at",
      "notes"
    ].forEach((key) => {
      if (data[key]) {
        payload[key] = data[key];
      }
    });

    try {
      if (
        this._formMode === "add"
      ) {
        await this._hass.callService(
          "homeprep",
          "add_item",
          payload
        );
      } else {
        await this._hass.callService(
          "homeprep",
          "update_item",
          {
            item_id:
              this._editingItem.id,
            ...payload
          }
        );
      }

      this._editingItem = null;
      this._formMode = null;
      await this.loadData();
    } catch (error) {
      console.error(error);
      alert(
        "HomePrep could not save the item."
      );
    }
  }

  async deleteItem(id) {
    const item =
      this._items.find(
        (x) => x.id === id
      );

    if (!item) return;

    if (
      !confirm(
        `Delete "${item.name}"?`
      )
    ) {
      return;
    }

    await this._hass.callService(
      "homeprep",
      "delete_item",
      {
        item_id: id
      }
    );

    await this.loadData();
  }

  group(entries) {
    const m = new Map();

    entries.forEach((x) => {
      const g =
        x.group || "Other";

      if (!m.has(g)) {
        m.set(g, []);
      }

      m.get(g).push(x);
    });

    return m;
  }

  renderCategoryOptions(
    selected
  ) {
    return [
      ...this.group(
        this._taxonomy.categories
      ).entries()
    ]
      .map(
        ([group, entries]) => `
          <optgroup
            label="${this.esc(group)}"
          >
            ${entries
              .map(
                (x) => `
                  <option
                    value="${this.esc(x.id)}"
                    ${
                      x.id === selected
                        ? "selected"
                        : ""
                    }
                  >
                    ${this.esc(x.label)}
                  </option>
                `
              )
              .join("")}
          </optgroup>
        `
      )
      .join("");
  }

  renderTypeOptions(selected) {
    return this._taxonomy.item_types
      .map(
        (x) => `
          <option
            value="${this.esc(x.id)}"
            ${
              x.id === selected
                ? "selected"
                : ""
            }
          >
            ${this.esc(x.label)}
          </option>
        `
      )
      .join("");
  }

  renderUnitOptions(
    categoryId,
    selected
  ) {
    const category =
      this.getCategory(categoryId);

    const preferred =
      category?.preferred_units
      || [];

    const ids =
      new Set(preferred);

    const recommended =
      preferred
        .map(
          (id) =>
            this.getUnit(id)
        )
        .filter(Boolean);

    const remaining =
      this._taxonomy.units.filter(
        (x) => !ids.has(x.id)
      );

    const option = (x) => `
      <option
        value="${this.esc(x.id)}"
        ${
          x.id === selected
            ? "selected"
            : ""
        }
      >
        ${this.esc(
          x.label
          + (
            x.symbol
              ? ` (${x.symbol})`
              : ""
          )
        )}
      </option>
    `;

    let html = "";

    if (recommended.length) {
      html += `
        <optgroup
          label="Recommended"
        >
          ${recommended
            .map(option)
            .join("")}
        </optgroup>
      `;
    }

    [
      ...this.group(
        remaining
      ).entries()
    ].forEach(
      ([group, entries]) => {
        html += `
          <optgroup
            label="${this.esc(group)}"
          >
            ${entries
              .map(option)
              .join("")}
          </optgroup>
        `;
      }
    );

    return html;
  }

  renderForm() {
    const item =
      this._editingItem;

    if (!item) return "";

    return `
      <div class="editor">
        <div class="editor-head">
          <strong>
            ${
              this._formMode === "add"
                ? "Add item"
                : "Edit item"
            }
          </strong>

          <button
            id="cancel-editor"
            class="icon-button"
            type="button"
          >
            <ha-icon
              icon="mdi:close"
            ></ha-icon>
          </button>
        </div>

        <div class="form-grid">
          <label class="field wide">
            <span>Name</span>
            <input
              id="hp-name"
              value="${this.esc(item.name)}"
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
              ${this.renderTypeOptions(
                item.item_type
              )}
            </select>
          </label>

          <label class="field">
            <span>Quantity</span>
            <input
              id="hp-quantity"
              type="number"
              step="any"
              min="0"
              value="${this.esc(
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

          <label class="field">
            <span>Expiration date</span>
            <input
              id="hp-expires"
              type="date"
              value="${this.esc(
                item.expires_at
              )}"
            >
          </label>

          <label class="field">
            <span>Last checked</span>
            <input
              id="hp-last-checked"
              type="date"
              value="${this.esc(
                item.last_checked
              )}"
            >
          </label>

          <label class="field">
            <span>Next check</span>
            <input
              id="hp-next-check"
              type="date"
              value="${this.esc(
                item.next_check_at
              )}"
            >
          </label>

          <label class="field wide">
            <span>Notes</span>
            <textarea
              id="hp-notes"
              rows="3"
            >${this.esc(
              item.notes
            )}</textarea>
          </label>
        </div>

        <div class="editor-actions">
          <button
            id="cancel-editor-bottom"
            class="secondary"
            type="button"
          >
            Cancel
          </button>

          <button
            id="save-editor"
            class="primary"
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    `;
  }

  renderInventory() {
    if (
      this._inventoryCollapsed
    ) {
      return "";
    }

    return this._taxonomy.categories
      .map((category) => {
        const items =
          this._items.filter(
            (item) =>
              item.category
              === category.id
          );

        if (!items.length) {
          return "";
        }

        const collapsed =
          this._collapsedCategories
            .has(category.id);

        return `
          <div class="category">
            <button
              type="button"
              class="category-head"
              data-action="toggle-category"
              data-category="${this.esc(
                category.id
              )}"
            >
              <div class="category-icon">
                <ha-icon
                  icon="${this.esc(
                    category.icon
                  )}"
                ></ha-icon>
              </div>

              <div class="category-title">
                ${this.esc(
                  category.label
                )}
              </div>

              <div class="category-count">
                ${items.length}
                ${
                  items.length === 1
                    ? "item"
                    : "items"
                }
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
                : items
                    .map(
                      (item) => `
                        <div class="item">
                          <div class="item-icon">
                            <ha-icon
                              icon="${this.esc(
                                category.icon
                              )}"
                            ></ha-icon>
                          </div>

                          <div class="item-main">
                            <div class="item-name">
                              ${this.esc(
                                item.name
                              )}
                            </div>

                            <div class="item-meta">
                              ${this.esc(
                                this.getItemType(
                                  item.item_type
                                )?.label
                                || item.item_type
                              )}
                              •
                              ${this.esc(
                                item.quantity
                              )}
                              ${this.esc(
                                this.getUnitDisplay(
                                  item.unit
                                )
                              )}
                            </div>
                          </div>

                          <div class="item-actions">
                            <button
                              class="icon-button"
                              type="button"
                              data-action="edit"
                              data-id="${this.esc(
                                item.id
                              )}"
                            >
                              <ha-icon
                                icon="mdi:pencil"
                              ></ha-icon>
                            </button>

                            <button
                              class="icon-button danger"
                              type="button"
                              data-action="delete"
                              data-id="${this.esc(
                                item.id
                              )}"
                            >
                              <ha-icon
                                icon="mdi:delete"
                              ></ha-icon>
                            </button>
                          </div>
                        </div>
                      `
                    )
                    .join("")
            }
          </div>
        `;
      })
      .join("");
  }

  render() {
    if (!this._hass) return;

    const styleVars =
      window.HomePrepUI.styleVars(
        this.config
      );

    this.innerHTML = `
      <ha-card style="${styleVars}">
        ${window.HomePrepUI.baseStyles()}

        <style>
          .wrap {
            padding: var(--hp-pad);
          }

          .header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
          }

          .logo {
            width: 38px;
            height: 38px;
          }

          .header-text {
            flex: 1;
          }

          .title {
            font-size: 16px;
            font-weight: 700;
          }

          .subtitle,
          .item-meta,
          .category-count {
            color: var(--hp-secondary);
          }

          .subtitle {
            margin-top: 2px;
            font-size: 9px;
          }

          button,
          input,
          select,
          textarea {
            font: inherit;
          }

          .add {
            width: 100%;
            padding: 10px;
            border: 0;
            border-radius:
              calc(
                var(--hp-radius) - 4px
              );
            cursor: pointer;
            color: white;
            background:
              var(--hp-accent);
            font-weight: 700;
          }

          .inventory-toggle {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 10px 0;
            padding: 9px 10px;
            border:
              1px solid
              var(--hp-border);
            border-radius:
              calc(
                var(--hp-radius) - 4px
              );
            color: var(--hp-primary);
            background:
              color-mix(
                in srgb,
                var(--hp-bg) 94%,
                var(--hp-primary) 6%
              );
            cursor: pointer;
          }

          .category {
            margin-top: 8px;
            border:
              1px solid
              var(--hp-border);
            border-radius:
              calc(
                var(--hp-radius) - 3px
              );
            overflow: hidden;
          }

          .category-head {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 10px;
            border: 0;
            color: var(--hp-primary);
            background:
              color-mix(
                in srgb,
                var(--hp-bg) 94%,
                var(--hp-primary) 6%
              );
            cursor: pointer;
            text-align: left;
          }

          .category-icon,
          .item-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border-radius: 50%;
            color: var(--hp-accent);
            background:
              color-mix(
                in srgb,
                var(--hp-accent) 14%,
                transparent
              );
          }

          .category-icon {
            width: 34px;
            height: 34px;
          }

          .item-icon {
            width: 32px;
            height: 32px;
          }

          .category-title,
          .item-main {
            flex: 1;
            min-width: 0;
          }

          .category-title,
          .item-name {
            font-weight: 700;
          }

          .category-count,
          .item-meta {
            font-size: 9px;
          }

          .item {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 9px 10px;
            border-top:
              1px solid
              var(--hp-border);
          }

          .item-name {
            font-size: 11px;
          }

          .item-actions {
            display: flex;
            gap: 4px;
          }

          .icon-button {
            width: 34px;
            height: 34px;
            border: 0;
            border-radius: 50%;
            cursor: pointer;
            color: var(--hp-primary);
            background:
              color-mix(
                in srgb,
                var(--hp-primary) 9%,
                transparent
              );
          }

          .danger {
            color: var(--hp-critical);
          }

          .editor {
            margin-top: 10px;
            padding: 12px;
            border:
              1px solid
              var(--hp-border);
            border-radius:
              calc(
                var(--hp-radius) - 3px
              );
          }

          .editor-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
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
          }

          .field span {
            font-size: 9px;
            color: var(--hp-secondary);
          }

          .wide {
            grid-column: 1/-1;
          }

          .field input,
          .field select,
          .field textarea {
            width: 100%;
            box-sizing: border-box;
            padding: 9px 10px;
            border:
              1px solid
              var(--hp-border);
            border-radius: 8px;
            color: var(--hp-primary);
            background: var(--hp-bg);
          }

          .editor-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 12px;
          }

          .primary,
          .secondary {
            padding: 9px 12px;
            border-radius: 8px;
            cursor: pointer;
          }

          .primary {
            border: 0;
            color: white;
            background: var(--hp-accent);
          }

          .secondary {
            border:
              1px solid
              var(--hp-border);
            color: var(--hp-primary);
            background: transparent;
          }

          @media(max-width:500px) {
            .form-grid {
              grid-template-columns:1fr;
            }

            .wide {
              grid-column:auto;
            }
          }
        </style>

        <div class="wrap">
          <div class="header">
            <img
              class="logo"
              src="/api/homeprep/frontend/icon.png"
            >

            <div class="header-text">
              <div class="title">
                ${this.esc(
                  this.config?.title
                  || "Inventory"
                )}
              </div>

              <div class="subtitle">
                Manage your HomePrep items
              </div>
            </div>
          </div>

          <button
            id="add-item"
            class="add"
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
              Inventory •
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

          ${
            this._inventoryCollapsed
              ? ""
              : this.renderInventory()
          }
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
