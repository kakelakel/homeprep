const STORAGE_KEY = "homeprep-language";

export const HOME_PREP_LANGUAGES = ["auto", "en", "sv", "nb", "da", "fi", "de", "fr"];

export const HOME_PREP_LANGUAGE_NAMES = {
  auto: "Automatic / Home Assistant",
  en: "English",
  sv: "Svenska",
  nb: "Norsk bokmål",
  da: "Dansk",
  fi: "Suomi",
  de: "Deutsch",
  fr: "Français",
};

const ALIASES = {
  no: "nb",
  "nb-no": "nb",
  "no-no": "nb",
  "sv-se": "sv",
  "da-dk": "da",
  "fi-fi": "fi",
  "de-de": "de",
  "fr-fr": "fr",
  "en-gb": "en",
  "en-us": "en",
};

const T = {
  sv: {
    "Overview": "Översikt", "Inventory": "Förråd", "Tasks": "Uppgifter", "Personal targets": "Personliga mål", "Targets": "Mål", "Guidance": "Vägledning", "Household": "Hushåll", "Settings": "Inställningar",
    "Add item": "Lägg till", "Add inventory item": "Lägg till förrådsartikel", "Edit inventory item": "Redigera förrådsartikel", "Save item": "Spara", "Edit": "Redigera", "Delete": "Ta bort", "Cancel": "Avbryt",
    "Add task": "Lägg till uppgift", "Edit task": "Redigera uppgift", "Save task": "Spara uppgift", "Complete": "Klarmarkera", "Enabled": "Aktiverad",
    "Name": "Namn", "Category": "Kategori", "Item type": "Typ", "Quantity": "Antal", "Unit": "Enhet", "Expires": "Bäst före", "Last checked": "Senast kontrollerad", "Next check / first inspection due": "Nästa kontroll / första inspektion", "Recurring inspection": "Återkommande inspektion", "Repeat every": "Upprepa var", "Period": "Period", "After completion": "Efter slutförande", "Reminder before due": "Påminn före förfallodatum", "Notes": "Anteckningar", "Next due": "Nästa förfallodatum",
    "Consumable": "Förbrukningsvara", "Equipment": "Utrustning", "Days": "Dagar", "Weeks": "Veckor", "Months": "Månader", "Years": "År", "Keep planned cadence": "Behåll planerat intervall", "Schedule from completion": "Schemalägg från slutförande",
    "Current": "Nuvarande", "Current coverage": "Nuvarande täckning", "Minimum": "Minimum", "Your target": "Ditt mål", "Priority": "Prioritet", "Normal": "Normal", "High": "Hög", "Critical": "Kritisk", "Not assessed": "Inte bedömd", "Inventory": "Förråd",
    "Official guidance": "Officiell vägledning", "Preparedness baseline": "Beredskapsbaslinje", "Adopt": "Lägg till som mål", "Already adopted": "Redan tillagt",
    "Save notification settings": "Spara notifieringsinställningar", "Saving…": "Sparar…", "Saved": "Sparat", "Settings saved": "Inställningarna sparades", "Could not save settings": "Kunde inte spara inställningarna", "Send test notification": "Skicka testnotis",
    "Language": "Språk", "Automatic / Home Assistant": "Automatiskt / Home Assistant",
    "Food": "Mat", "Water": "Vatten", "Medicine": "Medicin", "First aid": "Första hjälpen", "Hygiene": "Hygien", "Lighting": "Belysning", "Power": "Ström", "Communication": "Kommunikation", "Fire safety": "Brandsäkerhet", "Tools": "Verktyg", "Shelter & warmth": "Skydd & värme", "Cooking": "Matlagning", "Documents": "Dokument", "Cash": "Kontanter", "Pet supplies": "Husdjur", "Other": "Övrigt"
  },
  nb: {
    "Overview": "Oversikt", "Inventory": "Lager", "Tasks": "Oppgaver", "Personal targets": "Personlige mål", "Targets": "Mål", "Guidance": "Veiledning", "Household": "Husholdning", "Settings": "Innstillinger",
    "Add item": "Legg til", "Add inventory item": "Legg til lagerartikkel", "Edit inventory item": "Rediger lagerartikkel", "Save item": "Lagre", "Edit": "Rediger", "Delete": "Slett", "Cancel": "Avbryt",
    "Add task": "Legg til oppgave", "Edit task": "Rediger oppgave", "Save task": "Lagre oppgave", "Complete": "Fullfør", "Enabled": "Aktivert",
    "Name": "Navn", "Category": "Kategori", "Item type": "Type", "Quantity": "Antall", "Unit": "Enhet", "Expires": "Utløper", "Last checked": "Sist kontrollert", "Next check / first inspection due": "Neste kontroll / første inspeksjon", "Recurring inspection": "Gjentakende inspeksjon", "Repeat every": "Gjenta hver", "Period": "Periode", "After completion": "Etter fullføring", "Reminder before due": "Påminnelse før frist", "Notes": "Notater", "Next due": "Neste frist",
    "Consumable": "Forbruksvare", "Equipment": "Utstyr", "Days": "Dager", "Weeks": "Uker", "Months": "Måneder", "Years": "År", "Keep planned cadence": "Behold planlagt intervall", "Schedule from completion": "Planlegg fra fullføring",
    "Current": "Nåværende", "Current coverage": "Nåværende dekning", "Minimum": "Minimum", "Your target": "Ditt mål", "Priority": "Prioritet", "Normal": "Normal", "High": "Høy", "Critical": "Kritisk", "Not assessed": "Ikke vurdert",
    "Official guidance": "Offisiell veiledning", "Preparedness baseline": "Beredskapsgrunnlag", "Adopt": "Legg til som mål", "Already adopted": "Allerede lagt til",
    "Save notification settings": "Lagre varslingsinnstillinger", "Saving…": "Lagrer…", "Saved": "Lagret", "Settings saved": "Innstillingene er lagret", "Could not save settings": "Kunne ikke lagre innstillingene", "Send test notification": "Send testvarsel", "Language": "Språk", "Automatic / Home Assistant": "Automatisk / Home Assistant",
    "Food": "Mat", "Water": "Vann", "Medicine": "Medisin", "First aid": "Førstehjelp", "Hygiene": "Hygiene", "Lighting": "Belysning", "Power": "Strøm", "Communication": "Kommunikasjon", "Fire safety": "Brannsikkerhet", "Tools": "Verktøy", "Shelter & warmth": "Ly & varme", "Cooking": "Matlaging", "Documents": "Dokumenter", "Cash": "Kontanter", "Pet supplies": "Kjæledyr", "Other": "Annet"
  },
  da: {
    "Overview": "Oversigt", "Inventory": "Lager", "Tasks": "Opgaver", "Personal targets": "Personlige mål", "Targets": "Mål", "Guidance": "Vejledning", "Household": "Husstand", "Settings": "Indstillinger",
    "Add item": "Tilføj", "Add inventory item": "Tilføj lagerartikel", "Edit inventory item": "Rediger lagerartikel", "Save item": "Gem", "Edit": "Rediger", "Delete": "Slet", "Cancel": "Annuller", "Add task": "Tilføj opgave", "Edit task": "Rediger opgave", "Save task": "Gem opgave", "Complete": "Fuldfør", "Enabled": "Aktiveret",
    "Name": "Navn", "Category": "Kategori", "Item type": "Type", "Quantity": "Antal", "Unit": "Enhed", "Expires": "Udløber", "Last checked": "Sidst kontrolleret", "Next check / first inspection due": "Næste kontrol / første inspektion", "Recurring inspection": "Gentagen inspektion", "Repeat every": "Gentag hver", "Period": "Periode", "After completion": "Efter fuldførelse", "Reminder before due": "Påmindelse før frist", "Notes": "Noter", "Next due": "Næste frist",
    "Consumable": "Forbrugsvare", "Equipment": "Udstyr", "Days": "Dage", "Weeks": "Uger", "Months": "Måneder", "Years": "År", "Keep planned cadence": "Behold planlagt interval", "Schedule from completion": "Planlæg fra fuldførelse", "Current": "Nuværende", "Current coverage": "Nuværende dækning", "Minimum": "Minimum", "Your target": "Dit mål", "Priority": "Prioritet", "Normal": "Normal", "High": "Høj", "Critical": "Kritisk", "Not assessed": "Ikke vurderet",
    "Official guidance": "Officiel vejledning", "Preparedness baseline": "Beredskabsgrundlag", "Adopt": "Tilføj som mål", "Already adopted": "Allerede tilføjet", "Save notification settings": "Gem notifikationsindstillinger", "Saving…": "Gemmer…", "Saved": "Gemt", "Settings saved": "Indstillingerne er gemt", "Could not save settings": "Kunne ikke gemme indstillingerne", "Send test notification": "Send testnotifikation", "Language": "Sprog", "Automatic / Home Assistant": "Automatisk / Home Assistant",
    "Food": "Mad", "Water": "Vand", "Medicine": "Medicin", "First aid": "Førstehjælp", "Hygiene": "Hygiejne", "Lighting": "Belysning", "Power": "Strøm", "Communication": "Kommunikation", "Fire safety": "Brandsikkerhed", "Tools": "Værktøj", "Shelter & warmth": "Ly & varme", "Cooking": "Madlavning", "Documents": "Dokumenter", "Cash": "Kontanter", "Pet supplies": "Kæledyr", "Other": "Andet"
  },
  fi: {
    "Overview": "Yleiskatsaus", "Inventory": "Varasto", "Tasks": "Tehtävät", "Personal targets": "Henkilökohtaiset tavoitteet", "Targets": "Tavoitteet", "Guidance": "Ohjeistus", "Household": "Kotitalous", "Settings": "Asetukset",
    "Add item": "Lisää", "Add inventory item": "Lisää varastotuote", "Edit inventory item": "Muokkaa varastotuotetta", "Save item": "Tallenna", "Edit": "Muokkaa", "Delete": "Poista", "Cancel": "Peruuta", "Add task": "Lisää tehtävä", "Edit task": "Muokkaa tehtävää", "Save task": "Tallenna tehtävä", "Complete": "Merkitse valmiiksi", "Enabled": "Käytössä",
    "Name": "Nimi", "Category": "Luokka", "Item type": "Tyyppi", "Quantity": "Määrä", "Unit": "Yksikkö", "Expires": "Vanhenee", "Last checked": "Tarkistettu viimeksi", "Next check / first inspection due": "Seuraava tarkistus / ensimmäinen tarkastus", "Recurring inspection": "Toistuva tarkastus", "Repeat every": "Toista joka", "Period": "Jakso", "After completion": "Valmistumisen jälkeen", "Reminder before due": "Muistutus ennen määräaikaa", "Notes": "Muistiinpanot", "Next due": "Seuraava määräaika",
    "Consumable": "Kulutustavara", "Equipment": "Varuste", "Days": "Päivät", "Weeks": "Viikot", "Months": "Kuukaudet", "Years": "Vuodet", "Keep planned cadence": "Säilytä suunniteltu rytmi", "Schedule from completion": "Aikatauluta valmistumisesta", "Current": "Nykyinen", "Current coverage": "Nykyinen kattavuus", "Minimum": "Minimi", "Your target": "Tavoitteesi", "Priority": "Prioriteetti", "Normal": "Normaali", "High": "Korkea", "Critical": "Kriittinen", "Not assessed": "Ei arvioitu",
    "Official guidance": "Virallinen ohjeistus", "Preparedness baseline": "Varautumisen perustaso", "Adopt": "Lisää tavoitteeksi", "Already adopted": "Jo lisätty", "Save notification settings": "Tallenna ilmoitusasetukset", "Saving…": "Tallennetaan…", "Saved": "Tallennettu", "Settings saved": "Asetukset tallennettu", "Could not save settings": "Asetuksia ei voitu tallentaa", "Send test notification": "Lähetä testi-ilmoitus", "Language": "Kieli", "Automatic / Home Assistant": "Automaattinen / Home Assistant",
    "Food": "Ruoka", "Water": "Vesi", "Medicine": "Lääkkeet", "First aid": "Ensiapu", "Hygiene": "Hygienia", "Lighting": "Valaistus", "Power": "Virta", "Communication": "Viestintä", "Fire safety": "Paloturvallisuus", "Tools": "Työkalut", "Shelter & warmth": "Suoja & lämpö", "Cooking": "Ruoanlaitto", "Documents": "Asiakirjat", "Cash": "Käteinen", "Pet supplies": "Lemmikkitarvikkeet", "Other": "Muu"
  },
  de: {
    "Overview": "Übersicht", "Inventory": "Vorrat", "Tasks": "Aufgaben", "Personal targets": "Persönliche Ziele", "Targets": "Ziele", "Guidance": "Leitfaden", "Household": "Haushalt", "Settings": "Einstellungen",
    "Add item": "Hinzufügen", "Add inventory item": "Vorratsartikel hinzufügen", "Edit inventory item": "Vorratsartikel bearbeiten", "Save item": "Speichern", "Edit": "Bearbeiten", "Delete": "Löschen", "Cancel": "Abbrechen", "Add task": "Aufgabe hinzufügen", "Edit task": "Aufgabe bearbeiten", "Save task": "Aufgabe speichern", "Complete": "Erledigen", "Enabled": "Aktiviert",
    "Name": "Name", "Category": "Kategorie", "Item type": "Typ", "Quantity": "Menge", "Unit": "Einheit", "Expires": "Läuft ab", "Last checked": "Zuletzt geprüft", "Next check / first inspection due": "Nächste Prüfung / erste Inspektion", "Recurring inspection": "Wiederkehrende Inspektion", "Repeat every": "Wiederholen alle", "Period": "Zeitraum", "After completion": "Nach Abschluss", "Reminder before due": "Erinnerung vor Fälligkeit", "Notes": "Notizen", "Next due": "Nächste Fälligkeit",
    "Consumable": "Verbrauchsartikel", "Equipment": "Ausrüstung", "Days": "Tage", "Weeks": "Wochen", "Months": "Monate", "Years": "Jahre", "Keep planned cadence": "Geplanten Rhythmus beibehalten", "Schedule from completion": "Ab Abschluss planen", "Current": "Aktuell", "Current coverage": "Aktuelle Abdeckung", "Minimum": "Minimum", "Your target": "Dein Ziel", "Priority": "Priorität", "Normal": "Normal", "High": "Hoch", "Critical": "Kritisch", "Not assessed": "Nicht bewertet",
    "Official guidance": "Offizieller Leitfaden", "Preparedness baseline": "Vorsorge-Basis", "Adopt": "Als Ziel übernehmen", "Already adopted": "Bereits übernommen", "Save notification settings": "Benachrichtigungseinstellungen speichern", "Saving…": "Speichern…", "Saved": "Gespeichert", "Settings saved": "Einstellungen gespeichert", "Could not save settings": "Einstellungen konnten nicht gespeichert werden", "Send test notification": "Testbenachrichtigung senden", "Language": "Sprache", "Automatic / Home Assistant": "Automatisch / Home Assistant",
    "Food": "Lebensmittel", "Water": "Wasser", "Medicine": "Medikamente", "First aid": "Erste Hilfe", "Hygiene": "Hygiene", "Lighting": "Beleuchtung", "Power": "Strom", "Communication": "Kommunikation", "Fire safety": "Brandschutz", "Tools": "Werkzeuge", "Shelter & warmth": "Schutz & Wärme", "Cooking": "Kochen", "Documents": "Dokumente", "Cash": "Bargeld", "Pet supplies": "Haustierbedarf", "Other": "Sonstiges"
  },
  fr: {
    "Overview": "Aperçu", "Inventory": "Stock", "Tasks": "Tâches", "Personal targets": "Objectifs personnels", "Targets": "Objectifs", "Guidance": "Recommandations", "Household": "Foyer", "Settings": "Paramètres",
    "Add item": "Ajouter", "Add inventory item": "Ajouter un article", "Edit inventory item": "Modifier l’article", "Save item": "Enregistrer", "Edit": "Modifier", "Delete": "Supprimer", "Cancel": "Annuler", "Add task": "Ajouter une tâche", "Edit task": "Modifier la tâche", "Save task": "Enregistrer la tâche", "Complete": "Terminer", "Enabled": "Activé",
    "Name": "Nom", "Category": "Catégorie", "Item type": "Type", "Quantity": "Quantité", "Unit": "Unité", "Expires": "Expire", "Last checked": "Dernière vérification", "Next check / first inspection due": "Prochaine vérification / première inspection", "Recurring inspection": "Inspection récurrente", "Repeat every": "Répéter tous les", "Period": "Période", "After completion": "Après réalisation", "Reminder before due": "Rappel avant échéance", "Notes": "Notes", "Next due": "Prochaine échéance",
    "Consumable": "Consommable", "Equipment": "Équipement", "Days": "Jours", "Weeks": "Semaines", "Months": "Mois", "Years": "Années", "Keep planned cadence": "Conserver le rythme prévu", "Schedule from completion": "Planifier après réalisation", "Current": "Actuel", "Current coverage": "Couverture actuelle", "Minimum": "Minimum", "Your target": "Votre objectif", "Priority": "Priorité", "Normal": "Normale", "High": "Élevée", "Critical": "Critique", "Not assessed": "Non évalué",
    "Official guidance": "Recommandations officielles", "Preparedness baseline": "Base de préparation", "Adopt": "Ajouter comme objectif", "Already adopted": "Déjà ajouté", "Save notification settings": "Enregistrer les paramètres de notification", "Saving…": "Enregistrement…", "Saved": "Enregistré", "Settings saved": "Paramètres enregistrés", "Could not save settings": "Impossible d’enregistrer les paramètres", "Send test notification": "Envoyer une notification test", "Language": "Langue", "Automatic / Home Assistant": "Automatique / Home Assistant",
    "Food": "Alimentation", "Water": "Eau", "Medicine": "Médicaments", "First aid": "Premiers secours", "Hygiene": "Hygiène", "Lighting": "Éclairage", "Power": "Énergie", "Communication": "Communication", "Fire safety": "Sécurité incendie", "Tools": "Outils", "Shelter & warmth": "Abri & chaleur", "Cooking": "Cuisine", "Documents": "Documents", "Cash": "Espèces", "Pet supplies": "Animaux", "Other": "Autre"
  }
};

