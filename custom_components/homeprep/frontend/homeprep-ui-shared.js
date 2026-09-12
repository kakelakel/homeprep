window.HomePrepUI = window.HomePrepUI || {};

window.HomePrepUI.PRESETS = {
  theme: {
    label: "Home Assistant theme",
    values: {}
  },

  homeprep: {
    label: "HomePrep",
    values: {
      accent_color: "#2196f3",
      background_color: "var(--ha-card-background, var(--card-background-color))",
      primary_text_color: "var(--primary-text-color)",
      secondary_text_color: "var(--secondary-text-color)",
      border_color: "var(--divider-color)",
      ok_color: "#4caf50",
      attention_color: "#ff9800",
      critical_color: "#f44336",
      radius: 14,
      density: "comfortable",
      shadow: "soft",
      border: true
    }
  },

  minimal: {
    label: "Minimal",
    values: {
      accent_color: "var(--primary-color)",
      background_color: "var(--ha-card-background, var(--card-background-color))",
      primary_text_color: "var(--primary-text-color)",
      secondary_text_color: "var(--secondary-text-color)",
      border_color: "transparent",
      radius: 10,
      density: "compact",
      shadow: "none",
      border: false
    }
  },

  transparent: {
    label: "Transparent",
    values: {
      accent_color: "var(--primary-color)",
      background_color: "transparent",
      primary_text_color: "var(--primary-text-color)",
      secondary_text_color: "var(--secondary-text-color)",
      border_color: "var(--divider-color)",
      radius: 14,
      density: "comfortable",
      shadow: "none",
      border: true
    }
  },

  dark: {
    label: "Dark",
    values: {
      accent_color: "#64b5f6",
      background_color: "#161719",
      primary_text_color: "#f5f7fa",
      secondary_text_color: "#9aa4ad",
      border_color: "#30343a",
      ok_color: "#51c76a",
      attention_color: "#ffb74d",
      critical_color: "#ef5350",
      radius: 14,
      density: "comfortable",
      shadow: "soft",
      border: true
    }
  },

  light: {
    label: "Light",
    values: {
      accent_color: "#1976d2",
      background_color: "#ffffff",
      primary_text_color: "#17202a",
      secondary_text_color: "#607080",
      border_color: "#d8dde3",
      ok_color: "#2e7d32",
      attention_color: "#ed6c02",
      critical_color: "#d32f2f",
      radius: 14,
      density: "comfortable",
      shadow: "soft",
      border: true
    }
  },

  high_contrast: {
    label: "High Contrast",
    values: {
      accent_color: "#00e5ff",
      background_color: "#000000",
      primary_text_color: "#ffffff",
      secondary_text_color: "#d5d5d5",
      border_color: "#ffffff",
      ok_color: "#00ff66",
      attention_color: "#ffd600",
      critical_color: "#ff1744",
      radius: 6,
      density: "comfortable",
      shadow: "none",
      border: true
    }
  },

  cyber_cyan: {
    label: "Cyber Cyan",
    values: {
      accent_color: "#00f0ff",
      background_color: "rgba(6, 10, 14, 0.88)",
      primary_text_color: "#f1feff",
      secondary_text_color: "#74a9ad",
      border_color: "rgba(0, 240, 255, 0.28)",
      ok_color: "#00ff9d",
      attention_color: "#ffd166",
      critical_color: "#ff4d6d",
      radius: 16,
      density: "compact",
      shadow: "glow",
      border: true
    }
  },

  amber_tactical: {
    label: "Amber Tactical",
    values: {
      accent_color: "#ffb300",
      background_color: "#14110b",
      primary_text_color: "#fff5df",
      secondary_text_color: "#b9a57d",
      border_color: "#4b3a17",
      ok_color: "#8bc34a",
      attention_color: "#ffc107",
      critical_color: "#ff5722",
      radius: 8,
      density: "compact",
      shadow: "glow",
      border: true
    }
  },

  red_alert: {
    label: "Red Alert",
    values: {
      accent_color: "#ff1744",
      background_color: "#180b0e",
      primary_text_color: "#fff4f6",
      secondary_text_color: "#b98c96",
      border_color: "#5c1f2b",
      ok_color: "#66bb6a",
      attention_color: "#ffb300",
      critical_color: "#ff1744",
      radius: 10,
      density: "comfortable",
      shadow: "glow",
      border: true
    }
  },

  forest: {
    label: "Forest",
    values: {
      accent_color: "#7cb342",
      background_color: "#111713",
      primary_text_color: "#edf6ef",
      secondary_text_color: "#9eb1a2",
      border_color: "#314438",
      ok_color: "#66bb6a",
      attention_color: "#d4a72c",
      critical_color: "#e35d6a",
      radius: 14,
      density: "comfortable",
      shadow: "soft",
      border: true
    }
  },

  arctic: {
    label: "Arctic",
    values: {
      accent_color: "#4fc3f7",
      background_color: "#edf7fb",
      primary_text_color: "#17313d",
      secondary_text_color: "#607d8b",
      border_color: "#b7d5e1",
      ok_color: "#2e9d66",
      attention_color: "#d9951e",
      critical_color: "#d64545",
      radius: 16,
      density: "comfortable",
      shadow: "soft",
      border: true
    }
  },

  retro_terminal: {
    label: "Retro Terminal",
    values: {
      accent_color: "#39ff14",
      background_color: "#020802",
      primary_text_color: "#8cff7a",
      secondary_text_color: "#4f9d44",
      border_color: "#195e13",
      ok_color: "#39ff14",
      attention_color: "#d8ff33",
      critical_color: "#ff4141",
      radius: 2,
      density: "compact",
      shadow: "glow",
      border: true
    }
  },

  midnight_blue: {
    label: "Midnight Blue",
    values: {
      accent_color: "#5c9dff",
      background_color: "#0d1424",
      primary_text_color: "#eef4ff",
      secondary_text_color: "#8494b2",
      border_color: "#243252",
      ok_color: "#5ad08b",
      attention_color: "#f4b860",
      critical_color: "#f26d78",
      radius: 16,
      density: "comfortable",
      shadow: "soft",
      border: true
    }
  },

  desert: {
    label: "Desert",
    values: {
      accent_color: "#d99a4e",
      background_color: "#211b14",
      primary_text_color: "#fff5e7",
      secondary_text_color: "#bba98d",
      border_color: "#51402b",
      ok_color: "#8fae5d",
      attention_color: "#e2aa53",
      critical_color: "#d96a5f",
      radius: 12,
      density: "comfortable",
      shadow: "soft",
      border: true
    }
  },

  purple_haze: {
    label: "Purple Haze",
    values: {
      accent_color: "#b388ff",
      background_color: "#16111f",
      primary_text_color: "#f7f1ff",
      secondary_text_color: "#a797bb",
      border_color: "#433456",
      ok_color: "#69d39c",
      attention_color: "#ffca68",
      critical_color: "#ff6687",
      radius: 18,
      density: "comfortable",
      shadow: "glow",
      border: true
    }
  },

  monochrome: {
    label: "Monochrome",
    values: {
      accent_color: "#dddddd",
      background_color: "#171717",
      primary_text_color: "#f5f5f5",
      secondary_text_color: "#999999",
      border_color: "#3b3b3b",
      ok_color: "#cfcfcf",
      attention_color: "#f0f0f0",
      critical_color: "#ffffff",
      radius: 10,
      density: "compact",
      shadow: "none",
      border: true
    }
  }
};

