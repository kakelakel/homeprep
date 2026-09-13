"""WebSocket API for HomePrep household assets."""
from __future__ import annotations

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

DOMAIN = "homeprep"
ASSET_SERVICE_KEY = "asset_service"


def async_register_asset_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, websocket_assets)
    websocket_api.async_register_command(hass, websocket_asset_add)
    websocket_api.async_register_command(hass, websocket_asset_update)
    websocket_api.async_register_command(hass, websocket_asset_delete)
    websocket_api.async_register_command(hass, websocket_asset_mark_checked)


def _service(hass: HomeAssistant):
    return hass.data[DOMAIN][ASSET_SERVICE_KEY]


@websocket_api.websocket_command({vol.Required("type"): "homeprep/assets"})
@websocket_api.async_response
async def websocket_assets(hass, connection, msg):
    service = _service(hass)
    connection.send_result(msg["id"], {"assets": service.evaluated_assets(), "summary": service.summary()})


@websocket_api.websocket_command({vol.Required("type"): "homeprep/asset/add", vol.Required("asset"): dict})
@websocket_api.async_response
async def websocket_asset_add(hass, connection, msg):
    try:
        result = await _service(hass).async_add(msg["asset"])
    except ValueError as error:
        connection.send_error(msg["id"], "invalid_asset", str(error)); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/asset/update", vol.Required("asset_id"): str, vol.Required("updates"): dict})
@websocket_api.async_response
async def websocket_asset_update(hass, connection, msg):
    try:
        result = await _service(hass).async_update(msg["asset_id"], msg["updates"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Asset not found"); return
    except ValueError as error:
        connection.send_error(msg["id"], "invalid_asset", str(error)); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/asset/delete", vol.Required("asset_id"): str})
@websocket_api.async_response
async def websocket_asset_delete(hass, connection, msg):
    try:
        await _service(hass).async_delete(msg["asset_id"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Asset not found"); return
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command({vol.Required("type"): "homeprep/asset/mark_checked", vol.Required("asset_id"): str, vol.Optional("checked_on"): str})
@websocket_api.async_response
async def websocket_asset_mark_checked(hass, connection, msg):
    try:
        result = await _service(hass).async_mark_checked(msg["asset_id"], msg.get("checked_on"))
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Asset not found"); return
    connection.send_result(msg["id"], result)
