class HomePrepCardBase extends HTMLElement {
  constructor() {
    super();

    this._items = [];
    this._taxonomy = {
      categories: [],
      item_types: [],
      units: [],
    };
    this._summary = null;
    this._loading = false;
    this._error = null;
    this._loaded = false;

    this.addEventListener(
      "click",
      (event) => this.handleCommonClick(event)
    );
  }

  setConfig(config) {
    this.config = config || {};
  }

  set hass(hass) {
    const firstLoad = !this._hass;
    this._hass = hass;

    if (firstLoad) {
      this.loadData();
    }
  }

  connectedCallback() {
    if (!this._refreshTimer) {
      this._refreshTimer =
        window.setInterval(
          () => this.loadData(),
          30000
        );
    }
  }

  disconnectedCallback() {
    if (this._refreshTimer) {
      window.clearInterval(
        this._refreshTimer
      );

      this._refreshTimer = null;
    }
  }

  getCardSize() {
    return 4;
  }

  escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  parseDate(value) {
    if (!value) return null;

    const date =
      new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  today() {
    const now = new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
  }

  daysBetween(a, b) {
    return Math.round(
      (b.getTime() - a.getTime())
      / 86400000
    );
  }

  getItemStatus(item) {
    const today = this.today();
    const expires =
      this.parseDate(item.expires_at);
    const nextCheck =
      this.parseDate(item.next_check_at);

    if (expires && expires < today) {
      return {
        level: "critical",
        label: "Expired",
        detail:
          `${Math.abs(
            this.daysBetween(
              today,
              expires
            )
          )} d overdue`,
      };
    }

    if (
      nextCheck &&
      nextCheck <= today
    ) {
      return {
        level: "critical",
        label: "Check due",
        detail:
          nextCheck < today
            ? `${Math.abs(
                this.daysBetween(
                  today,
                  nextCheck
                )
              )} d overdue`
            : "Due today",
      };
    }

    if (expires) {
      const days =
        this.daysBetween(
          today,
          expires
        );

      if (days >= 0 && days <= 30) {
        return {
          level: "attention",
          label: "Expiring",
          detail: `${days} d`,
        };
      }
    }

    return {
      level: "ok",
      label: "OK",
      detail: "",
    };
  }

  async handleCommonClick(event) {
    const target =
      event.composedPath().find(
        (element) =>
          element instanceof HTMLElement &&
          element.dataset?.action === "refresh-homeprep"
      );

    if (!target) {
      return;
    }

    event.preventDefault();
    await this.loadData();
  }

  async loadData() {
    if (!this._hass || this._loading) {
      return;
    }

    this._loading = true;

    if (!this._loaded) {
      this.render();
    }

    try {
      const [
        itemsResult,
        taxonomyResult,
        summaryResult,
      ] = await Promise.all([
        this._hass.callWS({
          type: "homeprep/items",
        }),
        this._hass.callWS({
          type: "homeprep/taxonomy",
        }),
        this._hass.callWS({
          type: "homeprep/summary",
        }),
      ]);

      this._items =
        itemsResult.items ?? [];

      this._taxonomy = {
        categories:
          taxonomyResult.categories ?? [],
        item_types:
          taxonomyResult.item_types ?? [],
        units:
          taxonomyResult.units ?? [],
      };

      this._summary =
        summaryResult ?? null;

      this._error = null;
      this._loaded = true;
    } catch (error) {
      console.error(
        "HomePrep card load failed",
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
        (entry) => entry.id === id
      ) ?? null
    );
  }

  getUnit(id) {
    return (
      this._taxonomy.units.find(
        (entry) => entry.id === id
      ) ?? null
    );
  }

  getUnitDisplay(id) {
    const unit = this.getUnit(id);

    if (!unit) return id ?? "";

    return unit.symbol || unit.label;
  }

  getItemsForCategory(categoryId) {
    return this._items.filter(
      (item) =>
        item.category === categoryId
    );
  }

  getItemsForGroup(group) {
    const categoryIds =
      new Set(
        this._taxonomy.categories
          .filter(
            (category) =>
              category.group === group
          )
          .map(
            (category) =>
              category.id
          )
      );

    return this._items.filter(
      (item) =>
        categoryIds.has(item.category)
    );
  }

  getCategorySummary(categoryId) {
    const items =
      this.getItemsForCategory(
        categoryId
      );

    let critical = 0;
    let attention = 0;

    items.forEach((item) => {
      const status =
        this.getItemStatus(item);

      if (
        status.level === "critical"
      ) {
        critical += 1;
      } else if (
        status.level === "attention"
      ) {
        attention += 1;
      }
    });

    return {
      count: items.length,
      critical,
      attention,
      status:
        critical > 0
          ? "critical"
          : attention > 0
            ? "attention"
            : "ok",
    };
  }

  renderHeader(
    title,
    subtitle,
    icon = "mdi:shield-home"
  ) {
    return `
      <div class="hp-header">
        <div class="hp-header-icon">
          <ha-icon
            icon="${this.escapeHtml(icon)}"
          ></ha-icon>
        </div>

        <div class="hp-header-text">
          <div class="hp-title">
            ${this.escapeHtml(title)}
          </div>

          ${
            subtitle
              ? `
                <div class="hp-subtitle">
                  ${this.escapeHtml(subtitle)}
                </div>
              `
              : ""
          }
        </div>

        <button
          type="button"
          class="hp-icon-button"
          data-action="refresh-homeprep"
        >
          <ha-icon icon="mdi:refresh"></ha-icon>
        </button>
      </div>
    `;
  }

  renderLoadingCard(title = "HomePrep") {
    return `
      <ha-card>
        ${this.styles()}
        <div class="hp-card">
          ${this.renderHeader(
            title,
            "Loading...",
            "mdi:shield-home"
          )}

          <div class="hp-empty">
            Loading HomePrep...
          </div>
        </div>
      </ha-card>
    `;
  }

  renderErrorCard(title = "HomePrep") {
    return `
      <ha-card>
        ${this.styles()}
        <div class="hp-card">
          ${this.renderHeader(
            title,
            "Could not load data",
            "mdi:alert-circle"
          )}

          <div class="hp-empty hp-critical-text">
            HomePrep data is unavailable.
          </div>
        </div>
      </ha-card>
    `;
  }

  renderItemRow(item) {
    const category =
      this.getCategory(item.category);

    const status =
      this.getItemStatus(item);

    return `
      <div class="hp-item">
        <div class="hp-item-icon">
          <ha-icon
            icon="${this.escapeHtml(
              category?.icon
              ?? "mdi:package-variant"
            )}"
          ></ha-icon>
        </div>

        <div class="hp-item-main">
          <div class="hp-item-name">
            ${this.escapeHtml(
              item.name
            )}
          </div>

          <div class="hp-item-meta">
            ${this.escapeHtml(
              category?.label
              ?? item.category
            )}
            •
            ${this.escapeHtml(
              item.quantity
            )}
            ${this.escapeHtml(
              this.getUnitDisplay(
                item.unit
              )
            )}
          </div>
        </div>

        <div
          class="hp-status-text hp-${status.level}-text"
        >
          ${this.escapeHtml(
            status.label
          )}
          ${
            status.detail
              ? `<small>${this.escapeHtml(
                  status.detail
                )}</small>`
              : ""
          }
        </div>
      </div>
    `;
  }

  styles() {
    return `
      <style>
        .hp-card {
          padding: 14px;
        }

        .hp-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .hp-header-icon,
        .hp-category-icon,
        .hp-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #2196f3;
          background:
            rgba(33,150,243,.12);
          flex-shrink: 0;
        }

        .hp-header-icon {
          width: 38px;
          height: 38px;
        }

        .hp-category-icon {
          width: 34px;
          height: 34px;
        }

        .hp-item-icon {
          width: 32px;
          height: 32px;
        }

        .hp-header-text {
          flex: 1;
          min-width: 0;
        }

        .hp-title {
          font-size: 16px;
          font-weight: 700;
        }

        .hp-subtitle {
          margin-top: 2px;
          font-size: 9px;
          color:
            var(--secondary-text-color);
        }

        .hp-icon-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          cursor: pointer;
          color:
            var(--primary-text-color);
          background:
            rgba(128,128,128,.10);
        }

        .hp-grid {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 8px;
        }

        .hp-metric {
          padding: 10px;
          border: 1px solid
            var(--divider-color);
          border-radius: 10px;
          background:
            rgba(128,128,128,.04);
        }

        .hp-metric-value {
          font-size: 20px;
          font-weight: 800;
        }

        .hp-metric-label {
          margin-top: 2px;
          font-size: 9px;
          color:
            var(--secondary-text-color);
        }

        .hp-status-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px;
          margin-bottom: 10px;
          border-radius: 10px;
        }

        .hp-status-banner.hp-ok {
          background:
            rgba(76,175,80,.10);
        }

        .hp-status-banner.hp-attention {
          background:
            rgba(255,152,0,.10);
        }

        .hp-status-banner.hp-critical {
          background:
            rgba(244,67,54,.10);
        }

        .hp-status-banner strong {
          font-size: 12px;
        }

        .hp-category {
          border: 1px solid
            var(--divider-color);
          border-radius: 11px;
          overflow: hidden;
        }

        .hp-category-head {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px;
          background:
            rgba(128,128,128,.04);
        }

        .hp-category-title {
          flex: 1;
          font-size: 12px;
          font-weight: 700;
        }

        .hp-category-count {
          font-size: 9px;
          color:
            var(--secondary-text-color);
        }

        .hp-category-list {
          display: flex;
          flex-direction: column;
        }

        .hp-item {
          display: grid;
          grid-template-columns:
            auto
            minmax(0,1fr)
            auto;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
          border-top: 1px solid
            var(--divider-color);
        }

        .hp-item-name {
          font-size: 11px;
          font-weight: 700;
        }

        .hp-item-meta {
          margin-top: 2px;
          font-size: 8px;
          color:
            var(--secondary-text-color);
        }

        .hp-status-text {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 9px;
          font-weight: 700;
        }

        .hp-status-text small {
          margin-top: 1px;
          font-size: 8px;
          font-weight: 400;
          color:
            var(--secondary-text-color);
        }

        .hp-ok-text {
          color:
            var(--success-color,#4caf50);
        }

        .hp-attention-text {
          color:
            var(--warning-color,#ff9800);
        }

        .hp-critical-text {
          color:
            var(--error-color,#f44336);
        }

        .hp-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hp-empty {
          padding: 18px 8px;
          text-align: center;
          font-size: 10px;
          color:
            var(--secondary-text-color);
        }

        @media (max-width: 500px) {
          .hp-grid {
            grid-template-columns: 1fr 1fr;
          }

          .hp-item {
            grid-template-columns:
              auto
              minmax(0,1fr);
          }

          .hp-status-text {
            grid-column: 2;
            align-items: flex-start;
          }
        }
      </style>
    `;
  }
}


class HomePrepStatusCard extends HomePrepCardBase {
  render() {
    if (!this._hass) return;

    if (!this._loaded && this._loading) {
      this.innerHTML =
        this.renderLoadingCard("HomePrep");
      return;
    }

    if (this._error || !this._summary) {
      this.innerHTML =
        this.renderErrorCard("HomePrep");
      return;
    }

    const status =
      this._summary.status ?? "ok";

    const label =
      status === "critical"
        ? "Action required"
        : status === "attention"
          ? "Requires attention"
          : "Home is ready";

    this.innerHTML = `
      <ha-card>
        ${this.styles()}

        <div class="hp-card">
          ${this.renderHeader(
            this.config?.title
            ?? "HomePrep",
            "Preparedness overview",
            "mdi:shield-home"
          )}

          <div
            class="hp-status-banner hp-${status}"
          >
            <strong>
              ${this.escapeHtml(label)}
            </strong>

            <ha-icon
              icon="${
                status === "critical"
                  ? "mdi:alert-circle"
                  : status === "attention"
                    ? "mdi:alert"
                    : "mdi:check-circle"
              }"
            ></ha-icon>
          </div>

          <div class="hp-grid">
            <div class="hp-metric">
              <div class="hp-metric-value">
                ${this._summary.items ?? 0}
              </div>
              <div class="hp-metric-label">
                Inventory
              </div>
            </div>

            <div class="hp-metric">
              <div class="hp-metric-value">
                ${this._summary.expired ?? 0}
              </div>
              <div class="hp-metric-label">
                Expired
              </div>
            </div>

            <div class="hp-metric">
              <div class="hp-metric-value">
                ${this._summary.expiring_soon ?? 0}
              </div>
              <div class="hp-metric-label">
                Expiring soon
              </div>
            </div>

            <div class="hp-metric">
              <div class="hp-metric-value">
                ${this._summary.due_for_check ?? 0}
              </div>
              <div class="hp-metric-label">
                Check required
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }
}


class HomePrepCategoryCard extends HomePrepCardBase {
  render() {
    if (!this._hass) return;

    if (!this._loaded && this._loading) {
      this.innerHTML =
        this.renderLoadingCard(
          this.config?.title
          ?? "HomePrep category"
        );
      return;
    }

    if (this._error) {
      this.innerHTML =
        this.renderErrorCard(
          this.config?.title
          ?? "HomePrep category"
        );
      return;
    }

    const categoryId =
      this.config?.category
      ?? this._taxonomy.categories[0]?.id;

    const category =
      this.getCategory(categoryId);

    if (!category) {
      this.innerHTML =
        this.renderErrorCard(
          "Unknown category"
        );
      return;
    }

    const items =
      this.getItemsForCategory(
        categoryId
      );

    const summary =
      this.getCategorySummary(
        categoryId
      );

    const showItems =
      this.config?.show_items !== false;

    this.innerHTML = `
      <ha-card>
        ${this.styles()}

        <div class="hp-card">
          ${this.renderHeader(
            this.config?.title
            ?? category.label,
            `${summary.count} ${
              summary.count === 1
                ? "item"
                : "items"
            }`,
            category.icon
          )}

          <div
            class="hp-status-banner hp-${summary.status}"
          >
            <strong>
              ${
                summary.status === "critical"
                  ? `${summary.critical} require action`
                  : summary.status === "attention"
                    ? `${summary.attention} require attention`
                    : "All OK"
              }
            </strong>
          </div>

          ${
            showItems
              ? (
                  items.length
                    ? `
                      <div class="hp-stack">
                        ${items
                          .map(
                            (item) =>
                              this.renderItemRow(item)
                          )
                          .join("")}
                      </div>
                    `
                    : `
                      <div class="hp-empty">
                        No items in this category.
                      </div>
                    `
                )
              : ""
          }
        </div>
      </ha-card>
    `;
  }
}


class HomePrepGroupCard extends HomePrepCardBase {
  render() {
    if (!this._hass) return;

    if (!this._loaded && this._loading) {
      this.innerHTML =
        this.renderLoadingCard(
          this.config?.title
          ?? "HomePrep group"
        );
      return;
    }

    if (this._error) {
      this.innerHTML =
        this.renderErrorCard(
          this.config?.title
          ?? "HomePrep group"
        );
      return;
    }

    const group =
      this.config?.group
      ?? this._taxonomy.categories[0]?.group
      ?? "Essentials";

    const categories =
      this._taxonomy.categories.filter(
        (category) =>
          category.group === group
      );

    this.innerHTML = `
      <ha-card>
        ${this.styles()}

        <div class="hp-card">
          ${this.renderHeader(
            this.config?.title ?? group,
            `${categories.length} categories`,
            "mdi:view-grid"
          )}

          <div class="hp-stack">
            ${categories
              .map((category) => {
                const summary =
                  this.getCategorySummary(
                    category.id
                  );

                return `
                  <div class="hp-category">
                    <div class="hp-category-head">
                      <div class="hp-category-icon">
                        <ha-icon
                          icon="${this.escapeHtml(
                            category.icon
                          )}"
                        ></ha-icon>
                      </div>

                      <div class="hp-category-title">
                        ${this.escapeHtml(
                          category.label
                        )}
                      </div>

                      <div
                        class="hp-category-count hp-${summary.status}-text"
                      >
                        ${summary.count}
                        ${
                          summary.count === 1
                            ? "item"
                            : "items"
                        }
                      </div>
                    </div>

                    ${
                      this.config?.show_items === true
                        ? `
                          <div class="hp-category-list">
                            ${this.getItemsForCategory(
                              category.id
                            )
                              .map(
                                (item) =>
                                  this.renderItemRow(item)
                              )
                              .join("")}
                          </div>
                        `
                        : ""
                    }
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      </ha-card>
    `;
  }
}


class HomePrepAttentionCard extends HomePrepCardBase {
  render() {
    if (!this._hass) return;

    if (!this._loaded && this._loading) {
      this.innerHTML =
        this.renderLoadingCard(
          this.config?.title
          ?? "Requires attention"
        );
      return;
    }

    if (this._error) {
      this.innerHTML =
        this.renderErrorCard(
          this.config?.title
          ?? "Requires attention"
        );
      return;
    }

    const include =
      Array.isArray(
        this.config?.include
      )
        ? this.config.include
        : [
            "critical",
            "attention",
          ];

    const maxItems =
      Number(
        this.config?.max_items
        ?? 12
      );

    const items =
      this._items
        .map((item) => ({
          item,
          status:
            this.getItemStatus(item),
        }))
        .filter(
          ({ status }) =>
            include.includes(
              status.level
            )
        )
        .sort((a, b) => {
          const rank = {
            critical: 0,
            attention: 1,
            ok: 2,
          };

          return (
            rank[a.status.level]
            - rank[b.status.level]
          );
        })
        .slice(0, maxItems);

    this.innerHTML = `
      <ha-card>
        ${this.styles()}

        <div class="hp-card">
          ${this.renderHeader(
            this.config?.title
            ?? "Requires attention",
            `${items.length} shown`,
            "mdi:alert-circle-outline"
          )}

          ${
            items.length
              ? `
                <div class="hp-stack">
                  ${items
                    .map(
                      ({ item }) =>
                        this.renderItemRow(item)
                    )
                    .join("")}
                </div>
              `
              : `
                <div class="hp-empty">
                  Nothing requires attention.
                </div>
              `
          }
        </div>
      </ha-card>
    `;
  }
}


class HomePrepInventoryCard extends HomePrepCardBase {
  constructor() {
    super();

    this._collapsedCategories =
      new Set();

    this.addEventListener(
      "click",
      (event) => {
        const target =
          event.composedPath().find(
            (element) =>
              element instanceof HTMLElement &&
              (
                element.dataset?.action
                === "toggle-category"
                ||
                element.dataset?.action
                === "expand-all"
                ||
                element.dataset?.action
                === "collapse-all"
              )
          );

        if (!target) return;

        event.preventDefault();
        event.stopPropagation();

        if (
          target.dataset.action
          === "toggle-category"
        ) {
          const id =
            target.dataset.category;

          if (
            this._collapsedCategories.has(id)
          ) {
            this._collapsedCategories.delete(id);
          } else {
            this._collapsedCategories.add(id);
          }
        }

        if (
          target.dataset.action
          === "expand-all"
        ) {
          this._collapsedCategories.clear();
        }

        if (
          target.dataset.action
          === "collapse-all"
        ) {
          this._taxonomy.categories.forEach(
            (category) =>
              this._collapsedCategories.add(
                category.id
              )
          );
        }

        this.render();
      }
    );
  }

  render() {
    if (!this._hass) return;

    if (!this._loaded && this._loading) {
      this.innerHTML =
        this.renderLoadingCard(
          this.config?.title
          ?? "Inventory"
        );
      return;
    }

    if (this._error) {
      this.innerHTML =
        this.renderErrorCard(
          this.config?.title
          ?? "Inventory"
        );
      return;
    }

    const categoryFilter =
      this.config?.category;

    const groupFilter =
      this.config?.group;

    let categories =
      this._taxonomy.categories;

    if (categoryFilter) {
      categories =
        categories.filter(
          (category) =>
            category.id
            === categoryFilter
        );
    }

    if (groupFilter) {
      categories =
        categories.filter(
          (category) =>
            category.group
            === groupFilter
        );
    }

    const blocks =
      categories
        .map((category) => {
          const items =
            this.getItemsForCategory(
              category.id
            );

          if (!items.length) {
            return "";
          }

          const collapsed =
            this._collapsedCategories.has(
              category.id
            );

          const summary =
            this.getCategorySummary(
              category.id
            );

          return `
            <div class="hp-category">
              <button
                type="button"
                class="hp-category-head"
                data-action="toggle-category"
                data-category="${this.escapeHtml(
                  category.id
                )}"
                style="
                  width:100%;
                  border:0;
                  color:inherit;
                  cursor:pointer;
                  text-align:left;
                "
              >
                <div class="hp-category-icon">
                  <ha-icon
                    icon="${this.escapeHtml(
                      category.icon
                    )}"
                  ></ha-icon>
                </div>

                <div class="hp-category-title">
                  ${this.escapeHtml(
                    category.label
                  )}
                </div>

                <div
                  class="hp-category-count hp-${summary.status}-text"
                >
                  ${summary.count}
                  ${
                    summary.count === 1
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
                  : `
                    <div class="hp-category-list">
                      ${items
                        .map(
                          (item) =>
                            this.renderItemRow(item)
                        )
                        .join("")}
                    </div>
                  `
              }
            </div>
          `;
        })
        .join("");

    this.innerHTML = `
      <ha-card>
        ${this.styles()}

        <style>
          .hp-inventory-controls {
            display: flex;
            justify-content: flex-end;
            gap: 6px;
            margin-bottom: 8px;
          }

          .hp-small-button {
            padding: 6px 8px;
            border: 1px solid
              var(--divider-color);
            border-radius: 8px;
            cursor: pointer;
            color:
              var(--secondary-text-color);
            background: transparent;
            font-size: 9px;
          }
        </style>

        <div class="hp-card">
          ${this.renderHeader(
            this.config?.title
            ?? "Inventory",
            `${this._items.length} total items`,
            "mdi:package-variant-closed"
          )}

          <div class="hp-inventory-controls">
            <button
              class="hp-small-button"
              type="button"
              data-action="expand-all"
            >
              Expand all
            </button>

            <button
              class="hp-small-button"
              type="button"
              data-action="collapse-all"
            >
              Collapse all
            </button>
          </div>

          <div class="hp-stack">
            ${
              blocks.trim()
                ? blocks
                : `
                  <div class="hp-empty">
                    No matching inventory items.
                  </div>
                `
            }
          </div>
        </div>
      </ha-card>
    `;
  }
}


const cards = [
  [
    "homeprep-status-card",
    HomePrepStatusCard,
    "HomePrep Status",
    "Preparedness overview and status"
  ],
  [
    "homeprep-category-card",
    HomePrepCategoryCard,
    "HomePrep Category",
    "Show one HomePrep category"
  ],
  [
    "homeprep-group-card",
    HomePrepGroupCard,
    "HomePrep Group",
    "Show a HomePrep category group"
  ],
  [
    "homeprep-attention-card",
    HomePrepAttentionCard,
    "HomePrep Attention",
    "Show items that require attention"
  ],
  [
    "homeprep-inventory-card",
    HomePrepInventoryCard,
    "HomePrep Inventory",
    "Browsable category-based inventory"
  ],
];

window.customCards =
  window.customCards || [];

cards.forEach(
  ([tag, cardClass, name, description]) => {
    if (!customElements.get(tag)) {
      customElements.define(
        tag,
        cardClass
      );
    }

    window.customCards.push({
      type: tag,
      name,
      description,
    });
  }
);
