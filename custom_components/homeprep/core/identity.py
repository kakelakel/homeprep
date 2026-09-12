"""Stable platform-neutral identity for a HomePrep household."""

from __future__ import annotations

from typing import Any
from uuid import uuid4

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store


STORAGE_VERSION = 1
STORAGE_KEY = "homeprep.identity"


class HomePrepIdentity:
    """Persist the stable identity of this HomePrep household."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(
            hass,
            STORAGE_VERSION,
            STORAGE_KEY,
        )
        self.household_id = ""

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        household_id = str(data.get("household_id") or "").strip()
        if not household_id:
            household_id = str(uuid4())
            await self._store.async_save({"household_id": household_id})
        self.household_id = household_id
