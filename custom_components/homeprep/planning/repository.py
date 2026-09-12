"""Home Assistant Store-backed persistence for HomePrep planning."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .models import (
    create_household_profile,
    normalize_household_profile,
    normalize_target,
    utcnow_iso,
)

PLANNING_STORAGE_VERSION = 1
PLANNING_STORAGE_KEY = "homeprep.planning"


class HAPlanningRepository:
    def __init__(self, hass: HomeAssistant, household_id: str) -> None:
        self._household_id = household_id
        self._store = Store(
            hass,
            PLANNING_STORAGE_VERSION,
            PLANNING_STORAGE_KEY,
        )
        self._targets: list[dict[str, Any]] = []
        self._household = create_household_profile(household_id=household_id)

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self._targets = [
            normalize_target(target, self._household_id)
            for target in data.get("targets", [])
        ]
        self._household = normalize_household_profile(
            data.get("household"),
            self._household_id,
        )
        await self._save()

    @property
    def targets(self) -> list[dict[str, Any]]:
        return [dict(target) for target in self._targets if not target.get("deleted_at")]

    @property
    def household(self) -> dict[str, Any]:
        return dict(self._household)

    async def async_set_household(
        self,
        household: dict[str, Any],
    ) -> dict[str, Any]:
        existing = self._household
        merged = {
            **existing,
            **household,
            "id": self._household_id,
            "updated_at": utcnow_iso(),
            "revision": int(existing.get("revision", 1)) + 1,
        }
        self._household = normalize_household_profile(merged, self._household_id)
        await self._save()
        return self.household

    async def async_add_target(
        self,
        target: dict[str, Any],
    ) -> dict[str, Any]:
        self._targets.append(target)
        await self._save()
        return dict(target)

    async def async_update_target(
        self,
        target_id: str,
        target: dict[str, Any],
    ) -> dict[str, Any]:
        for index, current in enumerate(self._targets):
            if current["id"] == target_id and not current.get("deleted_at"):
                self._targets[index] = target
                await self._save()
                return dict(target)
        raise KeyError(target_id)

    async def async_delete_target(self, target_id: str) -> None:
        for target in self._targets:
            if target["id"] == target_id and not target.get("deleted_at"):
                target["deleted_at"] = utcnow_iso()
                target["updated_at"] = target["deleted_at"]
                target["revision"] = int(target.get("revision", 1)) + 1
                await self._save()
                return
        raise KeyError(target_id)

    async def _save(self) -> None:
        await self._store.async_save({
            "household": self._household,
            "targets": self._targets,
        })
