"""HomePrep integration for Home Assistant."""

from pathlib import Path

import voluptuous as vol

from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, SERVICE_ADD_ITEM, SERVICE_DELETE_ITEM, SERVICE_UPDATE_ITEM
from .core.service import HomePrepService
from .core.taxonomy import CATEGORIES, ITEM_TYPES, UNITS
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

FRONTEND_PATH = Path(__file__).parent / "frontend"
FRONTEND_URL = "/api/homeprep/frontend"

ADD_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Required("category"): vol.In(list(CATEGORIES)),
        vol.Required("item_type"): vol.In(list(ITEM_TYPES)),
        vol.Required("quantity"): vol.Coerce(float),
        vol.Required("unit"): vol.In(list(UNITS)),
        vol.Optional("expires_at"): cv.string,
        vol.Optional("last_checked"): cv.string,
        vol.Optional("next_check_at"): cv.string,
        vol.Optional("notes"): cv.string,
    }
)

UPDATE_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("item_id"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("category"): vol.In(list(CATEGORIES)),
        vol.Optional("item_type"): vol.In(list(ITEM_TYPES)),
        vol.Optional("quantity"): vol.Coerce(float),
        vol.Optional("unit"): vol.In(list(UNITS)),
        vol.Optional("expires_at"): cv.string,
        vol.Optional("last_checked"): cv.string,
        vol.Optional("next_check_at"): cv.string,
        vol.Optional("notes"): cv.string,
    }
)

DELETE_ITEM_SCHEMA = vol.Schema({vol.Required("item_id"): cv.string})


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    async_register_websocket_api(hass)
    async_register_planning_websocket(hass)
    async_register_task_websocket(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    await hass.http.async_register_static_paths(
        [StaticPathConfig(FRONTEND_URL, str(FRONTEND_PATH), False)]
    )

    repository = HAStorageRepository(hass)
    service = HomePrepService(hass, repository)
    await service.async_load()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = service

    planning_repository = HAPlanningRepository(hass)
    planning_service = HomePrepPlanningService(
        planning_repository,
        RecommendationCatalog(),
        service,
    )
    await planning_service.async_load()
    hass.data[DOMAIN][PLANNING_SERVICE_KEY] = planning_service

    task_repository = HATaskRepository(hass)
    task_service = HomePrepTaskService(task_repository, service)
    await task_service.async_load()
    hass.data[DOMAIN][TASK_SERVICE_KEY] = task_service

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    async def async_handle_add_item(call: ServiceCall) -> None:
        await service.async_add_item(dict(call.data))

    async def async_handle_update_item(call: ServiceCall) -> None:
        item_id = call.data["item_id"]
        updates = {k: v for k, v in call.data.items() if k != "item_id"}
        await service.async_update_item(item_id, updates)

    async def async_handle_delete_item(call: ServiceCall) -> None:
        await service.async_delete_item(call.data["item_id"])

    if not hass.services.has_service(DOMAIN, SERVICE_ADD_ITEM):
        hass.services.async_register(
            DOMAIN,
            SERVICE_ADD_ITEM,
            async_handle_add_item,
            schema=ADD_ITEM_SCHEMA,
        )

    if not hass.services.has_service(DOMAIN, SERVICE_UPDATE_ITEM):
        hass.services.async_register(
            DOMAIN,
            SERVICE_UPDATE_ITEM,
            async_handle_update_item,
            schema=UPDATE_ITEM_SCHEMA,
        )

    if not hass.services.has_service(DOMAIN, SERVICE_DELETE_ITEM):
        hass.services.async_register(
            DOMAIN,
            SERVICE_DELETE_ITEM,
            async_handle_delete_item,
            schema=DELETE_ITEM_SCHEMA,
        )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if not unload_ok:
        return False

    for service_name in (
        SERVICE_ADD_ITEM,
        SERVICE_UPDATE_ITEM,
        SERVICE_DELETE_ITEM,
    ):
        if hass.services.has_service(DOMAIN, service_name):
            hass.services.async_remove(DOMAIN, service_name)

    if DOMAIN in hass.data:
        hass.data[DOMAIN].pop(entry.entry_id, None)
        hass.data[DOMAIN].pop(PLANNING_SERVICE_KEY, None)
        hass.data[DOMAIN].pop(TASK_SERVICE_KEY, None)
        if not hass.data[DOMAIN]:
            hass.data.pop(DOMAIN)

    return True
