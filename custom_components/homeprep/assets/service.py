"""Application service for HomePrep household assets."""
from __future__ import annotations

from datetime import date
from typing import Any

from .models import create_asset, utcnow_iso
from .repository import HAAssetRepository


class HomePrepAssetService:
    def __init__(self, repository: HAAssetRepository, household_id: str) -> None:
        self._repository = repository
        self._household_id = household_id

    async def async_load(self) -> None:
        await self._repository.async_load()

    @property
    def assets(self) -> list[dict[str, Any]]:
        return self._repository.assets

    def get_asset(self, asset_id: str) -> dict[str, Any] | None:
        return next((asset for asset in self.assets if asset["id"] == asset_id), None)

    async def async_add(self, data: dict[str, Any]) -> dict[str, Any]:
        return await self._repository.async_add(create_asset(data, self._household_id))

    async def async_update(self, asset_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        existing = self.get_asset(asset_id)
        if existing is None:
            raise KeyError(asset_id)
        merged = {**existing, **updates}
        validated = create_asset(merged, self._household_id)
        validated["id"] = existing["id"]
        validated["household_id"] = existing["household_id"]
        validated["created_at"] = existing["created_at"]
        validated["updated_at"] = utcnow_iso()
        validated["revision"] = int(existing.get("revision", 1)) + 1
        return await self._repository.async_update(asset_id, validated)

    async def async_delete(self, asset_id: str) -> None:
        if self.get_asset(asset_id) is None:
            raise KeyError(asset_id)
        await self._repository.async_delete(asset_id)

    async def async_mark_checked(self, asset_id: str, checked_on: str | None = None) -> dict[str, Any]:
        checked = checked_on or date.today().isoformat()
        return await self.async_update(asset_id, {"last_checked_at": checked})

    def evaluated_assets(self) -> list[dict[str, Any]]:
        today = date.today().isoformat()
        result = []
        for asset in self.assets:
            next_check = asset.get("next_check_at")
            status = "critical" if next_check and next_check <= today else "ok"
            result.append({**asset, "status": status})
        return result

    def summary(self) -> dict[str, Any]:
        assets = self.evaluated_assets()
        critical = sum(1 for asset in assets if asset["status"] == "critical")
        return {
            "status": "critical" if critical else "ok",
            "assets": len(assets),
            "critical": critical,
            "ok": len(assets) - critical,
        }
