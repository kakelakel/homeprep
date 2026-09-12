"""Home Assistant Store-backed persistence for HomePrep planning."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .models import (
    create_household_profile,
    normalize_household_profile,
    normalize_target,
)

PLANNING_STORAGE_VERSION = 1
PLANNING_STORAGE_KEY = "homeprep.planning"


class HAPlanningRepository:
    def __init__(self, hass: HomeAssistant) -> None:
        self._store = Store(
            hass,
            PLANNING_STORAGE_VERSION,
            PLANNING_STORAGE_KEY,
        )
        self._targets: list[dict[str, Any]] = []
        self._household = create_household_profile()

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}

        self._targets = [
            normalize_target(target)
            for target in data.get("targets", [])
        ]

        self._household = normalize_household_profile(
            data.get("household")
        )

        await self._save()

    @property
    def targets(self) -> list[dict[str, Any]]:
        return [dict(target) for target in self._targets]

    @property
    def household(self) -> dict[str, Any]:
        return dict(self._household)

    async def async_set_household(
        self,
        household: dict[str, Any],
    ) -> dict[str, Any]:
        self._household = normalize_household_profile(household)
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
            if current["id"] == target_id:
                self._targets[index] = target
                await self._save()
                return dict(target)

        raise KeyError(target_id)

    async def async_delete_target(
        self,
        target_id: str,
    ) -> None:
        original_length = len(self._targets)

        self._targets = [
            target
            for target in self._targets
            if target["id"] != target_id
        ]

        if len(self._targets) == original_length:
            raise KeyError(target_id)

        await self._save()

    async def _save(self) -> None:
        await self._store.async_save(
            {
                "household": self._household,
                "targets": self._targets,
            }
        )
