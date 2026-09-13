"""Application service for HomePrep recurring tasks."""
from __future__ import annotations
from datetime import date
from typing import Any
from .models import create_task, utcnow_iso
from .repository import HATaskRepository
from .schedule import calculate_next_due, task_status


class HomePrepTaskService:
    def __init__(
        self,
        repository: HATaskRepository,
        inventory_service: Any,
        household_id: str,
        container_service: Any | None = None,
        asset_service: Any | None = None,
    ) -> None:
        self._repository = repository
        self._inventory_service = inventory_service
        self._household_id = household_id
        self._container_service = container_service
        self._asset_service = asset_service

    async def async_load(self) -> None:
        await self._repository.async_load()

    @property
    def tasks(self) -> list[dict[str, Any]]:
        return self._repository.tasks

    def get_task(self, task_id: str) -> dict[str, Any] | None:
        return next((task for task in self.tasks if task["id"] == task_id), None)

    def find_linked_task(self, linked_id: str, task_kind: str) -> dict[str, Any] | None:
        if task_kind == "container_inspection":
            key = "linked_container_id"
        elif task_kind == "asset_inspection":
            key = "linked_asset_id"
        else:
            key = "linked_item_id"
        return next(
            (
                task
                for task in self.tasks
                if task.get(key) == linked_id
                and task.get("task_kind", "general") == task_kind
            ),
            None,
        )

    async def async_add_task(self, data: dict[str, Any]) -> dict[str, Any]:
        self._validate_links(data)
        task = create_task(data, self._household_id)
        saved = await self._repository.async_add_task(task)
        await self._sync_linked_resource(saved)
        return saved

    async def async_update_task(
        self,
        task_id: str,
        updates: dict[str, Any],
    ) -> dict[str, Any]:
        existing = self._require_task(task_id)
        protected = {
            "id",
            "household_id",
            "created_at",
            "deleted_at",
            "schema_version",
            "completion_count",
            "last_completed_at",
        }
        merged = {
            **existing,
            **{key: value for key, value in updates.items() if key not in protected},
        }
        self._validate_links(merged)
        validated = create_task(merged, self._household_id)
        validated["id"] = existing["id"]
        validated["household_id"] = existing.get("household_id", self._household_id)
        validated["created_at"] = existing["created_at"]
        validated["updated_at"] = utcnow_iso()
        validated["revision"] = int(existing.get("revision", 1)) + 1
        validated["completion_count"] = int(existing.get("completion_count", 0))
        validated["last_completed_at"] = existing.get("last_completed_at")
        saved = await self._repository.async_update_task(task_id, validated)
        await self._sync_linked_resource(saved)
        return saved

    async def async_delete_task(self, task_id: str) -> None:
        existing = self._require_task(task_id)
        await self._repository.async_delete_task(task_id)
        if existing.get("task_kind") == "inspection" and existing.get("linked_item_id"):
            await self._inventory_service.async_update_item(existing["linked_item_id"], {"next_check_at": None})
        if existing.get("task_kind") == "container_inspection" and existing.get("linked_container_id") and self._container_service:
            try:
                await self._container_service.async_update(existing["linked_container_id"], {"next_check_at": None})
            except KeyError:
                pass
        if existing.get("task_kind") == "asset_inspection" and existing.get("linked_asset_id") and self._asset_service:
            try:
                await self._asset_service.async_update(existing["linked_asset_id"], {"next_check_at": None})
            except KeyError:
                pass

    async def async_complete_task(
        self,
        task_id: str,
        completed_on: str | None = None,
    ) -> dict[str, Any]:
        existing = self._require_task(task_id)
        completion_date = date.fromisoformat(completed_on) if completed_on else date.today()
        next_due = calculate_next_due(existing, completed_on=completion_date)
        updated = {
            **existing,
            "last_completed_at": completion_date.isoformat(),
            "next_due_at": next_due.isoformat(),
            "completion_count": int(existing.get("completion_count", 0)) + 1,
            "updated_at": utcnow_iso(),
            "revision": int(existing.get("revision", 1)) + 1,
        }
        saved = await self._repository.async_update_task(task_id, updated)
        await self._sync_linked_resource(saved)
        return saved

    def evaluated_tasks(self) -> list[dict[str, Any]]:
        result = []
        for task in self.tasks:
            item = None
            container = None
            asset = None
            linked_item_id = task.get("linked_item_id")
            linked_container_id = task.get("linked_container_id")
            linked_asset_id = task.get("linked_asset_id")
            if linked_item_id:
                item = self._inventory_service.get_item(linked_item_id)
            if linked_container_id and self._container_service:
                container = self._container_service.get_container(linked_container_id)
            if linked_asset_id and self._asset_service:
                asset = self._asset_service.get_asset(linked_asset_id)
            result.append(
                {
                    **task,
                    "status": task_status(task),
                    "linked_item": (
                        {
                            "id": item["id"],
                            "name": item["name"],
                            "category": item["category"],
                            "image_id": item.get("image_id"),
                            "image_token": item.get("image_token"),
                            "image_content_type": item.get("image_content_type"),
                            "image_filename": item.get("image_filename"),
                        }
                        if item else None
                    ),
                    "linked_container": (
                        {"id": container["id"], "name": container["name"], "location": container.get("location")}
                        if container else None
                    ),
                    "linked_asset": (
                        {
                            "id": asset["id"],
                            "name": asset["name"],
                            "location": asset.get("location"),
                            "asset_type": asset.get("asset_type"),
                            "image_id": asset.get("image_id"),
                            "image_token": asset.get("image_token"),
                            "image_content_type": asset.get("image_content_type"),
                            "image_filename": asset.get("image_filename"),
                        }
                        if asset else None
                    ),
                }
            )
        return result

    def summary(self) -> dict[str, Any]:
        counts = {"overdue": 0, "due": 0, "upcoming": 0, "ok": 0, "unscheduled": 0, "disabled": 0}
        for task in self.tasks:
            status = task_status(task)
            counts[status] += 1
        if counts["overdue"]:
            overall = "critical"
        elif counts["due"] or counts["upcoming"] or counts["unscheduled"]:
            overall = "attention"
        else:
            overall = "ok"
        return {"status": overall, "tasks": len(self.tasks), **counts}

    def _validate_links(self, data: dict[str, Any]) -> None:
        linked_item_id = data.get("linked_item_id")
        if linked_item_id:
            self._require_inventory_item(linked_item_id)
        linked_container_id = data.get("linked_container_id")
        if linked_container_id:
            if not self._container_service:
                raise KeyError("Container service unavailable")
            if self._container_service.get_container(linked_container_id) is None:
                raise KeyError(f"Container not found: {linked_container_id}")
        linked_asset_id = data.get("linked_asset_id")
        if linked_asset_id:
            if not self._asset_service:
                raise KeyError("Asset service unavailable")
            if self._asset_service.get_asset(linked_asset_id) is None:
                raise KeyError(f"Asset not found: {linked_asset_id}")

    async def _sync_linked_resource(self, task: dict[str, Any]) -> None:
        if task.get("task_kind") == "inspection":
            item_id = task.get("linked_item_id")
            if not item_id:
                return
            if not task.get("enabled", True):
                await self._inventory_service.async_update_item(item_id, {"next_check_at": None})
                return
            updates: dict[str, Any] = {"next_check_at": task.get("next_due_at")}
            if task.get("last_completed_at"):
                updates["last_checked"] = task["last_completed_at"]
            await self._inventory_service.async_update_item(item_id, updates)
            return

        if task.get("task_kind") == "container_inspection" and self._container_service:
            container_id = task.get("linked_container_id")
            if not container_id:
                return
            if not task.get("enabled", True):
                await self._container_service.async_update(container_id, {"next_check_at": None})
                return
            updates = {"next_check_at": task.get("next_due_at")}
            if task.get("last_completed_at"):
                updates["last_checked_at"] = task["last_completed_at"]
            await self._container_service.async_update(container_id, updates)
            return

        if task.get("task_kind") == "asset_inspection" and self._asset_service:
            asset_id = task.get("linked_asset_id")
            if not asset_id:
                return
            if not task.get("enabled", True):
                await self._asset_service.async_update(asset_id, {"next_check_at": None})
                return
            updates = {"next_check_at": task.get("next_due_at")}
            if task.get("last_completed_at"):
                updates["last_checked_at"] = task["last_completed_at"]
            await self._asset_service.async_update(asset_id, updates)

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
