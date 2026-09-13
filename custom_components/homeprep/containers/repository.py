"""Home Assistant Store-backed container repository."""
from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .models import normalize_container, utcnow_iso

CONTAINER_STORAGE_VERSION = 1
CONTAINER_STORAGE_KEY = "homeprep.containers"


class HAContainerRepository:
    def __init__(self, hass: HomeAssistant, household_id: str) -> None:
        self._household_id = household_id
        self._store = Store(hass, CONTAINER_STORAGE_VERSION, CONTAINER_STORAGE_KEY)
        self._containers: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self._containers = [
            normalize_container(container, self._household_id)
            for container in data.get("containers", [])
        ]
        await self._save()

    @property
    def containers(self) -> list[dict[str, Any]]:
        return [dict(container) for container in self._containers if not container.get("deleted_at")]

    async def async_add(self, container: dict[str, Any]) -> dict[str, Any]:
        self._containers.append(container)
        await self._save()
        return dict(container)

    async def async_update(self, container_id: str, container: dict[str, Any]) -> dict[str, Any]:
        for index, current in enumerate(self._containers):
            if current["id"] == container_id and not current.get("deleted_at"):
                self._containers[index] = container
                await self._save()
                return dict(container)
        raise KeyError(container_id)

    async def async_delete(self, container_id: str) -> None:
        for container in self._containers:
            if container["id"] == container_id and not container.get("deleted_at"):
                container["deleted_at"] = utcnow_iso()
                container["updated_at"] = container["deleted_at"]
                container["revision"] = int(container.get("revision", 1)) + 1
                await self._save()
                return
        raise KeyError(container_id)

    async def _save(self) -> None:
        await self._store.async_save({"containers": self._containers})
