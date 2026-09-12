"""Home Assistant Store-backed task repository."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .models import normalize_task

TASK_STORAGE_VERSION = 1
TASK_STORAGE_KEY = "homeprep.tasks"


class HATaskRepository:
    def __init__(self, hass: HomeAssistant) -> None:
        self._store = Store(hass, TASK_STORAGE_VERSION, TASK_STORAGE_KEY)
        self._tasks: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self._tasks = [normalize_task(task) for task in data.get("tasks", [])]
        await self._save()

    @property
    def tasks(self) -> list[dict[str, Any]]:
        return [dict(task) for task in self._tasks]

    async def async_add_task(self, task: dict[str, Any]) -> dict[str, Any]:
        self._tasks.append(task)
        await self._save()
        return dict(task)

    async def async_update_task(self, task_id: str, task: dict[str, Any]) -> dict[str, Any]:
        for index, current in enumerate(self._tasks):
            if current["id"] == task_id:
                self._tasks[index] = task
                await self._save()
                return dict(task)
        raise KeyError(task_id)

    async def async_delete_task(self, task_id: str) -> None:
        before = len(self._tasks)
        self._tasks = [task for task in self._tasks if task["id"] != task_id]
        if len(self._tasks) == before:
            raise KeyError(task_id)
        await self._save()

    async def _save(self) -> None:
        await self._store.async_save({"tasks": self._tasks})
