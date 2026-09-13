"""WebSocket API for HomePrep preparedness containers."""
from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

DOMAIN = "homeprep"
CONTAINER_SERVICE_KEY = "container_service"


def async_register_container_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, websocket_containers)
    websocket_api.async_register_command(hass, websocket_container_add)
    websocket_api.async_register_command(hass, websocket_container_update)
    websocket_api.async_register_command(hass, websocket_container_delete)
    websocket_api.async_register_command(hass, websocket_container_mark_checked)
    websocket_api.async_register_command(hass, websocket_container_assign_item)


def _service(hass: HomeAssistant):
    return hass.data[DOMAIN][CONTAINER_SERVICE_KEY]


@websocket_api.websocket_command({vol.Required("type"): "homeprep/containers"})
@websocket_api.async_response
async def websocket_containers(hass, connection, msg):
    service = _service(hass)
    connection.send_result(msg["id"], {"containers": service.evaluated_containers(), "summary": service.summary()})


@websocket_api.websocket_command({vol.Required("type"): "homeprep/container/add", vol.Required("container"): dict})
@websocket_api.async_response
async def websocket_container_add(hass, connection, msg):
    try:
        result = await _service(hass).async_add(msg["container"])
    except ValueError as error:
        connection.send_error(msg["id"], "invalid_container", str(error)); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/container/update", vol.Required("container_id"): str, vol.Required("updates"): dict})
@websocket_api.async_response
async def websocket_container_update(hass, connection, msg):
    try:
        result = await _service(hass).async_update(msg["container_id"], msg["updates"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Container not found"); return
    except ValueError as error:
        connection.send_error(msg["id"], "invalid_container", str(error)); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/container/delete", vol.Required("container_id"): str})
@websocket_api.async_response
async def websocket_container_delete(hass, connection, msg):
    try:
        await _service(hass).async_delete(msg["container_id"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Container not found"); return
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command({vol.Required("type"): "homeprep/container/mark_checked", vol.Required("container_id"): str, vol.Optional("checked_on"): str})
@websocket_api.async_response
async def websocket_container_mark_checked(hass, connection, msg):
    try:
        result = await _service(hass).async_mark_checked(msg["container_id"], msg.get("checked_on"))
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Container not found"); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/container/assign_item", vol.Required("item_id"): str, vol.Optional("container_id"): vol.Any(str, None)})
@websocket_api.async_response
async def websocket_container_assign_item(hass, connection, msg):
    try:
        await _service(hass).async_assign_item(msg["item_id"], msg.get("container_id"))
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Item or container not found"); return
    connection.send_result(msg["id"], {"success": True})
