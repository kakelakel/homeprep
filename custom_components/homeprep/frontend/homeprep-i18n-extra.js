import { getHomePrepLanguage } from "./homeprep-i18n.js?v=3";

const SV = {
  // Settings / notifications
  "Panel appearance is stored locally in this browser. Lovelace cards keep their own appearance settings.": "Panelens utseende sparas lokalt i den här webbläsaren. Lovelace-kort behåller sina egna utseendeinställningar.",
  "Panel preset": "Panelprofil",
  "Density": "Täthet",
  "Comfortable": "Bekväm",
  "Compact": "Kompakt",
  "Spacious": "Luftig",
  "Accent color": "Accentfärg",
  "Notifications": "Notiser",
  "Choose what HomePrep should notify you about and which Home Assistant notification targets should receive it.": "Välj vad HomePrep ska meddela dig om och vilka Home Assistant-mottagare som ska få notiserna.",
  "Enable HomePrep notifications": "Aktivera HomePrep-notiser",
  "HomePrep checks inventory and tasks in the background and avoids sending the same event repeatedly.": "HomePrep kontrollerar förråd och uppgifter i bakgrunden och undviker att skicka samma händelse flera gånger.",
  "Recipients": "Mottagare",
  "Inventory": "Förråd",
  "Expiring soon": "Går snart ut",
  "Notify before an inventory item's expiry date.": "Meddela innan en förrådsartikel går ut.",
  "Expired": "Utgånget",
  "Notify when an inventory item has passed its expiry date.": "Meddela när en förrådsartikel har passerat sitt utgångsdatum.",
  "Expiring-soon window": "Varningsfönster för utgång",
  "Tasks & inspections": "Uppgifter & kontroller",
  "Reminder": "Påminnelse",
  "Uses each task's own 'reminder before due' setting.": "Använder varje uppgifts egen inställning för påminnelse före förfallodatum.",
  "Due today": "Förfaller idag",
  "Notify on the task's due date.": "Meddela på uppgiftens förfallodatum.",
  "Overdue": "Försenad",
  "Notify once when a task becomes overdue.": "Meddela en gång när en uppgift blir försenad.",
  "Save notification settings": "Spara notifieringsinställningar",
  "Send test notification": "Skicka testnotis",
  "days": "dagar",

  // Household
  "Changes recalculate guidance. Existing personal targets remain yours until you choose to change them.": "Ändringar räknar om vägledningen. Befintliga personliga mål förblir dina tills du själv ändrar dem.",
  "Country / guidance profile": "Land / vägledningsprofil",
  "Preparedness horizon": "Beredskapshorisont",
  "Adults": "Vuxna",
  "Children": "Barn",
  "Pets": "Husdjur",
  "Save household": "Spara hushåll",
  "HomePrep never silently overwrites adopted personal targets when household data or guidance changes.": "HomePrep skriver aldrig över antagna personliga mål i bakgrunden när hushållsdata eller vägledning ändras.",
  "Sweden · MSB": "Sverige · MSB",
  "Norway · DSB": "Norge · DSB",
  "Other · HomePrep general baseline": "Övrigt · HomePreps allmänna baslinje",

  // Overview / inventory / tasks
  "Action required": "Åtgärd krävs",
  "Needs attention": "Behöver uppmärksamhet",
  "Preparedness looks good": "Beredskapen ser bra ut",
  "HomePrep combines inventory, recurring checks and understandable preparedness goals.": "HomePrep samlar förråd, återkommande kontroller och tydliga beredskapsmål.",
  "No inventory attention needed": "Ingen förrådsartikel kräver åtgärd",
  "Official profile": "Officiell profil",
  "General baseline": "Allmän baslinje",
  "Next actions": "Nästa åtgärder",
  "View tasks": "Visa uppgifter",
  "No task needs attention.": "Ingen uppgift behöver uppmärksamhet.",
  "Target progress": "Målstatus",
  "View targets": "Visa mål",
  "Recurring checks and standalone preparedness tasks.": "Återkommande kontroller och fristående beredskapsuppgifter.",
  "Managed from inventory": "Hanteras från förrådet",
  "Manage item": "Hantera artikel",
  "No due date": "Inget förfallodatum",
  "Unscheduled": "Ej schemalagd",
  "UNSCHEDULED": "EJ SCHEMALAGD",
  "Attention": "Behöver uppmärksamhet",
  "ATTENTION": "BEHÖVER UPPMÄRKSAMHET",
  "Ready": "Redo",
  "READY": "REDO",
  "Not ready": "Inte redo",
  "NOT READY": "INTE REDO",
  "Partially ready": "Delvis redo",
  "PARTIALLY READY": "DELVIS REDO",
  "No items in this category.": "Inga artiklar i den här kategorin.",
  "All OK": "Allt OK",
  "All ok": "Allt OK",
  "Tasks require attention": "Uppgifter kräver uppmärksamhet",
  "Manage your HomePrep items": "Hantera dina HomePrep-artiklar",
  "Add item": "Lägg till",
  "Add Item": "Lägg till",
  "Equipment": "Utrustning",
  "Inspection unscheduled": "Kontroll ej schemalagd",
  "Inspection": "Kontroll",
  "Linked": "Kopplad",
  "Next": "Nästa",
  "Overdue": "Försenad",
  "Due": "Förfaller",
  "Upcoming": "Kommande",
  "OK": "OK",

  // Targets static copy
  "Targets tell you what “ready” means. Quantities are measured automatically; capabilities use clear confirmations instead of abstract 0/1 values.": "Målen beskriver vad ”redo” innebär. Mängder mäts automatiskt; förmågor bekräftas tydligt i stället för med abstrakta 0/1-värden.",
  "Measured from inventory": "Mäts från förrådet",
  "Coverage you assess": "Täckning du bedömer",
  "Readiness confirmation": "Beredskapsbekräftelse",
  "Readiness checklist": "Beredskapschecklista",
  "from guidance": "från vägledning",
  "Complete the items below when they are genuinely ready.": "Markera punkterna nedan när de faktiskt är klara.",
  "Coverage is deliberately assessed by you; HomePrep will not guess days of coverage from arbitrary inventory.": "Täckningen bedöms av dig; HomePrep gissar inte antal dagar utifrån godtyckligt förrådsinnehåll.",
  "Current coverage": "Nuvarande täckning",
  "Current": "Nuvarande",
  "Minimum": "Minimum",
  "Your target": "Ditt mål",

  // Guidance UI
  "Official guidance": "Officiell vägledning",
  "Calculated guidance": "Beräknad vägledning",
  "What “ready” means": "Vad ”redo” innebär",
  "Adopted": "Tillagt",
  "Add as personal target": "Lägg till som personligt mål",

  // MSB recommendation titles
  "Stored emergency water": "Lagring av beredskapsvatten",
  "Food for one week": "Mat för en vecka",
  "Alternative cooking capability": "Alternativ möjlighet till matlagning",
  "Radio independent of mains power": "Radio oberoende av elnätet",
  "Alternative phone power": "Alternativ ström till telefon",
  "Emergency lighting": "Nödbelysning",
  "Warmth without normal heating": "Värme utan ordinarie uppvärmning",
  "First aid and household medicine": "Första hjälpen och husapotek",
  "Long-term prescription medicine reserve": "Reserv av receptbelagd långtidsmedicin",
  "Hygiene supplies without running water": "Hygienartiklar utan rinnande vatten",
  "Alternative payment capability": "Alternativa betalningsmöjligheter",
  "Important phone numbers on paper": "Viktiga telefonnummer på papper",
  "Emergency supplies for pets": "Beredskapsförråd för husdjur",

  // MSB recommendation requirements / descriptions / notes
  "I can prepare food without mains electricity": "Jag kan laga mat utan el från elnätet",
  "Confirm when your household has a usable alternative way to prepare food during an outage.": "Bekräfta när hushållet har ett fungerande alternativ för matlagning vid strömavbrott.",
  "A working radio can be used without mains power": "En fungerande radio kan användas utan el från elnätet",
  "Battery, solar or hand-crank power are examples described by MSB.": "Batteri, solceller eller handvev är exempel som MSB beskriver.",
  "MSB recommends a radio powered by batteries, solar cells or a hand crank.": "MSB rekommenderar en radio som drivs med batterier, solceller eller handvev.",
  "I can charge a phone during a power outage": "Jag kan ladda en telefon vid strömavbrott",
  "Confirm when a charged power bank or another independent charging method is available.": "Bekräfta när en laddad powerbank eller annan oberoende laddningsmöjlighet finns tillgänglig.",
  "Working lighting is available without mains power": "Fungerande belysning finns utan el från elnätet",
  "Confirm when your household has an independent light source ready to use.": "Bekräfta när hushållet har en oberoende ljuskälla redo att användas.",
  "My household can stay warm if normal heating stops": "Mitt hushåll kan hålla sig varmt om ordinarie uppvärmning slutar fungera",
  "Confirm when you have a practical plan and supplies for retaining warmth.": "Bekräfta när du har en praktisk plan och utrustning för att behålla värmen.",
  "First-aid supplies are available": "Första hjälpen-utrustning finns tillgänglig",
  "Necessary household medicines are available": "Nödvändiga läkemedel för hushållet finns tillgängliga",
  "Relevant for people with long-term prescription treatment.": "Relevant för personer med långvarig receptbelagd behandling.",
  "MSB advises people with long-term prescription treatment to preferably keep medicine for one month at home.": "MSB rekommenderar personer med långvarig receptbelagd behandling att helst ha läkemedel för en månad hemma.",
  "Hygiene can be managed without running water": "Hygienen kan skötas utan rinnande vatten",
  "Confirm when suitable hygiene supplies and a practical routine are available.": "Bekräfta när lämpliga hygienartiklar och en praktisk rutin finns på plats.",
  "Cash in smaller denominations is available": "Kontanter i mindre valörer finns tillgängliga",
  "An alternative payment method is available": "En alternativ betalningsmetod finns tillgänglig",
  "MSB recommends cash in smaller denominations and alternative payment options.": "MSB rekommenderar kontanter i mindre valörer och alternativa betalningsmöjligheter.",
  "Important phone numbers are written down and accessible offline": "Viktiga telefonnummer är nedskrivna och tillgängliga offline",
  "Relevant when the household has pets.": "Relevant när hushållet har husdjur.",
  "Emergency food, water and essential supplies are included for pets": "Beredskapsmat, vatten och nödvändiga förnödenheter finns även för husdjur",
  "MSB's current preparedness guidance states that at least three litres of water per day are needed, mainly for drinking and cooking. Adapt the amount to individual needs and circumstances.": "MSB:s aktuella råd om hemberedskap anger att minst tre liter vatten per person och dygn behövs, främst för dryck och matlagning. Anpassa mängden efter individuella behov och omständigheter.",
  "Keep food that supplies enough energy and can be stored at room temperature, prepared quickly, with little water, or eaten without cooking.": "Ha mat som ger tillräckligt med energi och som kan förvaras i rumstemperatur, tillagas snabbt med lite vatten eller ätas utan tillagning.",
};

