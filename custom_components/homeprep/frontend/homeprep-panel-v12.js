import "./homeprep-panel-v11.js?v=2";
import { hpT, getHomePrepLanguage } from "./homeprep-i18n.js?v=3";

const HomePrepPanel = customElements.get("homeprep-panel");

const SV = {
  "Assets are fixed or semi-permanent preparedness points in the home. Inventory is for supplies and movable equipment you store, consume or replace.": "Fasta punkter är viktiga fasta eller halvfasta funktioner i hemmet. Inventarier är för förnödenheter och flyttbar utrustning som du lagrar, förbrukar eller ersätter.",
  "Recurring asset check": "Återkommande kontroll av fast punkt",
  "Create a recurring task so the next check is calculated when this asset is checked.": "Skapa en återkommande uppgift så att nästa kontroll räknas fram när punkten kontrolleras.",
  "First due / next check": "Första förfallodatum / nästa kontroll",
  "Asset image": "Bild på fast punkt",
  "Choose image": "Välj bild",
  "Remove image": "Ta bort bild",
  "Images should help you find or identify an important point quickly.": "Bilder ska hjälpa dig att snabbt hitta eller identifiera en viktig punkt.",
};

function t(panel, text) {
  if (getHomePrepLanguage(panel?._hass) === "sv") return SV[text] || hpT(text, panel?._hass);
  return hpT(text, panel?._hass);
}

function esc(panel, value) {
  return panel.esc ? panel.esc(value) : String(value ?? "");
}

function assetImageUrl(asset) {
  return asset?.image_id && asset?.image_token
    ? `/api/homeprep/media/${encodeURIComponent(asset.image_id)}/${encodeURIComponent(asset.image_token)}`
    : null;
}

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

