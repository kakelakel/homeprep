"""Home Assistant Store-backed preparedness plan repository."""
from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .models import normalize_plan, utcnow_iso

PLAN_STORAGE_VERSION = 1
PLAN_STORAGE_KEY = "homeprep.plans"


class HAPlanRepository:
    def __init__(self, hass: HomeAssistant, household_id: str) -> None:
        self._household_id = household_id
        self._store = Store(hass, PLAN_STORAGE_VERSION, PLAN_STORAGE_KEY)
        self._plans: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self._plans = [normalize_plan(plan, self._household_id) for plan in data.get("plans", [])]
        await self._save()

    @property
    def plans(self) -> list[dict[str, Any]]:
        return [dict(plan) for plan in self._plans if not plan.get("deleted_at")]

    async def async_add(self, plan: dict[str, Any]) -> dict[str, Any]:
        self._plans.append(plan)
        await self._save()
        return dict(plan)

    async def async_update(self, plan_id: str, plan: dict[str, Any]) -> dict[str, Any]:
        for index, current in enumerate(self._plans):
            if current["id"] == plan_id and not current.get("deleted_at"):
                self._plans[index] = plan
                await self._save()
                return dict(plan)
        raise KeyError(plan_id)

    async def async_delete(self, plan_id: str) -> None:
        for plan in self._plans:
            if plan["id"] == plan_id and not plan.get("deleted_at"):
                plan["deleted_at"] = utcnow_iso()
                plan["updated_at"] = plan["deleted_at"]
                plan["revision"] = int(plan.get("revision", 1)) + 1
                await self._save()
                return
        raise KeyError(plan_id)

    async def _save(self) -> None:
        await self._store.async_save({"plans": self._plans})
