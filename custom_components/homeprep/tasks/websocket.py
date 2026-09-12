"""WebSocket API for HomePrep recurring tasks."""

from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

DOMAIN = "homeprep"
TASK_SERVICE_KEY = "task_service"


def async_register_task_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, websocket_tasks)
    websocket_api.async_register_command(hass, websocket_task_add)
    websocket_api.async_register_command(hass, websocket_task_update)
    websocket_api.async_register_command(hass, websocket_task_delete)
    websocket_api.async_register_command(hass, websocket_task_complete)


def _service(hass: HomeAssistant):
    return hass.data[DOMAIN][TASK_SERVICE_KEY]


@websocket_api.websocket_command({vol.Required("type"): "homeprep/tasks"})
@websocket_api.async_response
async def websocket_tasks(hass, connection, msg):
    service = _service(hass)
    connection.send_result(
        msg["id"],
        {
            "tasks": service.evaluated_tasks(),
            "summary": service.summary(),
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/task/add",
        vol.Required("task"): dict,
    }
)
@websocket_api.async_response
async def websocket_task_add(hass, connection, msg):
    try:
        result = await _service(hass).async_add_task(msg["task"])
    except (ValueError, KeyError) as error:
        connection.send_error(msg["id"], "invalid_task", str(error))
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/task/update",
        vol.Required("task_id"): str,
        vol.Required("updates"): dict,
    }
)
@websocket_api.async_response
async def websocket_task_update(hass, connection, msg):
    try:
        result = await _service(hass).async_update_task(
            msg["task_id"],
            msg["updates"],
        )
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Task or linked item not found")
        return
    except ValueError as error:
        connection.send_error(msg["id"], "invalid_task", str(error))
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/task/delete",
        vol.Required("task_id"): str,
    }
)
@websocket_api.async_response
async def websocket_task_delete(hass, connection, msg):
    try:
        await _service(hass).async_delete_task(msg["task_id"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Task not found")
        return
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/task/complete",
        vol.Required("task_id"): str,
        vol.Optional("completed_on"): str,
    }
)
@websocket_api.async_response
async def websocket_task_complete(hass, connection, msg):
    try:
        result = await _service(hass).async_complete_task(
            msg["task_id"],
            msg.get("completed_on"),
        )
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Task not found")
        return
    except ValueError as error:
        connection.send_error(msg["id"], "invalid_date", str(error))
        return
    connection.send_result(msg["id"], result)
