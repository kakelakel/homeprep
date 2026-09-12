class HomePrepPanel extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    this._active = "overview";
    this._loading = false;
    this._loaded = false;
    this._error = null;
    this._items = [];
    this._tasks = [];
    this._taskSummary = {};
    this._planning = null;
    this._profiles = [];
    this._recommendations = [];
    this._taxonomy = { categories: [], item_types: [], units: [] };
    this._editingTarget = null;
    this._settings = this.loadSettings();

    this.addEventListener("click", (event) => this.handleClick(event));
    this.addEventListener("submit", (event) => this.handleSubmit(event));
    this.addEventListener("change", (event) => this.handleChange(event));
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this.loadData();
  }

  set narrow(value) {
    this._narrow = value;
  }

  set route(value) {
    this._route = value;
  }

  set panel(value) {
    this._panel = value;
  }

  connectedCallback() {
    this.render();
  }

  loadSettings() {
    try {
      return {
        preset: "system",
        accent: "#2196F3",
        density: "comfortable",
        ...JSON.parse(localStorage.getItem("homeprep-panel-settings") || "{}")
      };
    } catch (_) {
      return { preset: "system", accent: "#2196F3", density: "comfortable" };
    }
  }

  saveSettings() {
    localStorage.setItem("homeprep-panel-settings", JSON.stringify(this._settings));
  }

  esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  category(id) {
    return this._taxonomy.categories.find((x) => x.id === id) || null;
  }

  profileForCountry(country) {
    return this._profiles.find((p) => p.country_code === country) || null;
  }

  async loadData() {
    if (!this._hass || this._loading) return;
    this._loading = true;
    this.render();

    try {
      const [items, tasks, planning, profiles, taxonomy] = await Promise.all([
        this._hass.callWS({ type: "homeprep/items" }),
        this._hass.callWS({ type: "homeprep/tasks" }),
        this._hass.callWS({ type: "homeprep/planning" }),
        this._hass.callWS({ type: "homeprep/recommendation_profiles" }),
        this._hass.callWS({ type: "homeprep/taxonomy" })
      ]);

      this._items = items.items ?? [];
      this._tasks = tasks.tasks ?? [];
      this._taskSummary = tasks.summary ?? {};
      this._planning = planning;
      this._profiles = profiles ?? [];
      this._taxonomy = {
        categories: taxonomy.categories ?? [],
        item_types: taxonomy.item_types ?? [],
        units: taxonomy.units ?? []
      };

      const profile = this.profileForCountry(planning.household?.country_code);
      this._recommendations = profile
        ? await this._hass.callWS({
            type: "homeprep/recommendations",
            profile_id: profile.id
          })
        : [];

      this._error = null;
      this._loaded = true;
    } catch (error) {
      console.error("HomePrep panel load failed", error);
      this._error = error;
    }

    this._loading = false;
    this.render();
  }

  async handleClick(event) {
    const target = event.composedPath().find(
      (el) => el instanceof HTMLElement && (el.dataset?.view || el.dataset?.action)
    );
    if (!target) return;

    if (target.dataset.view) {
      this._active = target.dataset.view;
      this._editingTarget = null;
      this.render();
      return;
    }

    const action = target.dataset.action;
    try {
      if (action === "refresh") {
        await this.loadData();
        return;
      }

      if (action === "complete-task") {
        target.disabled = true;
        await this._hass.callWS({
          type: "homeprep/task/complete",
          task_id: target.dataset.id
        });
        await this.loadData();
        return;
      }

      if (action === "edit-target") {
        this._editingTarget = target.dataset.id;
        this.render();
        return;
      }

      if (action === "cancel-target") {
        this._editingTarget = null;
        this.render();
        return;
      }

      if (action === "delete-target") {
        if (!confirm("Delete this personal target?")) return;
        await this._hass.callWS({
          type: "homeprep/target/delete",
          target_id: target.dataset.id
        });
        await this.loadData();
        return;
      }

      if (action === "adopt") {
        target.disabled = true;
        await this._hass.callWS({
          type: "homeprep/recommendation/adopt",
          profile_id: target.dataset.profile,
          recommendation_id: target.dataset.id
        });
        await this.loadData();
      }
    } catch (error) {
      console.error("HomePrep panel action failed", error);
      alert(`HomePrep: ${error?.message || error}`);
      await this.loadData();
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    try {
      if (form.id === "hp-household-form") {
        const data = new FormData(form);
        await this._hass.callWS({
          type: "homeprep/household/update",
          country_code: String(data.get("country_code")),
          adults: Number(data.get("adults")),
          children: Number(data.get("children")),
          pets: Number(data.get("pets")),
          preparedness_days: Number(data.get("preparedness_days"))
        });
        await this.loadData();
        return;
      }

      if (form.dataset.targetId) {
        const data = new FormData(form);
        const updates = {
          name: String(data.get("name") || "").trim(),
          minimum_value: data.get("minimum_value") === ""
            ? null
            : Number(data.get("minimum_value")),
          target_value: data.get("target_value") === ""
            ? null
            : Number(data.get("target_value")),
          enabled: data.get("enabled") === "on",
          priority: String(data.get("priority") || "normal"),
          notes: String(data.get("notes") || "")
        };

        await this._hass.callWS({
          type: "homeprep/target/update",
          target_id: form.dataset.targetId,
          updates
        });
        this._editingTarget = null;
        await this.loadData();
      }
    } catch (error) {
      console.error("HomePrep panel form failed", error);
      alert(`HomePrep: ${error?.message || error}`);
    }
  }

  handleChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    const setting = target.dataset.setting;
    if (!setting) return;

    this._settings[setting] = target.value;
    this.saveSettings();
    this.render();
  }

  statusClass(status) {
    if (["critical", "overdue", "below_minimum"].includes(status)) return "critical";
    if (["attention", "due", "upcoming", "below_target", "unknown"].includes(status)) return "attention";
    return "ok";
  }

  renderOverview() {
    const planning = this._planning || {};
    const ps = planning.summary || {};
    const ts = this._taskSummary || {};
    const inventoryProblems = this._items.filter((item) => {
      const today = new Date().toISOString().slice(0, 10);
      return (item.expires_at && item.expires_at < today)
        || (item.next_check_at && item.next_check_at <= today);
    }).length;

    const overall =
      ps.status === "critical" || ts.status === "critical" || inventoryProblems
        ? "critical"
        : ps.status === "attention" || ts.status === "attention"
          ? "attention"
          : "ok";

    const label = overall === "critical"
      ? "Action required"
      : overall === "attention"
        ? "Needs attention"
        : "Preparedness looks good";

    return `
      <section class="hero ${overall}">
        <div class="hero-icon"><ha-icon icon="mdi:shield-home"></ha-icon></div>
        <div>
          <h2>${label}</h2>
          <p>HomePrep combines your inventory, recurring tasks and personal preparedness targets.</p>
        </div>
      </section>

      <div class="metrics">
        ${this.metric("Inventory", this._items.length, `${inventoryProblems} require action`, inventoryProblems ? "critical" : "ok", "inventory")}
        ${this.metric("Tasks", ts.tasks ?? 0, `${(ts.overdue ?? 0) + (ts.due ?? 0) + (ts.upcoming ?? 0)} need attention`, ts.status || "ok", "tasks")}
        ${this.metric("Targets", ps.targets ?? 0, `${(ps.below_minimum ?? 0) + (ps.below_target ?? 0) + (ps.unknown ?? 0)} not fully met`, ps.status || "ok", "targets")}
        ${this.metric("Guidance", this._recommendations.length, "Official profile available", "ok", "recommendations")}
      </div>

      <div class="section-grid">
        <section class="panel-card">
          <div class="section-head"><h3>Next actions</h3><button data-view="tasks">View tasks</button></div>
          ${this._tasks.filter((t) => ["overdue", "due", "upcoming"].includes(t.status)).slice(0, 5).map((t) => this.taskRow(t, true)).join("") || '<div class="empty">No task needs attention.</div>'}
        </section>

        <section class="panel-card">
          <div class="section-head"><h3>Target progress</h3><button data-view="targets">View targets</button></div>
          ${(planning.evaluations || []).slice(0, 5).map((e) => this.evaluationRow(e)).join("") || '<div class="empty">No targets yet.</div>'}
        </section>
      </div>
    `;
  }

  metric(title, value, subtitle, status, view) {
    return `
      <button class="metric ${this.statusClass(status)}" data-view="${view}">
        <span class="metric-value">${this.esc(value ?? 0)}</span>
        <span class="metric-title">${this.esc(title)}</span>
        <span class="metric-sub">${this.esc(subtitle)}</span>
      </button>
    `;
  }

  taskRow(task, compact = false) {
    const category = this.category(task.category);
    return `
      <div class="row task-row">
        <div class="row-icon ${this.statusClass(task.status)}"><ha-icon icon="${this.esc(category?.icon || "mdi:clipboard-check-outline")}"></ha-icon></div>
        <div class="row-main">
          <strong>${this.esc(task.name)}</strong>
          <small>${this.esc(task.linked_item?.name || (task.task_kind === "inspection" ? "Inspection" : "Standalone task"))} · ${this.esc(task.next_due_at || "No due date")}</small>
        </div>
        <span class="badge ${this.statusClass(task.status)}">${this.esc(task.status)}</span>
        ${!compact && task.enabled ? `<button class="primary small" data-action="complete-task" data-id="${this.esc(task.id)}">Complete</button>` : ""}
      </div>
    `;
  }

  evaluationRow(evaluation) {
    const current = evaluation.current_value ?? "—";
    const target = evaluation.target_value ?? "—";
    return `
      <div class="row">
        <div class="row-icon ${this.statusClass(evaluation.status)}"><ha-icon icon="mdi:target"></ha-icon></div>
        <div class="row-main"><strong>${this.esc(evaluation.name)}</strong><small>${this.esc(current)} / ${this.esc(target)} ${this.esc(evaluation.unit || "")}</small></div>
        <span class="badge ${this.statusClass(evaluation.status)}">${this.esc(evaluation.status)}</span>
      </div>
    `;
  }

  renderInventory() {
    const groups = new Map();
    this._items.forEach((item) => {
      const key = item.category || "other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });

    return `
      <div class="page-title"><div><h2>Inventory</h2><p>${this._items.length} items currently tracked.</p></div></div>
      <div class="section-grid">
        ${[...groups.entries()].map(([categoryId, items]) => {
          const cat = this.category(categoryId);
          return `<section class="panel-card"><div class="section-head"><h3><ha-icon icon="${this.esc(cat?.icon || "mdi:package-variant")}"></ha-icon> ${this.esc(cat?.label || categoryId)}</h3><span>${items.length}</span></div>${items.map((item) => `<div class="row"><div class="row-main"><strong>${this.esc(item.name)}</strong><small>${this.esc(item.quantity)} ${this.esc(item.unit)}${item.next_check_at ? ` · Next check ${this.esc(item.next_check_at)}` : ""}${item.expires_at ? ` · Expires ${this.esc(item.expires_at)}` : ""}</small></div></div>`).join("")}</section>`;
        }).join("") || '<section class="panel-card"><div class="empty">No inventory items yet. Add your first items from the HomePrep Manage Lovelace card for now; full inventory editing will move into this panel in a later iteration.</div></section>'}
      </div>
    `;
  }

  renderTasks() {
    return `
      <div class="page-title"><div><h2>Tasks</h2><p>Recurring checks and standalone preparedness tasks.</p></div><span class="badge ${this.statusClass(this._taskSummary.status)}">${this.esc(this._taskSummary.status || "ok")}</span></div>
      <section class="panel-card">
        ${this._tasks.length ? this._tasks.map((task) => this.taskRow(task)).join("") : '<div class="empty">No tasks yet.</div>'}
      </section>
    `;
  }

  renderTargets() {
    const targets = this._planning?.targets || [];
    const evaluations = new Map((this._planning?.evaluations || []).map((e) => [e.target_id, e]));

    return `
      <div class="page-title"><div><h2>Personal targets</h2><p>Your targets are independent from the official guidance they may have originated from.</p></div></div>
      <div class="target-stack">
        ${targets.map((target) => {
          const evaluation = evaluations.get(target.id);
          if (this._editingTarget === target.id) return this.renderTargetForm(target, evaluation);
          return `<section class="panel-card target-card"><div class="target-top"><div><h3>${this.esc(target.name)}</h3><p>${this.esc(this.category(target.category)?.label || target.category)} · ${this.esc(target.origin || "custom")}</p></div><span class="badge ${this.statusClass(evaluation?.status)}">${this.esc(evaluation?.status || (target.enabled ? "unknown" : "disabled"))}</span></div><div class="target-numbers"><div><span>Current</span><strong>${this.esc(evaluation?.current_value ?? "—")} ${this.esc(target.unit || "")}</strong></div><div><span>Minimum</span><strong>${this.esc(target.minimum_value ?? "—")} ${this.esc(target.unit || "")}</strong></div><div><span>Target</span><strong>${this.esc(target.target_value ?? "—")} ${this.esc(target.unit || "")}</strong></div></div><div class="actions"><button data-action="edit-target" data-id="${this.esc(target.id)}">Edit</button><button class="danger" data-action="delete-target" data-id="${this.esc(target.id)}">Delete</button></div></section>`;
        }).join("") || '<section class="panel-card"><div class="empty">No personal targets yet. Review official recommendations to add some.</div></section>'}
      </div>
    `;
  }

  renderTargetForm(target, evaluation) {
    return `
      <section class="panel-card">
        <form class="form-grid" data-target-id="${this.esc(target.id)}">
          <label class="wide"><span>Name</span><input name="name" value="${this.esc(target.name)}" required></label>
          <label><span>Minimum</span><input name="minimum_value" type="number" step="any" value="${this.esc(target.minimum_value ?? "")}"></label>
          <label><span>Target</span><input name="target_value" type="number" step="any" value="${this.esc(target.target_value ?? "")}"></label>
          <label><span>Priority</span><select name="priority"><option value="normal" ${target.priority === "normal" ? "selected" : ""}>Normal</option><option value="high" ${target.priority === "high" ? "selected" : ""}>High</option><option value="critical" ${target.priority === "critical" ? "selected" : ""}>Critical</option></select></label>
          <label class="check"><input name="enabled" type="checkbox" ${target.enabled !== false ? "checked" : ""}><span>Enabled</span></label>
          <label class="wide"><span>Notes</span><textarea name="notes" rows="3">${this.esc(target.notes || "")}</textarea></label>
          <div class="wide hint">Official source metadata is preserved, but these values belong to your personal target and may be changed freely.</div>
          <div class="wide actions"><button type="submit" class="primary">Save target</button><button type="button" data-action="cancel-target">Cancel</button></div>
        </form>
      </section>
    `;
  }

  renderRecommendations() {
    const household = this._planning?.household || {};
    const profile = this.profileForCountry(household.country_code);
    const adopted = new Set((this._planning?.targets || []).filter((t) => t.source_profile_id === profile?.id).map((t) => t.source_recommendation_id));

    return `
      <div class="page-title"><div><h2>Official guidance</h2><p>${profile ? `${this.esc(profile.authority)} · profile ${this.esc(profile.version)}` : "No official profile is available for the selected country."}</p></div></div>
      <div class="recommendation-grid">
        ${this._recommendations.map((rec) => {
          const calc = rec.calculated || {};
          const isAdopted = adopted.has(rec.id);
          return `<section class="panel-card recommendation"><div class="recommendation-head"><div class="row-icon"><ha-icon icon="${this.esc(this.category(rec.category)?.icon || "mdi:shield-check")}"></ha-icon></div><div><h3>${this.esc(rec.title)}</h3><p>${this.esc(this.category(rec.category)?.label || rec.category)}</p></div></div>${calc.target_value != null ? `<div class="official-value"><span>Official calculated guidance</span><strong>${this.esc(calc.target_value)} ${this.esc(calc.unit || "")}</strong></div>` : ""}${rec.advisory_note ? `<p class="advisory">${this.esc(rec.advisory_note)}</p>` : ""}${rec.condition_note ? `<p class="hint">${this.esc(rec.condition_note)}</p>` : ""}<div class="actions">${isAdopted ? '<span class="adopted"><ha-icon icon="mdi:check"></ha-icon> Adopted</span>' : `<button class="primary" data-action="adopt" data-profile="${this.esc(profile?.id || "")}" data-id="${this.esc(rec.id)}">Adopt as personal target</button>`}</div></section>`;
        }).join("") || '<section class="panel-card"><div class="empty">No recommendations available.</div></section>'}
      </div>
    `;
  }

  renderHousehold() {
    const h = this._planning?.household || {};
    return `
      <div class="page-title"><div><h2>Household</h2><p>Changes affect calculated official guidance. Existing personal targets remain yours until you choose to change them.</p></div></div>
      <section class="panel-card form-card">
        <form id="hp-household-form" class="form-grid">
          <label><span>Country</span><select name="country_code"><option value="SE" ${h.country_code === "SE" ? "selected" : ""}>Sweden</option><option value="NO" ${h.country_code === "NO" ? "selected" : ""}>Norway</option></select></label>
          <label><span>Preparedness horizon</span><input name="preparedness_days" type="number" min="1" max="30" value="${this.esc(h.preparedness_days ?? 7)}"></label>
          <label><span>Adults</span><input name="adults" type="number" min="0" max="20" value="${this.esc(h.adults ?? 1)}"></label>
          <label><span>Children</span><input name="children" type="number" min="0" max="20" value="${this.esc(h.children ?? 0)}"></label>
          <label><span>Pets</span><input name="pets" type="number" min="0" max="20" value="${this.esc(h.pets ?? 0)}"></label>
          <div class="wide hint">Changing household data recalculates official guidance. HomePrep never silently overwrites already adopted personal targets.</div>
          <div class="wide actions"><button class="primary" type="submit">Save household</button></div>
        </form>
      </section>
    `;
  }

  renderSettings() {
    return `
      <div class="page-title"><div><h2>Settings</h2><p>Panel appearance is stored locally in this browser. Lovelace cards keep their own appearance settings.</p></div></div>
      <section class="panel-card form-card">
        <div class="form-grid">
          <label><span>Panel preset</span><select data-setting="preset"><option value="system" ${this._settings.preset === "system" ? "selected" : ""}>Home Assistant theme</option><option value="homeprep" ${this._settings.preset === "homeprep" ? "selected" : ""}>HomePrep</option><option value="dark" ${this._settings.preset === "dark" ? "selected" : ""}>Dark</option><option value="light" ${this._settings.preset === "light" ? "selected" : ""}>Light</option><option value="tactical" ${this._settings.preset === "tactical" ? "selected" : ""}>Amber Tactical</option></select></label>
          <label><span>Density</span><select data-setting="density"><option value="compact" ${this._settings.density === "compact" ? "selected" : ""}>Compact</option><option value="comfortable" ${this._settings.density === "comfortable" ? "selected" : ""}>Comfortable</option><option value="spacious" ${this._settings.density === "spacious" ? "selected" : ""}>Spacious</option></select></label>
          <label><span>Accent color</span><div class="color-row"><input type="color" data-setting="accent" value="${this.esc(this._settings.accent || "#2196F3")}"><code>${this.esc(this._settings.accent || "#2196F3")}</code></div></label>
        </div>
      </section>
    `;
  }

  appearanceVars() {
    const preset = this._settings.preset;
    const accent = this._settings.accent || "#2196F3";
    const palettes = {
      system: {
        bg: "var(--primary-background-color)", card: "var(--ha-card-background, var(--card-background-color))",
        text: "var(--primary-text-color)", muted: "var(--secondary-text-color)", border: "var(--divider-color)"
      },
      homeprep: { bg: "#10151c", card: "#171e27", text: "#f4f7fb", muted: "#91a0b2", border: "#293545" },
      dark: { bg: "#101112", card: "#191b1e", text: "#f5f5f5", muted: "#9a9fa6", border: "#30343a" },
      light: { bg: "#f3f6f9", card: "#ffffff", text: "#17202a", muted: "#607080", border: "#d8dde3" },
      tactical: { bg: "#0e0c08", card: "#17130d", text: "#fff5df", muted: "#b9a57d", border: "#4b3a17" }
    };
    const p = palettes[preset] || palettes.system;
    const pads = { compact: "10px", comfortable: "16px", spacious: "22px" };
    return `--hp-panel-bg:${p.bg};--hp-panel-card:${p.card};--hp-panel-text:${p.text};--hp-panel-muted:${p.muted};--hp-panel-border:${p.border};--hp-panel-accent:${accent};--hp-panel-pad:${pads[this._settings.density] || pads.comfortable};`;
  }

  render() {
    if (!this.isConnected) return;

    const nav = [
      ["overview", "mdi:view-dashboard-outline", "Overview"],
      ["inventory", "mdi:package-variant-closed", "Inventory"],
      ["tasks", "mdi:clipboard-check-outline", "Tasks"],
      ["targets", "mdi:target", "Targets"],
      ["recommendations", "mdi:shield-check-outline", "Guidance"],
      ["household", "mdi:home-account", "Household"],
      ["settings", "mdi:cog-outline", "Settings"]
    ];

    let content = "";
    if (this._error) {
      content = `<section class="panel-card"><div class="empty">HomePrep could not load panel data.<br><button data-action="refresh">Try again</button></div></section>`;
    } else if (!this._loaded) {
      content = `<section class="panel-card"><div class="empty">Loading HomePrep…</div></section>`;
    } else {
      const renderers = {
        overview: () => this.renderOverview(),
        inventory: () => this.renderInventory(),
        tasks: () => this.renderTasks(),
        targets: () => this.renderTargets(),
        recommendations: () => this.renderRecommendations(),
        household: () => this.renderHousehold(),
        settings: () => this.renderSettings()
      };
      content = (renderers[this._active] || renderers.overview)();
    }

    this.innerHTML = `
      <div class="app" style="${this.appearanceVars()}">
        <style>${this.styles()}</style>
        <header class="topbar">
          <div class="brand"><div class="brand-icon"><ha-icon icon="mdi:shield-home"></ha-icon></div><div><h1>HomePrep</h1><span>PREPARE · MONITOR · BE READY</span></div></div>
          <button class="icon-button" data-action="refresh" title="Refresh"><ha-icon icon="mdi:refresh"></ha-icon></button>
        </header>
        <nav class="tabs">${nav.map(([id, icon, label]) => `<button class="${this._active === id ? "active" : ""}" data-view="${id}"><ha-icon icon="${icon}"></ha-icon><span>${label}</span></button>`).join("")}</nav>
        <main>${content}</main>
      </div>
    `;
  }

  styles() {
    return `
      :host{display:block;min-height:100%;background:var(--hp-panel-bg);color:var(--hp-panel-text);font-family:var(--paper-font-body1_-_font-family,Roboto,sans-serif)}
      *{box-sizing:border-box} .app{min-height:100vh;background:var(--hp-panel-bg);color:var(--hp-panel-text)}
      .topbar{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:space-between;padding:14px max(18px,env(safe-area-inset-left));background:color-mix(in srgb,var(--hp-panel-bg) 92%,transparent);backdrop-filter:blur(16px);border-bottom:1px solid var(--hp-panel-border)}
      .brand{display:flex;align-items:center;gap:11px}.brand-icon,.row-icon{display:flex;align-items:center;justify-content:center;color:var(--hp-panel-accent);background:color-mix(in srgb,var(--hp-panel-accent) 14%,transparent);border-radius:50%}.brand-icon{width:40px;height:40px}.brand h1{font-size:18px;margin:0}.brand span{font-size:8px;letter-spacing:.12em;color:var(--hp-panel-muted)}
      .tabs{display:flex;overflow:auto;gap:4px;padding:8px max(14px,env(safe-area-inset-left));border-bottom:1px solid var(--hp-panel-border);background:var(--hp-panel-card)}.tabs button{display:flex;align-items:center;gap:6px;border:0;border-radius:9px;padding:9px 11px;background:transparent;color:var(--hp-panel-muted);cursor:pointer;white-space:nowrap}.tabs button.active{color:var(--hp-panel-accent);background:color-mix(in srgb,var(--hp-panel-accent) 12%,transparent)}
      main{max-width:1200px;margin:0 auto;padding:var(--hp-panel-pad)} h2,h3,p{margin-top:0}.page-title{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:8px 0 16px}.page-title h2{margin-bottom:4px}.page-title p,.hero p{color:var(--hp-panel-muted);font-size:12px;margin-bottom:0}
      .hero{display:flex;gap:14px;align-items:center;border:1px solid var(--hp-panel-border);border-radius:16px;padding:18px;margin-bottom:12px;background:var(--hp-panel-card)}.hero-icon{width:52px;height:52px;display:flex;align-items:center;justify-content:center;border-radius:15px;background:color-mix(in srgb,var(--hp-panel-accent) 14%,transparent);color:var(--hp-panel-accent)}.hero h2{margin:0 0 4px}.hero.critical{border-color:color-mix(in srgb,#f44336 45%,var(--hp-panel-border))}.hero.attention{border-color:color-mix(in srgb,#ff9800 45%,var(--hp-panel-border))}
      .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px}.metric{display:flex;flex-direction:column;text-align:left;border:1px solid var(--hp-panel-border);border-radius:14px;padding:14px;background:var(--hp-panel-card);color:var(--hp-panel-text);cursor:pointer}.metric-value{font-size:24px;font-weight:800}.metric-title{font-weight:700;font-size:12px}.metric-sub{font-size:9px;color:var(--hp-panel-muted);margin-top:3px}.metric.critical{border-color:color-mix(in srgb,#f44336 45%,var(--hp-panel-border))}.metric.attention{border-color:color-mix(in srgb,#ff9800 45%,var(--hp-panel-border))}
      .section-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.panel-card{border:1px solid var(--hp-panel-border);border-radius:14px;background:var(--hp-panel-card);padding:var(--hp-panel-pad);margin-bottom:12px}.section-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.section-head h3{display:flex;align-items:center;gap:6px;margin:0;font-size:13px}.section-head button,.actions button,.icon-button,.primary,.danger{border:1px solid var(--hp-panel-border);border-radius:9px;padding:7px 10px;background:transparent;color:var(--hp-panel-text);cursor:pointer}.primary{background:var(--hp-panel-accent)!important;color:#fff!important;border-color:var(--hp-panel-accent)!important}.danger{color:#ef5350!important}.icon-button{padding:8px}.small{font-size:9px;padding:6px 8px}
      .row{display:flex;align-items:center;gap:9px;padding:9px 0}.row+.row{border-top:1px solid var(--hp-panel-border)}.row-icon{width:32px;height:32px;flex:0 0 32px}.row-main{flex:1;min-width:0}.row-main strong{display:block;font-size:11px}.row-main small{display:block;margin-top:2px;font-size:9px;color:var(--hp-panel-muted)}.badge{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;padding:5px 7px;border-radius:999px;background:color-mix(in srgb,var(--hp-panel-muted) 12%,transparent)}.badge.ok,.row-icon.ok{color:#4caf50}.badge.attention,.row-icon.attention{color:#ff9800}.badge.critical,.row-icon.critical{color:#f44336}
      .target-stack,.recommendation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.target-card,.recommendation{margin:0}.target-top{display:flex;justify-content:space-between;gap:10px}.target-top h3,.recommendation h3{font-size:13px;margin-bottom:3px}.target-top p,.recommendation p{font-size:9px;color:var(--hp-panel-muted);margin:0}.target-numbers{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:13px 0}.target-numbers div,.official-value{border:1px solid var(--hp-panel-border);border-radius:9px;padding:9px}.target-numbers span,.official-value span{display:block;font-size:8px;color:var(--hp-panel-muted)}.target-numbers strong,.official-value strong{display:block;margin-top:3px;font-size:13px}.actions{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.recommendation-head{display:flex;align-items:center;gap:9px;margin-bottom:11px}.official-value{margin:10px 0}.advisory,.hint{font-size:9px!important;line-height:1.45;color:var(--hp-panel-muted)!important}.adopted{display:flex;align-items:center;gap:4px;color:#4caf50;font-size:10px;font-weight:700}
      .form-card{max-width:780px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.form-grid label{display:flex;flex-direction:column;gap:5px}.form-grid label>span{font-size:9px;color:var(--hp-panel-muted)}.form-grid input,.form-grid select,.form-grid textarea{width:100%;padding:9px 10px;border:1px solid var(--hp-panel-border);border-radius:9px;background:var(--hp-panel-bg);color:var(--hp-panel-text)}.form-grid .wide{grid-column:1/-1}.form-grid .check{flex-direction:row;align-items:center}.form-grid .check input{width:auto}.color-row{display:flex;align-items:center;gap:9px}.color-row input{width:54px;height:38px;padding:2px}.empty{text-align:center;color:var(--hp-panel-muted);font-size:10px;padding:22px}.empty button{margin-top:10px}.critical{--state-color:#f44336}.attention{--state-color:#ff9800}.ok{--state-color:#4caf50}
      @media(max-width:800px){.metrics{grid-template-columns:repeat(2,1fr)}.section-grid,.target-stack,.recommendation-grid{grid-template-columns:1fr}.tabs button span{display:none}.tabs button{padding:9px 12px}.form-grid{grid-template-columns:1fr}.form-grid .wide{grid-column:auto}}
    `;
  }
}

if (!customElements.get("homeprep-panel")) {
  customElements.define("homeprep-panel", HomePrepPanel);
}