window.HomePrepUI.getAppearance = function(config) {
  const appearance = config?.appearance || {};
  const presetId = appearance.preset || "theme";
  const preset =
    window.HomePrepUI.PRESETS[presetId]
    || window.HomePrepUI.PRESETS.theme;

  return {
    ...preset.values,
    ...appearance,
    preset: presetId
  };
};

window.HomePrepUI.styleVars = function(config) {
  const a = window.HomePrepUI.getAppearance(config);

  const radius =
    Number.isFinite(Number(a.radius))
      ? Number(a.radius)
      : 14;

  const densityMap = {
    compact: "10px",
    comfortable: "14px",
    spacious: "18px"
  };

  const shadowMap = {
    none: "none",
    soft: "0 5px 16px rgba(0,0,0,.16)",
    glow:
      `0 0 18px color-mix(in srgb, ${a.accent_color || "var(--primary-color)"} 26%, transparent)`
  };

  return [
    `--hp-accent:${a.accent_color || "var(--primary-color)"}`,
    `--hp-bg:${a.background_color || "var(--ha-card-background, var(--card-background-color))"}`,
    `--hp-primary:${a.primary_text_color || "var(--primary-text-color)"}`,
    `--hp-secondary:${a.secondary_text_color || "var(--secondary-text-color)"}`,
    `--hp-border:${a.border_color || "var(--divider-color)"}`,
    `--hp-ok:${a.ok_color || "var(--success-color,#4caf50)"}`,
    `--hp-attention:${a.attention_color || "var(--warning-color,#ff9800)"}`,
    `--hp-critical:${a.critical_color || "var(--error-color,#f44336)"}`,
    `--hp-radius:${radius}px`,
    `--hp-pad:${densityMap[a.density] || densityMap.comfortable}`,
    `--hp-shadow:${shadowMap[a.shadow] || shadowMap.none}`,
    `--hp-border-width:${a.border === false ? "0px" : "1px"}`
  ].join(";");
};

