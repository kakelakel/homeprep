(() => {
  const displayUnit = (ctx, unit) =>
    `${ctx.esc ? ctx.esc(unit.label) : unit.label}${unit.symbol ? ` (${ctx.esc ? ctx.esc(unit.symbol) : unit.symbol})` : ""}`;

  const esc = (ctx, value) =>
    ctx._esc ? ctx._esc(value) : ctx.esc ? ctx.esc(value) : String(value ?? "");

  const buildOptions = (ctx, categoryId, selected = "") => {
    const taxonomy = ctx._taxonomy || { categories: [], units: [] };
    const category = taxonomy.categories.find((x) => x.id === categoryId) || null;
    const preferredIds = category?.preferred_units || [];
    const preferred = preferredIds
      .map((id) => taxonomy.units.find((unit) => unit.id === id))
      .filter(Boolean);
    const preferredSet = new Set(preferred.map((unit) => unit.id));
    const remaining = taxonomy.units.filter((unit) => !preferredSet.has(unit.id));

    const option = (unit) =>
      `<option value="${esc(ctx, unit.id)}" ${unit.id === selected ? "selected" : ""}>${displayUnit(ctx, unit)}</option>`;

    if (!preferred.length) {
      return taxonomy.units.map(option).join("");
    }

    return [
      `<optgroup label="Suggested for ${esc(ctx, category?.label || "category")}">`,
      ...preferred.map(option),
      `</optgroup>`,
      `<optgroup label="All other units">`,
      ...remaining.map(option),
      `</optgroup>`
    ].join("");
  };

  const applySuggestion = (ctx, categorySelect, unitSelect) => {
    if (!categorySelect || !unitSelect) return;
    const category = (ctx._taxonomy?.categories || []).find(
      (x) => x.id === categorySelect.value
    );
    const suggested = category?.default_unit || category?.preferred_units?.[0] || "piece";
    unitSelect.innerHTML = buildOptions(ctx, categorySelect.value, suggested);
    unitSelect.value = suggested;
  };

  customElements.whenDefined("homeprep-manage-card").then(() => {
    const cls = customElements.get("homeprep-manage-card");
    if (!cls || cls.prototype.__homeprepUnitSuggestionsPatched) return;
    const proto = cls.prototype;
    proto.__homeprepUnitSuggestionsPatched = true;

    proto._unitOptions = function(categoryId, selected) {
      return buildOptions(this, categoryId, selected);
    };

    const originalOnChange = proto._onChange;
    proto._onChange = function(event) {
      const target = event.target;
      if (target instanceof HTMLSelectElement && target.id === "hp-category") {
        const unit = this.querySelector("#hp-unit");
        applySuggestion(this, target, unit);
        return;
      }
      return originalOnChange.call(this, event);
    };
  });

  customElements.whenDefined("homeprep-panel").then(() => {
    const cls = customElements.get("homeprep-panel");
    if (!cls || cls.prototype.__homeprepUnitSuggestionsPatched) return;
    const proto = cls.prototype;
    proto.__homeprepUnitSuggestionsPatched = true;

    proto.unitOptions = function(selected = "") {
      let categoryId = "food";
      if (this._editingItem) {
        categoryId = this.itemById(this._editingItem)?.category || categoryId;
      }
      return buildOptions(this, categoryId, selected);
    };

    const originalHandleChange = proto.handleChange;
    proto.handleChange = function(event) {
      const target = event.target;
      if (
        target instanceof HTMLSelectElement &&
        target.name === "category" &&
        target.closest("#hp-item-form")
      ) {
        const unit = target.closest("#hp-item-form")?.querySelector('select[name="unit"]');
        applySuggestion(this, target, unit);
        return;
      }
      return originalHandleChange.call(this, event);
    };
  });
})();

import("./homeprep-lovelace-images.js?v=1").catch((error) => {
  console.error("HomePrep Lovelace image support failed to load", error);
});
