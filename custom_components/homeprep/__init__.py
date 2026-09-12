"""HomePrep integration for Home Assistant."""
from pathlib import Path
from typing import Any
import voluptuous as vol
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
from .const import (
    DOMAIN,
    SERVICE_ADD_ITEM,
    SERVICE_DELETE_ITEM,
    SERVICE_UPDATE_ITEM,
)
from .core.service import HomePrepService
from .core.taxonomy import (
    CATEGORIES,
    ITEM_TYPES,
    UNITS,
)
from .planning.recommendations import RecommendationCatalog
from .planning.repository import HAPlanningRepository
from .planning.service import HomePrepPlanningService
from .planning.websocket import async_register_planning_websocket
from .repositories.ha_storage import HAStorageRepository
from .tasks.repository import HATaskRepository
from .tasks.service import HomePrepTaskService
from .tasks.websocket import async_register_task_websocket
from .websocket import async_register_websocket_api
PLATFORMS = ["sensor"]
PLANNING_SERVICE_KEY = "planning_service"
TASK_SERVICE_KEY = "task_service"
FRONTEND_PATH = (
    Path(__file__).parent
    / "frontend"
)
FRONTEND_URL = (
    "/api/homeprep/frontend"
)
INSPECTION_FIELDS = {
    "inspection_enabled",
    "inspection_recurrence_type",
    "inspection_recurrence_interval",
    "inspection_reschedule_mode",
    "inspection_reminder_before_days",
}
def _inspection_schema_fields() -> dict:
    return {
        vol.Optional("inspection_enabled"):
            cv.boolean,
        vol.Optional("inspection_recurrence_type"):
            vol.In(
                [
                    "days",
                    "weeks",
                    "months",
                    "years",
                ]
            ),
        vol.Optional("inspection_recurrence_interval"):
            vol.All(
                vol.Coerce(int),
                vol.Range(min=1),
            ),
        vol.Optional("inspection_reschedule_mode"):
            vol.In(
                [
                    "completion",
                    "scheduled",
                ]
            ),
        vol.Optional("inspection_reminder_before_days"):
            vol.All(
                vol.Coerce(int),
                vol.Range(min=0),
            ),
    }
ADD_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("name"):
            cv.string,
        vol.Required("category"):
            vol.In(
                list(CATEGORIES)
            ),
        vol.Required("item_type"):
            vol.In(
                list(ITEM_TYPES)
            ),
        vol.Required("quantity"):
            vol.Coerce(float),
        vol.Required("unit"):
            vol.In(
                list(UNITS)
            ),
        vol.Optional("expires_at"):
            cv.string,
        vol.Optional("last_checked"):
            cv.string,
        vol.Optional("next_check_at"):
            cv.string,
        vol.Optional("notes"):
            cv.string,
        **_inspection_schema_fields(),
    }
)
UPDATE_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("item_id"):
            cv.string,
        vol.Optional("name"):
            cv.string,
        vol.Optional("category"):
            vol.In(
                list(CATEGORIES)
            ),
        vol.Optional("item_type"):
            vol.In(
                list(ITEM_TYPES)
            ),
        vol.Optional("quantity"):
            vol.Coerce(float),
        vol.Optional("unit"):
            vol.In(
                list(UNITS)
            ),
        vol.Optional("expires_at"):
            cv.string,
        vol.Optional("last_checked"):
            cv.string,
        vol.Optional("next_check_at"):
            cv.string,
        vol.Optional("notes"):
            cv.string,
        **_inspection_schema_fields(),
    }
)
DELETE_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("item_id"):
            cv.string,
    }
)
def _split_inventory_and_inspection(
    data: dict[str, Any],
) -> tuple[
    dict[str, Any],
    dict[str, Any] | None,
]:
    inventory = {}
    inspection = {}
    inspection_supplied = False
    for key, value in data.items():
        if key in INSPECTION_FIELDS:
            inspection_supplied = True
            inspection[key] = value
        else:
            inventory[key] = value
    return (
        inventory,
        inspection
        if inspection_supplied
        else None,
    )
async def _async_sync_item_inspection(
    task_service: HomePrepTaskService,
    item: dict[str, Any],
    inspection: dict[str, Any] | None,
) -> None:
    """Create/update/disable the inspection task attached to an item."""
    if inspection is None:
        return
    existing = task_service.find_linked_task(
        item["id"],
        "inspection",
    )
    enabled = bool(
        inspection.get(
            "inspection_enabled",
            False,
        )
    )
    if not enabled:
        if existing is not None:
            await task_service.async_update_task(
                existing["id"],
                {
                    "enabled": False,
                },
            )
        return
    task_data = {
        "name":
            f"Check {item['name']}",
        "task_kind":
            "inspection",
        "category":
            item.get("category"),
        "linked_item_id":
            item["id"],
        "recurrence_type":
            inspection.get(
                "inspection_recurrence_type",
                (
                    existing.get(
                        "recurrence_type"
                    )
                    if existing
                    else "months"
                ),
            ),
        "recurrence_interval":
            inspection.get(
                "inspection_recurrence_interval",
                (
                    existing.get(
                        "recurrence_interval"
                    )
                    if existing
                    else 1
                ),
            ),
        "reschedule_mode":
            inspection.get(
                "inspection_reschedule_mode",
                (
                    existing.get(
                        "reschedule_mode"
                    )
                    if existing
                    else "scheduled"
                ),
            ),
        "next_due_at":
            item.get(
                "next_check_at"
            )
            or (
                existing.get(
                    "next_due_at"
                )
                if existing
                else None
            ),
        "reminder_before_days":
            inspection.get(
                "inspection_reminder_before_days",
                (
                    existing.get(
                        "reminder_before_days"
                    )
                    if existing
                    else 7
                ),
            ),
        "enabled":
            True,
        "notes":
            (
                existing.get("notes")
                if existing
                else None
            ),
    }
    if existing is None:
        await task_service.async_add_task(
            task_data
        )
    else:
        await task_service.async_update_task(
            existing["id"],
            task_data,
        )
