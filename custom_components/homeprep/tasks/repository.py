"""Home Assistant Store-backed task repository."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .models import normalize_task, utcnow_iso

TASK_STORAGE_VERSION = 1
TASK_STORAGE_KEY = "homeprep.tasks"


class HATaskRepository:
    def __init__(self, hass: HomeAssistant, household_id: str) -> None:
        self._household_id = household_id
        self._store = Store(hass, TASK_STORAGE_VERSION, TASK_STORAGE_KEY)
        self._tasks: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self._tasks = [
            normalize_task(task, self._household_id)
            for task in data.get("tasks", [])
        ]
        await self._save()

    @property
    def tasks(self) -> list[dict[str, Any]]:
        return [dict(task) for task in self._tasks if not task.get("deleted_at")]

    async def async_add_task(self, task: dict[str, Any]) -> dict[str, Any]:
        self._tasks.append(task)
        await self._save()
        return dict(task)

    async def async_update_task(self, task_id: str, task: dict[str, Any]) -> dict[str, Any]:
        for index, current in enumerate(self._tasks):
            if current["id"] == task_id and not current.get("deleted_at"):
                self._tasks[index] = task
                await self._save()
                return dict(task)
        raise KeyError(task_id)

    async def async_delete_task(self, task_id: str) -> None:
        for task in self._tasks:
            if task["id"] == task_id and not task.get("deleted_at"):
                task["deleted_at"] = utcnow_iso()
                task["updated_at"] = task["deleted_at"]
                task["revision"] = int(task.get("revision", 1)) + 1
                await self._save()
                return
        raise KeyError(task_id)

    async def _save(self) -> None:
        await self._store.async_save({"tasks": self._tasks})
