"""WebSocket API for HomePrep notifications."""
from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from ..const import DOMAIN
from ..media import async_register_media
from .service import HomePrepNotificationService


NOTIFICATION_SERVICE_KEY = "notification_service"


def _get_service(hass: HomeAssistant) -> HomePrepNotificationService | None:
    value = hass.data.get(DOMAIN, {}).get(NOTIFICATION_SERVICE_KEY)
    return value if isinstance(value, HomePrepNotificationService) else None


@websocket_api.websocket_command({vol.Required("type"): "homeprep/notifications"})
@websocket_api.async_response
async def websocket_get_notifications(hass, connection, msg) -> None:
    service = _get_service(hass)
    if service is None:
        connection.send_error(msg["id"], "not_loaded", "HomePrep notifications are not loaded")
        return

    connection.send_result(msg["id"], {
        "settings": service.settings,
        "targets": service.available_targets(),
    })


@websocket_api.websocket_command({
    vol.Required("type"): "homeprep/notifications/update",
    vol.Required("settings"): dict,
})
@websocket_api.async_response
async def websocket_update_notifications(hass, connection, msg) -> None:
    service = _get_service(hass)
    if service is None:
        connection.send_error(msg["id"], "not_loaded", "HomePrep notifications are not loaded")
        return

    settings = await service.async_update_settings(dict(msg["settings"]))
    connection.send_result(msg["id"], settings)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/notifications/test"})
@websocket_api.async_response
async def websocket_test_notifications(hass, connection, msg) -> None:
    service = _get_service(hass)
    if service is None:
        connection.send_error(msg["id"], "not_loaded", "HomePrep notifications are not loaded")
        return

    result = await service.async_send_test()
    connection.send_result(msg["id"], result)


def async_register_notification_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, websocket_get_notifications)
    websocket_api.async_register_command(hass, websocket_update_notifications)
    websocket_api.async_register_command(hass, websocket_test_notifications)
    async_register_media(hass)