async def async_setup(
    hass: HomeAssistant,
    config: dict,
) -> bool:
    """Set up HomePrep."""
    async_register_websocket_api(
        hass
    )
    async_register_planning_websocket(
        hass
    )
    async_register_task_websocket(
        hass
    )
    return True
async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Set up HomePrep from a config entry."""
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                FRONTEND_URL,
                str(FRONTEND_PATH),
                False,
            )
        ]
    )
    repository = HAStorageRepository(
        hass
    )
    service = HomePrepService(
        hass,
        repository,
    )
    await service.async_load()
    hass.data.setdefault(
        DOMAIN,
        {},
    )[entry.entry_id] = service
    planning_repository = (
        HAPlanningRepository(
            hass
        )
    )
    planning_service = (
        HomePrepPlanningService(
            planning_repository,
            RecommendationCatalog(),
            service,
        )
    )
    await planning_service.async_load()
    hass.data[
        DOMAIN
    ][
        PLANNING_SERVICE_KEY
    ] = planning_service
    task_repository = (
        HATaskRepository(
            hass
        )
    )
    task_service = (
        HomePrepTaskService(
            task_repository,
            service,
        )
    )
    await task_service.async_load()
    hass.data[
        DOMAIN
    ][
        TASK_SERVICE_KEY
    ] = task_service
    await hass.config_entries.async_forward_entry_setups(
        entry,
        PLATFORMS,
    )
    async def async_handle_add_item(
        call: ServiceCall,
    ) -> None:
        inventory_data, inspection = (
            _split_inventory_and_inspection(
                dict(call.data)
            )
        )
        item = await service.async_add_item(
            inventory_data
        )
        await _async_sync_item_inspection(
            task_service,
            item,
            inspection,
        )
    async def async_handle_update_item(
        call: ServiceCall,
    ) -> None:
        data = dict(
            call.data
        )
        item_id = data.pop(
            "item_id"
        )
        inventory_data, inspection = (
            _split_inventory_and_inspection(
                data
            )
        )
        if inventory_data:
            item = await service.async_update_item(
                item_id,
                inventory_data,
            )
        else:
            item = service.get_item(
                item_id
            )
        if item is None:
            return
        await _async_sync_item_inspection(
            task_service,
            item,
            inspection,
        )
    async def async_handle_delete_item(
        call: ServiceCall,
    ) -> None:
        item_id = call.data[
            "item_id"
        ]
        linked_inspection = (
            task_service.find_linked_task(
                item_id,
                "inspection",
            )
        )
        if linked_inspection:
            await task_service.async_delete_task(
                linked_inspection["id"]
            )
        await service.async_delete_item(
            item_id
        )
    if not hass.services.has_service(
        DOMAIN,
        SERVICE_ADD_ITEM,
    ):
        hass.services.async_register(
            DOMAIN,
            SERVICE_ADD_ITEM,
            async_handle_add_item,
            schema=ADD_ITEM_SCHEMA,
        )
    if not hass.services.has_service(
        DOMAIN,
        SERVICE_UPDATE_ITEM,
    ):
        hass.services.async_register(
            DOMAIN,
            SERVICE_UPDATE_ITEM,
            async_handle_update_item,
            schema=UPDATE_ITEM_SCHEMA,
        )
    if not hass.services.has_service(
        DOMAIN,
        SERVICE_DELETE_ITEM,
    ):
        hass.services.async_register(
            DOMAIN,
            SERVICE_DELETE_ITEM,
            async_handle_delete_item,
            schema=DELETE_ITEM_SCHEMA,
        )
    return True
async def async_unload_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Unload HomePrep."""
    unload_ok = (
        await hass.config_entries.async_unload_platforms(
            entry,
            PLATFORMS,
        )
    )
    if not unload_ok:
        return False
    for service_name in (
        SERVICE_ADD_ITEM,
        SERVICE_UPDATE_ITEM,
        SERVICE_DELETE_ITEM,
    ):
        if hass.services.has_service(
            DOMAIN,
            service_name,
        ):
            hass.services.async_remove(
                DOMAIN,
                service_name,
            )
    if DOMAIN in hass.data:
        hass.data[DOMAIN].pop(
            entry.entry_id,
            None,
        )
        hass.data[DOMAIN].pop(
            PLANNING_SERVICE_KEY,
            None,
        )
        hass.data[DOMAIN].pop(
            TASK_SERVICE_KEY,
            None,
        )
        if not hass.data[DOMAIN]:
            hass.data.pop(
                DOMAIN
            )
    return True
