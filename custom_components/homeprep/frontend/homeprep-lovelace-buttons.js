(() => {
  const patch = async (tag, renderMethod) => {
    await customElements.whenDefined(tag);
    const Card = customElements.get(tag);
    if (!Card || Card.prototype.__homeprepButtonStyleApplied) return;
    Card.prototype.__homeprepButtonStyleApplied = true;

    const previous = Card.prototype[renderMethod];
    if (typeof previous !== "function") return;

    Card.prototype[renderMethod] = function patchedStyles(...args) {
      const result = previous.apply(this, args);
      const css = `
        <style id="hp-action-button-styles">
          button.primary,
          .editor-actions button,
          .hp-complete,
          .icon-button {
            background: var(--hp-accent) !important;
            color: #fff !important;
            border: 1px solid color-mix(in srgb, var(--hp-accent) 82%, #000) !important;
            border-radius: 8px !important;
            font-weight: 700 !important;
            box-shadow: none !important;
            transition: filter .15s ease, transform .08s ease, opacity .15s ease;
          }
          button.primary:hover,
          .editor-actions button:hover,
          .hp-complete:hover,
          .icon-button:hover { filter: brightness(1.08); }
          button.primary:active,
          .editor-actions button:active,
          .hp-complete:active,
          .icon-button:active { transform: translateY(1px); }
          button.danger,
          .icon-button.danger {
            background: color-mix(in srgb, var(--hp-critical) 82%, #5b0b0b) !important;
            color: #fff !important;
            border-color: color-mix(in srgb, var(--hp-critical) 76%, #000) !important;
          }
          button:disabled { opacity:.55 !important; cursor:not-allowed !important; }
        </style>`;

      if (typeof result === "string") {
        return result.includes("hp-action-button-styles") ? result : `${result}${css}`;
      }

      queueMicrotask(() => {
        if (!this.querySelector?.("#hp-action-button-styles")) {
          this.insertAdjacentHTML?.("beforeend", css);
        }
      });
      return result;
    };
  };

  patch("homeprep-manage-card", "_render").catch(console.error);
  patch("homeprep-tasks-card", "styles").catch(console.error);
})();