function translatePatternSv(text) {
  let m;
  if ((m = text.match(/^(\d+) items currently tracked\.$/))) return `${m[1]} artiklar följs just nu.`;
  if ((m = text.match(/^(\d+) item currently tracked\.$/))) return `${m[1]} artikel följs just nu.`;
  if ((m = text.match(/^(\d+) require action$/))) return `${m[1]} kräver åtgärd`;
  if ((m = text.match(/^(\d+) need attention$/))) return `${m[1]} behöver uppmärksamhet`;
  if ((m = text.match(/^(\d+) not fully ready$/))) return `${m[1]} inte helt redo`;
  if ((m = text.match(/^(\d+) items$/))) return `${m[1]} artiklar`;
  if ((m = text.match(/^(\d+) item$/))) return `${m[1]} artikel`;
  if ((m = text.match(/^(\d+) total items$/))) return `${m[1]} artiklar totalt`;
  if ((m = text.match(/^(\d+) total item$/))) return `${m[1]} artikel totalt`;
  if ((m = text.match(/^(\d+) day$/))) return `${m[1]} dag`;
  if ((m = text.match(/^(\d+) days$/))) return `${m[1]} dagar`;
  if ((m = text.match(/^Food · (\d+) pcs$/))) return `Mat · ${m[1]} st`;
  if ((m = text.match(/^Equipment · (\d+) pcs · Inspection unscheduled$/))) return `Utrustning · ${m[1]} st · Kontroll ej schemalagd`;
  if ((m = text.match(/^Inspection · Every (\d+) month · Linked: (.+)$/))) return `Kontroll · Var ${m[1]}:e månad · Kopplad: ${m[2]}`;
  if ((m = text.match(/^Inspection · Every (\d+) months · Linked: (.+)$/))) return `Kontroll · Var ${m[1]}:e månad · Kopplad: ${m[2]}`;
  if ((m = text.match(/^Next: (.+)$/))) return `Nästa: ${m[1]}`;
  if ((m = text.match(/^Next check (.+)$/))) return `Nästa kontroll ${m[1]}`;
  if ((m = text.match(/^Expires (.+)$/))) return `Går ut ${m[1]}`;
  return text;
}

export function hpTExtra(text, hass) {
  const value = String(text ?? "");
  if (getHomePrepLanguage(hass) !== "sv") return value;
  return SV[value] || translatePatternSv(value);
}

export function localizeHomePrepElementExtra(root, hass) {
  if (!root || getHomePrepLanguage(hass) !== "sv") return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const original = node.nodeValue || "";
    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    const core = original.trim();
    if (!core) continue;
    const translated = hpTExtra(core, hass);
    if (translated !== core) node.nodeValue = `${leading}${translated}${trailing}`;
  }
  root.querySelectorAll?.("[placeholder],[title],[aria-label]").forEach((el) => {
    for (const attr of ["placeholder", "title", "aria-label"]) {
      if (!el.hasAttribute(attr)) continue;
      const value = el.getAttribute(attr);
      const translated = hpTExtra(value, hass);
      if (translated !== value) el.setAttribute(attr, translated);
    }
  });
}
