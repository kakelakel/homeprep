customElements.whenDefined("homeprep-panel").then(() => {
  const cls = customElements.get("homeprep-panel");
  if (!cls || cls.prototype.__homePrepPlanAssetLinksPatched) return;

  const proto = cls.prototype;
  proto.__homePrepPlanAssetLinksPatched = true;
  const oldRender = proto.render;

  proto.render = function render(...args) {
    const result = oldRender.apply(this, args);

    if (this._active !== "plans" || !this._loaded || this._error) return result;

    this.querySelectorAll(".hp-plan-check-row").forEach((row) => {
      const requirement = row.querySelector('[data-action="toggle-plan-item"]');
      if (!requirement) return;

      const plan = (this._plans || []).find((value) => value.id === requirement.dataset.planId);
      const item = plan?.checklist?.find((value) => value.id === requirement.dataset.itemId);
      const assets = item?.linked_assets || [];
      if (!assets.length) return;

      const textContainer = requirement.querySelector("span");
      if (!textContainer) return;

      let links = textContainer.querySelector(".hp-resource-links");
      if (!links) {
        links = document.createElement("small");
        links.className = "hp-resource-links";
        textContainer.appendChild(links);
      }

      const existing = new Set(
        [...links.querySelectorAll("[data-hp-asset-id]")].map((element) => element.dataset.hpAssetId)
      );

      for (const asset of assets) {
        if (existing.has(asset.id)) continue;
        const link = document.createElement("span");
        link.dataset.hpAssetId = asset.id;
        const icon = document.createElement("ha-icon");
        icon.setAttribute("icon", "mdi:home-cog-outline");
        link.appendChild(icon);
        link.appendChild(document.createTextNode(String(asset.name || "Asset")));
        links.appendChild(link);
      }
    });

    return result;
  };
});
