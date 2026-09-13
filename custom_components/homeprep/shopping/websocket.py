"""WebSocket API for HomePrep shopping list."""
from __future__ import annotations

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

DOMAIN = "homeprep"
SHOPPING_SERVICE_KEY = "shopping_service"


def async_register_shopping_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, websocket_shopping)
    websocket_api.async_register_command(hass, websocket_shopping_add)
    websocket_api.async_register_command(hass, websocket_shopping_update)
    websocket_api.async_register_command(hass, websocket_shopping_delete)
    websocket_api.async_register_command(hass, websocket_shopping_status)


def _service(hass: HomeAssistant):
    return hass.data[DOMAIN][SHOPPING_SERVICE_KEY]


@websocket_api.websocket_command({vol.Required("type"): "homeprep/shopping"})
@websocket_api.async_response
async def websocket_shopping(hass, connection, msg):
    service = _service(hass)
    connection.send_result(msg["id"], {"items": await service.evaluated_items(), "summary": await service.summary()})


@websocket_api.websocket_command({vol.Required("type"): "homeprep/shopping/add", vol.Required("item"): dict})
@websocket_api.async_response
async def websocket_shopping_add(hass, connection, msg):
    try:
        result = await _service(hass).async_add(msg["item"])
    except ValueError as error:
        connection.send_error(msg["id"], "invalid_shopping_item", str(error)); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/shopping/update", vol.Required("item_id"): str, vol.Required("updates"): dict})
@websocket_api.async_response
async def websocket_shopping_update(hass, connection, msg):
    try:
        result = await _service(hass).async_update(msg["item_id"], msg["updates"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Shopping item not found"); return
    except ValueError as error:
        connection.send_error(msg["id"], "invalid_shopping_item", str(error)); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/shopping/status", vol.Required("item_id"): str, vol.Required("status"): vol.In(["pending", "purchased", "ignored"])})
@websocket_api.async_response
async def websocket_shopping_status(hass, connection, msg):
    try:
        result = await _service(hass).async_set_status(msg["item_id"], msg["status"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Shopping item not found"); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/shopping/delete", vol.Required("item_id"): str})
@websocket_api.async_response
async def websocket_shopping_delete(hass, connection, msg):
    try:
        await _service(hass).async_delete(msg["item_id"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Shopping item not found"); return
    connection.send_result(msg["id"], {"success": True})
