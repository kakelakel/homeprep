"""Application service for HomePrep planning."""

from __future__ import annotations

from typing import Any

from .adoption import adopt_recommendation, calculate_recommendation
from .evaluation import evaluate_target
from .models import create_target, utcnow_iso
from .recommendations import RecommendationCatalog
from .repository import HAPlanningRepository


class HomePrepPlanningService:
    def __init__(
        self,
        repository: HAPlanningRepository,
        catalog: RecommendationCatalog,
        inventory_service: Any,
        household_id: str,
    ) -> None:
        self._repository = repository
        self._catalog = catalog
        self._inventory_service = inventory_service
        self._household_id = household_id

    async def async_load(self) -> None:
        self._catalog.load()
        await self._repository.async_load()

    @property
    def household(self) -> dict[str, Any]:
        return self._repository.household

    @property
    def targets(self) -> list[dict[str, Any]]:
        return self._repository.targets

    def list_profiles(self) -> list[dict[str, Any]]:
        return self._catalog.list_metadata()

    def get_profile(self, profile_id: str) -> dict[str, Any] | None:
        return self._catalog.get(profile_id)

    def recommendations_for_household(self, profile_id: str) -> list[dict[str, Any]]:
        profile = self._require_profile(profile_id)
        return [
            calculate_recommendation(recommendation, self.household, profile)
            for recommendation in profile["recommendations"]
        ]

    async def async_update_household(
        self,
        changes: dict[str, Any],
    ) -> dict[str, Any]:
        updated = {**self.household, **changes}
        return await self._repository.async_set_household(updated)

    async def async_add_target(self, data: dict[str, Any]) -> dict[str, Any]:
        target = create_target(data, self._household_id)
        return await self._repository.async_add_target(target)

    async def async_update_target(
        self,
        target_id: str,
        updates: dict[str, Any],
    ) -> dict[str, Any]:
        existing = self._require_target(target_id)
        protected = {
            "id",
            "household_id",
            "created_at",
            "deleted_at",
            "schema_version",
            "origin",
            "source_profile_id",
            "source_recommendation_id",
            "source_profile_version",
        }
        merged = {
            **existing,
            **{key: value for key, value in updates.items() if key not in protected},
        }
        merged["updated_at"] = utcnow_iso()
        merged["revision"] = int(existing.get("revision", 1)) + 1
        return await self._repository.async_update_target(target_id, merged)

    async def async_delete_target(self, target_id: str) -> None:
        await self._repository.async_delete_target(target_id)

    async def async_adopt_recommendation(
        self,
        profile_id: str,
        recommendation_id: str,
    ) -> dict[str, Any]:
        profile = self._require_profile(profile_id)
        recommendation = next(
            (
                item
                for item in profile["recommendations"]
                if item["id"] == recommendation_id
            ),
            None,
        )
        if recommendation is None:
            raise KeyError(recommendation_id)

        target_data = adopt_recommendation(
            recommendation,
            self.household,
            profile,
        )
        target = create_target(target_data, self._household_id)
        return await self._repository.async_add_target(target)

    def evaluate_targets(self) -> list[dict[str, Any]]:
        inventory = list(self._inventory_service.items)
        return [
            evaluate_target(target, inventory)
            for target in self.targets
            if target.get("enabled", True)
        ]

    def summary(self) -> dict[str, Any]:
        evaluations = self.evaluate_targets()
        counts = {"met": 0, "below_target": 0, "below_minimum": 0, "unknown": 0}
        for evaluation in evaluations:
            status = evaluation["status"]
            counts[status] = counts.get(status, 0) + 1
        if counts["below_minimum"]:
            status = "critical"
        elif counts["below_target"] or counts["unknown"]:
            status = "attention"
        else:
            status = "ok"
        return {"status": status, "targets": len(evaluations), **counts}

    def _require_profile(self, profile_id: str) -> dict[str, Any]:
        profile = self._catalog.get(profile_id)
        if profile is None:
            raise KeyError(profile_id)
        return profile

    def _require_target(self, target_id: str) -> dict[str, Any]:
        for target in self.targets:
            if target["id"] == target_id:
                return target
        raise KeyError(target_id)
