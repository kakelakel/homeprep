"""Application service for HomePrep preparedness plans."""
from __future__ import annotations

import calendar
from datetime import date
from typing import Any
from uuid import uuid4

from .models import create_plan, normalize_check_item, utcnow_iso
from .repository import HAPlanRepository

PLAN_TEMPLATES: dict[str, dict[str, Any]] = {
    "fire": {
        "name": "Fire safety plan",
        "plan_type": "fire",
        "description": "Household fire preparedness, evacuation and equipment readiness.",
        "review_interval_months": 6,
        "checklist": [
            {"label": "A household meeting point outside the home has been agreed"},
            {"label": "Everyone knows the primary evacuation route"},
            {"label": "Alternative escape routes have been considered"},
            {"label": "Smoke alarms are installed in suitable locations"},
            {"label": "Smoke alarms have been tested recently"},
            {"label": "Fire extinguisher or other suitable extinguishing equipment is available"},
            {"label": "Fire blanket is available where appropriate"},
            {"label": "Children know what to do if the alarm sounds"},
        ],
    },
    "flood": {
        "name": "Flood and water damage plan",
        "plan_type": "flood",
        "description": "Reduce the impact of leaks, flooding and water-related damage.",
        "review_interval_months": 6,
        "checklist": [
            {"label": "The main water shutoff is known and accessible"},
            {"label": "Household members know how to shut off the water"},
            {"label": "Leak sensors are installed in relevant areas"},
            {"label": "Leak sensors have been tested recently"},
            {"label": "Floor drains and drainage routes are accessible and clear"},
            {"label": "Washing-machine and dishwasher hoses have been inspected"},
            {"label": "Important documents and vulnerable valuables are stored above likely flood level"},
            {"label": "Any sump pump or drainage pump has been tested"},
        ],
    },
    "evacuation": {
        "name": "Rapid evacuation plan",
        "plan_type": "evacuation",
        "description": "Be ready to leave the home quickly with the people and essentials that matter most.",
        "review_interval_months": 6,
        "checklist": [
            {"label": "Primary exit routes are known"},
            {"label": "A household meeting point has been agreed"},
            {"label": "Go bag or evacuation kit is ready"},
            {"label": "Essential medicines can be taken quickly"},
            {"label": "Important documents or copies are accessible"},
            {"label": "Children and dependants have a clear evacuation routine"},
            {"label": "Pet transport and essential pet supplies are planned"},
            {"label": "A contact outside the household knows the emergency plan"},
        ],
    },
}


def _add_months(value: date, months: int) -> date:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


