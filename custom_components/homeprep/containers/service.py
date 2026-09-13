"""Application service for HomePrep preparedness containers."""
from __future__ import annotations

from datetime import date
from typing import Any

from .models import create_container, utcnow_iso
from .repository import HAContainerRepository


class HomePrepContainerService:
    def __init__(self, repository: HAContainerRepository, inventory_service: Any, household_id: str) -> None:
        self._repository = repository
        self._inventory_service = inventory_service
        self._household_id = household_id

    async def async_load(self) -> None:
        await self._repository.async_load()

    @property
    def containers(self) -> list[dict[str, Any]]:
        return self._repository.containers

    def get_container(self, container_id: str) -> dict[str, Any] | None:
        return next((container for container in self.containers if container["id"] == container_id), None)

    async def async_add(self, data: dict[str, Any]) -> dict[str, Any]:
        return await self._repository.async_add(create_container(data, self._household_id))

    async def async_update(self, container_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        existing = self._require(container_id)
        protected = {"id", "household_id", "created_at", "deleted_at", "schema_version"}
        merged = {**existing, **{k: v for k, v in updates.items() if k not in protected}}
        validated = create_container(merged, self._household_id)
        validated["id"] = existing["id"]
        validated["household_id"] = existing.get("household_id", self._household_id)
        validated["created_at"] = existing["created_at"]
        validated["updated_at"] = utcnow_iso()
        validated["revision"] = int(existing.get("revision", 1)) + 1
        return await self._repository.async_update(container_id, validated)

    async def async_delete(self, container_id: str) -> None:
        self._require(container_id)
        for item in list(self._inventory_service.items):
            if item.get("container_id") == container_id:
                await self._inventory_service.async_update_item(item["id"], {"container_id": None})
        await self._repository.async_delete(container_id)

    async def async_assign_item(self, item_id: str, container_id: str | None) -> bool:
        item = self._inventory_service.get_item(item_id)
        if item is None:
            raise KeyError(item_id)
        if container_id:
            self._require(container_id)
        return await self._inventory_service.async_update_item(item_id, {"container_id": container_id or None})

    async def async_mark_checked(self, container_id: str, checked_on: str | None = None) -> dict[str, Any]:
        value = checked_on or date.today().isoformat()
        return await self.async_update(container_id, {"last_checked_at": value})

    def evaluated_containers(self) -> list[dict[str, Any]]:
        today = date.today()
        result = []
        for container in self.containers:
            items = [item for item in self._inventory_service.items if item.get("container_id") == container["id"]]
            critical = 0
            attention = 0
            check_dates = [container.get("last_checked_at")]
            for item in items:
                expires = self._parse_date(item.get("expires_at"))
                next_check = self._parse_date(item.get("next_check_at"))
                if item.get("last_checked"):
                    check_dates.append(item.get("last_checked"))
                if (expires and expires < today) or (next_check and next_check <= today):
                    critical += 1
                elif expires and 0 <= (expires - today).days <= 30:
                    attention += 1
            own_check = self._parse_date(container.get("next_check_at"))
            if own_check and own_check <= today:
                critical += 1
            elif own_check and 0 < (own_check - today).days <= 30:
                attention += 1
            status = "critical" if critical else "attention" if attention else "ok"
            effective_last_checked = max((value for value in check_dates if value), default=None)
            result.append({
                **container,
                "status": status,
                "item_count": len(items),
                "critical_count": critical,
                "attention_count": attention,
                "effective_last_checked_at": effective_last_checked,
                "items": [
                    {
                        "id": item["id"],
                        "name": item["name"],
                        "category": item.get("category"),
                        "quantity": item.get("quantity"),
                        "unit": item.get("unit"),
                        "expires_at": item.get("expires_at"),
                        "last_checked": item.get("last_checked"),
                        "next_check_at": item.get("next_check_at"),
                    }
                    for item in items
                ],
            })
        return result

    def summary(self) -> dict[str, Any]:
        containers = self.evaluated_containers()
        critical = sum(1 for container in containers if container["status"] == "critical")
        attention = sum(1 for container in containers if container["status"] == "attention")
        status = "critical" if critical else "attention" if attention else "ok"
        return {"status": status, "containers": len(containers), "critical": critical, "attention": attention, "ok": len(containers) - critical - attention}

    def _require(self, container_id: str) -> dict[str, Any]:
        container = self.get_container(container_id)
        if container is None:
            raise KeyError(container_id)
        return container

    @staticmethod
    def _parse_date(value: str | None) -> date | None:
        if not value:
            return None
        try:
            return date.fromisoformat(value)
        except ValueError:
            return None
