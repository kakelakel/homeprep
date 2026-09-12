import "./homeprep-ui-shared.js?v=3";
import "./homeprep-card.js?v=4";
import "./homeprep-dashboard-cards.js?v=3";
import "./homeprep-manage-card.js?v=3";
import "./homeprep-tasks-card.js?v=3";
import "./homeprep-lovelace-images.js?v=2";
import "./homeprep-lovelace-buttons.js?v=1";
import "./homeprep-lovelace-i18n.js?v=3";

// Home Assistant keeps custom card metadata in a global array. During frontend
// reloads, or when an older HomePrep resource is still present in the browser,
// the same card modules can be evaluated more than once. Custom elements are
// protected by customElements.get(), but the metadata array itself is not.
// Normalize HomePrep entries here so the card picker always shows one entry per
// HomePrep card type.
window.customCards = window.customCards || [];

const seenHomePrepTypes = new Set();
window.customCards = window.customCards.filter((card) => {
  const type = String(card?.type || "");
  if (!type.startsWith("homeprep-")) return true;
  if (seenHomePrepTypes.has(type)) return false;
  seenHomePrepTypes.add(type);
  return true;
});