export function getHomePrepLanguage(hass) {
  const override = localStorage.getItem(STORAGE_KEY) || "auto";
  if (override !== "auto" && HOME_PREP_LANGUAGES.includes(override)) return override;
  const raw = String(hass?.language || hass?.locale?.language || navigator.language || "en").toLowerCase();
  const normalized = ALIASES[raw] || ALIASES[raw.replace("_", "-")] || raw.split(/[-_]/)[0];
  return HOME_PREP_LANGUAGES.includes(normalized) ? normalized : "en";
}

export function getHomePrepLanguageOverride() {
  const value = localStorage.getItem(STORAGE_KEY) || "auto";
  return HOME_PREP_LANGUAGES.includes(value) ? value : "auto";
}

export function setHomePrepLanguageOverride(value) {
  const safe = HOME_PREP_LANGUAGES.includes(value) ? value : "auto";
  if (safe === "auto") localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, safe);
}

export function hpT(text, hass) {
  const language = getHomePrepLanguage(hass);
  if (language === "en") return text;
  return T[language]?.[text] || text;
}

export function localizeHomePrepHtml(html, hass) {
  if (!html || getHomePrepLanguage(hass) === "en") return html;
  const template = document.createElement("template");
  template.innerHTML = String(html);
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const original = node.nodeValue || "";
    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    const core = original.trim();
    if (!core) continue;
    const translated = hpT(core, hass);
    if (translated !== core) node.nodeValue = `${leading}${translated}${trailing}`;
  }
  for (const el of template.content.querySelectorAll("[placeholder],[title],[aria-label]")) {
    for (const attr of ["placeholder", "title", "aria-label"]) {
      if (!el.hasAttribute(attr)) continue;
      const value = el.getAttribute(attr);
      const translated = hpT(value, hass);
      if (translated !== value) el.setAttribute(attr, translated);
    }
  }
  return template.innerHTML;
}

export function languageOptionsHtml(hass) {
  const selected = getHomePrepLanguageOverride();
  return HOME_PREP_LANGUAGES.map((code) => {
    const label = code === "auto" ? hpT(HOME_PREP_LANGUAGE_NAMES.auto, hass) : HOME_PREP_LANGUAGE_NAMES[code];
    return `<option value="${code}" ${selected === code ? "selected" : ""}>${label}</option>`;
  }).join("");
}
