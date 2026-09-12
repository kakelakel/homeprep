"""Core HomePrep service."""

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send

from ..const import SIGNAL_ITEMS_UPDATED
from ..repositories.base import HomePrepRepository
from .models import create_item, utcnow_iso


class HomePrepService:
    """Provide HomePrep domain operations."""

    def __init__(
        self,
        hass: HomeAssistant,
        repository: HomePrepRepository,
        household_id: str,
    ) -> None:
        self._hass = hass
        self._repository = repository
        self._household_id = household_id

    async def async_load(self) -> None:
        await self._repository.async_load()

    @property
    def items(self) -> list[dict[str, Any]]:
        return self._repository.items

    def get_item(self, item_id: str) -> dict[str, Any] | None:
        return self._repository.get_item(item_id)

    async def async_add_item(self, data: dict[str, Any]) -> dict[str, Any]:
        item = create_item(data, self._household_id)
        await self._repository.async_add_item(item)
        async_dispatcher_send(self._hass, SIGNAL_ITEMS_UPDATED)
        return item

    async def async_update_item(
        self,
        item_id: str,
        updates: dict[str, Any],
    ) -> bool:
        item = self.get_item(item_id)
        if item is None:
            return False

        protected_fields = {
            "id",
            "household_id",
            "created_at",
            "deleted_at",
            "revision",
            "schema_version",
        }
        clean_updates = {
            key: value
            for key, value in updates.items()
            if key not in protected_fields
        }
        clean_updates["updated_at"] = utcnow_iso()
        clean_updates["revision"] = int(item.get("revision", 1)) + 1

        result = await self._repository.async_update_item(item_id, clean_updates)
        if result:
            async_dispatcher_send(self._hass, SIGNAL_ITEMS_UPDATED)
        return result

    async def async_delete_item(self, item_id: str) -> bool:
        result = await self._repository.async_delete_item(item_id)
        if result:
            async_dispatcher_send(self._hass, SIGNAL_ITEMS_UPDATED)
        return result
