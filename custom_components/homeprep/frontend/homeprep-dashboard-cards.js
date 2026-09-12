class HomePrepCardBase extends HTMLElement {
  constructor() {
    super();

    this._items = [];
    this._taxonomy = {
      categories: [],
      item_types: [],
      units: []
    };
    this._summary = null;
    this._loading = false;
    this._loaded = false;
    this._error = null;
  }

  static getConfigElement() {
    return document.createElement(
      "homeprep-card-editor"
    );
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    this.config = config || {};
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
      this._timer =
        window.setInterval(
          () => this.loadData(),
          30000
        );
    }
  }

  disconnectedCallback() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  getCardSize() {
    return 4;
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
      const [
        items,
        taxonomy,
        summary
      ] = await Promise.all([
        this._hass.callWS({
          type: "homeprep/items"
        }),
        this._hass.callWS({
          type: "homeprep/taxonomy"
        }),
        this._hass.callWS({
          type: "homeprep/summary"
        })
      ]);

      this._items =
        items.items ?? [];

      this._taxonomy = {
        categories:
          taxonomy.categories ?? [],
        item_types:
          taxonomy.item_types ?? [],
        units:
          taxonomy.units ?? []
      };

      this._summary = summary;
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

  parseDate(value) {
    if (!value) return null;

    const d =
      new Date(`${value}T00:00:00`);

    return Number.isNaN(d.getTime())
      ? null
      : d;
  }

  today() {
    const n = new Date();

    return new Date(
      n.getFullYear(),
      n.getMonth(),
      n.getDate()
    );
  }

  getItemStatus(item) {
    const today = this.today();
    const expires =
      this.parseDate(item.expires_at);
    const check =
      this.parseDate(item.next_check_at);

    if (expires && expires < today) {
      return {
        level: "critical",
        label: "Expired"
      };
    }

    if (check && check <= today) {
      return {
        level: "critical",
        label: "Check due"
      };
    }

    if (expires) {
      const days =
        Math.round(
          (expires - today)
          / 86400000
        );

      if (
        days >= 0 &&
        days <= 30
      ) {
        return {
          level: "attention",
          label: `Expiring • ${days} d`
        };
      }
    }

    return {
      level: "ok",
      label: "OK"
    };
  }

  getCategory(id) {
    return (
      this._taxonomy.categories.find(
        (x) => x.id === id
      ) || null
    );
  }

  getUnit(id) {
    return (
      this._taxonomy.units.find(
        (x) => x.id === id
      ) || null
    );
  }

  getUnitDisplay(id) {
    const u = this.getUnit(id);

    return u
      ? (u.symbol || u.label)
      : id || "";
  }

  itemsForCategory(id) {
    return this._items.filter(
      (item) =>
        item.category === id
    );
  }

  categorySummary(id) {
    const items =
      this.itemsForCategory(id);

    let critical = 0;
    let attention = 0;

    items.forEach((item) => {
      const s =
        this.getItemStatus(item);

      if (s.level === "critical") {
        critical++;
      } else if (
        s.level === "attention"
      ) {
        attention++;
      }
    });

    return {
      count: items.length,
      critical,
      attention,
      status:
        critical
          ? "critical"
          : attention
            ? "attention"
            : "ok"
    };
  }

  renderHeader(
    title,
    subtitle,
    icon
  ) {
    return `
      <div class="hp-header">
        <div class="hp-header-icon">
          <ha-icon
            icon="${this.esc(
              icon || "mdi:shield-home"
            )}"
          ></ha-icon>
        </div>

        <div class="hp-header-text">
          <div class="hp-title">
            ${this.esc(title)}
          </div>

          ${
            subtitle
              ? `
                <div class="hp-subtitle">
                  ${this.esc(subtitle)}
                </div>
              `
              : ""
          }
        </div>
      </div>
    `;
  }

  renderItem(item) {
    const category =
      this.getCategory(
        item.category
      );

    const status =
      this.getItemStatus(item);

    return `
      <div class="hp-item">
        <div class="hp-item-icon">
          <ha-icon
            icon="${this.esc(
              category?.icon
              || "mdi:package-variant"
            )}"
          ></ha-icon>
        </div>

        <div class="hp-item-main">
          <div class="hp-item-name">
            ${this.esc(item.name)}
          </div>

          <div class="hp-item-meta">
            ${this.esc(
              category?.label
              || item.category
            )}
            •
            ${this.esc(item.quantity)}
            ${this.esc(
              this.getUnitDisplay(
                item.unit
              )
            )}
          </div>
        </div>

        <div
          class="hp-item-status hp-${status.level}-text"
        >
          ${this.esc(
            status.label
          )}
        </div>
      </div>
    `;
  }

  commonStyles() {
    return `
      ${window.HomePrepUI.baseStyles()}

      <style>
        .hp-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .hp-header-icon,
        .hp-item-icon,
        .hp-category-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          color: var(--hp-accent);
          background:
            color-mix(
              in srgb,
              var(--hp-accent) 14%,
              transparent
            );
        }

        .hp-header-icon {
          width: 38px;
          height: 38px;
        }

        .hp-item-icon {
          width: 32px;
          height: 32px;
        }

        .hp-category-icon {
          width: 34px;
          height: 34px;
        }

        .hp-header-text {
          flex: 1;
          min-width: 0;
        }

        .hp-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--hp-primary);
        }

        .hp-subtitle,
        .hp-item-meta,
        .hp-category-subtitle {
          color: var(--hp-secondary);
        }

        .hp-subtitle {
          margin-top: 2px;
          font-size: 9px;
        }

        .hp-grid {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 8px;
        }

        .hp-metric,
        .hp-category {
          border:
            1px solid
            var(--hp-border);
          border-radius:
            calc(
              var(--hp-radius) - 3px
            );
          background:
            color-mix(
              in srgb,
              var(--hp-bg) 94%,
              var(--hp-primary) 6%
            );
        }

        .hp-metric {
          padding: 10px;
        }

        .hp-metric-value {
          font-size: 20px;
          font-weight: 800;
        }

        .hp-metric-label {
          margin-top: 2px;
          font-size: 9px;
          color: var(--hp-secondary);
        }

        .hp-status-banner {
          padding: 10px 12px;
          margin-bottom: 10px;
          border-radius:
            calc(
              var(--hp-radius) - 4px
            );
          font-size: 12px;
          font-weight: 700;
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

        .hp-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hp-item {
          display: grid;
          grid-template-columns:
            auto minmax(0,1fr) auto;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
        }

        .hp-item + .hp-item {
          border-top:
            1px solid
            var(--hp-border);
        }

        .hp-item-name {
          font-size: 11px;
          font-weight: 700;
        }

        .hp-item-meta {
          margin-top: 2px;
          font-size: 8px;
        }

        .hp-item-status {
          font-size: 9px;
          font-weight: 700;
          text-align: right;
        }

        .hp-category-head {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px;
        }

        .hp-category-title {
          flex: 1;
          font-size: 12px;
          font-weight: 700;
        }

        .hp-category-subtitle {
          font-size: 9px;
        }

        .hp-empty {
          padding: 18px 8px;
          text-align: center;
          font-size: 10px;
          color: var(--hp-secondary);
        }
      </style>
    `;
  }

  wrap(content) {
    return `
      <ha-card
        style="${window.HomePrepUI.styleVars(
          this.config
        )}"
      >
        ${this.commonStyles()}
        <div class="hp-card">
          ${content}
        </div>
      </ha-card>
    `;
  }
}


