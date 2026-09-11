"""Storage handling for HomePrep."""

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

STORAGE_VERSION = 1
STORAGE_KEY = "homeprep.storage"


class HomePrepStore:
    """Handle persistent storage for HomePrep."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the HomePrep store."""
        self._store: Store[dict[str, Any]] = Store(
            hass,
            STORAGE_VERSION,
            STORAGE_KEY,
        )

        self._data: dict[str, Any] = {
            "items": [],
        }

    async def async_load(self) -> None:
        """Load HomePrep data from storage."""
        stored_data = await self._store.async_load()

        if stored_data is not None:
            self._data = stored_data

    async def async_save(self) -> None:
        """Save HomePrep data to storage."""
        await self._store.async_save(self._data)

    @property
    def items(self) -> list[dict[str, Any]]:
        """Return all HomePrep items."""
        return self._data["items"]

    async def async_add_item(
        self,
        item: dict[str, Any],
    ) -> None:
        """Add an item and save the store."""
        self._data["items"].append(item)
        await self.async_save()