window.HomePrepUI.baseStyles = function() {
  return `
    <style>
      ha-card {
        background: var(--hp-bg);
        color: var(--hp-primary);
        border:
          var(--hp-border-width)
          solid
          var(--hp-border);
        border-radius: var(--hp-radius);
        box-shadow: var(--hp-shadow);
        overflow: hidden;
      }

      .hp-card {
        padding: var(--hp-pad);
      }

      .hp-accent {
        color: var(--hp-accent);
      }

      .hp-muted {
        color: var(--hp-secondary);
      }

      .hp-ok-text {
        color: var(--hp-ok) !important;
      }

      .hp-attention-text {
        color: var(--hp-attention) !important;
      }

      .hp-critical-text {
        color: var(--hp-critical) !important;
      }
    </style>
  `;
};


class HomePrepUniversalEditor extends HTMLElement {
  constructor() {
    super();

    this._config = {};
    this._taxonomy = {
      categories: [],
      item_types: [],
      units: []
    };

    this._taxonomyLoaded = false;

    this.addEventListener(
      "change",
      (event) => this.handleInput(event)
    );

    this.addEventListener(
      "input",
      (event) => this.handleInput(event)
    );
  }

  setConfig(config) {
    this._config = {
      ...(config || {})
    };

    this.render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;

    if (first) {
      this.loadTaxonomy();
    }
  }

  async loadTaxonomy() {
    if (!this._hass) return;

    try {
      const result =
        await this._hass.callWS({
          type: "homeprep/taxonomy"
        });

      this._taxonomy = {
        categories:
          result.categories ?? [],
        item_types:
          result.item_types ?? [],
        units:
          result.units ?? []
      };

      this._taxonomyLoaded = true;
      this.render();
    } catch (error) {
      console.error(
        "HomePrep editor taxonomy load failed",
        error
      );
    }
  }

  fireConfigChanged() {
    this.dispatchEvent(
      new CustomEvent(
        "config-changed",
        {
          detail: {
            config: this._config
          },
          bubbles: true,
          composed: true
        }
      )
    );
  }

  setValue(path, value) {
    const next = structuredClone(
      this._config || {}
    );

    if (path.startsWith("appearance.")) {
      const key =
        path.substring(
          "appearance.".length
        );

      next.appearance = {
        ...(next.appearance || {})
      };

      if (
        value === "" ||
        value === undefined
      ) {
        delete next.appearance[key];
      } else {
        next.appearance[key] = value;
      }

      if (
        Object.keys(next.appearance)
          .length === 0
      ) {
        delete next.appearance;
      }
    } else {
      if (
        value === "" ||
        value === undefined
      ) {
        delete next[path];
      } else {
        next[path] = value;
      }
    }

    this._config = next;
    this.fireConfigChanged();
    this.render();
  }

  handleInput(event) {
    const target = event.target;

    if (
      !target ||
      !target.dataset?.path
    ) {
      return;
    }

    const path =
      target.dataset.path;

    let value;

    if (
      target.type === "checkbox"
    ) {
      value = target.checked;
    } else if (
      target.type === "number"
    ) {
      value =
        target.value === ""
          ? ""
          : Number(target.value);
    } else {
      value = target.value;
    }

    this.setValue(path, value);
  }

  esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  selected(value, expected) {
    return value === expected
      ? "selected"
      : "";
  }

  checked(value) {
    return value ? "checked" : "";
  }

  getGroups() {
    return [
      ...new Set(
        this._taxonomy.categories
          .map(
            (category) =>
              category.group
          )
          .filter(Boolean)
      )
    ];
  }

