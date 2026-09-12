"""Canonical taxonomy definitions for HomePrep."""

from typing import Any


CATEGORIES: dict[str, str] = {
    "food": "Food",
    "water": "Water",
    "medicine": "Medicine",
    "first_aid": "First aid",
    "hygiene": "Hygiene",
    "lighting": "Lighting",
    "power": "Power",
    "communication": "Communication",
    "fire_safety": "Fire safety",
    "tools": "Tools",
    "shelter_warmth": "Shelter & warmth",
    "cooking": "Cooking",
    "documents": "Documents",
    "cash": "Cash",
    "pet_supplies": "Pet supplies",
    "other": "Other",
}


CATEGORY_META: dict[str, dict[str, Any]] = {
    "food": {
        "group": "Essentials",
        "icon": "mdi:food",
        "form_profile": "expiry",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "can",
            "jar",
            "bag",
            "portion",
            "meal",
            "serving",
            "gram",
            "kilogram",
        ],
    },

    "water": {
        "group": "Essentials",
        "icon": "mdi:water",
        "form_profile": "expiry",
        "default_unit": "liter",
        "preferred_units": [
            "liter",
            "milliliter",
            "canister",
            "bottle",
            "gallon_us",
            "gallon_imperial",
        ],
    },

    "medicine": {
        "group": "Health",
        "icon": "mdi:pill",
        "form_profile": "expiry",
        "default_unit": "tablet",
        "preferred_units": [
            "tablet",
            "blister_pack",
            "capsule",
            "dose",
            "bottle",
            "milliliter",
            "ampoule",
            "vial",
        ],
    },

    "first_aid": {
        "group": "Health",
        "icon": "mdi:medical-bag",
        "form_profile": "balanced",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "box",
            "roll",
            "sheet",
            "bottle",
            "tube",
        ],
    },

    "hygiene": {
        "group": "Health",
        "icon": "mdi:shower",
        "form_profile": "expiry",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "roll",
            "bottle",
            "tube",
            "milliliter",
            "liter",
        ],
    },

    "lighting": {
        "group": "Utilities",
        "icon": "mdi:lightbulb",
        "form_profile": "inspection",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "set",
        ],
    },

    "power": {
        "group": "Utilities",
        "icon": "mdi:battery-charging",
        "form_profile": "inspection",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "set",
            "watt_hour",
            "kilowatt_hour",
        ],
    },

    "communication": {
        "group": "Utilities",
        "icon": "mdi:radio",
        "form_profile": "inspection",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "set",
            "pack",
        ],
    },

    "fire_safety": {
        "group": "Safety",
        "icon": "mdi:fire-extinguisher",
        "form_profile": "inspection",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "set",
            "pack",
            "kilogram",
            "liter",
        ],
    },

    "tools": {
        "group": "Household",
        "icon": "mdi:tools",
        "form_profile": "inspection",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "set",
            "pair",
            "pack",
        ],
    },

    "shelter_warmth": {
        "group": "Essentials",
        "icon": "mdi:home-thermometer",
        "form_profile": "inspection",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "set",
            "pair",
            "pack",
            "meter",
            "square_meter",
            "foot",
            "square_foot",
        ],
    },

    "cooking": {
        "group": "Essentials",
        "icon": "mdi:pot-steam",
        "form_profile": "balanced",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "set",
            "pack",
            "bottle",
            "canister",
            "liter",
            "kilogram",
        ],
    },

    "documents": {
        "group": "Administration",
        "icon": "mdi:file-document",
        "form_profile": "inspection",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "set",
            "sheet",
        ],
    },

    "cash": {
        "group": "Administration",
        "icon": "mdi:cash",
        "form_profile": "inspection",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
        ],
    },

    "pet_supplies": {
        "group": "Household",
        "icon": "mdi:paw",
        "form_profile": "balanced",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "bag",
            "can",
            "bottle",
            "liter",
            "kilogram",
        ],
    },

    "other": {
        "group": "Other",
        "icon": "mdi:package-variant",
        "form_profile": "balanced",
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "set",
        ],
    },
}


ITEM_TYPES: dict[str, str] = {
    "consumable": "Consumable",
    "equipment": "Equipment",
}


