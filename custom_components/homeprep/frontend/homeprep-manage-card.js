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
    return 6;
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
            data-id="${this.escapeHtml(item.id)}"
            title="Edit"
          >
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>

          <button
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
        () => {
          console.log(
            "HomePrep: Add item clicked"
          );
        }
      );
    }

    this.querySelectorAll(
      "[data-action='edit']"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          console.log(
            "HomePrep: Edit item",
            button.dataset.id
          );
        }
      );
    });

    this.querySelectorAll(
      "[data-action='delete']"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          console.log(
            "HomePrep: Delete item",
            button.dataset.id
          );
        }
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

          button {
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

          .add-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            width: 100%;
            box-sizing: border-box;
            margin-bottom: 14px;
            padding: 10px 14px;
            border: 0;
            border-radius: 10px;
            cursor: pointer;
            color: white;
            background: #2196f3;
            font-weight: 600;
          }

          .add-button ha-icon {
            --mdc-icon-size: 19px;
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