  renderContentSettings() {
    const type =
      this._config.type || "";

    const titleField = `
      <label class="field">
        <span>Title</span>
        <input
          data-path="title"
          type="text"
          value="${this.esc(
            this._config.title || ""
          )}"
          placeholder="Default title"
        >
      </label>
    `;

    if (
      type ===
      "custom:homeprep-category-card"
    ) {
      return `
        ${titleField}

        <label class="field">
          <span>Category</span>
          <select data-path="category">
            ${this._taxonomy.categories
              .map(
                (category) => `
                  <option
                    value="${this.esc(
                      category.id
                    )}"
                    ${this.selected(
                      this._config.category,
                      category.id
                    )}
                  >
                    ${this.esc(
                      category.label
                    )}
                  </option>
                `
              )
              .join("")}
          </select>
        </label>

        <label class="toggle">
          <input
            data-path="show_items"
            type="checkbox"
            ${this.checked(
              this._config.show_items
              !== false
            )}
          >
          <span>Show items</span>
        </label>
      `;
    }

    if (
      type ===
      "custom:homeprep-group-card"
    ) {
      return `
        ${titleField}

        <label class="field">
          <span>Category group</span>
          <select data-path="group">
            ${this.getGroups()
              .map(
                (group) => `
                  <option
                    value="${this.esc(group)}"
                    ${this.selected(
                      this._config.group,
                      group
                    )}
                  >
                    ${this.esc(group)}
                  </option>
                `
              )
              .join("")}
          </select>
        </label>

        <label class="toggle">
          <input
            data-path="show_items"
            type="checkbox"
            ${this.checked(
              this._config.show_items
              === true
            )}
          >
          <span>Show actual items</span>
        </label>
      `;
    }

    if (
      type ===
      "custom:homeprep-attention-card"
    ) {
      const include =
        Array.isArray(
          this._config.include
        )
          ? this._config.include
          : ["critical", "attention"];

      return `
        ${titleField}

        <label class="field">
          <span>Maximum items</span>
          <input
            data-path="max_items"
            type="number"
            min="1"
            max="100"
            value="${this.esc(
              this._config.max_items ?? 12
            )}"
          >
        </label>

        <div class="hint">
          Critical and Attention are
          both shown by default.
          Fine-grained status filters
          stay available in YAML for now.
        </div>
      `;
    }

    if (
      type ===
      "custom:homeprep-inventory-card"
    ) {
      return `
        ${titleField}

        <label class="field">
          <span>Category filter</span>
          <select data-path="category">
            <option value="">
              All categories
            </option>

            ${this._taxonomy.categories
              .map(
                (category) => `
                  <option
                    value="${this.esc(
                      category.id
                    )}"
                    ${this.selected(
                      this._config.category,
                      category.id
                    )}
                  >
                    ${this.esc(
                      category.label
                    )}
                  </option>
                `
              )
              .join("")}
          </select>
        </label>

        <label class="field">
          <span>Group filter</span>
          <select data-path="group">
            <option value="">
              All groups
            </option>

            ${this.getGroups()
              .map(
                (group) => `
                  <option
                    value="${this.esc(group)}"
                    ${this.selected(
                      this._config.group,
                      group
                    )}
                  >
                    ${this.esc(group)}
                  </option>
                `
              )
              .join("")}
          </select>
        </label>
      `;
    }

    if (
      type ===
      "custom:homeprep-manage-card"
    ) {
      return `
        ${titleField}

        <label class="toggle">
          <input
            data-path="inventory_collapsed"
            type="checkbox"
            ${this.checked(
              this._config.inventory_collapsed
              === true
            )}
          >
          <span>
            Inventory collapsed by default
          </span>
        </label>
      `;
    }

    if (
      type ===
      "custom:homeprep-card"
    ) {
      return `
        ${titleField}

        <label class="toggle">
          <input
            data-path="show_actions"
            type="checkbox"
            ${this.checked(
              this._config.show_actions
              !== false
            )}
          >
          <span>Show attention items</span>
        </label>
      `;
    }

    if (
      type ===
      "custom:homeprep-mini-card"
    ) {
      return titleField;
    }

    return titleField;
  }

  renderAppearance() {
    const a =
      this._config.appearance || {};

    const presets =
      window.HomePrepUI.PRESETS;

    return `
      <div class="section-title">
        Appearance
      </div>

      <label class="field">
        <span>Preset</span>
        <select
          data-path="appearance.preset"
        >
          ${Object.entries(presets)
            .map(
              ([id, preset]) => `
                <option
                  value="${this.esc(id)}"
                  ${this.selected(
                    a.preset || "theme",
                    id
                  )}
                >
                  ${this.esc(
                    preset.label
                  )}
                </option>
              `
            )
            .join("")}
        </select>
      </label>

      <div class="subheading">
        Custom overrides
      </div>

      ${this.colorTextField(
        "Accent / icon color",
        "accent_color",
        a
      )}

      ${this.colorTextField(
        "Background color",
        "background_color",
        a
      )}

      ${this.colorTextField(
        "Primary text color",
        "primary_text_color",
        a
      )}

      ${this.colorTextField(
        "Secondary text color",
        "secondary_text_color",
        a
      )}

      ${this.colorTextField(
        "Border color",
        "border_color",
        a
      )}

      ${this.colorTextField(
        "OK color",
        "ok_color",
        a
      )}

      ${this.colorTextField(
        "Attention color",
        "attention_color",
        a
      )}

      ${this.colorTextField(
        "Critical color",
        "critical_color",
        a
      )}

      <div class="two-col">
        <label class="field">
          <span>Border radius</span>
          <input
            data-path="appearance.radius"
            type="number"
            min="0"
            max="40"
            value="${this.esc(
              a.radius ?? ""
            )}"
            placeholder="Preset"
          >
        </label>

        <label class="field">
          <span>Density</span>
          <select
            data-path="appearance.density"
          >
            <option value="">
              Preset
            </option>
            <option
              value="compact"
              ${this.selected(
                a.density,
                "compact"
              )}
            >
              Compact
            </option>
            <option
              value="comfortable"
              ${this.selected(
                a.density,
                "comfortable"
              )}
            >
              Comfortable
            </option>
            <option
              value="spacious"
              ${this.selected(
                a.density,
                "spacious"
              )}
            >
              Spacious
            </option>
          </select>
        </label>
      </div>

      <div class="two-col">
        <label class="field">
          <span>Shadow</span>
          <select
            data-path="appearance.shadow"
          >
            <option value="">
              Preset
            </option>
            <option
              value="none"
              ${this.selected(
                a.shadow,
                "none"
              )}
            >
              None
            </option>
            <option
              value="soft"
              ${this.selected(
                a.shadow,
                "soft"
              )}
            >
              Soft
            </option>
            <option
              value="glow"
              ${this.selected(
                a.shadow,
                "glow"
              )}
            >
              Glow
            </option>
          </select>
        </label>

        <label class="toggle compact-toggle">
          <input
            data-path="appearance.border"
            type="checkbox"
            ${this.checked(
              a.border !== false
            )}
          >
          <span>Show border</span>
        </label>
      </div>

      <div class="hint">
        Presets provide defaults.
        Any value above overrides
        only that part of the preset.
        CSS variables and rgba(...)
        are supported.
      </div>
    `;
  }

  colorTextField(
    label,
    key,
    appearance
  ) {
    return `
      <label class="field">
        <span>${this.esc(label)}</span>
        <input
          data-path="appearance.${this.esc(key)}"
          type="text"
          value="${this.esc(
            appearance[key] || ""
          )}"
          placeholder="Preset / HA theme"
        >
      </label>
    `;
  }

  render() {
    this.innerHTML = `
      <style>
        .editor {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 4px 0 12px;
        }

        .section-title {
          margin-top: 4px;
          padding-bottom: 6px;
          border-bottom:
            1px solid
            var(--divider-color);
          font-size: 14px;
          font-weight: 700;
        }

        .subheading {
          margin-top: 4px;
          font-size: 11px;
          font-weight: 700;
          color:
            var(--secondary-text-color);
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .field span {
          font-size: 11px;
          color:
            var(--secondary-text-color);
        }

        input,
        select {
          width: 100%;
          box-sizing: border-box;
          padding: 9px 10px;
          border:
            1px solid
            var(--divider-color);
          border-radius: 8px;
          color:
            var(--primary-text-color);
          background:
            var(--card-background-color);
          font: inherit;
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 36px;
          font-size: 12px;
        }

        .toggle input {
          width: auto;
        }

        .two-col {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 10px;
        }

        .compact-toggle {
          align-self: end;
          padding-bottom: 4px;
        }

        .hint {
          padding: 9px 10px;
          border-radius: 8px;
          font-size: 10px;
          line-height: 1.4;
          color:
            var(--secondary-text-color);
          background:
            rgba(128,128,128,.08);
        }
      </style>

      <div class="editor">
        <div class="section-title">
          Card
        </div>

        ${this.renderContentSettings()}

        ${this.renderAppearance()}
      </div>
    `;
  }
}


if (
  !customElements.get(
    "homeprep-card-editor"
  )
) {
  customElements.define(
    "homeprep-card-editor",
    HomePrepUniversalEditor
  );
}
