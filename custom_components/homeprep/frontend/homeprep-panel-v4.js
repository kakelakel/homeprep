import "./homeprep-panel.js?v=3";

const HomePrepPanel = customElements.get("homeprep-panel");

if (HomePrepPanel) {
  HomePrepPanel.prototype.renderOverview = function renderOverview() {
    const planning = this._planning || {};
    const ps = planning.summary || {};
    const ts = this._taskSummary || {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const soonLimit = new Date(today);
    soonLimit.setDate(soonLimit.getDate() + 30);

    let expired = 0;
    let expiringSoon = 0;
    let dueForCheck = 0;

    for (const item of this._items) {
      if (item.expires_at) {
        const expiry = new Date(`${item.expires_at}T00:00:00`);
        if (expiry < today) expired += 1;
        else if (expiry <= soonLimit) expiringSoon += 1;
      }

      if (item.next_check_at) {
        const checkDate = new Date(`${item.next_check_at}T00:00:00`);
        if (checkDate <= today) dueForCheck += 1;
      }
    }

    const inventoryStatus = expired > 0 || dueForCheck > 0
      ? "critical"
      : expiringSoon > 0
        ? "attention"
        : "ok";

    const inventoryAttention = expired + expiringSoon + dueForCheck;
    const inventorySubtitle = inventoryAttention
      ? [
          expired ? `${expired} expired` : null,
          expiringSoon ? `${expiringSoon} expiring soon` : null,
          dueForCheck ? `${dueForCheck} due for check` : null,
        ].filter(Boolean).join(" · ")
      : "No inventory attention needed";

    const overall =
      ps.status === "critical" || ts.status === "critical" || inventoryStatus === "critical"
        ? "critical"
        : ps.status === "attention" || ts.status === "attention" || inventoryStatus === "attention"
          ? "attention"
          : "ok";

    const label = overall === "critical"
      ? "Action required"
      : overall === "attention"
        ? "Needs attention"
        : "Preparedness looks good";

    return `
      <section class="hero"><div class="hero-icon ${overall}"><ha-icon icon="mdi:shield-home"></ha-icon></div><div><h2>${label}</h2><p>HomePrep combines inventory, recurring checks and understandable preparedness goals.</p></div></section>
      <div class="metrics">
        ${this.metric("Inventory", this._items.length, inventorySubtitle, inventoryStatus, "inventory")}
        ${this.metric("Tasks", ts.tasks ?? 0, `${(ts.overdue ?? 0) + (ts.due ?? 0) + (ts.upcoming ?? 0)} need attention`, ts.status || "ok", "tasks")}
        ${this.metric("Targets", ps.targets ?? 0, `${(ps.below_minimum ?? 0) + (ps.below_target ?? 0) + (ps.unknown ?? 0)} not fully ready`, ps.status || "ok", "targets")}
        ${this.metric("Guidance", this._recommendations.length, this.profileForCountry(planning.household?.country_code)?.unofficial ? "General baseline" : "Official profile", "ok", "recommendations")}
      </div>
      <div class="section-grid">
        <section class="panel-card"><div class="section-head"><h3>Next actions</h3><button data-view="tasks">View tasks</button></div>${this._tasks.filter((t) => ["overdue", "due", "upcoming"].includes(t.status)).slice(0, 5).map((t) => this.taskRow(t, true)).join("") || '<div class="empty">No task needs attention.</div>'}</section>
        <section class="panel-card"><div class="section-head"><h3>Target progress</h3><button data-view="targets">View targets</button></div>${(planning.evaluations || []).slice(0, 5).map((e) => this.evaluationRow(e)).join("") || '<div class="empty">No targets yet.</div>'}</section>
      </div>`;
  };
}
