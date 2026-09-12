import "./homeprep-panel-v7.js?v=9";

const HomePrepPanel = customElements.get("homeprep-panel");

if (HomePrepPanel && !HomePrepPanel.prototype.__homeprepV9ButtonsApplied) {
  HomePrepPanel.prototype.__homeprepV9ButtonsApplied = true;
  const previousStyles = HomePrepPanel.prototype.styles;

  HomePrepPanel.prototype.styles = function styles() {
    return `${previousStyles.call(this)}
      /* HomePrep action buttons */
      .row-actions button,
      .actions button,
      .section-head button,
      .notification-actions button,
      .form-card .actions button,
      button.primary,
      .image-upload-button {
        background: var(--hp-panel-accent) !important;
        color: #fff !important;
        border: 1px solid color-mix(in srgb, var(--hp-panel-accent) 82%, #000) !important;
        border-radius: 8px !important;
        font-weight: 700 !important;
        box-shadow: none !important;
        transition: filter .15s ease, transform .08s ease, opacity .15s ease;
      }

      .row-actions button:hover,
      .actions button:hover,
      .section-head button:hover,
      .notification-actions button:hover,
      .form-card .actions button:hover,
      button.primary:hover,
      .image-upload-button:hover {
        filter: brightness(1.08);
      }

      .row-actions button:active,
      .actions button:active,
      .section-head button:active,
      .notification-actions button:active,
      .form-card .actions button:active,
      button.primary:active {
        transform: translateY(1px);
      }

      button.danger,
      .row-actions button.danger,
      .actions button.danger,
      .form-card .actions button.danger,
      .inventory-image-controls button.danger {
        background: color-mix(in srgb, var(--hp-panel-critical, #f44336) 82%, #5b0b0b) !important;
        color: #fff !important;
        border-color: color-mix(in srgb, var(--hp-panel-critical, #f44336) 76%, #000) !important;
      }

      .row-actions button:disabled,
      .actions button:disabled,
      .section-head button:disabled,
      .notification-actions button:disabled,
      .form-card .actions button:disabled,
      button.primary:disabled {
        opacity: .55 !important;
        cursor: not-allowed !important;
        filter: saturate(.65) !important;
      }

      /* Keep navigation/status controls visually separate from actions. */
      .tabs button,
      .metric,
      .requirement-toggle,
      .category-head {
        background: initial;
        color: inherit;
      }
    `;
  };
}
