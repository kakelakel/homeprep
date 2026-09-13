"""Application service for HomePrep shopping list."""
from __future__ import annotations

from datetime import date
from typing import Any

from .models import create_shopping_item, utcnow_iso
from .repository import HAShoppingRepository


class HomePrepShoppingService:
    def __init__(self, repository: HAShoppingRepository, inventory_service: Any, household_id: str) -> None:
        self._repository = repository
        self._inventory_service = inventory_service
        self._household_id = household_id

    async def async_load(self) -> None:
        await self._repository.async_load()
        await self.async_sync_expired_inventory()

    @property
    def items(self) -> list[dict[str, Any]]:
        return self._repository.items

    def get_item(self, item_id: str) -> dict[str, Any] | None:
        return next((item for item in self.items if item["id"] == item_id), None)

    async def async_sync_expired_inventory(self) -> int:
        today = date.today().isoformat()
        existing_sources = {
            item.get("source_id")
            for item in self.items
            if item.get("source_type") == "inventory_expired" and item.get("source_id")
        }
        added = 0
        for inventory_item in self._inventory_service.items:
            expires_at = inventory_item.get("expires_at")
            if not expires_at or expires_at >= today or inventory_item["id"] in existing_sources:
                continue
            entry = create_shopping_item(
                {
                    "name": inventory_item["name"],
                    "quantity": inventory_item.get("quantity", 1),
                    "unit": inventory_item.get("unit", "piece"),
                    "category": inventory_item.get("category", "other"),
                    "container_id": inventory_item.get("container_id"),
                    "source_type": "inventory_expired",
                    "source_id": inventory_item["id"],
                    "reason": f"Expired {expires_at}",
                },
                self._household_id,
            )
            await self._repository.async_add(entry)
            existing_sources.add(inventory_item["id"])
            added += 1
        return added

    async def async_add(self, data: dict[str, Any]) -> dict[str, Any]:
        return await self._repository.async_add(create_shopping_item(data, self._household_id))

    async def async_update(self, item_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        existing = self.get_item(item_id)
        if existing is None:
            raise KeyError(item_id)
        merged = {**existing, **updates}
        validated = create_shopping_item(merged, self._household_id)
        validated["id"] = existing["id"]
        validated["household_id"] = existing["household_id"]
        validated["created_at"] = existing["created_at"]
        validated["updated_at"] = utcnow_iso()
        validated["revision"] = int(existing.get("revision", 1)) + 1
        return await self._repository.async_update(item_id, validated)

    async def async_set_status(self, item_id: str, status: str) -> dict[str, Any]:
        timestamp = utcnow_iso()
        updates: dict[str, Any] = {"status": status}
        if status == "purchased":
            updates["purchased_at"] = timestamp
            updates["ignored_at"] = None
        elif status == "ignored":
            updates["ignored_at"] = timestamp
            updates["purchased_at"] = None
        else:
            updates["purchased_at"] = None
            updates["ignored_at"] = None
        return await self.async_update(item_id, updates)

    async def async_delete(self, item_id: str) -> None:
        if self.get_item(item_id) is None:
            raise KeyError(item_id)
        await self._repository.async_delete(item_id)

    async def evaluated_items(self) -> list[dict[str, Any]]:
        await self.async_sync_expired_inventory()
        inventory = {item["id"]: item for item in self._inventory_service.items}
        result = []
        for item in self.items:
            source = inventory.get(item.get("source_id")) if item.get("source_type") == "inventory_expired" else None
            result.append({
                **item,
                "source_inventory_item": ({"id": source["id"], "name": source["name"], "expires_at": source.get("expires_at")} if source else None),
            })
        return result

    async def summary(self) -> dict[str, Any]:
        items = await self.evaluated_items()
        pending = sum(1 for item in items if item["status"] == "pending")
        return {
            "status": "attention" if pending else "ok",
            "items": len(items),
            "pending": pending,
            "purchased": sum(1 for item in items if item["status"] == "purchased"),
            "ignored": sum(1 for item in items if item["status"] == "ignored"),
        }
