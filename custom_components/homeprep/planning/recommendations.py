"""Curated, versioned recommendation profiles for HomePrep."""

from __future__ import annotations

import json
from importlib.resources import files
from typing import Any


class RecommendationCatalog:
    """Load recommendation profiles bundled with HomePrep."""

    def __init__(self) -> None:
        self._profiles: dict[str, dict[str, Any]] = {}

    def load(self) -> None:
        package_root = files("custom_components.homeprep.recommendations")

        profiles: dict[str, dict[str, Any]] = {}

        for resource in package_root.iterdir():
            if not resource.name.endswith(".json"):
                continue

            with resource.open("r", encoding="utf-8") as handle:
                profile = json.load(handle)

            profile_id = profile["id"]
            profiles[profile_id] = profile

        self._profiles = profiles

    @property
    def profiles(self) -> list[dict[str, Any]]:
        return list(self._profiles.values())

    def get(self, profile_id: str) -> dict[str, Any] | None:
        return self._profiles.get(profile_id)

    def list_metadata(self) -> list[dict[str, Any]]:
        return [
            {
                "id": profile["id"],
                "country_code": profile["country_code"],
                "authority": profile["authority"],
                "authority_url": profile["authority_url"],
                "title": profile["title"],
                "version": profile["version"],
                "reviewed_at": profile["reviewed_at"],
                "default_duration_days": profile.get(
                    "default_duration_days"
                ),
            }
            for profile in self.profiles
        ]
