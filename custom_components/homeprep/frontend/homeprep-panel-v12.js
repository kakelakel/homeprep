import "./homeprep-panel-v11.js?v=2";

const HomePrepPanel = customElements.get("homeprep-panel");

if (HomePrepPanel && !HomePrepPanel.prototype.__homePrepV12Applied) {
  const proto = HomePrepPanel.prototype;
  proto.__homePrepV12Applied = true;

  const oldRender = proto.render;
  proto.render = function render() {
    const result = oldRender.call(this);

    if (this._active === "plans" && this._loaded && !this._error) {
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
          link.innerHTML = `<ha-icon icon="mdi:home-cog-outline"></ha-icon>${this.esc(asset.name)}`;
          links.appendChild(link);
        }
      });
    }

    return result;
  };
}