if (HomePrepPanel && !HomePrepPanel.prototype.__homePrepV12Applied) {
  const proto = HomePrepPanel.prototype;
  proto.__homePrepV12Applied = true;

  proto.assetInspection = function assetInspection(assetId) {
    return (this._tasks || []).find((task) => task.task_kind === "asset_inspection" && task.linked_asset_id === assetId) || null;
  };

  proto.renderAssetForm = function renderAssetForm(asset) {
    const inspection = asset ? this.assetInspection(asset.id) : null;
    const recurring = Boolean(inspection?.enabled);
    const types = [
      ["water_shutoff", "Main water shutoff"], ["isolation_valve", "Isolation valve"], ["floor_drain", "Floor drain"],
      ["leak_sensor", "Leak sensor"], ["backflow_valve", "Backflow valve"], ["sump_pump", "Sump / drainage pump"],
      ["smoke_alarm", "Smoke alarm"], ["fire_extinguisher", "Fire extinguisher"], ["electrical_panel", "Electrical panel"],
      ["generator", "Generator"], ["other", "Other"],
    ];
    const typeOptions = types.map(([id, label]) => `<option value="${id}" ${asset?.asset_type === id || (!asset && id === "other") ? "selected" : ""}>${esc(this, hpT(label, this._hass))}</option>`).join("");
    const image = assetImageUrl(asset);
    return `<div class="page-title"><div><h2>${asset ? hpT("Edit asset", this._hass) : hpT("Add asset", this._hass)}</h2><p>${t(this, "Assets are fixed or semi-permanent preparedness points in the home. Inventory is for supplies and movable equipment you store, consume or replace.")}</p></div></div>
      <section class="panel-card hp-asset-definition"><ha-icon icon="mdi:home-cog"></ha-icon><div><strong>${hpT("Assets", this._hass)}</strong><span>${t(this, "Assets are fixed or semi-permanent preparedness points in the home. Inventory is for supplies and movable equipment you store, consume or replace.")}</span></div></section>
      <section class="panel-card form-card"><form id="hp-asset-form" ${asset ? `data-asset-id="${esc(this, asset.id)}"` : ""} class="form-grid">
        <label class="wide"><span>Name</span><input name="name" value="${esc(this, asset?.name || "")}" required></label>
        <label><span>${hpT("Asset type", this._hass)}</span><select name="asset_type">${typeOptions}</select></label>
        <label><span>Location</span><input name="location" value="${esc(this, asset?.location || "")}" placeholder="Basement utility room, kitchen…"></label>
        <label><span>Last checked</span><input type="date" name="last_checked_at" value="${esc(this, asset?.last_checked_at || "")}"></label>
        <label><span>${t(this, "First due / next check")}</span><input type="date" name="next_check_at" value="${esc(this, inspection?.next_due_at || asset?.next_check_at || "")}"></label>
        <label class="wide check-box"><input name="asset_inspection_enabled" type="checkbox" ${recurring ? "checked" : ""}><span>${t(this, "Recurring asset check")}</span></label>
        <div class="inspection-grid wide">
          <label><span>Repeat every</span><input name="asset_inspection_interval" type="number" min="1" value="${esc(this, inspection?.recurrence_interval ?? 6)}"></label>
          <label><span>Period</span><select name="asset_inspection_type"><option value="days" ${inspection?.recurrence_type === "days" ? "selected" : ""}>Days</option><option value="weeks" ${inspection?.recurrence_type === "weeks" ? "selected" : ""}>Weeks</option><option value="months" ${inspection?.recurrence_type === "months" || !inspection ? "selected" : ""}>Months</option><option value="years" ${inspection?.recurrence_type === "years" ? "selected" : ""}>Years</option></select></label>
          <label><span>After completion</span><select name="asset_inspection_reschedule"><option value="scheduled" ${inspection?.reschedule_mode === "scheduled" || !inspection ? "selected" : ""}>Keep planned cadence</option><option value="completion" ${inspection?.reschedule_mode === "completion" ? "selected" : ""}>Schedule from completion</option></select></label>
          <label><span>Reminder before due</span><input name="asset_inspection_reminder" type="number" min="0" value="${esc(this, inspection?.reminder_before_days ?? 7)}"></label>
        </div>
        <div class="wide hint">${t(this, "Create a recurring task so the next check is calculated when this asset is checked.")}</div>
        <label class="wide"><span>Description</span><textarea name="description" rows="2">${esc(this, asset?.description || "")}</textarea></label>
        <label class="wide"><span>Instructions</span><textarea name="instructions" rows="3" placeholder="How to find, operate or check this point">${esc(this, asset?.instructions || "")}</textarea></label>
        <div class="wide hp-asset-image-editor"><div><span>${t(this, "Asset image")}</span><small>${t(this, "Images should help you find or identify an important point quickly.")}</small></div>${image ? `<img src="${image}" alt="">` : '<div class="hp-image-placeholder"><ha-icon icon="mdi:image-outline"></ha-icon></div>'}<label class="image-upload-button"><ha-icon icon="mdi:camera-plus-outline"></ha-icon>${t(this, "Choose image")}<input name="asset_image" type="file" accept="image/jpeg,image/png,image/webp" hidden></label>${image ? `<button type="button" class="danger" data-action="remove-asset-image" data-id="${esc(this, asset.id)}">${t(this, "Remove image")}</button>` : ""}</div>
        <label class="wide"><span>Notes</span><textarea name="notes" rows="2">${esc(this, asset?.notes || "")}</textarea></label>
        <div class="wide actions"><button class="primary" type="submit">Save</button><button type="button" data-action="cancel-asset">Cancel</button></div>
      </form></section>`;
  };

  proto.renderAssets = function renderAssets() {
    if (this._creatingAsset) return this.renderAssetForm(null);
    if (this._editingAsset) return this.renderAssetForm(this.assetById(this._editingAsset));
    const cards = (this._assets || []).map((asset) => {
      const [, label, icon] = this.assetType(asset.asset_type);
      const status = asset.status || "ok";
      const image = assetImageUrl(asset);
      const inspection = this.assetInspection(asset.id);
      const visual = image ? `<img class="hp-asset-thumb" src="${image}" alt="">` : `<div class="row-icon ${this.statusClass(status)}"><ha-icon icon="${icon}"></ha-icon></div>`;
      return `<section class="panel-card hp-asset-card"><div class="target-top"><div class="recommendation-head">${visual}<div><h3>${esc(this, asset.name)}</h3><p>${esc(this, hpT(label, this._hass))}${asset.location ? ` · ${esc(this, asset.location)}` : ""}</p></div></div><span class="badge ${this.statusClass(status)} hp-status-pill">${status === "ok" ? hpT("Ready", this._hass) : hpT("Needs attention", this._hass)}</span></div>
        ${asset.description ? `<p class="hp-asset-description">${esc(this, asset.description)}</p>` : ""}
        ${asset.instructions ? `<div class="hp-asset-instructions"><ha-icon icon="mdi:information-outline"></ha-icon><span>${esc(this, asset.instructions)}</span></div>` : ""}
        <div class="hp-plan-review"><span>Last checked: <strong>${esc(this, asset.last_checked_at || "Never")}</strong></span><span>Next check: <strong>${esc(this, asset.next_check_at || "Not scheduled")}</strong></span>${inspection?.enabled ? `<span><ha-icon icon="mdi:calendar-sync"></ha-icon> Recurring task</span>` : ""}</div>
        <div class="actions"><button data-action="mark-asset-checked" data-id="${esc(this, asset.id)}">${hpT("Mark checked", this._hass)}</button><button data-action="edit-asset" data-id="${esc(this, asset.id)}">Edit</button><button class="danger" data-action="delete-asset" data-id="${esc(this, asset.id)}">Delete</button></div></section>`;
    }).join("");
    return `<div class="page-title"><div><h2>${hpT("Household assets", this._hass)}</h2><p>${t(this, "Assets are fixed or semi-permanent preparedness points in the home. Inventory is for supplies and movable equipment you store, consume or replace.")}</p></div><button class="primary" data-action="add-asset"><ha-icon icon="mdi:plus"></ha-icon> ${hpT("Add asset", this._hass)}</button></div><div class="target-stack">${cards || `<section class="panel-card"><div class="empty">${hpT("No assets yet.", this._hass)}</div></section>`}</div>`;
  };

  const oldHandleSubmit = proto.handleSubmit;
  proto.handleSubmit = async function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "hp-asset-form") return oldHandleSubmit.call(this, event);
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
    try {
      const existingId = form.dataset.assetId || null;
      const saved = existingId
        ? await this._hass.callWS({ type: "homeprep/asset/update", asset_id: existingId, updates: payload })
        : await this._hass.callWS({ type: "homeprep/asset/add", asset: payload });
      const assetId = existingId || saved.id;
      const existingTask = this.assetInspection(assetId);
      const enabled = data.get("asset_inspection_enabled") === "on";
      if (enabled) {
        const task = {
          name: `Check ${payload.name}`,
          task_kind: "asset_inspection",
          category: "other",
          linked_asset_id: assetId,
          recurrence_type: String(data.get("asset_inspection_type") || "months"),
          recurrence_interval: Number(data.get("asset_inspection_interval") || 6),
          reschedule_mode: String(data.get("asset_inspection_reschedule") || "scheduled"),
          next_due_at: payload.next_check_at,
          reminder_before_days: Number(data.get("asset_inspection_reminder") || 7),
          enabled: true,
        };
        if (existingTask) await this._hass.callWS({ type: "homeprep/task/update", task_id: existingTask.id, updates: task });
        else await this._hass.callWS({ type: "homeprep/task/add", task });
      } else if (existingTask) {
        await this._hass.callWS({ type: "homeprep/task/update", task_id: existingTask.id, updates: { enabled: false } });
      }
      const file = form.querySelector('input[name="asset_image"]')?.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller");
        const encoded = await fileToBase64(file);
        await this._hass.callWS({ type: "homeprep/asset/image/set", asset_id: assetId, content_type: file.type, data: encoded, filename: file.name });
      }
      this._editingAsset = null;
      this._creatingAsset = false;
      await this.loadData();
    } catch (error) {
      console.error("HomePrep asset save failed", error);
      alert(`HomePrep: ${error?.message || error}`);
    }
  };

  const oldHandleClick = proto.handleClick;
  proto.handleClick = async function handleClick(event) {
    const target = event.composedPath().find((el) => el instanceof HTMLElement && el.dataset?.action === "remove-asset-image");
    if (target) {
      try {
        await this._hass.callWS({ type: "homeprep/asset/image/remove", asset_id: target.dataset.id });
        await this.loadData();
        this._editingAsset = target.dataset.id;
        this.render();
      } catch (error) {
        alert(`HomePrep: ${error?.message || error}`);
      }
      return;
    }
    return oldHandleClick.call(this, event);
  };

  const oldTaskRow = proto.taskRow;
  proto.taskRow = function taskRow(task, compact = false) {
    if (task.task_kind !== "asset_inspection") return oldTaskRow.call(this, task, compact);
    const asset = task.linked_asset;
    const image = assetImageUrl(asset);
    const visual = image ? `<img class="hp-task-thumb" src="${image}" alt="">` : `<div class="row-icon ${this.statusClass(task.status)}"><ha-icon icon="mdi:home-cog"></ha-icon></div>`;
    return `<div class="row task-row">${visual}<div class="row-main"><strong>${esc(this, task.name)}</strong><small>${esc(this, asset?.name || "Asset check")} · ${esc(this, task.next_due_at || "No due date")}</small></div><span class="badge ${this.statusClass(task.status)}">${esc(this, task.status)}</span>${!compact ? `<div class="row-actions"><button data-view="assets">Manage asset</button>${task.enabled ? `<button class="primary small" data-action="complete-task" data-id="${esc(this, task.id)}">Complete</button>` : ""}</div>` : ""}</div>`;
  };

  const oldRenderInventory = proto.renderInventory;
  proto.renderInventory = function renderInventory() {
    const html = oldRenderInventory.call(this);
    if (this._creatingItem || this._editingItem) return html;
    return html.replace(/(<div class="page-title">[\s\S]*?<\/div>)(<div class="section-grid">)/, `$1<section class="hp-definition-strip"><ha-icon icon="mdi:package-variant-closed"></ha-icon><span><strong>Inventory</strong> is for supplies and movable equipment you store, consume or replace. <strong>Assets</strong> are fixed or semi-permanent points in the home.</span></section>$2`);
  };

  const oldRender = proto.render;
  proto.render = function render() {
    const result = oldRender.call(this);
    const nav = this.querySelector(".hp-side-nav");
    if (nav) {
      const preparedness = nav.querySelector("details:nth-of-type(1) summary > ha-icon:first-child");
      if (preparedness) preparedness.setAttribute("icon", "mdi:shield-outline");
      const assetButton = nav.querySelector('button[data-view="assets"] ha-icon');
      if (assetButton) assetButton.setAttribute("icon", "mdi:home-cog");
      if (window.matchMedia?.("(hover:hover) and (pointer:fine)").matches) {
        nav.querySelectorAll("details").forEach((details) => {
          details.addEventListener("pointerenter", () => { details.open = true; });
          details.addEventListener("pointerleave", () => {
            const hasActive = Boolean(details.querySelector("button.active"));
            if (!hasActive) details.open = false;
          });
        });
      }
    }
    return result;
  };

  const oldStyles = proto.styles;
  proto.styles = function styles() {
    return `${oldStyles.call(this)}
      .hp-asset-definition,.hp-definition-strip{display:flex;align-items:flex-start;gap:10px;padding:11px 13px;border:1px solid var(--hp-panel-border);border-radius:11px;background:color-mix(in srgb,var(--hp-panel-accent) 5%,transparent);font-size:10px;color:var(--hp-panel-muted);margin-bottom:12px}
      .hp-asset-definition ha-icon,.hp-definition-strip ha-icon{width:20px;height:20px;color:var(--hp-panel-accent);flex:0 0 auto}.hp-asset-definition div{display:flex;flex-direction:column;gap:3px}.hp-asset-definition strong,.hp-definition-strip strong{color:var(--hp-panel-text)}
      .hp-asset-image-editor{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:10px;align-items:center;padding:12px;border:1px solid var(--hp-panel-border);border-radius:11px}.hp-asset-image-editor>div:first-child{display:flex;flex-direction:column;gap:3px}.hp-asset-image-editor small{font-size:8px;color:var(--hp-panel-muted)}.hp-asset-image-editor img,.hp-image-placeholder{width:84px;height:64px;border-radius:9px;object-fit:cover;border:1px solid var(--hp-panel-border)}.hp-image-placeholder{display:flex;align-items:center;justify-content:center;color:var(--hp-panel-muted)}.image-upload-button{display:inline-flex!important;flex-direction:row!important;align-items:center;gap:6px;padding:8px 10px;cursor:pointer}
      .hp-asset-thumb,.hp-task-thumb{width:42px;height:42px;flex:0 0 42px;object-fit:cover;border-radius:10px;border:1px solid var(--hp-panel-border)}.hp-task-thumb{width:32px;height:32px;flex-basis:32px;border-radius:50%}
      .hp-plan-review ha-icon{width:13px;height:13px;vertical-align:middle}.hp-side-nav summary>ha-icon:first-child,.hp-side-nav details button ha-icon{display:inline-flex!important;opacity:1!important}
      @media(max-width:800px){.hp-asset-image-editor{grid-template-columns:1fr}.hp-asset-image-editor img,.hp-image-placeholder{width:100%;height:150px}}
    `;
  };
}
