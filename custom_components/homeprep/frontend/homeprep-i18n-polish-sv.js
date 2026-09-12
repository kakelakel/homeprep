import { getHomePrepLanguage } from "./homeprep-i18n.js?v=3";

const SV_POLISH = {
  "No due date": "Inget förfallodatum",
  "Managed from inventory": "Hanteras från förrådet",
  "Water": "Vatten",
  "Food": "Mat",
  "Cooking": "Matlagning",
  "Shelter & warmth": "Skydd & värme",
  "Communication": "Kommunikation",
  "Medicine": "Medicin",
  "Lighting": "Belysning",
  "Cash": "Kontanter",
  "Measured from inventory": "Mäts från förrådet",
  "Coverage you assess": "Täckning du bedömer",
  "Readiness confirmation": "Beredskapsbekräftelse",
  "Readiness checklist": "Beredskapschecklista",
  "from guidance": "från vägledning",

  "DAB radio independent of mains power": "DAB-radio oberoende av elnätet",
  "Extra regular medicine reserve": "Extra reserv av ordinarie läkemedel",
  "Battery, crank or solar emergency lighting": "Nödbelysning med batteri, vev eller solceller",
  "Cash and alternative payment cards": "Kontanter och alternativa betalningskort",

  "I can prepare food without mains electricity": "Jag kan laga mat utan el från elnätet",
  "Confirm when your household has a usable alternative cooking method.": "Bekräfta när hushållet har en fungerande alternativ matlagningsmetod.",
  "A working DAB radio can be used without mains power": "En fungerande DAB-radio kan användas utan el från elnätet",
  "Working emergency lighting is available without mains power": "Fungerande nödbelysning finns utan el från elnätet",
  "Cash is available for disruptions": "Kontanter finns tillgängliga vid störningar",
  "An alternative payment card or method is available": "Ett alternativt betalningskort eller betalningssätt finns tillgängligt",
  "Confirm when you have a practical plan on shutting off or retaining heat.": "Bekräfta när du har en praktisk plan för att stänga av eller behålla värme.",
};

function translateSegment(segment) {
  const trimmed = segment.trim();
  return SV_POLISH[trimmed] || trimmed;
}

function translatePattern(text) {
  let m;

  if ((m = text.match(/^(\d+) artiklar registrerade\.$/))) {
    return Number(m[1]) === 1 ? "1 artikel registrerad." : `${m[1]} artiklar registrerade.`;
  }
  if ((m = text.match(/^(\d+) artikel registrerade\.$/))) {
    return Number(m[1]) === 1 ? "1 artikel registrerad." : `${m[1]} artiklar registrerade.`;
  }
  if ((m = text.match(/^(\d+) piece$/))) return `${m[1]} st`;
  if ((m = text.match(/^(\d+) pieces$/))) return `${m[1]} st`;
  if ((m = text.match(/^(\d+) of (\d+) ready$/))) return `${m[1]} av ${m[2]} redo`;

  if (text.includes(" · ")) {
    return text.split(" · ").map(translateSegment).join(" · ");
  }

  return SV_POLISH[text] || text;
}

export function hpTPolishSv(text, hass) {
  const value = String(text ?? "");
  if (getHomePrepLanguage(hass) !== "sv") return value;
  return translatePattern(value);
}

export function localizeHomePrepElementPolishSv(root, hass) {
  if (!root || getHomePrepLanguage(hass) !== "sv") return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const original = node.nodeValue || "";
    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    const core = original.trim();
    if (!core) continue;
    const translated = hpTPolishSv(core, hass);
    if (translated !== core) node.nodeValue = `${leading}${translated}${trailing}`;
  }

  root.querySelectorAll?.("[placeholder],[title],[aria-label]").forEach((el) => {
    for (const attr of ["placeholder", "title", "aria-label"]) {
      if (!el.hasAttribute(attr)) continue;
      const value = el.getAttribute(attr);
      const translated = hpTPolishSv(value, hass);
      if (translated !== value) el.setAttribute(attr, translated);
    }
  });
}
