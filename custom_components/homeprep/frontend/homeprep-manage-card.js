class HomePrepManageCard extends HTMLElement {
  setConfig(config) {
    this.config = config || {};
  }

  set hass(hass) {
    const firstLoad = !this._hass;

    this._hass = hass;

    if (firstLoad) {
      this.loadItems();
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

  async loadItems() {
    if (!this._hass) {
      return;
    }

    this._loading = true;
    this._error = null;

    this.render();

    try {
      const result = await this._hass.callWS({
        type: "homeprep/items",
      });

      this._items = result.items ?? [];
    } catch (error) {
      console.error(
        "HomePrep: Failed to load inventory",
        error
      );

      this._error = error;
      this._items = [];
    }

    this._loading = false;
    this.render();
  }

  openAddForm() {
    this._editingItem = {
      name: "",
      category: "",
      item_type: "consumable",
      quantity: 1,
      unit: "pcs",
      expires_at: "",
      last_checked: "",
      next_check_at: "",
      notes: "",
    };

    this._formMode = "add";
    this.render();
  }

  openEditForm(itemId) {
    const item = this._items?.find(
      (entry) => entry.id === itemId
    );

    if (!item) {
      return;
    }

    this._editingItem = {
      ...item,
      expires_at: item.expires_at ?? "",
      last_checked: item.last_checked ?? "",
      next_check_at: item.next_check_at ?? "",
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
    const root = this;

    return {
      name:
        root.querySelector("#hp-name")
          ?.value.trim() ?? "",

      category:
        root.querySelector("#hp-category")
          ?.value.trim() ?? "",

      item_type:
        root.querySelector("#hp-type")
          ?.value ?? "consumable",

      quantity: Number(
        root.querySelector("#hp-quantity")
          ?.value ?? 0
      ),

      unit:
        root.querySelector("#hp-unit")
          ?.value.trim() ?? "",

      expires_at:
        root.querySelector("#hp-expires")
          ?.value ?? "",

      last_checked:
        root.querySelector("#hp-last-checked")
          ?.value ?? "",

      next_check_at:
        root.querySelector("#hp-next-check")
          ?.value ?? "",

      notes:
        root.querySelector("#hp-notes")
          ?.value.trim() ?? "",
    };
  }

  async saveForm() {
    const data = this.readForm();

    if (!data.name) {
      alert("Name is required.");
      return;
    }

    if (!data.category) {
      alert("Category is required.");
      return;
    }

    if (!data.unit) {
      alert("Unit is required.");
      return;
    }

    if (
      Number.isNaN(data.quantity)
      || data.quantity < 0
    ) {
      alert("Quantity must be a valid number.");
      return;
    }

    try {
      if (this._formMode === "add") {
        await this._hass.callService(
          "homeprep",
          "add_item",
          data
        );
      } else if (
        this._formMode === "edit"
        && this._editingItem?.id
      ) {
        await this._hass.callService(
          "homeprep",
          "update_item",
          {
            item_id: this._editingItem.id,
            ...data,
          }
        );
      }

      this._editingItem = null;
      this._formMode = null;

      await this.loadItems();
    } catch (error) {
      console.error(
        "HomePrep: Failed to save item",
        error
      );

      alert(
        "HomePrep could not save the item."
      );
    }
  }

  async deleteItem(itemId) {
    const item = this._items?.find(
      (entry) => entry.id === itemId
    );

    if (!item) {
      return;
    }

    const confirmed = window.confirm(
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

      await this.loadItems();
    } catch (error) {
      console.error(
        "HomePrep: Failed to delete item",
        error
      );

      alert(
        "HomePrep could not delete the item."
      );
    }
  }

  renderForm() {
    if (!this._editingItem) {
      return "";
    }

    const item = this._editingItem;

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
            id="cancel-editor"
            class="icon-button"
            title="Close"
          >
            <ha-icon icon="mdi:close"></ha-icon>
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

          <label class="field field-wide">
            <span>Category</span>

            <input
              id="hp-category"
              type="text"
              value="${this.escapeHtml(
                item.category
              )}"
            >
          </label>

          <label class="field">
            <span>Type</span>

            <select id="hp-type">
              <option
                value="consumable"
                ${
                  item.item_type ===
                  "consumable"
                    ? "selected"
                    : ""
                }
              >
                Consumable
              </option>

              <option
                value="equipment"
                ${
                  item.item_type ===
                  "equipment"
                    ? "selected"
                    : ""
                }
              >
                Equipment
              </option>
            </select>
          </label>

          <label class="field">
            <span>Quantity</span>

            <input
              id="hp-quantity"
              type="number"
              step="any"
              min="0"
              value="${this.escapeHtml(
                item.quantity ?? 1
              )}"
            >
          </label>

          <label class="field">
            <span>Unit</span>

            <input
              id="hp-unit"
              type="text"
              value="${this.escapeHtml(
                item.unit ?? ""
              )}"
            >
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
            id="cancel-editor-bottom"
            class="secondary-button"
          >
            Cancel
          </button>

          <button
            id="save-editor"
            class="primary-button"
          >
            <ha-icon icon="mdi:content-save"></ha-icon>
            ${saveLabel}
          </button>
        </div>
      </div>
    `;
  }

  renderItem(item) {
    const name = this.escapeHtml(
      item.name || "Unnamed item"
    );

    const category = this.escapeHtml(
      item.category || "Uncategorized"
    );

    const type =
      item.item_type === "equipment"
        ? "Equipment"
        : "Consumable";

    const quantity =
      item.quantity !== undefined &&
      item.quantity !== null
        ? this.escapeHtml(item.quantity)
        : "";

    const unit = this.escapeHtml(
      item.unit || ""
    );

    return `
      <div class="item">
        <div class="item-main">
          <div class="item-icon">
            <ha-icon
              icon="${
                item.item_type === "equipment"
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
            class="icon-button"
            data-action="edit"
            data-id="${this.escapeHtml(
              item.id
            )}"
            title="Edit"
          >
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>

          <button
            class="icon-button delete"
            data-action="delete"
            data-id="${this.escapeHtml(
              item.id
            )}"
            title="Delete"
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  attachEvents() {
    const refreshButton =
      this.querySelector("#refresh");

    if (refreshButton) {
      refreshButton.addEventListener(
        "click",
        () => this.loadItems()
      );
    }

    const addButton =
      this.querySelector("#add-item");

    if (addButton) {
      addButton.addEventListener(
        "click",
        () => this.openAddForm()
      );
    }

    const cancelEditor =
      this.querySelector(
        "#cancel-editor"
      );

    if (cancelEditor) {
      cancelEditor.addEventListener(
        "click",
        () => this.closeForm()
      );
    }

    const cancelEditorBottom =
      this.querySelector(
        "#cancel-editor-bottom"
      );

    if (cancelEditorBottom) {
      cancelEditorBottom.addEventListener(
        "click",
        () => this.closeForm()
      );
    }

    const saveEditor =
      this.querySelector(
        "#save-editor"
      );

    if (saveEditor) {
      saveEditor.addEventListener(
        "click",
        () => this.saveForm()
      );
    }

    this.querySelectorAll(
      "[data-action='edit']"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        () =>
          this.openEditForm(
            button.dataset.id
          )
      );
    });

    this.querySelectorAll(
      "[data-action='delete']"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        () =>
          this.deleteItem(
            button.dataset.id
          )
      );
    });
  }

  render() {
    if (!this._hass) {
      return;
    }

    let content = "";

    if (this._loading) {
      content = `
        <div class="message">
          <ha-icon icon="mdi:loading"></ha-icon>
          Loading inventory...
        </div>
      `;
    } else if (this._error) {
      content = `
        <div class="message error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>

          <div>
            <strong>
              Could not load HomePrep inventory
            </strong>

            <div class="message-detail">
              Check the HomePrep integration and reload the card.
            </div>
          </div>
        </div>
      `;
    } else if (!this._items?.length) {
      content = `
        <div class="empty">
          <ha-icon
            icon="mdi:package-variant-closed"
          ></ha-icon>

          <div class="empty-title">
            No items yet
          </div>

          <div class="empty-detail">
            Add your first preparedness item.
          </div>
        </div>
      `;
    } else {
      content = `
        <div class="inventory">
          ${this._items
            .map((item) =>
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
            object-fit: contain;
            flex-shrink: 0;
          }

          .header-text {
            flex: 1;
            min-width: 0;
          }

          .title {
            font-size: 20px;
            font-weight: 700;
            line-height: 1.1;
          }

          .subtitle {
            margin-top: 3px;
            font-size: 11px;
            color: var(--secondary-text-color);
          }

          .header-actions {
            display: flex;
            align-items: center;
            gap: 4px;
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
            padding: 0;
            border: 0;
            border-radius: 50%;
            cursor: pointer;
            color: var(--primary-text-color);
            background: rgba(128, 128, 128, 0.10);
          }

          .icon-button:hover {
            background: rgba(128, 128, 128, 0.18);
          }

          .icon-button ha-icon {
            --mdc-icon-size: 20px;
          }

          .add-button,
          .primary-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            border: 0;
            border-radius: 10px;
            cursor: pointer;
            color: white;
            background: #2196f3;
            font-weight: 600;
          }

          .add-button {
            width: 100%;
            box-sizing: border-box;
            margin-bottom: 14px;
            padding: 10px 14px;
          }

          .primary-button {
            padding: 10px 14px;
          }

          .secondary-button {
            padding: 10px 14px;
            border: 1px solid var(--divider-color);
            border-radius: 10px;
            cursor: pointer;
            color: var(--primary-text-color);
            background: transparent;
          }

          .inventory {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 11px 10px;
            border-radius: 12px;
            border: 1px solid var(--divider-color);
          }

          .item-main {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
          }

          .item-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            flex-shrink: 0;
            color: #42a5f5;
            background: rgba(66, 165, 245, 0.12);
          }

          .item-icon ha-icon {
            --mdc-icon-size: 21px;
          }

          .item-content {
            min-width: 0;
          }

          .item-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 13px;
            font-weight: 700;
          }

          .item-meta {
            margin-top: 2px;
            font-size: 10px;
            color: var(--secondary-text-color);
          }

          .item-quantity {
            margin-top: 3px;
            font-size: 11px;
          }

          .item-actions {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-shrink: 0;
          }

          .delete {
            color: var(--error-color, #db4437);
          }

          .editor {
            margin-bottom: 14px;
            padding: 14px;
            border-radius: 12px;
            border: 1px solid var(--divider-color);
            background: rgba(128, 128, 128, 0.05);
          }

          .editor-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
          }

          .editor-title {
            font-size: 15px;
            font-weight: 700;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .field {
            display: flex;
            flex-direction: column;
            gap: 5px;
            min-width: 0;
          }

          .field-wide {
            grid-column: 1 / -1;
          }

          .field span {
            font-size: 10px;
            color: var(--secondary-text-color);
          }

          .field input,
          .field select,
          .field textarea {
            width: 100%;
            box-sizing: border-box;
            padding: 9px 10px;
            border: 1px solid var(--divider-color);
            border-radius: 8px;
            outline: none;
            color: var(--primary-text-color);
            background: var(
              --input-fill-color,
              var(--card-background-color)
            );
          }

          .field textarea {
            resize: vertical;
          }

          .editor-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 14px;
          }

          .message {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 18px;
            border-radius: 12px;
            background: rgba(128, 128, 128, 0.08);
          }

          .message-detail {
            margin-top: 3px;
            font-size: 11px;
            color: var(--secondary-text-color);
          }

          .error {
            color: var(--error-color, #db4437);
          }

          .empty {
            padding: 30px 16px;
            text-align: center;
            color: var(--secondary-text-color);
          }

          .empty ha-icon {
            --mdc-icon-size: 38px;
            color: #42a5f5;
          }

          .empty-title {
            margin-top: 10px;
            font-size: 14px;
            font-weight: 700;
            color: var(--primary-text-color);
          }

          .empty-detail {
            margin-top: 4px;
            font-size: 11px;
          }

          @media (max-width: 500px) {
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

            <div class="header-actions">
              <button
                id="refresh"
                class="icon-button"
                title="Refresh"
              >
                <ha-icon
                  icon="mdi:refresh"
                ></ha-icon>
              </button>
            </div>
          </div>

          <button
            id="add-item"
            class="add-button"
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            Add item
          </button>

          ${this.renderForm()}

          ${content}
        </div>
      </ha-card>
    `;

    this.attachEvents();
  }
}


if (!customElements.get(
  "homeprep-manage-card"
)) {
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
