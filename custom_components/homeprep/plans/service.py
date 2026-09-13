"""Application service for HomePrep preparedness plans."""
from __future__ import annotations

from typing import Any
from uuid import uuid4

from .models import create_plan, normalize_check_item, utcnow_iso
from .repository import HAPlanRepository

PLAN_TEMPLATES: dict[str, dict[str, Any]] = {
    "fire": {
        "name": "Fire safety plan",
        "plan_type": "fire",
        "description": "Household fire preparedness, evacuation and equipment readiness.",
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


class HomePrepPlanService:
    def __init__(self, repository: HAPlanRepository, household_id: str) -> None:
        self._repository = repository
        self._household_id = household_id

    async def async_load(self) -> None:
        await self._repository.async_load()

    @property
    def plans(self) -> list[dict[str, Any]]:
        return self._repository.plans

    def get_plan(self, plan_id: str) -> dict[str, Any] | None:
        return next((plan for plan in self.plans if plan["id"] == plan_id), None)

    async def async_add(self, data: dict[str, Any]) -> dict[str, Any]:
        return await self._repository.async_add(create_plan(data, self._household_id))

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
                found = True
            checklist.append(current)
        if not found:
            raise KeyError(item_id)
        return await self.async_update(plan_id, {"checklist": checklist})

    async def async_add_check_item(self, plan_id: str, label: str, description: str | None = None) -> dict[str, Any]:
        plan = self._require(plan_id)
        item = normalize_check_item({"id": str(uuid4()), "label": label, "description": description, "completed": False})
        return await self.async_update(plan_id, {"checklist": [*plan.get("checklist", []), item]})

    async def async_delete_check_item(self, plan_id: str, item_id: str) -> dict[str, Any]:
        plan = self._require(plan_id)
        checklist = [item for item in plan.get("checklist", []) if item.get("id") != item_id]
        if len(checklist) == len(plan.get("checklist", [])):
            raise KeyError(item_id)
        return await self.async_update(plan_id, {"checklist": checklist})

    def evaluated_plans(self) -> list[dict[str, Any]]:
        result = []
        for plan in self.plans:
            checklist = plan.get("checklist", [])
            total = len(checklist)
            completed = sum(1 for item in checklist if item.get("completed"))
            if not plan.get("enabled", True):
                status = "disabled"
            elif total and completed == total:
                status = "ok"
            else:
                status = "attention"
            result.append({**plan, "status": status, "completed_count": completed, "check_count": total})
        return result

    def summary(self) -> dict[str, Any]:
        plans = self.evaluated_plans()
        enabled = [plan for plan in plans if plan["status"] != "disabled"]
        attention = sum(1 for plan in enabled if plan["status"] == "attention")
        ready = sum(1 for plan in enabled if plan["status"] == "ok")
        return {
            "status": "attention" if attention else "ok",
            "plans": len(plans),
            "ready": ready,
            "attention": attention,
            "disabled": len(plans) - len(enabled),
        }

    def templates(self) -> list[dict[str, Any]]:
        return [{"id": key, "name": value["name"], "plan_type": value["plan_type"], "description": value.get("description")} for key, value in PLAN_TEMPLATES.items()]

    def _require(self, plan_id: str) -> dict[str, Any]:
        plan = self.get_plan(plan_id)
        if plan is None:
            raise KeyError(plan_id)
        return plan
