"""WebSocket API for HomePrep."""

from datetime import date, timedelta
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .core.service import HomePrepService


EXPIRING_SOON_DAYS = 30


def _get_service(
    hass: HomeAssistant,
) -> HomePrepService | None:
    """Return the active HomePrep service."""

    domain_data = hass.data.get(DOMAIN, {})

    if not domain_data:
        return None

    for value in domain_data.values():
        if isinstance(value, HomePrepService):
            return value

    return None


def _parse_date(
    value: str | None,
) -> date | None:
    """Parse an ISO date."""

    if not value:
        return None

    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def _build_summary(
    items: list[dict[str, Any]],
) -> dict[str, Any]:
    """Build HomePrep summary data."""

    today = dt_util.now().date()

    expiring_limit = today + timedelta(
        days=EXPIRING_SOON_DAYS
    )

    expired_items: list[dict[str, Any]] = []
    expiring_items: list[dict[str, Any]] = []
    due_items: list[dict[str, Any]] = []

    consumables = 0
    equipment = 0

    for item in items:
        if item.get("item_type") == "consumable":
            consumables += 1

        if item.get("item_type") == "equipment":
            equipment += 1

        expires_at = _parse_date(
            item.get("expires_at")
        )

        if expires_at is not None:
            if expires_at < today:
                expired_items.append(
                    {
                        "id": item.get("id"),
                        "name": item.get("name"),
                        "category": item.get(
                            "category"
                        ),
                        "expires_at": item.get(
                            "expires_at"
                        ),
                        "days_overdue": (
                            today - expires_at
                        ).days,
                    }
                )

            elif (
                today
                <= expires_at
                <= expiring_limit
            ):
                expiring_items.append(
                    {
                        "id": item.get("id"),
                        "name": item.get("name"),
                        "category": item.get(
                            "category"
                        ),
                        "expires_at": item.get(
                            "expires_at"
                        ),
                        "days_remaining": (
                            expires_at - today
                        ).days,
                    }
                )

        next_check_at = _parse_date(
            item.get("next_check_at")
        )

        if (
            next_check_at is not None
            and next_check_at <= today
        ):
            due_items.append(
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "category": item.get(
                        "category"
                    ),
                    "next_check_at": item.get(
                        "next_check_at"
                    ),
                    "days_overdue": max(
                        0,
                        (
                            today
                            - next_check_at
                        ).days,
                    ),
                }
            )

    if expired_items or due_items:
        status = "critical"

    elif expiring_items:
        status = "attention"

    else:
        status = "ok"

    return {
        "status": status,
        "items": len(items),
        "consumables": consumables,
        "equipment": equipment,
        "expired": len(expired_items),
        "expiring_soon": len(
            expiring_items
        ),
        "due_for_check": len(
            due_items
        ),
        "expired_items": expired_items,
        "expiring_soon_items":
            expiring_items,
        "due_for_check_items":
            due_items,
    }


@websocket_api.websocket_command(
    {
        vol.Required("type"):
            "homeprep/items",
    }
)
@websocket_api.async_response
async def websocket_get_items(
    hass: HomeAssistant,
    connection:
        websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return all HomePrep items."""

    service = _get_service(hass)

    if service is None:
        connection.send_error(
            msg["id"],
            "not_loaded",
            "HomePrep is not loaded",
        )
        return

    connection.send_result(
        msg["id"],
        {
            "items": service.items,
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"):
            "homeprep/summary",
    }
)
@websocket_api.async_response
async def websocket_get_summary(
    hass: HomeAssistant,
    connection:
        websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return HomePrep summary."""

    service = _get_service(hass)

    if service is None:
        connection.send_error(
            msg["id"],
            "not_loaded",
            "HomePrep is not loaded",
        )
        return

    summary = _build_summary(
        service.items
    )

    connection.send_result(
        msg["id"],
        summary,
    )


def async_register_websocket_api(
    hass: HomeAssistant,
) -> None:
    """Register HomePrep WebSocket commands."""

    websocket_api.async_register_command(
        hass,
        websocket_get_items,
    )

    websocket_api.async_register_command(
        hass,
        websocket_get_summary,
    )
