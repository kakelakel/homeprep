class HomePrepMainBase extends HTMLElement {
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
      this.load();
    }
  }

  async load() {
    if (!this._hass) return;

    try {
      this._summary =
        await this._hass.callWS({
          type: "homeprep/summary"
        });
    } catch (error) {
      this._summary = null;
    }

    this.render();
  }

  esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  baseCss() {
    return `
      ${window.HomePrepUI.baseStyles()}
      <style>
        .wrap {
          padding: var(--hp-pad);
        }

        .head {
          display:flex;
          align-items:center;
          gap:10px;
        }

        .logo {
          width:40px;
          height:40px;
        }

        .title {
          font-size:16px;
          font-weight:700;
        }

        .sub {
          margin-top:2px;
          font-size:9px;
          color:var(--hp-secondary);
        }

        .status {
          margin-top:10px;
          padding:10px;
          border-radius:
            calc(
              var(--hp-radius) - 4px
            );
          font-size:12px;
          font-weight:700;
        }

        .status.ok {
          color:var(--hp-ok);
          background:
            color-mix(
              in srgb,
              var(--hp-ok) 12%,
              transparent
            );
        }

        .status.attention {
          color:var(--hp-attention);
          background:
            color-mix(
              in srgb,
              var(--hp-attention) 12%,
              transparent
            );
        }

        .status.critical {
          color:var(--hp-critical);
          background:
            color-mix(
              in srgb,
              var(--hp-critical) 12%,
              transparent
            );
        }

        .metrics {
          display:grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap:8px;
          margin-top:8px;
        }

        .metric {
          padding:9px;
          border:
            1px solid
            var(--hp-border);
          border-radius:
            calc(
              var(--hp-radius) - 5px
            );
        }

        .metric strong {
          display:block;
          font-size:18px;
        }

        .metric span {
          font-size:9px;
          color:var(--hp-secondary);
        }
      </style>
    `;
  }

  shell(content) {
    return `
      <ha-card
        style="${window.HomePrepUI.styleVars(
          this.config
        )}"
      >
        ${this.baseCss()}
        ${content}
      </ha-card>
    `;
  }
}


class HomePrepCard extends HomePrepMainBase {
  render() {
    if (!this._hass) return;

    const s =
      this._summary;

    if (!s) {
      this.innerHTML =
        this.shell(`
          <div class="wrap">
            HomePrep unavailable
          </div>
        `);
      return;
    }

    const status =
      s.status || "ok";

    const label =
      status === "critical"
        ? "Action required"
        : status === "attention"
          ? "Requires attention"
          : "Home is ready";

    this.innerHTML =
      this.shell(`
        <div class="wrap">
          <div class="head">
            <img
              class="logo"
              src="/api/homeprep/frontend/icon.png"
            >

            <div>
              <div class="title">
                ${this.esc(
                  this.config?.title
                  || "HomePrep"
                )}
              </div>

              <div class="sub">
                PREPARE • MONITOR • BE READY
              </div>
            </div>
          </div>

          <div
            class="status ${status}"
          >
            ${this.esc(label)}
          </div>

          <div class="metrics">
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
                  <div class="metric">
                    <strong>
                      ${value ?? 0}
                    </strong>
                    <span>
                      ${this.esc(
                        labelText
                      )}
                    </span>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      `);
  }
}


class HomePrepMiniCard extends HomePrepMainBase {
  render() {
    if (!this._hass) return;

    const s =
      this._summary;

    const status =
      s?.status || "ok";

    const label =
      !s
        ? "Unknown"
        : status === "critical"
          ? "Requires attention"
          : status === "attention"
            ? "Attention"
            : "OK";

    this.innerHTML =
      this.shell(`
        <div class="wrap">
          <div class="head">
            <img
              class="logo"
              src="/api/homeprep/frontend/icon.png"
            >

            <div style="flex:1">
              <div class="title">
                ${this.esc(
                  this.config?.title
                  || "HomePrep"
                )}
              </div>

              <div class="sub">
                ${this.esc(label)}
              </div>
            </div>

            <div
              class="status ${status}"
              style="margin-top:0;padding:7px 9px"
            >
              ${this.esc(label)}
            </div>
          </div>
        </div>
      `);
  }
}


[
  [
    "homeprep-card",
    HomePrepCard,
    "HomePrep"
  ],
  [
    "homeprep-mini-card",
    HomePrepMiniCard,
    "HomePrep Mini"
  ]
].forEach(
  ([tag, cls, name]) => {
    if (!customElements.get(tag)) {
      customElements.define(
        tag,
        cls
      );
    }

    window.customCards =
      window.customCards || [];

    window.customCards.push({
      type: tag,
      name,
      description:
        `${name} card`
    });
  }
);
