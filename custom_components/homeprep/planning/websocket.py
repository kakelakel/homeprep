"""WebSocket API for HomePrep planning."""

from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

DOMAIN = "homeprep"
PLANNING_KEY = "planning_service"


def async_register_planning_websocket(
    hass: HomeAssistant,
) -> None:
    websocket_api.async_register_command(
        hass,
        websocket_planning_overview,
    )
    websocket_api.async_register_command(
        hass,
        websocket_profiles,
    )
    websocket_api.async_register_command(
        hass,
        websocket_profile,
    )
    websocket_api.async_register_command(
        hass,
        websocket_recommendations,
    )
    websocket_api.async_register_command(
        hass,
        websocket_update_household,
    )
    websocket_api.async_register_command(
        hass,
        websocket_add_target,
    )
    websocket_api.async_register_command(
        hass,
        websocket_update_target,
    )
    websocket_api.async_register_command(
        hass,
        websocket_delete_target,
    )
    websocket_api.async_register_command(
        hass,
        websocket_adopt_recommendation,
    )


def _service(hass: HomeAssistant):
    return hass.data[DOMAIN][PLANNING_KEY]


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/planning",
    }
)
@websocket_api.async_response
async def websocket_planning_overview(
    hass,
    connection,
    msg,
):
    service = _service(hass)

    connection.send_result(
        msg["id"],
        {
            "household": service.household,
            "targets": service.targets,
            "evaluations": service.evaluate_targets(),
            "summary": service.summary(),
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/recommendation_profiles",
    }
)
@websocket_api.async_response
async def websocket_profiles(
    hass,
    connection,
    msg,
):
    connection.send_result(
        msg["id"],
        _service(hass).list_profiles(),
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/recommendation_profile",
        vol.Required("profile_id"): str,
    }
)
@websocket_api.async_response
async def websocket_profile(
    hass,
    connection,
    msg,
):
    profile = _service(hass).get_profile(msg["profile_id"])

    if profile is None:
        connection.send_error(
            msg["id"],
            "not_found",
            "Recommendation profile not found",
        )
        return

    connection.send_result(msg["id"], profile)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/recommendations",
        vol.Required("profile_id"): str,
    }
)
@websocket_api.async_response
async def websocket_recommendations(
    hass,
    connection,
    msg,
):
    try:
        result = _service(hass).recommendations_for_household(
            msg["profile_id"]
        )
    except KeyError:
        connection.send_error(
            msg["id"],
            "not_found",
            "Recommendation profile not found",
        )
        return

    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/household/update",
        vol.Optional("country_code"): str,
        vol.Optional("adults"): vol.Coerce(int),
        vol.Optional("children"): vol.Coerce(int),
        vol.Optional("pets"): vol.Coerce(int),
        vol.Optional("preparedness_days"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def websocket_update_household(
    hass,
    connection,
    msg,
):
    changes = {
        key: value
        for key, value in msg.items()
        if key not in {"id", "type"}
    }

    result = await _service(hass).async_update_household(changes)
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/target/add",
        vol.Required("target"): dict,
    }
)
@websocket_api.async_response
async def websocket_add_target(
    hass,
    connection,
    msg,
):
    try:
        result = await _service(hass).async_add_target(msg["target"])
    except (ValueError, KeyError) as error:
        connection.send_error(
            msg["id"],
            "invalid_target",
            str(error),
        )
        return

    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/target/update",
        vol.Required("target_id"): str,
        vol.Required("updates"): dict,
    }
)
@websocket_api.async_response
async def websocket_update_target(
    hass,
    connection,
    msg,
):
    try:
        result = await _service(hass).async_update_target(
            msg["target_id"],
            msg["updates"],
        )
    except KeyError:
        connection.send_error(
            msg["id"],
            "not_found",
            "Target not found",
        )
        return

    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/target/delete",
        vol.Required("target_id"): str,
    }
)
@websocket_api.async_response
async def websocket_delete_target(
    hass,
    connection,
    msg,
):
    try:
        await _service(hass).async_delete_target(msg["target_id"])
    except KeyError:
        connection.send_error(
            msg["id"],
            "not_found",
            "Target not found",
        )
        return

    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homeprep/recommendation/adopt",
        vol.Required("profile_id"): str,
        vol.Required("recommendation_id"): str,
    }
)
@websocket_api.async_response
async def websocket_adopt_recommendation(
    hass,
    connection,
    msg,
):
    try:
        result = await _service(hass).async_adopt_recommendation(
            msg["profile_id"],
            msg["recommendation_id"],
        )
    except KeyError:
        connection.send_error(
            msg["id"],
            "not_found",
            "Profile or recommendation not found",
        )
        return

    connection.send_result(msg["id"], result)
