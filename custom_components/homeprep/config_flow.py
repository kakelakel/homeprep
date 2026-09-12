"""Config flow for HomePrep."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN


COUNTRY_PROFILES = {
    "SE": "se-msb-2026-v1",
    "NO": "no-dsb-2026-v1",
}

TARGET_MAP = {
    "SE": {
        "target_water": "water",
        "target_food": "food_coverage",
        "target_cooking": "alternative_cooking",
        "target_communication": "emergency_radio",
        "target_power": "powerbank",
        "target_lighting": "lighting",
        "target_warmth": "warmth",
        "target_first_aid": "first_aid_medicine",
        "target_hygiene": "hygiene",
        "target_cash": "cash_payment",
        "target_documents": "paper_contacts",
        "target_pets": "pet_supplies",
    },
    "NO": {
        "target_water": "water",
        "target_food": "food_coverage",
        "target_cooking": "alternative_cooking",
        "target_communication": "radio",
        "target_power": "powerbanks",
        "target_lighting": "lighting",
        "target_warmth": "warmth",
        "target_first_aid": "medicine_first_aid",
        "target_hygiene": "hygiene",
        "target_cash": "cash",
        "target_documents": "paper_contacts",
        "target_pets": "pet_supplies",
    },
}


class HomePrepConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the HomePrep setup wizard."""

    VERSION = 1

    def __init__(self) -> None:
        self._household: dict[str, Any] = {}
        self._selected_target_ids: list[str] = []

    async def async_step_user(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Start the setup wizard."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return await self.async_step_household()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
        )

    async def async_step_household(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Collect the household profile."""
        if user_input is not None:
            self._household = {
                "country_code": user_input["country_code"],
                "adults": user_input["adults"],
                "children": user_input["children"],
                "pets": user_input["pets"],
                "preparedness_days": user_input["preparedness_days"],
            }
            return await self.async_step_targets()

        return self.async_show_form(
            step_id="household",
            data_schema=vol.Schema(
                {
                    vol.Required("country_code", default="SE"):
                        vol.In({"SE": "Sweden", "NO": "Norway"}),
                    vol.Required("adults", default=1):
                        vol.All(vol.Coerce(int), vol.Range(min=0, max=20)),
                    vol.Required("children", default=0):
                        vol.All(vol.Coerce(int), vol.Range(min=0, max=20)),
                    vol.Required("pets", default=0):
                        vol.All(vol.Coerce(int), vol.Range(min=0, max=20)),
                    vol.Required("preparedness_days", default=7):
                        vol.All(vol.Coerce(int), vol.Range(min=1, max=30)),
                }
            ),
        )

    async def async_step_targets(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Choose initial personal targets."""
        country = self._household.get("country_code", "SE")
        mapping = TARGET_MAP[country]

        if user_input is not None:
            self._selected_target_ids = [
                recommendation_id
                for field, recommendation_id in mapping.items()
                if user_input.get(field, False)
            ]
            return await self.async_step_review()

        fields: dict[Any, Any] = {
            vol.Optional("target_water", default=True): bool,
            vol.Optional("target_food", default=True): bool,
            vol.Optional("target_cooking", default=True): bool,
            vol.Optional("target_communication", default=True): bool,
            vol.Optional("target_power", default=True): bool,
            vol.Optional("target_lighting", default=True): bool,
            vol.Optional("target_warmth", default=True): bool,
            vol.Optional("target_first_aid", default=True): bool,
            vol.Optional("target_hygiene", default=True): bool,
            vol.Optional("target_cash", default=True): bool,
            vol.Optional("target_documents", default=True): bool,
        }

        if int(self._household.get("pets", 0)) > 0:
            fields[vol.Optional("target_pets", default=True)] = bool

        return self.async_show_form(
            step_id="targets",
            data_schema=vol.Schema(fields),
            description_placeholders={
                "authority": "MSB" if country == "SE" else "DSB",
            },
        )

    async def async_step_review(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Review and create the HomePrep entry."""
        if user_input is not None:
            country = self._household["country_code"]
            return self.async_create_entry(
                title="HomePrep",
                data={
                    "setup_applied": False,
                    "setup": {
                        "household": self._household,
                        "profile_id": COUNTRY_PROFILES[country],
                        "target_ids": self._selected_target_ids,
                    },
                },
            )

        people = int(self._household.get("adults", 0)) + int(
            self._household.get("children", 0)
        )

        return self.async_show_form(
            step_id="review",
            data_schema=vol.Schema({}),
            description_placeholders={
                "country": self._household.get("country_code", ""),
                "people": str(people),
                "pets": str(self._household.get("pets", 0)),
                "days": str(self._household.get("preparedness_days", 7)),
                "targets": str(len(self._selected_target_ids)),
            },
        )
