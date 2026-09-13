import "./homeprep-panel-v10.js?v=1";
import { hpT, getHomePrepLanguage } from "./homeprep-i18n.js?v=3";

const HomePrepPanel = customElements.get("homeprep-panel");

const ASSET_TYPES = [
  ["water_shutoff", "Main water shutoff", "mdi:water-pump-off"],
  ["isolation_valve", "Isolation valve", "mdi:valve"],
  ["floor_drain", "Floor drain", "mdi:pipe"],
  ["leak_sensor", "Leak sensor", "mdi:water-alert"],
  ["backflow_valve", "Backflow valve", "mdi:valve-closed"],
  ["sump_pump", "Sump / drainage pump", "mdi:pump"],
  ["smoke_alarm", "Smoke alarm", "mdi:smoke-detector"],
  ["fire_extinguisher", "Fire extinguisher", "mdi:fire-extinguisher"],
  ["electrical_panel", "Electrical panel", "mdi:lightning-bolt"],
  ["generator", "Generator", "mdi:engine"],
  ["other", "Other", "mdi:home-cog-outline"],
];

const SV = {
  "Preparedness": "Beredskap",
  "Maintenance": "Underhåll",
  "Plans & Guidance": "Planer & vägledning",
  "Household": "Hushåll",
  "Shopping List": "Inköpslista",
  "Assets": "Fasta punkter",
  "Household assets": "Viktiga punkter i hemmet",
  "Track fixed or semi-permanent preparedness points in your home.": "Håll koll på fasta eller halvfasta beredskapspunkter i hemmet.",
  "Add asset": "Lägg till punkt",
  "Edit asset": "Redigera punkt",
  "Asset type": "Typ",
  "Instructions": "Instruktioner",
  "Mark checked": "Markera kontrollerad",
  "No assets yet.": "Inga fasta punkter ännu.",
  "Shopping list": "Inköpslista",
  "Expired inventory is added automatically. You can also add things manually.": "Utgångna inventarier läggs till automatiskt. Du kan också lägga till saker manuellt.",
  "Add shopping item": "Lägg till inköp",
  "Pending": "Att köpa",
  "Purchased": "Köpt",
  "Ignored": "Ignorerad",
  "Mark purchased": "Markera köpt",
  "Ignore": "Ignorera",
  "Restore": "Återställ",
  "Automatically added": "Automatiskt tillagd",
  "Manual": "Manuell",
  "Main water shutoff": "Huvudavstängning vatten",
  "Isolation valve": "Avstängningsventil",
  "Floor drain": "Golvbrunn",
  "Leak sensor": "Läckagesensor",
  "Backflow valve": "Bakvattenventil",
  "Sump / drainage pump": "Dränerings-/länspump",
  "Smoke alarm": "Brandvarnare",
  "Fire extinguisher": "Brandsläckare",
  "Electrical panel": "Elcentral",
  "Generator": "Generator",
  "Linked assets": "Länkade fasta punkter",
};

function t(panel, text) {
  if (getHomePrepLanguage(panel?._hass) === "sv") return SV[text] || hpT(text, panel?._hass);
  return hpT(text, panel?._hass);
}

function esc(panel, value) {
  return panel.esc ? panel.esc(value) : String(value ?? "");
}

function localizeAdded(root, hass) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const raw = node.nodeValue || "";
    const core = raw.trim();
    if (!core) continue;
    const translated = getHomePrepLanguage(hass) === "sv" ? (SV[core] || hpT(core, hass)) : hpT(core, hass);
    if (translated !== core) node.nodeValue = raw.replace(core, translated);
  }
}

function options(values, selected = []) {
  const selectedSet = new Set(selected || []);
  return values.map((value) => `<option value="${value.id}" ${selectedSet.has(value.id) ? "selected" : ""}>${value.label}</option>`).join("");
}

