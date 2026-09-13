"""WebSocket API for HomePrep preparedness plans."""
from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

DOMAIN = "homeprep"
PLAN_SERVICE_KEY = "plan_service"


def async_register_plan_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, websocket_plans)
    websocket_api.async_register_command(hass, websocket_plan_add)
    websocket_api.async_register_command(hass, websocket_plan_add_template)
    websocket_api.async_register_command(hass, websocket_plan_update)
    websocket_api.async_register_command(hass, websocket_plan_delete)
    websocket_api.async_register_command(hass, websocket_plan_toggle_item)
    websocket_api.async_register_command(hass, websocket_plan_add_item)
    websocket_api.async_register_command(hass, websocket_plan_update_item)
    websocket_api.async_register_command(hass, websocket_plan_delete_item)
    websocket_api.async_register_command(hass, websocket_plan_mark_reviewed)


def _service(hass: HomeAssistant):
    return hass.data[DOMAIN][PLAN_SERVICE_KEY]


@websocket_api.websocket_command({vol.Required("type"): "homeprep/plans"})
@websocket_api.async_response
async def websocket_plans(hass, connection, msg):
    service = _service(hass)
    connection.send_result(msg["id"], {"plans": service.evaluated_plans(), "summary": service.summary(), "templates": service.templates()})


@websocket_api.websocket_command({vol.Required("type"): "homeprep/plan/add", vol.Required("plan"): dict})
@websocket_api.async_response
async def websocket_plan_add(hass, connection, msg):
    try:
        result = await _service(hass).async_add(msg["plan"])
    except (ValueError, KeyError) as error:
        connection.send_error(msg["id"], "invalid_plan", str(error)); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/plan/add_template", vol.Required("template_id"): str})
@websocket_api.async_response
async def websocket_plan_add_template(hass, connection, msg):
    try:
        result = await _service(hass).async_add_from_template(msg["template_id"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Plan template not found"); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/plan/update", vol.Required("plan_id"): str, vol.Required("updates"): dict})
@websocket_api.async_response
async def websocket_plan_update(hass, connection, msg):
    try:
        result = await _service(hass).async_update(msg["plan_id"], msg["updates"])
    except KeyError as error:
        connection.send_error(msg["id"], "not_found", str(error)); return
    except ValueError as error:
        connection.send_error(msg["id"], "invalid_plan", str(error)); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/plan/delete", vol.Required("plan_id"): str})
@websocket_api.async_response
async def websocket_plan_delete(hass, connection, msg):
    try:
        await _service(hass).async_delete(msg["plan_id"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Plan not found"); return
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command({vol.Required("type"): "homeprep/plan/toggle_item", vol.Required("plan_id"): str, vol.Required("item_id"): str, vol.Optional("completed"): bool})
@websocket_api.async_response
async def websocket_plan_toggle_item(hass, connection, msg):
    try:
        result = await _service(hass).async_toggle_check_item(msg["plan_id"], msg["item_id"], msg.get("completed"))
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Plan or checklist item not found"); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({
    vol.Required("type"): "homeprep/plan/add_item",
    vol.Required("plan_id"): str,
    vol.Required("label"): str,
    vol.Optional("description"): str,
    vol.Optional("linked_inventory_item_ids", default=[]): [str],
    vol.Optional("linked_container_ids", default=[]): [str],
})
@websocket_api.async_response
async def websocket_plan_add_item(hass, connection, msg):
    try:
        result = await _service(hass).async_add_check_item(
            msg["plan_id"],
            msg["label"],
            msg.get("description"),
            msg.get("linked_inventory_item_ids"),
            msg.get("linked_container_ids"),
        )
    except (KeyError, ValueError) as error:
        connection.send_error(msg["id"], "invalid_item", str(error)); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({
    vol.Required("type"): "homeprep/plan/update_item",
    vol.Required("plan_id"): str,
    vol.Required("item_id"): str,
    vol.Required("updates"): dict,
})
@websocket_api.async_response
async def websocket_plan_update_item(hass, connection, msg):
    try:
        result = await _service(hass).async_update_check_item(msg["plan_id"], msg["item_id"], msg["updates"])
    except (KeyError, ValueError) as error:
        connection.send_error(msg["id"], "invalid_item", str(error)); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/plan/delete_item", vol.Required("plan_id"): str, vol.Required("item_id"): str})
@websocket_api.async_response
async def websocket_plan_delete_item(hass, connection, msg):
    try:
        result = await _service(hass).async_delete_check_item(msg["plan_id"], msg["item_id"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Plan or checklist item not found"); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/plan/mark_reviewed", vol.Required("plan_id"): str, vol.Optional("reviewed_on"): str})
@websocket_api.async_response
async def websocket_plan_mark_reviewed(hass, connection, msg):
    try:
        result = await _service(hass).async_mark_reviewed(msg["plan_id"], msg.get("reviewed_on"))
    except (KeyError, ValueError) as error:
        connection.send_error(msg["id"], "invalid_review", str(error)); return
    connection.send_result(msg["id"], result)
