"""HomePrep integration for Home Assistant."""

from pathlib import Path
from uuid import uuid4

import voluptuous as vol

from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .const import (
    DOMAIN,
    SERVICE_ADD_ITEM,
    SERVICE_DELETE_ITEM,
    SERVICE_UPDATE_ITEM,
)
from .store import HomePrepStore


PLATFORMS = ["sensor"]

FRONTEND_PATH = Path(__file__).parent / "frontend"
FRONTEND_URL = "/api/homeprep/frontend"


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

UPDATE_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("item_id"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("category"): cv.string,
        vol.Optional("item_type"): vol.In(
            ["consumable", "equipment"]
        ),
        vol.Optional("quantity"): vol.Coerce(float),
        vol.Optional("unit"): cv.string,
        vol.Optional("expires_at"): cv.string,
        vol.Optional("last_checked"): cv.string,
        vol.Optional("next_check_at"): cv.string,
        vol.Optional("notes"): cv.string,
    }
)

DELETE_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("item_id"): cv.string,
    }
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Set up HomePrep from a config entry."""

    # Register HomePrep frontend files.
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                FRONTEND_URL,
                str(FRONTEND_PATH),
                False,
            )
        ]
    )

    # Load persistent HomePrep storage.
    store = HomePrepStore(hass)
    await store.async_load()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = store

    # Load Home Assistant platforms.
    await hass.config_entries.async_forward_entry_setups(
        entry,
        PLATFORMS,
    )

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

    async def async_handle_update_item(call: ServiceCall) -> None:
        """Handle the update item action."""

        item_id = call.data["item_id"]

        updates = {
            key: value
            for key, value in call.data.items()
            if key != "item_id"
        }

        await store.async_update_item(
            item_id,
            updates,
        )

    async def async_handle_delete_item(call: ServiceCall) -> None:
        """Handle the delete item action."""

        await store.async_delete_item(
            call.data["item_id"],
        )

    if not hass.services.has_service(
        DOMAIN,
        SERVICE_ADD_ITEM,
    ):
        hass.services.async_register(
            DOMAIN,
            SERVICE_ADD_ITEM,
            async_handle_add_item,
            schema=ADD_ITEM_SCHEMA,
        )

    if not hass.services.has_service(
        DOMAIN,
        SERVICE_UPDATE_ITEM,
    ):
        hass.services.async_register(
            DOMAIN,
            SERVICE_UPDATE_ITEM,
            async_handle_update_item,
            schema=UPDATE_ITEM_SCHEMA,
        )

    if not hass.services.has_service(
        DOMAIN,
        SERVICE_DELETE_ITEM,
    ):
        hass.services.async_register(
            DOMAIN,
            SERVICE_DELETE_ITEM,
            async_handle_delete_item,
            schema=DELETE_ITEM_SCHEMA,
        )

    return True


async def async_unload_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Unload a HomePrep config entry."""

    unload_ok = await hass.config_entries.async_unload_platforms(
        entry,
        PLATFORMS,
    )

    if not unload_ok:
        return False

    if hass.services.has_service(
        DOMAIN,
        SERVICE_ADD_ITEM,
    ):
        hass.services.async_remove(
            DOMAIN,
            SERVICE_ADD_ITEM,
        )

    if hass.services.has_service(
        DOMAIN,
        SERVICE_UPDATE_ITEM,
    ):
        hass.services.async_remove(
            DOMAIN,
            SERVICE_UPDATE_ITEM,
        )

    if hass.services.has_service(
        DOMAIN,
        SERVICE_DELETE_ITEM,
    ):
        hass.services.async_remove(
            DOMAIN,
            SERVICE_DELETE_ITEM,
        )

    if DOMAIN in hass.data:
        hass.data[DOMAIN].pop(
            entry.entry_id,
            None,
        )

        if not hass.data[DOMAIN]:
            hass.data.pop(DOMAIN)

    return True
