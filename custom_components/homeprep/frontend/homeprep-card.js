class HomePrepCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this._hass) {
      return;
    }

    this.innerHTML = `
      <ha-card>
        <div style="
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        ">
          <ha-icon icon="mdi:home-shield"></ha-icon>

          <div>
            <div style="font-size: 20px; font-weight: 600;">
              HomePrep
            </div>

            <div style="opacity: 0.65; margin-top: 2px;">
              Custom card loaded successfully
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define("homeprep-card", HomePrepCard);

window.customCards = window.customCards || [];

window.customCards.push({
  type: "homeprep-card",
  name: "HomePrep",
  description: "HomePrep preparedness overview",
});
