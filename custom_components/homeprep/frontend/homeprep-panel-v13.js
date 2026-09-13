import "./homeprep-panel-v12.js?v=2";

const HomePrepPanel = customElements.get("homeprep-panel");

if (HomePrepPanel && !HomePrepPanel.prototype.__homePrepV13Applied) {
  const proto = HomePrepPanel.prototype;
  proto.__homePrepV13Applied = true;

  const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const readinessPercent = (total, problems) => {
    const count = Math.max(0, Number(total) || 0);
    if (!count) return null;
    return clampPercent(((count - Math.min(count, Math.max(0, Number(problems) || 0))) / count) * 100);
  };

  proto.renderOverview = function renderOverview() {
    const planning = this._planning || {};
    const ps = planning.summary || {};
    const ts = this._taskSummary || {};
    const cs = this._containerSummary || {};
    const pls = this._planSummary || {};
    const as = this._assetSummary || {};
    const ss = this._shoppingSummary || {};
    const inventory = this._items || [];
    const today = new Date().toISOString().slice(0, 10);

    const inventoryCritical = inventory.filter((item) =>
      (item.expires_at && item.expires_at < today) ||
      (item.next_check_at && item.next_check_at <= today)
    ).length;
    const inventorySoon = inventory.filter((item) =>
      item.expires_at && item.expires_at >= today &&
      item.expires_at <= new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    ).length;
    const inventoryProblems = Math.min(inventory.length, inventoryCritical + inventorySoon);
    const containerProblems = (cs.critical ?? 0) + (cs.attention ?? 0);
    const taskProblems = (ts.overdue ?? 0) + (ts.due ?? 0) + (ts.upcoming ?? 0) + (ts.unscheduled ?? 0);
    const assetProblems = as.critical ?? 0;
    const planProblems = pls.attention ?? 0;
    const targetProblems = (ps.below_minimum ?? 0) + (ps.below_target ?? 0) + (ps.unknown ?? 0);

    const areas = [
      { id: "inventory", title: "Inventory", icon: "mdi:package-variant-closed", total: inventory.length, problems: inventoryProblems, detail: `${inventoryProblems} need attention` },
      { id: "containers", title: "Containers", icon: "mdi:archive-outline", total: cs.containers ?? 0, problems: containerProblems, detail: `${containerProblems} need attention` },
      { id: "tasks", title: "Tasks", icon: "mdi:clipboard-check-outline", total: ts.tasks ?? 0, problems: taskProblems, detail: `${taskProblems} due / upcoming` },
      { id: "assets", title: "Assets", icon: "mdi:hammer-wrench", total: as.assets ?? 0, problems: assetProblems, detail: `${assetProblems} checks due` },
      { id: "plans", title: "Plans", icon: "mdi:clipboard-list-outline", total: pls.plans ?? 0, problems: planProblems, detail: `${planProblems} need attention` },
      { id: "targets", title: "Targets", icon: "mdi:target", total: ps.targets ?? 0, problems: targetProblems, detail: `${targetProblems} not fully ready` },
    ].map((area) => ({ ...area, percent: readinessPercent(area.total, area.problems) }));

    const configured = areas.filter((area) => area.percent !== null);
    const score = configured.length
      ? Math.round(configured.reduce((sum, area) => sum + area.percent, 0) / configured.length)
      : 0;

    const critical = inventoryCritical || (ts.overdue ?? 0) || (cs.critical ?? 0) || (as.critical ?? 0);
    const attention = inventorySoon || taskProblems || containerProblems || planProblems || targetProblems || (ss.pending ?? 0);
    const overall = critical ? "critical" : attention ? "attention" : "ok";
    const label = overall === "critical" ? "Action required" : overall === "attention" ? "Needs attention" : "Preparedness looks good";

    const areaHtml = areas.map((area) => {
      const percent = area.percent;
      const status = percent === null ? "neutral" : area.problems ? (percent < 60 ? "critical" : "attention") : "ok";
      return `<button class="hp-readiness-area ${status}" data-view="${area.id}">
        <div class="hp-readiness-area-head"><span class="hp-readiness-area-icon"><ha-icon icon="${area.icon}"></ha-icon></span><span class="hp-readiness-area-title">${this.esc(area.title)}</span><strong>${percent === null ? "—" : `${percent}%`}</strong></div>
        <div class="hp-readiness-bar"><span style="width:${percent ?? 0}%"></span></div>
        <div class="hp-readiness-area-meta"><span>${this.esc(area.detail)}</span><span>${this.esc(area.total)} tracked</span></div>
      </button>`;
    }).join("");

    const nextActions = (this._tasks || [])
      .filter((task) => ["overdue", "due", "upcoming"].includes(task.status))
      .slice(0, 5)
      .map((task) => this.taskRow(task, true))
      .join("") || '<div class="empty">No task needs attention.</div>';

    return `<section class="hero hp-readiness-hero"><div class="hero-icon ${overall}"><ha-icon icon="mdi:shield-home"></ha-icon></div><div class="hp-readiness-hero-copy"><h2>${label}</h2><p>Readiness across supplies, storage, maintenance and household plans.</p></div><div class="hp-readiness-score"><strong>${score}%</strong><span>overall readiness</span></div></section>
      <section class="panel-card hp-readiness-panel"><div class="section-head"><h3><ha-icon icon="mdi:chart-timeline-variant-shimmer"></ha-icon> Readiness by area</h3><span class="hp-inline-stat"><ha-icon icon="mdi:cart-outline"></ha-icon>${ss.pending ?? 0} to buy</span></div><div class="hp-readiness-grid">${areaHtml}</div></section>
      <div class="hp-overview-lower"><section class="panel-card"><div class="section-head"><h3>Next actions</h3><button data-view="tasks">View tasks</button></div>${nextActions}</section>
      <section class="panel-card hp-attention-summary"><div class="section-head"><h3>Attention queue</h3></div>
        <button data-view="shopping"><ha-icon icon="mdi:cart-outline"></ha-icon><span><strong>${ss.pending ?? 0}</strong> Shopping items</span></button>
        <button data-view="plans"><ha-icon icon="mdi:clipboard-list-outline"></ha-icon><span><strong>${pls.review_required ?? 0}</strong> Plans to review</span></button>
        <button data-view="assets"><ha-icon icon="mdi:hammer-wrench"></ha-icon><span><strong>${as.critical ?? 0}</strong> Asset checks due</span></button>
        <button data-view="containers"><ha-icon icon="mdi:archive-outline"></ha-icon><span><strong>${containerProblems}</strong> Containers need attention</span></button>
      </section></div>`;
  };

  const oldHandleChange = proto.handleChange;
  proto.handleChange = function handleChange(event) {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.name === "asset_image" && target.files?.[0]) {
      const file = target.files[0];
      const editor = target.closest(".hp-asset-image-editor");
      if (editor) {
        if (this._assetPreviewUrl) URL.revokeObjectURL(this._assetPreviewUrl);
        this._assetPreviewUrl = URL.createObjectURL(file);
        const existing = editor.querySelector("img,.hp-image-placeholder");
        if (existing) {
          const preview = document.createElement("img");
          preview.src = this._assetPreviewUrl;
          preview.alt = file.name || "Asset preview";
          existing.replaceWith(preview);
        }
      }
      return;
    }
    return oldHandleChange.call(this, event);
  };

  const oldRender = proto.render;
  proto.render = function render() {
    const result = oldRender.call(this);
    const nav = this.querySelector(".hp-side-nav");
    if (!nav) return result;

    const preparedness = nav.querySelector("details:nth-of-type(1) summary > ha-icon:first-child");
    if (preparedness) preparedness.setAttribute("icon", "mdi:shield-outline");
    const assetButton = nav.querySelector('button[data-view="assets"] ha-icon');
    if (assetButton) assetButton.setAttribute("icon", "mdi:hammer-wrench");

    nav.querySelectorAll("details").forEach((details) => {
      const summary = details.querySelector(":scope > summary");
      const active = Boolean(details.querySelector("button.active"));
      summary?.classList.toggle("active-group", active);

      const menu = document.createElement("div");
      menu.className = "hp-nav-menu";
      [...details.children]
        .filter((child) => child instanceof HTMLButtonElement)
        .forEach((button) => menu.appendChild(button));
      details.appendChild(menu);

      if (window.matchMedia?.("(hover:hover) and (pointer:fine)").matches) {
        details.addEventListener("pointerenter", () => { details.open = true; });
        details.addEventListener("pointerleave", () => { details.open = false; });
      }
    });
    return result;
  };

  const oldStyles = proto.styles;
  proto.styles = function styles() {
    return `${oldStyles.call(this)}
      .hp-content-shell{display:block!important;min-height:calc(100vh - 69px)!important}
      .hp-content-shell main{max-width:1200px!important;margin:0 auto!important;padding:var(--hp-panel-pad)!important}
      .hp-side-nav{position:sticky!important;top:69px!important;z-index:5!important;height:auto!important;overflow:visible!important;display:flex!important;align-items:center!important;gap:4px!important;padding:8px max(14px,env(safe-area-inset-left))!important;border-right:0!important;border-bottom:1px solid var(--hp-panel-border)!important;background:var(--hp-panel-card)!important}
      .hp-side-nav>button,.hp-side-nav details>summary{width:auto!important;min-height:38px;display:flex;align-items:center;gap:7px;border:0;border-radius:9px;padding:8px 11px;background:transparent;color:var(--hp-panel-muted);cursor:pointer;white-space:nowrap}
      .hp-side-nav>button.active,.hp-side-nav details>summary.active-group{color:var(--hp-panel-accent)!important;background:color-mix(in srgb,var(--hp-panel-accent) 12%,transparent)!important;font-weight:700}
      .hp-side-nav details{position:relative!important;margin:0!important}
      .hp-side-nav details>summary{font-size:10px!important;text-transform:none!important;letter-spacing:0!important;font-weight:700!important}
      .hp-side-nav details>summary .chevron{width:15px;height:15px}
      .hp-side-nav .hp-nav-menu{display:none;position:absolute;top:calc(100% + 6px);left:0;z-index:20;min-width:220px;padding:6px;border:1px solid var(--hp-panel-border);border-radius:11px;background:var(--hp-panel-card);box-shadow:0 12px 30px rgba(0,0,0,.28)}
      .hp-side-nav details[open]>.hp-nav-menu{display:flex;flex-direction:column;gap:2px}
      .hp-side-nav .hp-nav-menu button{width:100%!important;padding:9px 10px!important;text-align:left!important}
      .hp-side-nav .hp-nav-menu button ha-icon{display:inline-flex!important;opacity:1!important;width:18px!important;height:18px!important;flex:0 0 18px!important}
      .hp-side-nav summary>ha-icon:first-child{display:inline-flex!important;opacity:1!important;width:18px!important;height:18px!important;flex:0 0 18px!important}
      .hp-readiness-hero{padding:14px 16px!important}.hp-readiness-hero-copy{flex:1;min-width:0}.hp-readiness-score{display:flex;flex-direction:column;align-items:flex-end}.hp-readiness-score strong{font-size:28px;line-height:1;font-weight:900}.hp-readiness-score span{font-size:8px;color:var(--hp-panel-muted);margin-top:4px;text-transform:uppercase;letter-spacing:.06em}
      .hp-readiness-panel{padding:12px!important}.hp-inline-stat{display:inline-flex;align-items:center;gap:5px;font-size:9px;color:var(--hp-panel-muted)}.hp-inline-stat ha-icon{width:15px;height:15px}
      .hp-readiness-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.hp-readiness-area{display:block;width:100%;padding:10px;border:1px solid var(--hp-panel-border);border-radius:10px;background:color-mix(in srgb,var(--hp-panel-card) 92%,var(--hp-panel-text) 8%);color:var(--hp-panel-text);cursor:pointer;text-align:left}.hp-readiness-area:hover{border-color:color-mix(in srgb,var(--hp-panel-accent) 55%,var(--hp-panel-border))}.hp-readiness-area-head{display:flex;align-items:center;gap:7px}.hp-readiness-area-icon{display:inline-flex;color:var(--hp-panel-accent)}.hp-readiness-area-icon ha-icon{width:17px;height:17px}.hp-readiness-area-title{flex:1;font-size:10px;font-weight:700}.hp-readiness-area-head strong{font-size:12px}.hp-readiness-bar{height:5px;border-radius:999px;overflow:hidden;background:color-mix(in srgb,var(--hp-panel-muted) 15%,transparent);margin:8px 0 6px}.hp-readiness-bar span{display:block;height:100%;border-radius:inherit;background:#4caf50}.hp-readiness-area.attention .hp-readiness-bar span{background:#ff9800}.hp-readiness-area.critical .hp-readiness-bar span{background:#f44336}.hp-readiness-area.neutral .hp-readiness-bar span{background:var(--hp-panel-muted)}.hp-readiness-area-meta{display:flex;justify-content:space-between;gap:8px;font-size:8px;color:var(--hp-panel-muted)}
      .hp-overview-lower{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(260px,.55fr);gap:12px}.hp-attention-summary{display:flex;flex-direction:column;gap:5px}.hp-attention-summary .section-head{margin-bottom:2px}.hp-attention-summary>button{display:flex;align-items:center;gap:8px;padding:8px 9px;border:0;border-radius:8px;background:color-mix(in srgb,var(--hp-panel-card) 92%,var(--hp-panel-text) 8%);color:var(--hp-panel-text);cursor:pointer;text-align:left}.hp-attention-summary>button:hover{background:color-mix(in srgb,var(--hp-panel-accent) 10%,var(--hp-panel-card))}.hp-attention-summary>button ha-icon{width:17px;height:17px;color:var(--hp-panel-accent)}.hp-attention-summary>button span{font-size:9px}.hp-attention-summary>button strong{font-size:12px;margin-right:3px}
      @media(max-width:900px){.hp-readiness-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hp-overview-lower{grid-template-columns:1fr}}
      @media(max-width:800px){.hp-side-nav{overflow-x:auto!important;overflow-y:visible!important;align-items:flex-start!important}.hp-side-nav details{position:static!important}.hp-side-nav .hp-nav-menu{position:fixed;left:12px;right:12px;top:auto;min-width:0}.hp-content-shell main{padding:var(--hp-panel-pad)!important}}
      @media(max-width:560px){.hp-readiness-grid{grid-template-columns:1fr}.hp-readiness-hero{align-items:flex-start}.hp-readiness-score strong{font-size:22px}}
    `;
  };
}
