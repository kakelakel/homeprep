const HOME_PREP_PATH = "/homeprep";
const INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "ha-button",
  "ha-icon-button",
  "ha-switch",
  "ha-checkbox",
  "[role='button']",
  "[contenteditable='true']",
].join(",");

const EXPLICIT_CARD_TYPES = [
  "homeprep-card",
  "homeprep-mini-card",
  "homeprep-status-card",
  "homeprep-category-card",
  "homeprep-group-card",
  "homeprep-attention-card",
  "homeprep-inventory-card",
  "homeprep-manage-card",
  "homeprep-tasks-card",
];

function navigateToHomePrep() {
  if (window.location.pathname === HOME_PREP_PATH) return;
  window.history.pushState(null, "", HOME_PREP_PATH);
  window.dispatchEvent(new CustomEvent("location-changed"));
}

function isInteractiveEvent(event) {
  return event.composedPath().some((node) => {
    return node instanceof Element && node.matches?.(INTERACTIVE_SELECTOR);
  });
}

function installNavigation(card) {
  if (!card || card.__homePrepNavigationInstalled) return;
  card.__homePrepNavigationInstalled = true;

  card.style.cursor = "pointer";
  card.setAttribute("tabindex", card.getAttribute("tabindex") || "0");
  card.setAttribute("title", card.getAttribute("title") || "Open HomePrep");

  card.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || isInteractiveEvent(event)) return;
    navigateToHomePrep();
  });

  card.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || isInteractiveEvent(event)) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    navigateToHomePrep();
  });
}

function patchCardType(type) {
  const ElementClass = customElements.get(type);
  if (!ElementClass || ElementClass.prototype.__homePrepNavigationPatched) return;

  ElementClass.prototype.__homePrepNavigationPatched = true;
  const oldSetConfig = ElementClass.prototype.setConfig;

  if (typeof oldSetConfig === "function") {
    ElementClass.prototype.setConfig = function setConfig(...args) {
      const result = oldSetConfig.apply(this, args);
      installNavigation(this);
      return result;
    };
  }
}

const discoveredTypes = (window.customCards || [])
  .map((card) => String(card?.type || ""))
  .filter((type) => type.startsWith("homeprep-") && !type.endsWith("-editor"));

new Set([...EXPLICIT_CARD_TYPES, ...discoveredTypes]).forEach(patchCardType);
