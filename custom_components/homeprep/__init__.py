"""HomePrep integration for Home Assistant."""

from uuid import uuid4

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, SERVICE_ADD_ITEM
from .store import HomePrepStore


ADD_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Required("category"): cv.string,
        vol.Required("item_type"): vol.In(
            ["consumable", "equipment"]
        ),
        vol.Required("quantity"): vol.Coerce(float),
        vol.Required("unit"): cv.string,
        vol.Optional("expires_at"): cv.string,
        vol.Optional("last_checked"): cv.string,
        vol.Optional("next_check_at"): cv.string,
        vol.Optional("notes"): cv.string,
    }
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Set up HomePrep from a config entry."""

    store = HomePrepStore(hass)
    await store.async_load()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = store

    async def async_handle_add_item(call: ServiceCall) -> None:
        """Handle the add item action."""

        item = {
            "id": str(uuid4()),
            "name": call.data["name"],
            "category": call.data["category"],
            "item_type": call.data["item_type"],
            "quantity": call.data["quantity"],
            "unit": call.data["unit"],
            "expires_at": call.data.get("expires_at"),
            "last_checked": call.data.get("last_checked"),
            "next_check_at": call.data.get("next_check_at"),
            "notes": call.data.get("notes"),
        }

        await store.async_add_item(item)

    if not hass.services.has_service(DOMAIN, SERVICE_ADD_ITEM):
        hass.services.async_register(
            DOMAIN,
            SERVICE_ADD_ITEM,
            async_handle_add_item,
            schema=ADD_ITEM_SCHEMA,
        )

    return True


async def async_unload_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Unload a HomePrep config entry."""

    hass.services.async_remove(
        DOMAIN,
        SERVICE_ADD_ITEM,
    )

    if DOMAIN in hass.data:
        hass.data[DOMAIN].pop(entry.entry_id, None)

        if not hass.data[DOMAIN]:
            hass.data.pop(DOMAIN)

    return True
