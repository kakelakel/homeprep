"""Home Assistant storage repository for HomePrep."""

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from ..core.models import normalize_item, utcnow_iso
from .base import HomePrepRepository


STORAGE_VERSION = 1
STORAGE_KEY = "homeprep.storage"


class HAStorageRepository(HomePrepRepository):
    """Store HomePrep data in Home Assistant storage."""

    def __init__(self, hass: HomeAssistant, household_id: str) -> None:
        self._household_id = household_id
        self._store: Store[dict[str, Any]] = Store(
            hass,
            STORAGE_VERSION,
            STORAGE_KEY,
        )
        self._data: dict[str, Any] = {"items": []}

    async def async_load(self) -> None:
        stored_data = await self._store.async_load()
        if stored_data is None:
            return

        original_items = stored_data.get("items", [])
        normalized_items = [
            normalize_item(item, self._household_id)
            for item in original_items
        ]
        self._data = {**stored_data, "items": normalized_items}

        if normalized_items != original_items:
            await self._store.async_save(self._data)

    async def async_save(self) -> None:
        await self._store.async_save(self._data)

    @property
    def items(self) -> list[dict[str, Any]]:
        return [
            item
            for item in self._data["items"]
            if not item.get("deleted_at")
        ]

    def get_item(self, item_id: str) -> dict[str, Any] | None:
        for item in self._data["items"]:
            if item.get("id") == item_id and not item.get("deleted_at"):
                return item
        return None

    async def async_add_item(self, item: dict[str, Any]) -> None:
        self._data["items"].append(item)
        await self.async_save()

    async def async_update_item(self, item_id: str, updates: dict[str, Any]) -> bool:
        item = self.get_item(item_id)
        if item is None:
            return False
        item.update(updates)
        await self.async_save()
        return True

    async def async_delete_item(self, item_id: str) -> bool:
        item = self.get_item(item_id)
        if item is None:
            return False

        item["deleted_at"] = utcnow_iso()
        item["updated_at"] = item["deleted_at"]
        item["revision"] = int(item.get("revision", 1)) + 1
        await self.async_save()
        return True
