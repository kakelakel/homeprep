import "./homeprep-panel-v4.js?v=4";

const HomePrepPanel = customElements.get("homeprep-panel");

if (HomePrepPanel) {
  HomePrepPanel.prototype.inventoryItemState = function inventoryItemState(item) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const soonLimit = new Date(today);
    soonLimit.setDate(soonLimit.getDate() + 30);

    let expiryState = null;
    if (item.expires_at) {
      const expiry = new Date(`${item.expires_at}T00:00:00`);
      if (expiry < today) expiryState = { status: "critical", label: "Expired" };
      else if (expiry <= soonLimit) expiryState = { status: "attention", label: "Expiring soon" };
    }

    let checkState = null;
    if (item.next_check_at) {
      const checkDate = new Date(`${item.next_check_at}T00:00:00`);
      if (checkDate <= today) checkState = { status: "critical", label: "Check due" };
    }

    if (expiryState?.status === "critical") return expiryState;
    if (checkState?.status === "critical") return checkState;
    if (expiryState) return expiryState;
    return { status: "ok", label: "OK" };
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
      return `<section class="panel-card"><div class="section-head"><h3><ha-icon icon="${this.esc(cat?.icon || "mdi:package-variant")}"></ha-icon> ${this.esc(cat?.label || categoryId)}</h3><span>${items.length}</span></div>${items.map((item) => {
        const state = this.inventoryItemState(item);
        return `<div class="row inventory-row"><div class="row-icon ${state.status}" title="${this.esc(state.label)}"><ha-icon icon="${this.esc(cat?.icon || "mdi:package-variant")}"></ha-icon></div><div class="row-main"><strong>${this.esc(item.name)}</strong><small>${this.esc(item.quantity)} ${this.esc(item.unit)}${item.next_check_at ? ` · Next check ${this.esc(item.next_check_at)}` : ""}${item.expires_at ? ` · Expires ${this.esc(item.expires_at)}` : ""}</small></div>${state.status !== "ok" ? `<span class="badge ${state.status}">${this.esc(state.label)}</span>` : ""}<div class="row-actions"><button data-action="edit-item" data-id="${this.esc(item.id)}">Edit</button><button class="danger small" data-action="delete-item" data-id="${this.esc(item.id)}">Delete</button></div></div>`;
      }).join("")}</section>`;
    }).join("") || '<section class="panel-card"><div class="empty">No inventory items yet. Use Add item to get started.</div></section>'}</div>`;
  };

  const oldRender = HomePrepPanel.prototype.render;
  HomePrepPanel.prototype.render = function render() {
    oldRender.call(this);
    const brandIcon = this.querySelector(".brand-icon");
    if (brandIcon) {
      brandIcon.classList.add("brand-logo");
      brandIcon.innerHTML = '<img src="/api/homeprep/frontend/icon.png" alt="HomePrep">';
    }
  };

  const oldStyles = HomePrepPanel.prototype.styles;
  HomePrepPanel.prototype.styles = function styles() {
    return `${oldStyles.call(this)}
      .brand-logo{overflow:hidden;background:transparent!important;border-radius:11px!important}
      .brand-logo img{width:100%;height:100%;display:block;object-fit:contain}
      .inventory-row .row-icon{transition:color .15s ease,background .15s ease}
      .inventory-row .badge{white-space:nowrap}
    `;
  };
}