if (HomePrepPanel && !HomePrepPanel.prototype.__homePrepV11Applied) {
  const proto = HomePrepPanel.prototype;
  proto.__homePrepV11Applied = true;

  proto.assetById = function assetById(id) {
    return (this._assets || []).find((asset) => asset.id === id) || null;
  };

  proto.shoppingItemById = function shoppingItemById(id) {
    return (this._shoppingItems || []).find((item) => item.id === id) || null;
  };

  proto.assetType = function assetType(type) {
    return ASSET_TYPES.find(([id]) => id === type) || ASSET_TYPES[ASSET_TYPES.length - 1];
  };

  const oldLoadData = proto.loadData;
  proto.loadData = async function loadData(...args) {
    const result = await oldLoadData.apply(this, args);
    if (!this._hass || this._loading) return result;
    try {
      const [assets, shopping] = await Promise.all([
        this._hass.callWS({ type: "homeprep/assets" }),
        this._hass.callWS({ type: "homeprep/shopping" }),
      ]);
      this._assets = assets?.assets || [];
      this._assetSummary = assets?.summary || {};
      this._shoppingItems = shopping?.items || [];
      this._shoppingSummary = shopping?.summary || {};
    } catch (error) {
      console.error("HomePrep assets/shopping load failed", error);
      this._assets = this._assets || [];
      this._shoppingItems = this._shoppingItems || [];
    }
    this.render();
    return result;
  };

  const oldResetEditors = proto.resetEditors;
  proto.resetEditors = function resetEditors() {
    oldResetEditors.call(this);
    this._editingAsset = null;
    this._creatingAsset = false;
    this._editingShoppingItem = null;
    this._creatingShoppingItem = false;
  };

  proto.renderAssetForm = function renderAssetForm(asset) {
    const typeOptions = ASSET_TYPES.map(([id, label]) => `<option value="${id}" ${asset?.asset_type === id || (!asset && id === "other") ? "selected" : ""}>${esc(this, t(this, label))}</option>`).join("");
    return `<div class="page-title"><div><h2>${t(this, asset ? "Edit asset" : "Add asset")}</h2><p>${t(this, "Track fixed or semi-permanent preparedness points in your home.")}</p></div></div>
      <section class="panel-card form-card"><form id="hp-asset-form" ${asset ? `data-asset-id="${esc(this, asset.id)}"` : ""} class="form-grid">
        <label class="wide"><span>Name</span><input name="name" value="${esc(this, asset?.name || "")}" required></label>
        <label><span>${t(this, "Asset type")}</span><select name="asset_type">${typeOptions}</select></label>
        <label><span>Location</span><input name="location" value="${esc(this, asset?.location || "")}" placeholder="Basement utility room, kitchen…"></label>
        <label><span>Last checked</span><input type="date" name="last_checked_at" value="${esc(this, asset?.last_checked_at || "")}"></label>
        <label><span>Next check</span><input type="date" name="next_check_at" value="${esc(this, asset?.next_check_at || "")}"></label>
        <label class="wide"><span>Description</span><textarea name="description" rows="2">${esc(this, asset?.description || "")}</textarea></label>
        <label class="wide"><span>${t(this, "Instructions")}</span><textarea name="instructions" rows="3" placeholder="How to find, operate or check this point">${esc(this, asset?.instructions || "")}</textarea></label>
        <label class="wide"><span>Notes</span><textarea name="notes" rows="2">${esc(this, asset?.notes || "")}</textarea></label>
        <div class="wide actions"><button class="primary" type="submit">Save</button><button type="button" data-action="cancel-asset">Cancel</button></div>
      </form></section>`;
  };

  proto.renderAssets = function renderAssets() {
    if (this._creatingAsset) return this.renderAssetForm(null);
    if (this._editingAsset) return this.renderAssetForm(this.assetById(this._editingAsset));
    const cards = (this._assets || []).map((asset) => {
      const [type, label, icon] = this.assetType(asset.asset_type);
      const status = asset.status || "ok";
      return `<section class="panel-card hp-asset-card"><div class="target-top"><div class="recommendation-head"><div class="row-icon ${this.statusClass(status)}"><ha-icon icon="${icon}"></ha-icon></div><div><h3>${esc(this, asset.name)}</h3><p>${esc(this, t(this, label))}${asset.location ? ` · ${esc(this, asset.location)}` : ""}</p></div></div><span class="badge ${this.statusClass(status)} hp-status-pill">${status === "ok" ? t(this, "Ready") : t(this, "Needs attention")}</span></div>
        ${asset.description ? `<p class="hp-asset-description">${esc(this, asset.description)}</p>` : ""}
        ${asset.instructions ? `<div class="hp-asset-instructions"><ha-icon icon="mdi:information-outline"></ha-icon><span>${esc(this, asset.instructions)}</span></div>` : ""}
        <div class="hp-plan-review"><span>Last checked: <strong>${esc(this, asset.last_checked_at || "Never")}</strong></span><span>Next check: <strong>${esc(this, asset.next_check_at || "Not scheduled")}</strong></span></div>
        <div class="actions"><button data-action="mark-asset-checked" data-id="${esc(this, asset.id)}">${t(this, "Mark checked")}</button><button data-action="edit-asset" data-id="${esc(this, asset.id)}">Edit</button><button class="danger" data-action="delete-asset" data-id="${esc(this, asset.id)}">Delete</button></div></section>`;
    }).join("");
    return `<div class="page-title"><div><h2>${t(this, "Household assets")}</h2><p>${t(this, "Track fixed or semi-permanent preparedness points in your home.")}</p></div><button class="primary" data-action="add-asset"><ha-icon icon="mdi:plus"></ha-icon> ${t(this, "Add asset")}</button></div><div class="target-stack">${cards || `<section class="panel-card"><div class="empty">${t(this, "No assets yet.")}</div></section>`}</div>`;
  };

  proto.renderShoppingForm = function renderShoppingForm(item) {
    return `<div class="page-title"><div><h2>${t(this, item ? "Edit shopping item" : "Add shopping item")}</h2><p>${t(this, "Expired inventory is added automatically. You can also add things manually.")}</p></div></div><section class="panel-card form-card"><form id="hp-shopping-form" ${item ? `data-shopping-id="${esc(this, item.id)}"` : ""} class="form-grid">
      <label class="wide"><span>Name</span><input name="name" value="${esc(this, item?.name || "")}" required></label>
      <label><span>Quantity</span><input name="quantity" type="number" min="0" step="any" value="${esc(this, item?.quantity ?? 1)}"></label>
      <label><span>Unit</span><select name="unit">${this.unitOptions(item?.unit || "piece")}</select></label>
      <label><span>Category</span><select name="category">${this.categoryOptions(item?.category || "other")}</select></label>
      <label class="wide"><span>Notes</span><textarea name="notes" rows="3">${esc(this, item?.notes || "")}</textarea></label>
      <div class="wide actions"><button class="primary" type="submit">Save</button><button type="button" data-action="cancel-shopping">Cancel</button></div>
    </form></section>`;
  };

  proto.renderShopping = function renderShopping() {
    if (this._creatingShoppingItem) return this.renderShoppingForm(null);
    if (this._editingShoppingItem) return this.renderShoppingForm(this.shoppingItemById(this._editingShoppingItem));
    const groups = ["pending", "purchased", "ignored"];
    const labels = { pending: t(this, "Pending"), purchased: t(this, "Purchased"), ignored: t(this, "Ignored") };
    const sections = groups.map((status) => {
      const items = (this._shoppingItems || []).filter((item) => item.status === status);
      if (!items.length && status !== "pending") return "";
      return `<section class="panel-card"><div class="section-head"><h3><ha-icon icon="${status === "pending" ? "mdi:cart-outline" : status === "purchased" ? "mdi:cart-check" : "mdi:cart-off"}"></ha-icon>${labels[status]}</h3><span>${items.length}</span></div>${items.map((item) => {
        const automatic = item.source_type === "inventory_expired";
        return `<div class="row hp-shopping-row"><div class="row-icon ${status === "pending" ? "attention" : "ok"}"><ha-icon icon="${automatic ? "mdi:autorenew" : "mdi:cart-plus"}"></ha-icon></div><div class="row-main"><strong>${esc(this, item.name)}</strong><small>${esc(this, item.quantity)} ${esc(this, item.unit)} · ${automatic ? t(this, "Automatically added") : t(this, "Manual")}${item.reason ? ` · ${esc(this, item.reason)}` : ""}</small></div><div class="row-actions">${status === "pending" ? `<button class="primary small" data-action="purchase-shopping" data-id="${esc(this, item.id)}">${t(this, "Mark purchased")}</button><button data-action="ignore-shopping" data-id="${esc(this, item.id)}">${t(this, "Ignore")}</button>` : `<button data-action="restore-shopping" data-id="${esc(this, item.id)}">${t(this, "Restore")}</button>`}<button data-action="edit-shopping" data-id="${esc(this, item.id)}">Edit</button><button class="danger small" data-action="delete-shopping" data-id="${esc(this, item.id)}">Delete</button></div></div>`;
      }).join("") || '<div class="empty">Nothing to buy right now.</div>'}</section>`;
    }).join("");
    return `<div class="page-title"><div><h2>${t(this, "Shopping list")}</h2><p>${t(this, "Expired inventory is added automatically. You can also add things manually.")}</p></div><button class="primary" data-action="add-shopping"><ha-icon icon="mdi:plus"></ha-icon> ${t(this, "Add shopping item")}</button></div>${sections}`;
  };

  const oldRenderPlanItemForm = proto.renderPlanItemForm;
  proto.renderPlanItemForm = function renderPlanItemForm(plan, item = null) {
    let html = oldRenderPlanItemForm.call(this, plan, item);
    const assetValues = (this._assets || []).map((asset) => ({ id: asset.id, label: esc(this, `${asset.name}${asset.location ? ` · ${asset.location}` : ""}`) }));
    const assetField = `<label><span>${t(this, "Linked assets")}</span><select name="linked_asset_ids" multiple size="6">${options(assetValues, item?.linked_asset_ids)}</select></label>`;
    html = html.replace('<div class="wide hint">Link the equipment', `${assetField}<div class="wide hint">Link the equipment`);
    return html;
  };

  const oldHandleSubmit = proto.handleSubmit;
  proto.handleSubmit = async function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return oldHandleSubmit.call(this, event);

    if (form.id === "hp-asset-form") {
      event.preventDefault();
      const data = new FormData(form);
      const payload = {
        name: String(data.get("name") || "").trim(),
        asset_type: String(data.get("asset_type") || "other"),
        location: String(data.get("location") || "").trim() || null,
        description: String(data.get("description") || "").trim() || null,
        instructions: String(data.get("instructions") || "").trim() || null,
        last_checked_at: String(data.get("last_checked_at") || "") || null,
        next_check_at: String(data.get("next_check_at") || "") || null,
        notes: String(data.get("notes") || "").trim() || null,
      };
      if (form.dataset.assetId) await this._hass.callWS({ type: "homeprep/asset/update", asset_id: form.dataset.assetId, updates: payload });
      else await this._hass.callWS({ type: "homeprep/asset/add", asset: payload });
      this._editingAsset = null; this._creatingAsset = false; await this.loadData(); return;
    }

    if (form.id === "hp-shopping-form") {
      event.preventDefault();
      const data = new FormData(form);
      const payload = {
        name: String(data.get("name") || "").trim(),
        quantity: Number(data.get("quantity") || 1),
        unit: String(data.get("unit") || "piece"),
        category: String(data.get("category") || "other"),
        notes: String(data.get("notes") || "").trim() || null,
      };
      if (form.dataset.shoppingId) await this._hass.callWS({ type: "homeprep/shopping/update", item_id: form.dataset.shoppingId, updates: payload });
      else await this._hass.callWS({ type: "homeprep/shopping/add", item: { ...payload, source_type: "manual" } });
      this._editingShoppingItem = null; this._creatingShoppingItem = false; await this.loadData(); return;
    }

    if (form.id === "hp-plan-item-form") {
      event.preventDefault();
      const data = new FormData(form);
      const selected = (name) => [...(form.querySelector(`[name="${name}"]`)?.selectedOptions || [])].map((option) => option.value);
      const payload = {
        label: String(data.get("label") || "").trim(),
        description: String(data.get("description") || "").trim() || null,
        linked_inventory_item_ids: selected("linked_inventory_item_ids"),
        linked_container_ids: selected("linked_container_ids"),
        linked_asset_ids: selected("linked_asset_ids"),
      };
      if (form.dataset.itemId) await this._hass.callWS({ type: "homeprep/plan/update_item", plan_id: form.dataset.planId, item_id: form.dataset.itemId, updates: payload });
      else await this._hass.callWS({ type: "homeprep/plan/add_item", plan_id: form.dataset.planId, ...payload });
      this._editingPlanItem = null; await this.loadData(); return;
    }

    return oldHandleSubmit.call(this, event);
  };

  const oldHandleClick = proto.handleClick;
  proto.handleClick = async function handleClick(event) {
    const target = event.composedPath().find((el) => el instanceof HTMLElement && (el.dataset?.action || el.dataset?.view));
    const action = target?.dataset?.action;
    try {
      if (action === "add-asset") { this._creatingAsset = true; this._editingAsset = null; this.render(); return; }
      if (action === "edit-asset") { this._editingAsset = target.dataset.id; this._creatingAsset = false; this.render(); return; }
      if (action === "cancel-asset") { this._editingAsset = null; this._creatingAsset = false; this.render(); return; }
      if (action === "delete-asset") { if (!confirm("Delete this household asset?")) return; await this._hass.callWS({ type: "homeprep/asset/delete", asset_id: target.dataset.id }); await this.loadData(); return; }
      if (action === "mark-asset-checked") { await this._hass.callWS({ type: "homeprep/asset/mark_checked", asset_id: target.dataset.id }); await this.loadData(); return; }
      if (action === "add-shopping") { this._creatingShoppingItem = true; this._editingShoppingItem = null; this.render(); return; }
      if (action === "edit-shopping") { this._editingShoppingItem = target.dataset.id; this._creatingShoppingItem = false; this.render(); return; }
      if (action === "cancel-shopping") { this._editingShoppingItem = null; this._creatingShoppingItem = false; this.render(); return; }
      if (action === "delete-shopping") { if (!confirm("Delete this shopping-list entry?")) return; await this._hass.callWS({ type: "homeprep/shopping/delete", item_id: target.dataset.id }); await this.loadData(); return; }
      if (["purchase-shopping", "ignore-shopping", "restore-shopping"].includes(action)) {
        const status = action === "purchase-shopping" ? "purchased" : action === "ignore-shopping" ? "ignored" : "pending";
        await this._hass.callWS({ type: "homeprep/shopping/status", item_id: target.dataset.id, status }); await this.loadData(); return;
      }
    } catch (error) {
      console.error("HomePrep asset/shopping action failed", error);
      alert(`HomePrep: ${error?.message || error}`); return;
    }
    return oldHandleClick.call(this, event);
  };

  const oldRenderOverview = proto.renderOverview;
  proto.renderOverview = function renderOverview() {
    const planning = this._planning || {};
    const ps = planning.summary || {};
    const ts = this._taskSummary || {};
    const cs = this._containerSummary || {};
    const pls = this._planSummary || {};
    const as = this._assetSummary || {};
    const ss = this._shoppingSummary || {};
    const today = new Date().toISOString().slice(0, 10);
    const inventoryProblems = this._items.filter((item) => (item.expires_at && item.expires_at < today) || (item.next_check_at && item.next_check_at <= today)).length;
    const states = [ps.status, ts.status, cs.status, pls.status, as.status, ss.status];
    const overall = states.includes("critical") || inventoryProblems ? "critical" : states.includes("attention") ? "attention" : "ok";
    const label = overall === "critical" ? "Action required" : overall === "attention" ? "Needs attention" : "Preparedness looks good";
    return `<section class="hero"><div class="hero-icon ${overall}"><ha-icon icon="mdi:shield-home"></ha-icon></div><div><h2>${label}</h2><p>HomePrep combines supplies, storage, household assets, recurring checks and readiness plans.</p></div></section>
      <div class="metrics hp-overview-metrics">
        ${this.metric("Inventory", this._items.length, `${inventoryProblems} require action`, inventoryProblems ? "critical" : "ok", "inventory")}
        ${this.metric("Containers", cs.containers ?? 0, `${(cs.critical ?? 0) + (cs.attention ?? 0)} need attention`, cs.status || "ok", "containers")}
        ${this.metric("Shopping List", ss.pending ?? 0, `${ss.pending ?? 0} to buy`, ss.status || "ok", "shopping")}
        ${this.metric("Tasks", ts.tasks ?? 0, `${(ts.overdue ?? 0) + (ts.due ?? 0) + (ts.upcoming ?? 0)} need attention`, ts.status || "ok", "tasks")}
        ${this.metric("Assets", as.assets ?? 0, `${as.critical ?? 0} checks due`, as.status || "ok", "assets")}
        ${this.metric("Plans", pls.plans ?? 0, `${pls.attention ?? 0} need attention`, pls.status || "ok", "plans")}
        ${this.metric("Targets", ps.targets ?? 0, `${(ps.below_minimum ?? 0) + (ps.below_target ?? 0) + (ps.unknown ?? 0)} not fully ready`, ps.status || "ok", "targets")}
        ${this.metric("Guidance", this._recommendations.length, this.profileForCountry(planning.household?.country_code)?.unofficial ? "General baseline" : "Official profile", "ok", "recommendations")}
      </div>
      <div class="section-grid"><section class="panel-card"><div class="section-head"><h3>Next actions</h3><button data-view="tasks">View tasks</button></div>${this._tasks.filter((task) => ["overdue", "due", "upcoming"].includes(task.status)).slice(0, 5).map((task) => this.taskRow(task, true)).join("") || '<div class="empty">No task needs attention.</div>'}</section><section class="panel-card"><div class="section-head"><h3>Readiness</h3></div><div class="row"><div class="row-main"><strong>${pls.attention ?? 0} plans need attention</strong><small>${pls.review_required ?? 0} require review</small></div></div><div class="row"><div class="row-main"><strong>${as.critical ?? 0} asset checks due</strong><small>${ss.pending ?? 0} shopping-list items waiting</small></div></div></section></div>`;
  };

  const oldRender = proto.render;
  proto.render = function render() {
    const result = oldRender.call(this);
    if (!this.isConnected) return result;
    const main = this.querySelector("main");
    if (main && this._loaded && !this._error) {
      if (this._active === "assets") main.innerHTML = this.renderAssets();
      if (this._active === "shopping") main.innerHTML = this.renderShopping();
    }
    const nav = this.querySelector("nav.tabs");
    if (nav && main) {
      const active = this._active;
      const button = (id, icon, label) => `<button class="${active === id ? "active" : ""}" data-view="${id}"><ha-icon icon="${icon}"></ha-icon><span>${t(this, label)}</span></button>`;
      nav.className = "hp-side-nav";
      nav.innerHTML = `${button("overview","mdi:view-dashboard-outline","Overview")}
        <details ${["inventory","containers","shopping","targets"].includes(active) ? "open" : ""}><summary><ha-icon icon="mdi:shield-package-outline"></ha-icon><span>${t(this,"Preparedness")}</span><ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon></summary>${button("inventory","mdi:package-variant-closed","Inventory")}${button("containers","mdi:archive-outline","Containers")}${button("shopping","mdi:cart-outline","Shopping List")}${button("targets","mdi:target","Targets")}</details>
        <details ${["tasks","assets"].includes(active) ? "open" : ""}><summary><ha-icon icon="mdi:wrench-clock-outline"></ha-icon><span>${t(this,"Maintenance")}</span><ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon></summary>${button("tasks","mdi:clipboard-check-outline","Tasks")}${button("assets","mdi:home-cog-outline","Assets")}</details>
        <details ${["plans","recommendations"].includes(active) ? "open" : ""}><summary><ha-icon icon="mdi:clipboard-list-outline"></ha-icon><span>${t(this,"Plans & Guidance")}</span><ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon></summary>${button("plans","mdi:clipboard-list-outline","Plans")}${button("recommendations","mdi:shield-check-outline","Guidance")}</details>
        <details ${["household","settings"].includes(active) ? "open" : ""}><summary><ha-icon icon="mdi:home-account"></ha-icon><span>${t(this,"Household")}</span><ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon></summary>${button("household","mdi:home-account","Household")}${button("settings","mdi:cog-outline","Settings")}</details>`;
      const shell = document.createElement("div");
      shell.className = "hp-content-shell";
      nav.parentNode.insertBefore(shell, nav);
      shell.appendChild(nav);
      shell.appendChild(main);
    }
    localizeAdded(this, this._hass);
    return result;
  };

  const oldStyles = proto.styles;
  proto.styles = function styles() {
    return `${oldStyles.call(this)}
      .hp-content-shell{display:grid;grid-template-columns:220px minmax(0,1fr);min-height:calc(100vh - 69px)}
      .hp-content-shell main{width:100%;max-width:1200px;margin:0 auto;padding:var(--hp-panel-pad)}
      .hp-side-nav{position:sticky;top:69px;align-self:start;height:calc(100vh - 69px);overflow:auto;padding:10px 8px;border-right:1px solid var(--hp-panel-border);background:var(--hp-panel-card)}
      .hp-side-nav>button,.hp-side-nav details button{width:100%;display:flex;align-items:center;gap:9px;border:0;border-radius:9px;padding:9px 10px;background:transparent;color:var(--hp-panel-muted);cursor:pointer;text-align:left}
      .hp-side-nav button.active{color:var(--hp-panel-accent);background:color-mix(in srgb,var(--hp-panel-accent) 12%,transparent);font-weight:700}
      .hp-side-nav button ha-icon,.hp-side-nav summary>ha-icon:first-child{width:18px;height:18px}
      .hp-side-nav details{margin-top:7px}.hp-side-nav summary{display:flex;align-items:center;gap:8px;padding:8px 10px;color:var(--hp-panel-text);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;cursor:pointer;list-style:none}.hp-side-nav summary::-webkit-details-marker{display:none}.hp-side-nav summary span{flex:1}.hp-side-nav .chevron{width:16px;height:16px;transition:transform .15s}.hp-side-nav details[open] .chevron{transform:rotate(180deg)}.hp-side-nav details button{padding-left:34px}
      .hp-asset-description{font-size:10px;color:var(--hp-panel-muted);margin:8px 0}.hp-asset-instructions{display:flex;gap:7px;padding:9px;border:1px solid var(--hp-panel-border);border-radius:9px;font-size:9px;color:var(--hp-panel-muted);margin:8px 0}.hp-asset-instructions ha-icon{width:16px;height:16px;color:var(--hp-panel-accent)}
      .hp-shopping-row .row-actions{justify-content:flex-end}
      #hp-plan-item-form{grid-template-columns:repeat(3,minmax(0,1fr))}#hp-plan-item-form .wide{grid-column:1/-1}
      @media(max-width:800px){.hp-content-shell{display:block}.hp-side-nav{position:static;height:auto;border-right:0;border-bottom:1px solid var(--hp-panel-border);display:grid;grid-template-columns:1fr;gap:2px}.hp-side-nav details{margin-top:2px}.hp-side-nav>button,.hp-side-nav details button{min-height:42px}.hp-content-shell main{padding:var(--hp-panel-pad)}#hp-plan-item-form{grid-template-columns:1fr}#hp-plan-item-form .wide{grid-column:auto}}
    `;
  };
}
