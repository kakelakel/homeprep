"""HomePrep integration for Home Assistant."""

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .store import HomePrepStore


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Set up HomePrep from a config entry."""

    store = HomePrepStore(hass)
    await store.async_load()

    if not store.items:
        await store.async_add_item(
            {
                "id": "test-item",
                "name": "Test item",
                "category": "food",
                "item_type": "consumable",
                "quantity": 1,
                "unit": "piece",
                "expires_at": None,
                "last_checked": None,
                "next_check_at": None,
                "notes": "Created automatically for storage testing.",
            }
        )

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = store

    return True


async def async_unload_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Unload a HomePrep config entry."""

    if DOMAIN in hass.data:
        hass.data[DOMAIN].pop(entry.entry_id, None)

        if not hass.data[DOMAIN]:
            hass.data.pop(DOMAIN)

    return True
