class HomePrepTasksCard extends HTMLElement {
  constructor() {
    super();

    this._tasks = [];
    this._summary = null;
    this._taxonomy = {
      categories: [],
      item_types: [],
      units: []
    };
    this._loading = false;
    this._loaded = false;
    this._error = null;
    this._busyTaskId = null;

    this.addEventListener(
      "click",
      (event) => this.handleClick(event)
    );
  }

  static getConfigElement() {
    return document.createElement(
      "homeprep-card-editor"
    );
  }

  static getStubConfig() {
    return {
      view: "all",
      sort: "status",
      max_tasks: 25,
      show_summary: true,
      show_complete: true,
      show_linked_item: true,
      show_recurrence: true,
      show_disabled: false
    };
  }

  setConfig(config) {
    this.config = {
      ...HomePrepTasksCard.getStubConfig(),
      ...(config || {})
    };

    if (this._loaded) {
      this.render();
    }
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;

    if (first) {
      this.loadData();
    }
  }

  connectedCallback() {
    if (!this._timer) {
      this._timer = window.setInterval(
        () => this.loadData(),
        30000
      );
    }
  }

  disconnectedCallback() {
    if (this._timer) {
      window.clearInterval(this._timer);
      this._timer = null;
    }
  }

  getCardSize() {
    return 5;
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
      const [tasks, taxonomy] =
        await Promise.all([
          this._hass.callWS({
            type: "homeprep/tasks"
          }),
          this._hass.callWS({
            type: "homeprep/taxonomy"
          })
        ]);

      this._tasks = tasks.tasks ?? [];
      this._summary = tasks.summary ?? null;
      this._taxonomy = {
        categories:
          taxonomy.categories ?? [],
        item_types:
          taxonomy.item_types ?? [],
        units:
          taxonomy.units ?? []
      };

      this._error = null;
      this._loaded = true;
    } catch (error) {
      console.error(
        "HomePrep tasks card load failed",
        error
      );
      this._error = error;
    } finally {
      this._loading = false;
      this.render();
    }
  }

  getCategory(id) {
    return (
      this._taxonomy.categories.find(
        (category) => category.id === id
      ) || null
    );
  }

  statusRank(status) {
    return ({
      overdue: 0,
      due: 1,
      upcoming: 2,
      unscheduled: 3,
      ok: 4,
      disabled: 5
    })[status] ?? 99;
  }

  statusLabel(status) {
    return ({
      overdue: "Overdue",
      due: "Due today",
      upcoming: "Upcoming",
      ok: "OK",
      unscheduled: "Unscheduled",
      disabled: "Disabled"
    })[status] || status;
  }

  statusLevel(status) {
    if (status === "overdue") {
      return "critical";
    }

    if (
      status === "due" ||
      status === "upcoming" ||
      status === "unscheduled"
    ) {
      return "attention";
    }

    return "ok";
  }

  formatDate(value) {
    if (!value) return "No due date";

    try {
      return new Intl.DateTimeFormat(
        undefined,
        {
          year: "numeric",
          month: "short",
          day: "numeric"
        }
      ).format(
        new Date(`${value}T00:00:00`)
      );
    } catch (_) {
      return value;
    }
  }

  recurrenceLabel(task) {
    const interval =
      Number(task.recurrence_interval || 1);

    const unit =
      task.recurrence_type || "months";

    const singular = ({
      days: "day",
      weeks: "week",
      months: "month",
      years: "year"
    })[unit] || unit;

    const plural = ({
      days: "days",
      weeks: "weeks",
      months: "months",
      years: "years"
    })[unit] || unit;

    return `Every ${interval} ${
      interval === 1
        ? singular
        : plural
    }`;
  }

  filteredTasks() {
    const config = this.config || {};
    let tasks = [...this._tasks];

    if (!config.show_disabled) {
      tasks = tasks.filter(
        (task) => task.enabled !== false
      );
    }

    if (config.task_kind) {
      tasks = tasks.filter(
        (task) =>
          task.task_kind === config.task_kind
      );
    }

    if (config.category) {
      tasks = tasks.filter(
        (task) =>
          task.category === config.category
      );
    }

    const view = config.view || "all";

    if (view === "attention") {
      tasks = tasks.filter(
        (task) =>
          [
            "overdue",
            "due",
            "upcoming",
            "unscheduled"
          ].includes(task.status)
      );
    } else if (view !== "all") {
      tasks = tasks.filter(
        (task) => task.status === view
      );
    }

    const sort = config.sort || "status";

    tasks.sort((a, b) => {
      if (sort === "name") {
        return String(a.name || "")
          .localeCompare(
            String(b.name || "")
          );
      }

      if (sort === "due") {
        const ad = a.next_due_at || "9999-12-31";
        const bd = b.next_due_at || "9999-12-31";
        return ad.localeCompare(bd);
      }

      const rank =
        this.statusRank(a.status)
        - this.statusRank(b.status);

      if (rank !== 0) {
        return rank;
      }

      return String(
        a.next_due_at || "9999-12-31"
      ).localeCompare(
        String(
          b.next_due_at || "9999-12-31"
        )
      );
    });

    const max = Math.max(
      1,
      Number(config.max_tasks || 25)
    );

    return tasks.slice(0, max);
  }

  renderHeader() {
    return `
      <div class="hp-header">
        <div class="hp-header-icon">
          <ha-icon
            icon="mdi:clipboard-check-outline"
          ></ha-icon>
        </div>

        <div class="hp-header-text">
          <div class="hp-title">
            ${this.esc(
              this.config?.title || "Tasks"
            )}
          </div>

          <div class="hp-subtitle">
            Recurring preparedness checks
          </div>
        </div>
      </div>
    `;
  }

  renderSummary() {
    if (
      this.config?.show_summary === false ||
      !this._summary
    ) {
      return "";
    }

    const summary = this._summary;
    const status = summary.status || "ok";
    const banner =
      status === "critical"
        ? "Tasks require action"
        : status === "attention"
          ? "Tasks require attention"
          : "Tasks are up to date";

    return `
      <div class="hp-status-banner hp-${status}">
        ${this.esc(banner)}
      </div>

      <div class="hp-summary-grid">
        ${[
          ["Overdue", summary.overdue || 0, "critical"],
          ["Due", summary.due || 0, "attention"],
          ["Upcoming", summary.upcoming || 0, "attention"],
          ["OK", summary.ok || 0, "ok"]
        ]
          .map(
            ([label, value, level]) => `
              <div class="hp-metric">
                <div class="hp-metric-value hp-${level}-text">
                  ${this.esc(value)}
                </div>
                <div class="hp-metric-label">
                  ${this.esc(label)}
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  renderTask(task) {
    const category =
      this.getCategory(task.category);

    const level =
      this.statusLevel(task.status);

    const icon =
      task.task_kind === "inspection"
        ? (
            category?.icon ||
            "mdi:clipboard-search-outline"
          )
        : (
            category?.icon ||
            "mdi:checkbox-marked-circle-outline"
          );

    const recurrence =
      this.config?.show_recurrence !== false
        ? this.recurrenceLabel(task)
        : null;

    const linked =
      this.config?.show_linked_item !== false &&
      task.linked_item
        ? task.linked_item.name
        : null;

    const meta = [
      task.task_kind === "inspection"
        ? "Inspection"
        : "Task",
      recurrence,
      linked ? `Linked: ${linked}` : null
    ].filter(Boolean);

    const busy =
      this._busyTaskId === task.id;

    return `
      <div class="hp-task hp-${level}">
        <div class="hp-task-icon">
          <ha-icon
            icon="${this.esc(icon)}"
          ></ha-icon>
        </div>

        <div class="hp-task-main">
          <div class="hp-task-name">
            ${this.esc(task.name)}
          </div>

          <div class="hp-task-meta">
            ${this.esc(meta.join(" • "))}
          </div>

          <div class="hp-task-due">
            <ha-icon
              icon="mdi:calendar-clock-outline"
            ></ha-icon>
            <span>
              ${this.esc(
                this.formatDate(task.next_due_at)
              )}
            </span>
          </div>
        </div>

        <div class="hp-task-side">
          <div class="hp-task-status hp-${level}-text">
            ${this.esc(
              this.statusLabel(task.status)
            )}
          </div>

          ${
            this.config?.show_complete !== false &&
            task.enabled !== false
              ? `
                <button
                  type="button"
                  class="hp-complete"
                  data-complete-task="${this.esc(task.id)}"
                  ${busy ? "disabled" : ""}
                >
                  <ha-icon
                    icon="${
                      busy
                        ? "mdi:loading"
                        : "mdi:check"
                    }"
                  ></ha-icon>
                  <span>
                    ${busy ? "Saving" : "Complete"}
                  </span>
                </button>
              `
              : ""
          }
        </div>
      </div>
    `;
  }

  async handleClick(event) {
    const button =
      event.composedPath().find(
        (element) =>
          element instanceof HTMLElement &&
          element.dataset?.completeTask
      );

    if (!button || this._busyTaskId) {
      return;
    }

    const taskId =
      button.dataset.completeTask;

    this._busyTaskId = taskId;
    this.render();

    try {
      await this._hass.callWS({
        type: "homeprep/task/complete",
        task_id: taskId
      });

      await this.loadData();
    } catch (error) {
      console.error(
        "HomePrep task completion failed",
        error
      );

      window.alert(
        "HomePrep could not complete the task."
      );
    } finally {
      this._busyTaskId = null;
      this.render();
    }
  }

  styles() {
    return `
      ${window.HomePrepUI.baseStyles()}

      <style>
        .hp-header {
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:12px;
        }

        .hp-header-icon,
        .hp-task-icon {
          display:flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
          border-radius:50%;
          color:var(--hp-accent);
          background:
            color-mix(
              in srgb,
              var(--hp-accent) 14%,
              transparent
            );
        }

        .hp-header-icon {
          width:38px;
          height:38px;
        }

        .hp-task-icon {
          width:34px;
          height:34px;
        }

        .hp-header-text,
        .hp-task-main {
          flex:1;
          min-width:0;
        }

        .hp-title {
          font-size:16px;
          font-weight:700;
          color:var(--hp-primary);
        }

        .hp-subtitle {
          margin-top:2px;
          font-size:9px;
          color:var(--hp-secondary);
        }

        .hp-status-banner {
          padding:10px 12px;
          margin-bottom:8px;
          border-radius:
            calc(var(--hp-radius) - 4px);
          font-size:12px;
          font-weight:700;
        }

        .hp-status-banner.hp-ok {
          background:
            color-mix(
              in srgb,
              var(--hp-ok) 12%,
              transparent
            );
        }

        .hp-status-banner.hp-attention {
          background:
            color-mix(
              in srgb,
              var(--hp-attention) 12%,
              transparent
            );
        }

        .hp-status-banner.hp-critical {
          background:
            color-mix(
              in srgb,
              var(--hp-critical) 12%,
              transparent
            );
        }

        .hp-summary-grid {
          display:grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap:7px;
          margin-bottom:10px;
        }

        .hp-metric {
          min-width:0;
          padding:8px 9px;
          border:1px solid var(--hp-border);
          border-radius:
            calc(var(--hp-radius) - 4px);
          background:
            color-mix(
              in srgb,
              var(--hp-bg) 94%,
              var(--hp-primary) 6%
            );
        }

        .hp-metric-value {
          font-size:18px;
          font-weight:800;
        }

        .hp-metric-label {
          margin-top:2px;
          font-size:8px;
          color:var(--hp-secondary);
        }

        .hp-list {
          display:flex;
          flex-direction:column;
          gap:7px;
        }

        .hp-task {
          display:grid;
          grid-template-columns:
            auto minmax(0,1fr) auto;
          align-items:center;
          gap:10px;
          padding:10px;
          border:1px solid var(--hp-border);
          border-left-width:3px;
          border-radius:
            calc(var(--hp-radius) - 4px);
          background:
            color-mix(
              in srgb,
              var(--hp-bg) 95%,
              var(--hp-primary) 5%
            );
        }

        .hp-task.hp-critical {
          border-left-color:var(--hp-critical);
        }

        .hp-task.hp-attention {
          border-left-color:var(--hp-attention);
        }

        .hp-task.hp-ok {
          border-left-color:var(--hp-ok);
        }

        .hp-task-name {
          font-size:11px;
          font-weight:700;
          color:var(--hp-primary);
        }

        .hp-task-meta {
          margin-top:2px;
          font-size:8px;
          line-height:1.35;
          color:var(--hp-secondary);
        }

        .hp-task-due {
          display:flex;
          align-items:center;
          gap:4px;
          margin-top:5px;
          font-size:9px;
          color:var(--hp-secondary);
        }

        .hp-task-due ha-icon {
          --mdc-icon-size:13px;
        }

        .hp-task-side {
          display:flex;
          flex-direction:column;
          align-items:flex-end;
          gap:7px;
        }

        .hp-task-status {
          font-size:9px;
          font-weight:700;
          white-space:nowrap;
        }

        .hp-complete {
          display:flex;
          align-items:center;
          gap:4px;
          min-height:30px;
          padding:5px 9px;
          border:1px solid
            color-mix(
              in srgb,
              var(--hp-ok) 45%,
              var(--hp-border)
            );
          border-radius:9px;
          color:var(--hp-primary);
          background:
            color-mix(
              in srgb,
              var(--hp-ok) 12%,
              transparent
            );
          cursor:pointer;
          font:inherit;
          font-size:9px;
          font-weight:700;
        }

        .hp-complete:hover {
          background:
            color-mix(
              in srgb,
              var(--hp-ok) 22%,
              transparent
            );
        }

        .hp-complete:disabled {
          opacity:.55;
          cursor:default;
        }

        .hp-complete ha-icon {
          --mdc-icon-size:15px;
        }

        .hp-empty {
          padding:18px 8px;
          text-align:center;
          font-size:10px;
          color:var(--hp-secondary);
        }

        @media(max-width:520px) {
          .hp-summary-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .hp-task {
            grid-template-columns:
              auto minmax(0,1fr);
          }

          .hp-task-side {
            grid-column:2;
            align-items:flex-start;
          }
        }
      </style>
    `;
  }

  render() {
    if (!this._hass) return;

    if (this._error) {
      this.innerHTML = `
        <ha-card
          style="${window.HomePrepUI.styleVars(this.config)}"
        >
          ${this.styles()}
          <div class="hp-card">
            ${this.renderHeader()}
            <div class="hp-empty">
              HomePrep task data is unavailable.
            </div>
          </div>
        </ha-card>
      `;
      return;
    }

    const tasks = this.filteredTasks();

    this.innerHTML = `
      <ha-card
        style="${window.HomePrepUI.styleVars(this.config)}"
      >
        ${this.styles()}
        <div class="hp-card">
          ${this.renderHeader()}
          ${this.renderSummary()}

          ${
            tasks.length
              ? `
                <div class="hp-list">
                  ${tasks
                    .map((task) => this.renderTask(task))
                    .join("")}
                </div>
              `
              : `
                <div class="hp-empty">
                  No tasks match this card's filters.
                </div>
              `
          }
        </div>
      </ha-card>
    `;
  }
}

if (!customElements.get("homeprep-tasks-card")) {
  customElements.define(
    "homeprep-tasks-card",
    HomePrepTasksCard
  );
}

window.customCards = window.customCards || [];

if (
  !window.customCards.some(
    (card) => card.type === "homeprep-tasks-card"
  )
) {
  window.customCards.push({
    type: "homeprep-tasks-card",
    name: "HomePrep Tasks",
    description:
      "Configurable recurring tasks card for HomePrep"
  });
}
