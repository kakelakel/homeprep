"""Config flow for HomePrep."""

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN


class HomePrepConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for HomePrep."""

    VERSION = 1

    async def async_step_user(
        self,
        user_input: dict | None = None,
    ) -> FlowResult:
        """Handle the initial setup step."""

        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(
                title="HomePrep",
                data={},
            )

        return self.async_show_form(
            step_id="user",
        )
