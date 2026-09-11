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

    def get_item(self, item_id: str) -> dict[str, Any] | None:
        """Return one HomePrep item by ID."""
        for item in self._data["items"]:
            if item.get("id") == item_id:
                return item

        return None

    async def async_add_item(
        self,
        item: dict[str, Any],
    ) -> None:
        """Add an item and save the store."""
        self._data["items"].append(item)
        await self.async_save()

    async def async_update_item(
        self,
        item_id: str,
        updates: dict[str, Any],
    ) -> bool:
        """Update an existing item."""
        item = self.get_item(item_id)

        if item is None:
            return False

        item.update(updates)
        await self.async_save()

        return True

    async def async_delete_item(
        self,
        item_id: str,
    ) -> bool:
        """Delete an item."""
        item = self.get_item(item_id)

        if item is None:
            return False

        self._data["items"].remove(item)
        await self.async_save()

        return True
