import { localizeHomePrepElement } from "./homeprep-i18n.js?v=2";

const HOME_PREP_ELEMENTS = [
  "homeprep-card",
  "homeprep-mini-card",
  "homeprep-status-card",
  "homeprep-category-card",
  "homeprep-group-card",
  "homeprep-attention-card",
  "homeprep-inventory-card",
  "homeprep-manage-card",
  "homeprep-tasks-card",
  "homeprep-card-editor",
  "homeprep-status-card-editor",
  "homeprep-category-card-editor",
  "homeprep-group-card-editor",
  "homeprep-attention-card-editor",
  "homeprep-inventory-card-editor",
  "homeprep-manage-card-editor",
  "homeprep-tasks-card-editor",
];

function localizeElement(element) {
  queueMicrotask(() => localizeHomePrepElement(element.shadowRoot || element, element._hass || element.hass));
}

function patchElement(name) {
  const ElementClass = customElements.get(name);
  if (!ElementClass || ElementClass.prototype.__homePrepI18nPatched) return;
  ElementClass.prototype.__homePrepI18nPatched = true;

  if (typeof ElementClass.prototype.render === "function") {
    const oldRender = ElementClass.prototype.render;
    ElementClass.prototype.render = function render(...args) {
      const result = oldRender.apply(this, args);
      localizeElement(this);
      return result;
    };
  }

  if (typeof ElementClass.prototype.connectedCallback === "function") {
    const oldConnected = ElementClass.prototype.connectedCallback;
    ElementClass.prototype.connectedCallback = function connectedCallback(...args) {
      const result = oldConnected.apply(this, args);
      localizeElement(this);
      return result;
    };
  }
}

HOME_PREP_ELEMENTS.forEach(patchElement);
