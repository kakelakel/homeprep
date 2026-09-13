"""Home Assistant Store-backed asset repository."""
from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .models import normalize_asset, utcnow_iso

ASSET_STORAGE_VERSION = 1
ASSET_STORAGE_KEY = "homeprep.assets"


class HAAssetRepository:
    def __init__(self, hass: HomeAssistant, household_id: str) -> None:
        self._household_id = household_id
        self._store = Store(hass, ASSET_STORAGE_VERSION, ASSET_STORAGE_KEY)
        self._assets: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self._assets = [normalize_asset(asset, self._household_id) for asset in data.get("assets", [])]
        await self._save()

    @property
    def assets(self) -> list[dict[str, Any]]:
        return [dict(asset) for asset in self._assets if not asset.get("deleted_at")]

    async def async_add(self, asset: dict[str, Any]) -> dict[str, Any]:
        self._assets.append(asset)
        await self._save()
        return dict(asset)

    async def async_update(self, asset_id: str, asset: dict[str, Any]) -> dict[str, Any]:
        for index, current in enumerate(self._assets):
            if current["id"] == asset_id and not current.get("deleted_at"):
                self._assets[index] = asset
                await self._save()
                return dict(asset)
        raise KeyError(asset_id)

    async def async_delete(self, asset_id: str) -> None:
        for asset in self._assets:
            if asset["id"] == asset_id and not asset.get("deleted_at"):
                asset["deleted_at"] = utcnow_iso()
                asset["updated_at"] = asset["deleted_at"]
                asset["revision"] = int(asset.get("revision", 1)) + 1
                await self._save()
                return
        raise KeyError(asset_id)

    async def _save(self) -> None:
        await self._store.async_save({"assets": self._assets})