class HomePrepPlanService:
    def __init__(
        self,
        repository: HAPlanRepository,
        household_id: str,
        inventory_service: Any | None = None,
        container_service: Any | None = None,
        asset_service: Any | None = None,
    ) -> None:
        self._repository = repository
        self._household_id = household_id
        self._inventory_service = inventory_service
        self._container_service = container_service
        self._asset_service = asset_service

    async def async_load(self) -> None:
        await self._repository.async_load()

    @property
    def plans(self) -> list[dict[str, Any]]:
        return self._repository.plans

    def get_plan(self, plan_id: str) -> dict[str, Any] | None:
        return next((plan for plan in self.plans if plan["id"] == plan_id), None)

    async def async_add(self, data: dict[str, Any]) -> dict[str, Any]:
        plan = create_plan(data, self._household_id)
        self._validate_links(plan.get("checklist", []))
        return await self._repository.async_add(plan)

    async def async_add_from_template(self, template_id: str) -> dict[str, Any]:
        template = PLAN_TEMPLATES.get(template_id)
        if template is None:
            raise KeyError(template_id)
        return await self.async_add(template)

    async def async_update(self, plan_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        existing = self._require(plan_id)
        protected = {"id", "household_id", "created_at", "deleted_at", "schema_version"}
        merged = {**existing, **{k: v for k, v in updates.items() if k not in protected}}
        validated = create_plan(merged, self._household_id)
        self._validate_links(validated.get("checklist", []))
        validated["id"] = existing["id"]
        validated["household_id"] = existing.get("household_id", self._household_id)
        validated["created_at"] = existing["created_at"]
        validated["updated_at"] = utcnow_iso()
        validated["revision"] = int(existing.get("revision", 1)) + 1
        return await self._repository.async_update(plan_id, validated)

    async def async_delete(self, plan_id: str) -> None:
        self._require(plan_id)
        await self._repository.async_delete(plan_id)

    async def async_toggle_check_item(self, plan_id: str, item_id: str, completed: bool | None = None) -> dict[str, Any]:
        plan = self._require(plan_id)
        checklist = []
        found = False
        for item in plan.get("checklist", []):
            current = dict(item)
            if current["id"] == item_id:
                current["completed"] = (not current.get("completed", False)) if completed is None else bool(completed)
                if current["completed"]:
                    current["last_confirmed_at"] = date.today().isoformat()
                found = True
            checklist.append(current)
        if not found:
            raise KeyError(item_id)
        return await self.async_update(plan_id, {"checklist": checklist})

    async def async_add_check_item(
        self,
        plan_id: str,
        label: str,
        description: str | None = None,
        linked_inventory_item_ids: list[str] | None = None,
        linked_container_ids: list[str] | None = None,
        linked_asset_ids: list[str] | None = None,
    ) -> dict[str, Any]:
        plan = self._require(plan_id)
        item = normalize_check_item({
            "id": str(uuid4()),
            "label": label,
            "description": description,
            "completed": False,
            "linked_inventory_item_ids": linked_inventory_item_ids or [],
            "linked_container_ids": linked_container_ids or [],
            "linked_asset_ids": linked_asset_ids or [],
        })
        self._validate_links([item])
        return await self.async_update(plan_id, {"checklist": [*plan.get("checklist", []), item]})

    async def async_update_check_item(self, plan_id: str, item_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        plan = self._require(plan_id)
        checklist = []
        found = False
        for item in plan.get("checklist", []):
            if item.get("id") == item_id:
                merged = {**item, **updates, "id": item_id}
                normalized = normalize_check_item(merged)
                self._validate_links([normalized])
                checklist.append(normalized)
                found = True
            else:
                checklist.append(item)
        if not found:
            raise KeyError(item_id)
        return await self.async_update(plan_id, {"checklist": checklist})

    async def async_delete_check_item(self, plan_id: str, item_id: str) -> dict[str, Any]:
        plan = self._require(plan_id)
        checklist = [item for item in plan.get("checklist", []) if item.get("id") != item_id]
        if len(checklist) == len(plan.get("checklist", [])):
            raise KeyError(item_id)
        return await self.async_update(plan_id, {"checklist": checklist})

    async def async_mark_reviewed(self, plan_id: str, reviewed_on: str | None = None) -> dict[str, Any]:
        plan = self._require(plan_id)
        reviewed = date.fromisoformat(reviewed_on) if reviewed_on else date.today()
        interval = int(plan.get("review_interval_months", 0) or 0)
        next_review = _add_months(reviewed, interval).isoformat() if interval else None
        return await self.async_update(plan_id, {
            "last_reviewed_at": reviewed.isoformat(),
            "next_review_at": next_review,
        })

    def evaluated_plans(self) -> list[dict[str, Any]]:
        today = date.today()
        result = []
        for plan in self.plans:
            checklist = plan.get("checklist", [])
            total = len(checklist)
            completed = sum(1 for item in checklist if item.get("completed"))
            next_review = None
            if plan.get("next_review_at"):
                try:
                    next_review = date.fromisoformat(plan["next_review_at"])
                except ValueError:
                    next_review = None
            review_required = bool(next_review and next_review <= today)
            if not plan.get("enabled", True):
                status = "disabled"
            elif review_required:
                status = "attention"
            elif total and completed == total:
                status = "ok"
            else:
                status = "attention"
            enriched = []
            for item in checklist:
                linked_inventory = []
                linked_containers = []
                linked_assets = []
                if self._inventory_service:
                    for item_id in item.get("linked_inventory_item_ids", []):
                        inv = self._inventory_service.get_item(item_id)
                        if inv:
                            linked_inventory.append({"id": inv["id"], "name": inv["name"], "category": inv.get("category")})
                if self._container_service:
                    for container_id in item.get("linked_container_ids", []):
                        container = self._container_service.get_container(container_id)
                        if container:
                            linked_containers.append({"id": container["id"], "name": container["name"], "location": container.get("location")})
                if self._asset_service:
                    for asset_id in item.get("linked_asset_ids", []):
                        asset = self._asset_service.get_asset(asset_id)
                        if asset:
                            linked_assets.append({"id": asset["id"], "name": asset["name"], "location": asset.get("location"), "asset_type": asset.get("asset_type")})
                enriched.append({**item, "linked_inventory_items": linked_inventory, "linked_containers": linked_containers, "linked_assets": linked_assets})
            result.append({
                **plan,
                "checklist": enriched,
                "status": status,
                "review_required": review_required,
                "completed_count": completed,
                "check_count": total,
            })
        return result

    def summary(self) -> dict[str, Any]:
        plans = self.evaluated_plans()
        enabled = [plan for plan in plans if plan["status"] != "disabled"]
        attention = sum(1 for plan in enabled if plan["status"] == "attention")
        review_required = sum(1 for plan in enabled if plan.get("review_required"))
        ready = sum(1 for plan in enabled if plan["status"] == "ok")
        return {
            "status": "attention" if attention else "ok",
            "plans": len(plans),
            "ready": ready,
            "attention": attention,
            "review_required": review_required,
            "disabled": len(plans) - len(enabled),
        }

    def templates(self) -> list[dict[str, Any]]:
        return [{"id": key, "name": value["name"], "plan_type": value["plan_type"], "description": value.get("description")} for key, value in PLAN_TEMPLATES.items()]

    def _validate_links(self, checklist: list[dict[str, Any]]) -> None:
        for item in checklist:
            if self._inventory_service:
                for item_id in item.get("linked_inventory_item_ids", []):
                    if self._inventory_service.get_item(item_id) is None:
                        raise KeyError(f"Inventory item not found: {item_id}")
            if self._container_service:
                for container_id in item.get("linked_container_ids", []):
                    if self._container_service.get_container(container_id) is None:
                        raise KeyError(f"Container not found: {container_id}")
            if self._asset_service:
                for asset_id in item.get("linked_asset_ids", []):
                    if self._asset_service.get_asset(asset_id) is None:
                        raise KeyError(f"Asset not found: {asset_id}")

    def _require(self, plan_id: str) -> dict[str, Any]:
        plan = self.get_plan(plan_id)
        if plan is None:
            raise KeyError(plan_id)
        return plan