UNITS: dict[str, dict[str, str | None]] = {
    "piece": {
        "label": "Piece",
        "symbol": "pcs",
        "group": "Count",
        "system": "neutral",
    },
    "pair": {
        "label": "Pair",
        "symbol": None,
        "group": "Count",
        "system": "neutral",
    },
    "set": {
        "label": "Set",
        "symbol": None,
        "group": "Count",
        "system": "neutral",
    },
    "dozen": {
        "label": "Dozen",
        "symbol": "doz",
        "group": "Count",
        "system": "neutral",
    },

    "pack": {
        "label": "Pack",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "box": {
        "label": "Box",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "carton": {
        "label": "Carton",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "crate": {
        "label": "Crate",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "bag": {
        "label": "Bag",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "sachet": {
        "label": "Sachet",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "bottle": {
        "label": "Bottle",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "can": {
        "label": "Can",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "jar": {
        "label": "Jar",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "tube": {
        "label": "Tube",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "roll": {
        "label": "Roll",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "sheet": {
        "label": "Sheet",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "bucket": {
        "label": "Bucket",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "canister": {
        "label": "Canister",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },

    "blister_pack": {
        "label": "Blister pack",
        "symbol": None,
        "group": "Medicine",
        "system": "neutral",
    },
    "tablet": {
        "label": "Tablet",
        "symbol": None,
        "group": "Medicine",
        "system": "neutral",
    },
    "capsule": {
        "label": "Capsule",
        "symbol": None,
        "group": "Medicine",
        "system": "neutral",
    },
    "dose": {
        "label": "Dose",
        "symbol": None,
        "group": "Medicine",
        "system": "neutral",
    },
    "ampoule": {
        "label": "Ampoule",
        "symbol": None,
        "group": "Medicine",
        "system": "neutral",
    },
    "vial": {
        "label": "Vial",
        "symbol": None,
        "group": "Medicine",
        "system": "neutral",
    },

    "portion": {
        "label": "Portion",
        "symbol": None,
        "group": "Food",
        "system": "neutral",
    },
    "meal": {
        "label": "Meal",
        "symbol": None,
        "group": "Food",
        "system": "neutral",
    },
    "serving": {
        "label": "Serving",
        "symbol": None,
        "group": "Food",
        "system": "neutral",
    },

    "milliliter": {
        "label": "Milliliter",
        "symbol": "ml",
        "group": "Volume",
        "system": "metric",
    },
    "centiliter": {
        "label": "Centiliter",
        "symbol": "cl",
        "group": "Volume",
        "system": "metric",
    },
    "deciliter": {
        "label": "Deciliter",
        "symbol": "dl",
        "group": "Volume",
        "system": "metric",
    },
    "liter": {
        "label": "Liter",
        "symbol": "L",
        "group": "Volume",
        "system": "metric",
    },
    "cubic_meter": {
        "label": "Cubic meter",
        "symbol": "m³",
        "group": "Volume",
        "system": "metric",
    },

    "fluid_ounce_us": {
        "label": "US fluid ounce",
        "symbol": "fl oz",
        "group": "Volume",
        "system": "us_customary",
    },
    "cup_us": {
        "label": "US cup",
        "symbol": "cup",
        "group": "Volume",
        "system": "us_customary",
    },
    "pint_us": {
        "label": "US pint",
        "symbol": "pt",
        "group": "Volume",
        "system": "us_customary",
    },
    "quart_us": {
        "label": "US quart",
        "symbol": "qt",
        "group": "Volume",
        "system": "us_customary",
    },
    "gallon_us": {
        "label": "US gallon",
        "symbol": "gal",
        "group": "Volume",
        "system": "us_customary",
    },

    "fluid_ounce_imperial": {
        "label": "Imperial fluid ounce",
        "symbol": "fl oz",
        "group": "Volume",
        "system": "imperial",
    },
    "pint_imperial": {
        "label": "Imperial pint",
        "symbol": "pt",
        "group": "Volume",
        "system": "imperial",
    },
    "quart_imperial": {
        "label": "Imperial quart",
        "symbol": "qt",
        "group": "Volume",
        "system": "imperial",
    },
    "gallon_imperial": {
        "label": "Imperial gallon",
        "symbol": "gal",
        "group": "Volume",
        "system": "imperial",
    },

    "milligram": {
        "label": "Milligram",
        "symbol": "mg",
        "group": "Mass",
        "system": "metric",
    },
    "gram": {
        "label": "Gram",
        "symbol": "g",
        "group": "Mass",
        "system": "metric",
    },
    "kilogram": {
        "label": "Kilogram",
        "symbol": "kg",
        "group": "Mass",
        "system": "metric",
    },

    "ounce": {
        "label": "Ounce",
        "symbol": "oz",
        "group": "Mass",
        "system": "customary",
    },
    "pound": {
        "label": "Pound",
        "symbol": "lb",
        "group": "Mass",
        "system": "customary",
    },
    "stone": {
        "label": "Stone",
        "symbol": "st",
        "group": "Mass",
        "system": "imperial",
    },

    "millimeter": {
        "label": "Millimeter",
        "symbol": "mm",
        "group": "Length",
        "system": "metric",
    },
    "centimeter": {
        "label": "Centimeter",
        "symbol": "cm",
        "group": "Length",
        "system": "metric",
    },
    "meter": {
        "label": "Meter",
        "symbol": "m",
        "group": "Length",
        "system": "metric",
    },
    "kilometer": {
        "label": "Kilometer",
        "symbol": "km",
        "group": "Length",
        "system": "metric",
    },

    "inch": {
        "label": "Inch",
        "symbol": "in",
        "group": "Length",
        "system": "customary",
    },
    "foot": {
        "label": "Foot",
        "symbol": "ft",
        "group": "Length",
        "system": "customary",
    },
    "yard": {
        "label": "Yard",
        "symbol": "yd",
        "group": "Length",
        "system": "customary",
    },
    "mile": {
        "label": "Mile",
        "symbol": "mi",
        "group": "Length",
        "system": "customary",
    },

    "square_meter": {
        "label": "Square meter",
        "symbol": "m²",
        "group": "Area",
        "system": "metric",
    },
    "square_inch": {
        "label": "Square inch",
        "symbol": "in²",
        "group": "Area",
        "system": "customary",
    },
    "square_foot": {
        "label": "Square foot",
        "symbol": "ft²",
        "group": "Area",
        "system": "customary",
    },
    "square_yard": {
        "label": "Square yard",
        "symbol": "yd²",
        "group": "Area",
        "system": "customary",
    },

    "cubic_inch": {
        "label": "Cubic inch",
        "symbol": "in³",
        "group": "Volume",
        "system": "customary",
    },
    "cubic_foot": {
        "label": "Cubic foot",
        "symbol": "ft³",
        "group": "Volume",
        "system": "customary",
    },

    "watt_hour": {
        "label": "Watt-hour",
        "symbol": "Wh",
        "group": "Energy",
        "system": "neutral",
    },
    "kilowatt_hour": {
        "label": "Kilowatt-hour",
        "symbol": "kWh",
        "group": "Energy",
        "system": "neutral",
    },

    "other": {
        "label": "Other",
        "symbol": None,
        "group": "Other",
        "system": "neutral",
    },
}


CATEGORY_ALIASES = {
    "food": "food",
    "mat": "food",
    "water": "water",
    "vatten": "water",
    "drink": "water",
    "medicine": "medicine",
    "medicin": "medicine",
    "läkemedel": "medicine",
    "lakemedel": "medicine",
    "first aid": "first_aid",
    "first_aid": "first_aid",
    "första hjälpen": "first_aid",
    "forsta hjalpen": "first_aid",
    "hygiene": "hygiene",
    "hygien": "hygiene",
    "lighting": "lighting",
    "belysning": "lighting",
    "power": "power",
    "ström": "power",
    "strom": "power",
    "el": "power",
    "communication": "communication",
    "kommunikation": "communication",
    "fire safety": "fire_safety",
    "fire_safety": "fire_safety",
    "brandskydd": "fire_safety",
    "tools": "tools",
    "verktyg": "tools",
    "shelter & warmth": "shelter_warmth",
    "shelter_warmth": "shelter_warmth",
    "värme": "shelter_warmth",
    "varme": "shelter_warmth",
    "cooking": "cooking",
    "matlagning": "cooking",
    "documents": "documents",
    "dokument": "documents",
    "cash": "cash",
    "kontanter": "cash",
    "pet supplies": "pet_supplies",
    "pet_supplies": "pet_supplies",
    "husdjur": "pet_supplies",
    "other": "other",
    "övrigt": "other",
    "ovrigt": "other",
}


ITEM_TYPE_ALIASES = {
    "consumable": "consumable",
    "förbrukningsvara": "consumable",
    "forbrukningsvara": "consumable",
    "equipment": "equipment",
    "utrustning": "equipment",
}


UNIT_ALIASES = {
    "piece": "piece",
    "pieces": "piece",
    "pcs": "piece",
    "pc": "piece",
    "st": "piece",
    "styck": "piece",

    "pair": "pair",
    "par": "pair",

    "set": "set",

    "pack": "pack",
    "package": "pack",
    "paket": "pack",
    "förpackning": "pack",
    "forpackning": "pack",

    "box": "box",
    "låda": "box",
    "lada": "box",

    "bag": "bag",
    "påse": "bag",
    "pase": "bag",

    "bottle": "bottle",
    "flaska": "bottle",

    "can": "can",
    "burk": "can",

    "tube": "tube",
    "tub": "tube",

    "roll": "roll",
    "rulle": "roll",

    "sheet": "sheet",
    "ark": "sheet",

    "bucket": "bucket",
    "hink": "bucket",

    "canister": "canister",
    "dunk": "canister",

    "blister pack": "blister_pack",
    "blister_pack": "blister_pack",
    "tablettkarta": "blister_pack",

    "tablet": "tablet",
    "tablett": "tablet",

    "capsule": "capsule",
    "kapsel": "capsule",

    "dose": "dose",
    "dos": "dose",

    "ml": "milliliter",
    "milliliter": "milliliter",
    "cl": "centiliter",
    "centiliter": "centiliter",
    "dl": "deciliter",
    "deciliter": "deciliter",
    "l": "liter",
    "liter": "liter",
    "litre": "liter",

    "m3": "cubic_meter",
    "m³": "cubic_meter",
    "kubik": "cubic_meter",
    "kubikmeter": "cubic_meter",

    "mg": "milligram",
    "milligram": "milligram",
    "g": "gram",
    "gram": "gram",
    "kg": "kilogram",
    "kilogram": "kilogram",

    "oz": "ounce",
    "ounce": "ounce",
    "lb": "pound",
    "lbs": "pound",
    "pound": "pound",

    "mm": "millimeter",
    "millimeter": "millimeter",
    "cm": "centimeter",
    "centimeter": "centimeter",
    "m": "meter",
    "meter": "meter",
    "km": "kilometer",
    "kilometer": "kilometer",

    "in": "inch",
    "inch": "inch",
    "ft": "foot",
    "foot": "foot",
    "feet": "foot",
    "yd": "yard",
    "yard": "yard",
    "mi": "mile",
    "mile": "mile",

    "wh": "watt_hour",
    "watt-hour": "watt_hour",
    "kwh": "kilowatt_hour",
    "kilowatt-hour": "kilowatt_hour",

    "other": "other",
    "övrigt": "other",
    "ovrigt": "other",
}


def _key(value: Any) -> str:
    if value is None:
        return ""

    return str(value).strip().casefold()


def normalize_category(value: Any) -> str:
    raw = str(value or "").strip()

    if raw in CATEGORIES:
        return raw

    return CATEGORY_ALIASES.get(
        _key(raw),
        raw,
    )


def normalize_item_type(value: Any) -> str:
    raw = str(value or "").strip()

    if raw in ITEM_TYPES:
        return raw

    return ITEM_TYPE_ALIASES.get(
        _key(raw),
        raw,
    )


def normalize_unit(value: Any) -> str:
    raw = str(value or "").strip()

    if raw in UNITS:
        return raw

    return UNIT_ALIASES.get(
        _key(raw),
        raw,
    )


def validate_category(value: Any) -> str:
    normalized = normalize_category(value)

    if normalized not in CATEGORIES:
        raise ValueError(
            f"Unknown HomePrep category: {value}"
        )

    return normalized


def validate_item_type(value: Any) -> str:
    normalized = normalize_item_type(value)

    if normalized not in ITEM_TYPES:
        raise ValueError(
            f"Unknown HomePrep item type: {value}"
        )

    return normalized


def validate_unit(value: Any) -> str:
    normalized = normalize_unit(value)

    if normalized not in UNITS:
        raise ValueError(
            f"Unknown HomePrep unit: {value}"
        )

    return normalized


def get_taxonomy() -> dict[str, Any]:
    return {
        "categories": [
            {
                "id": category_id,
                "label": label,
                "group": CATEGORY_META[
                    category_id
                ]["group"],
                "icon": CATEGORY_META[
                    category_id
                ]["icon"],
                "form_profile": CATEGORY_META[
                    category_id
                ]["form_profile"],
                "default_unit": CATEGORY_META[
                    category_id
                ]["default_unit"],
                "preferred_units": CATEGORY_META[
                    category_id
                ]["preferred_units"],
            }
            for category_id, label
            in CATEGORIES.items()
        ],

        "item_types": [
            {
                "id": item_type_id,
                "label": label,
            }
            for item_type_id, label
            in ITEM_TYPES.items()
        ],

        "units": [
            {
                "id": unit_id,
                "label": data["label"],
                "symbol": data["symbol"],
                "group": data["group"],
                "system": data["system"],
            }
            for unit_id, data
            in UNITS.items()
        ],
    }
