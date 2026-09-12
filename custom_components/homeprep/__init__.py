"""HomePrep integration for Home Assistant."""

from pathlib import Path

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
from .websocket import async_register_websocket_api


PLATFORMS = ["sensor"]

PLANNING_SERVICE_KEY = "planning_service"

FRONTEND_PATH = (
    Path(__file__).parent
    / "frontend"
)

FRONTEND_URL = (
    "/api/homeprep/frontend"
)


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
    }
)


DELETE_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("item_id"):
            cv.string,
    }
)


async def async_setup(
    hass: HomeAssistant,
    config: dict,
) -> bool:
    """Set up HomePrep."""

    #
    # Register HomePrep WebSocket APIs once.
    #
    async_register_websocket_api(
        hass
    )

    async_register_planning_websocket(
        hass
    )

    return True


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Set up HomePrep from a config entry."""

    #
    # Register bundled frontend files.
    #
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                FRONTEND_URL,
                str(FRONTEND_PATH),
                False,
            )
        ]
    )

    #
    # ---------------------------------------------------------
    # Inventory
    # ---------------------------------------------------------
    #
    # Existing HomePrep inventory backend.
    #

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

    #
    # ---------------------------------------------------------
    # Planning
    # ---------------------------------------------------------
    #
    # Personal targets, household profile and
    # official recommendation profiles.
    #

    planning_repository = (
        HAPlanningRepository(
            hass
        )
    )

    recommendation_catalog = (
        RecommendationCatalog()
    )

    planning_service = (
        HomePrepPlanningService(
            planning_repository,
            recommendation_catalog,
            service,
        )
    )

    await planning_service.async_load()

    hass.data[
        DOMAIN
    ][
        PLANNING_SERVICE_KEY
    ] = planning_service

    #
    # Set up Home Assistant platforms.
    #
    await hass.config_entries.async_forward_entry_setups(
        entry,
        PLATFORMS,
    )

    #
    # ---------------------------------------------------------
    # Inventory actions
    # ---------------------------------------------------------
    #

    async def async_handle_add_item(
        call: ServiceCall,
    ) -> None:
        """Handle add item."""

        await service.async_add_item(
            dict(call.data)
        )

    async def async_handle_update_item(
        call: ServiceCall,
    ) -> None:
        """Handle update item."""

        item_id = call.data[
            "item_id"
        ]

        updates = {
            key: value
            for key, value
            in call.data.items()
            if key != "item_id"
        }

        await service.async_update_item(
            item_id,
            updates,
        )

    async def async_handle_delete_item(
        call: ServiceCall,
    ) -> None:
        """Handle delete item."""

        await service.async_delete_item(
            call.data["item_id"]
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

    #
    # Remove inventory actions.
    #
    if hass.services.has_service(
        DOMAIN,
        SERVICE_ADD_ITEM,
    ):
        hass.services.async_remove(
            DOMAIN,
            SERVICE_ADD_ITEM,
        )

    if hass.services.has_service(
        DOMAIN,
        SERVICE_UPDATE_ITEM,
    ):
        hass.services.async_remove(
            DOMAIN,
            SERVICE_UPDATE_ITEM,
        )

    if hass.services.has_service(
        DOMAIN,
        SERVICE_DELETE_ITEM,
    ):
        hass.services.async_remove(
            DOMAIN,
            SERVICE_DELETE_ITEM,
        )

    #
    # Remove runtime services.
    #
    if DOMAIN in hass.data:
        hass.data[DOMAIN].pop(
            entry.entry_id,
            None,
        )

        hass.data[DOMAIN].pop(
            PLANNING_SERVICE_KEY,
            None,
        )

        if not hass.data[DOMAIN]:
            hass.data.pop(
                DOMAIN
            )

    return True
