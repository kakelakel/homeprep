"""Home Assistant Store-backed shopping list repository."""
from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .models import normalize_shopping_item, utcnow_iso

SHOPPING_STORAGE_VERSION = 1
SHOPPING_STORAGE_KEY = "homeprep.shopping"


class HAShoppingRepository:
    def __init__(self, hass: HomeAssistant, household_id: str) -> None:
        self._household_id = household_id
        self._store = Store(hass, SHOPPING_STORAGE_VERSION, SHOPPING_STORAGE_KEY)
        self._items: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self._items = [normalize_shopping_item(item, self._household_id) for item in data.get("items", [])]
        await self._save()

    @property
    def items(self) -> list[dict[str, Any]]:
        return [dict(item) for item in self._items if not item.get("deleted_at")]

    @property
    def all_items(self) -> list[dict[str, Any]]:
        return [dict(item) for item in self._items]

    async def async_add(self, item: dict[str, Any]) -> dict[str, Any]:
        self._items.append(item)
        await self._save()
        return dict(item)

    async def async_update(self, item_id: str, item: dict[str, Any]) -> dict[str, Any]:
        for index, current in enumerate(self._items):
            if current["id"] == item_id and not current.get("deleted_at"):
                self._items[index] = item
                await self._save()
                return dict(item)
        raise KeyError(item_id)

    async def async_delete(self, item_id: str) -> None:
        for item in self._items:
            if item["id"] == item_id and not item.get("deleted_at"):
                item["deleted_at"] = utcnow_iso()
                item["updated_at"] = item["deleted_at"]
                item["revision"] = int(item.get("revision", 1)) + 1
                await self._save()
                return
        raise KeyError(item_id)

    async def _save(self) -> None:
        await self._store.async_save({"items": self._items})