class HomePrepStatusCard extends HomePrepCardBase {
  render() {
    if (!this._hass) return;

    if (
      this._error ||
      (!this._summary &&
       !this._loading)
    ) {
      this.innerHTML =
        this.wrap(`
          ${this.renderHeader(
            "HomePrep",
            "Unavailable",
            "mdi:alert-circle"
          )}
          <div class="hp-empty">
            HomePrep data is unavailable.
          </div>
        `);
      return;
    }

    if (!this._summary) {
      this.innerHTML =
        this.wrap(`
          ${this.renderHeader(
            "HomePrep",
            "Loading...",
            "mdi:shield-home"
          )}
        `);
      return;
    }

    const s = this._summary;
    const status =
      s.status || "ok";

    const label =
      status === "critical"
        ? "Action required"
        : status === "attention"
          ? "Requires attention"
          : "Home is ready";

    this.innerHTML =
      this.wrap(`
        ${this.renderHeader(
          this.config?.title
          || "HomePrep",
          "Preparedness overview",
          "mdi:shield-home"
        )}

        <div
          class="hp-status-banner hp-${status}"
        >
          ${this.esc(label)}
        </div>

        <div class="hp-grid">
          ${[
            ["Inventory", s.items],
            ["Expired", s.expired],
            [
              "Expiring soon",
              s.expiring_soon
            ],
            [
              "Check required",
              s.due_for_check
            ]
          ]
            .map(
              ([labelText, value]) => `
                <div class="hp-metric">
                  <div class="hp-metric-value">
                    ${value ?? 0}
                  </div>
                  <div class="hp-metric-label">
                    ${this.esc(labelText)}
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      `);
  }
}


class HomePrepCategoryCard extends HomePrepCardBase {
  render() {
    if (!this._hass) return;

    const id =
      this.config?.category
      || this._taxonomy.categories[0]?.id;

    const category =
      this.getCategory(id);

    if (!category) {
      this.innerHTML =
        this.wrap(`
          ${this.renderHeader(
            "HomePrep Category",
            "Choose a category",
            "mdi:shape"
          )}
          <div class="hp-empty">
            Select a category in the visual editor.
          </div>
        `);
      return;
    }

    const summary =
      this.categorySummary(id);

    const items =
      this.itemsForCategory(id);

    this.innerHTML =
      this.wrap(`
        ${this.renderHeader(
          this.config?.title
          || category.label,
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
          ${
            summary.status === "critical"
              ? `${summary.critical} require action`
              : summary.status === "attention"
                ? `${summary.attention} require attention`
                : "All OK"
          }
        </div>

        ${
          this.config?.show_items
          !== false
            ? (
                items.length
                  ? `
                    <div class="hp-category">
                      ${items
                        .map(
                          (item) =>
                            this.renderItem(item)
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
      `);
  }
}


class HomePrepGroupCard extends HomePrepCardBase {
  render() {
    if (!this._hass) return;

    const group =
      this.config?.group
      || this._taxonomy.categories[0]?.group
      || "Essentials";

    const categories =
      this._taxonomy.categories.filter(
        (x) => x.group === group
      );

    this.innerHTML =
      this.wrap(`
        ${this.renderHeader(
          this.config?.title
          || group,
          `${categories.length} categories`,
          "mdi:view-grid"
        )}

        <div class="hp-stack">
          ${categories
            .map((category) => {
              const s =
                this.categorySummary(
                  category.id
                );

              const items =
                this.itemsForCategory(
                  category.id
                );

              return `
                <div class="hp-category">
                  <div class="hp-category-head">
                    <div class="hp-category-icon">
                      <ha-icon
                        icon="${this.esc(
                          category.icon
                        )}"
                      ></ha-icon>
                    </div>

                    <div class="hp-category-title">
                      ${this.esc(
                        category.label
                      )}
                    </div>

                    <div
                      class="hp-category-subtitle hp-${s.status}-text"
                    >
                      ${s.count}
                      ${
                        s.count === 1
                          ? "item"
                          : "items"
                      }
                    </div>
                  </div>

                  ${
                    this.config?.show_items
                    === true
                      ? items
                          .map(
                            (item) =>
                              this.renderItem(item)
                          )
                          .join("")
                      : ""
                  }
                </div>
              `;
            })
            .join("")}
        </div>
      `);
  }
}


class HomePrepAttentionCard extends HomePrepCardBase {
  render() {
    if (!this._hass) return;

    const max =
      Number(
        this.config?.max_items
        ?? 12
      );

    const items =
      this._items
        .filter(
          (item) =>
            this.getItemStatus(item)
              .level !== "ok"
        )
        .sort((a, b) => {
          const rank = {
            critical: 0,
            attention: 1,
            ok: 2
          };

          return (
            rank[
              this.getItemStatus(a)
                .level
            ]
            -
            rank[
              this.getItemStatus(b)
                .level
            ]
          );
        })
        .slice(0, max);

    this.innerHTML =
      this.wrap(`
        ${this.renderHeader(
          this.config?.title
          || "Requires attention",
          `${items.length} shown`,
          "mdi:alert-circle-outline"
        )}

        ${
          items.length
            ? `
              <div class="hp-category">
                ${items
                  .map(
                    (item) =>
                      this.renderItem(item)
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
      `);
  }
}


class HomePrepInventoryCard extends HomePrepCardBase {
  constructor() {
    super();

    this._collapsed =
      new Set();

    this.addEventListener(
      "click",
      (event) => {
        const target =
          event.composedPath().find(
            (el) =>
              el instanceof HTMLElement &&
              el.dataset?.category
          );

        if (!target) return;

        const id =
          target.dataset.category;

        if (
          this._collapsed.has(id)
        ) {
          this._collapsed.delete(id);
        } else {
          this._collapsed.add(id);
        }

        this.render();
      }
    );
  }

  render() {
    if (!this._hass) return;

    let categories =
      this._taxonomy.categories;

    if (this.config?.category) {
      categories =
        categories.filter(
          (x) =>
            x.id
            === this.config.category
        );
    }

    if (this.config?.group) {
      categories =
        categories.filter(
          (x) =>
            x.group
            === this.config.group
        );
    }

    const blocks =
      categories
        .map((category) => {
          const items =
            this.itemsForCategory(
              category.id
            );

          if (!items.length) {
            return "";
          }

          const collapsed =
            this._collapsed.has(
              category.id
            );

          const s =
            this.categorySummary(
              category.id
            );

          return `
            <div class="hp-category">
              <button
                type="button"
                data-category="${this.esc(
                  category.id
                )}"
                style="
                  width:100%;
                  border:0;
                  color:inherit;
                  background:transparent;
                  cursor:pointer;
                  padding:0;
                  text-align:left;
                "
              >
                <div class="hp-category-head">
                  <div class="hp-category-icon">
                    <ha-icon
                      icon="${this.esc(
                        category.icon
                      )}"
                    ></ha-icon>
                  </div>

                  <div class="hp-category-title">
                    ${this.esc(
                      category.label
                    )}
                  </div>

                  <div
                    class="hp-category-subtitle hp-${s.status}-text"
                  >
                    ${s.count}
                    ${
                      s.count === 1
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
                </div>
              </button>

              ${
                collapsed
                  ? ""
                  : items
                      .map(
                        (item) =>
                          this.renderItem(item)
                      )
                      .join("")
              }
            </div>
          `;
        })
        .join("");

    this.innerHTML =
      this.wrap(`
        ${this.renderHeader(
          this.config?.title
          || "Inventory",
          `${this._items.length} total items`,
          "mdi:package-variant-closed"
        )}

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
      `);
  }
}


const cards = [
  [
    "homeprep-status-card",
    HomePrepStatusCard,
    "HomePrep Status"
  ],
  [
    "homeprep-category-card",
    HomePrepCategoryCard,
    "HomePrep Category"
  ],
  [
    "homeprep-group-card",
    HomePrepGroupCard,
    "HomePrep Group"
  ],
  [
    "homeprep-attention-card",
    HomePrepAttentionCard,
    "HomePrep Attention"
  ],
  [
    "homeprep-inventory-card",
    HomePrepInventoryCard,
    "HomePrep Inventory"
  ]
];

window.customCards =
  window.customCards || [];

cards.forEach(
  ([tag, cls, name]) => {
    if (!customElements.get(tag)) {
      customElements.define(
        tag,
        cls
      );
    }

    window.customCards.push({
      type: tag,
      name,
      description:
        `${name} card for HomePrep`
    });
  }
);
