"""WebSocket API for HomePrep."""

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .core.service import HomePrepService


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/items",
    }
)
@websocket_api.async_response
async def websocket_get_items(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return all HomePrep items."""

    domain_data = hass.data.get(DOMAIN, {})

    if not domain_data:
        connection.send_error(
            msg["id"],
            "not_loaded",
            "HomePrep is not loaded",
        )
        return

    service: HomePrepService = next(
        iter(domain_data.values())
    )

    connection.send_result(
        msg["id"],
        {
            "items": service.items,
        },
    )


def async_register_websocket_api(
    hass: HomeAssistant,
) -> None:
    """Register HomePrep WebSocket commands."""

    websocket_api.async_register_command(
        hass,
        websocket_get_items,
    )
