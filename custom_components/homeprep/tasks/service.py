"""Application service for HomePrep recurring tasks."""

from __future__ import annotations

from datetime import date
from typing import Any

from .models import create_task, utcnow_iso
from .repository import HATaskRepository
from .schedule import calculate_next_due, task_status


class HomePrepTaskService:
    def __init__(self, repository: HATaskRepository, inventory_service: Any) -> None:
        self._repository = repository
        self._inventory_service = inventory_service

    async def async_load(self) -> None:
        await self._repository.async_load()

    @property
    def tasks(self) -> list[dict[str, Any]]:
        return self._repository.tasks

    def get_task(self, task_id: str) -> dict[str, Any] | None:
        return next((task for task in self.tasks if task["id"] == task_id), None)

    async def async_add_task(self, data: dict[str, Any]) -> dict[str, Any]:
        linked_item_id = data.get("linked_item_id")
        if linked_item_id:
            self._require_inventory_item(linked_item_id)
        return await self._repository.async_add_task(create_task(data))

    async def async_update_task(self, task_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        existing = self._require_task(task_id)
        protected = {
            "id",
            "created_at",
            "schema_version",
            "completion_count",
            "last_completed_at",
        }

        merged = {
            **existing,
            **{k: v for k, v in updates.items() if k not in protected},
        }

        if merged.get("linked_item_id"):
            self._require_inventory_item(merged["linked_item_id"])

        validated = create_task(merged)
        validated["id"] = existing["id"]
        validated["created_at"] = existing["created_at"]
        validated["last_completed_at"] = existing.get("last_completed_at")
        validated["completion_count"] = existing.get("completion_count", 0)
        validated["updated_at"] = utcnow_iso()
        validated["revision"] = int(existing.get("revision", 1)) + 1

        return await self._repository.async_update_task(task_id, validated)

    async def async_delete_task(self, task_id: str) -> None:
        await self._repository.async_delete_task(task_id)

    async def async_complete_task(
        self,
        task_id: str,
        completed_on: str | None = None,
    ) -> dict[str, Any]:
        existing = self._require_task(task_id)
        completion_date = (
            date.fromisoformat(completed_on)
            if completed_on
            else date.today()
        )

        next_due = calculate_next_due(existing, completed_on=completion_date)

        updated = {
            **existing,
            "last_completed_at": completion_date.isoformat(),
            "next_due_at": next_due.isoformat(),
            "completion_count": int(existing.get("completion_count", 0)) + 1,
            "updated_at": utcnow_iso(),
            "revision": int(existing.get("revision", 1)) + 1,
        }

        return await self._repository.async_update_task(task_id, updated)

    def evaluated_tasks(self) -> list[dict[str, Any]]:
        result = []

        for task in self.tasks:
            linked_item = None
            if task.get("linked_item_id"):
                linked_item = self._inventory_service.get_item(task["linked_item_id"])

            result.append(
                {
                    **task,
                    "status": task_status(task),
                    "linked_item": (
                        {
                            "id": linked_item["id"],
                            "name": linked_item["name"],
                            "category": linked_item["category"],
                        }
                        if linked_item
                        else None
                    ),
                }
            )

        return result

    def summary(self) -> dict[str, Any]:
        counts = {
            "overdue": 0,
            "due": 0,
            "upcoming": 0,
            "ok": 0,
            "unscheduled": 0,
            "disabled": 0,
        }

        for task in self.tasks:
            counts[task_status(task)] += 1

        overall = (
            "critical"
            if counts["overdue"]
            else "attention"
            if counts["due"] or counts["upcoming"] or counts["unscheduled"]
            else "ok"
        )

        return {"status": overall, "tasks": len(self.tasks), **counts}

    def _require_task(self, task_id: str) -> dict[str, Any]:
        task = self.get_task(task_id)
        if task is None:
            raise KeyError(task_id)
        return task

    def _require_inventory_item(self, item_id: str) -> dict[str, Any]:
        item = self._inventory_service.get_item(item_id)
        if item is None:
            raise KeyError(f"Inventory item not found: {item_id}")
        return item
