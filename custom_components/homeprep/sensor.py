"""Sensor platform for HomePrep."""

from datetime import date, timedelta
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import DOMAIN, SIGNAL_ITEMS_UPDATED
from .core.service import HomePrepService


EXPIRING_SOON_DAYS = 30


def parse_date(value: str | None) -> date | None:
    """Parse an ISO date string."""

    if not value:
        return None

    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def get_expired_items(
    items: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Return expired HomePrep items."""

    today = dt_util.now().date()
    result: list[dict[str, Any]] = []

    for item in items:
        expires_at = parse_date(
            item.get("expires_at")
        )

        if expires_at is None:
            continue

        if expires_at < today:
            result.append(
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "category": item.get("category"),
                    "expires_at": item.get(
                        "expires_at"
                    ),
                    "days_overdue": (
                        today - expires_at
                    ).days,
                }
            )

    return result


def get_expiring_items(
    items: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Return HomePrep items expiring soon."""

    today = dt_util.now().date()

    limit = today + timedelta(
        days=EXPIRING_SOON_DAYS
    )

    result: list[dict[str, Any]] = []

    for item in items:
        expires_at = parse_date(
            item.get("expires_at")
        )

        if expires_at is None:
            continue

        if today <= expires_at <= limit:
            result.append(
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "category": item.get("category"),
                    "expires_at": item.get(
                        "expires_at"
                    ),
                    "days_remaining": (
                        expires_at - today
                    ).days,
                }
            )

    return result


def get_due_items(
    items: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Return HomePrep items due for inspection."""

    today = dt_util.now().date()
    result: list[dict[str, Any]] = []

    for item in items:
        next_check_at = parse_date(
            item.get("next_check_at")
        )

        if next_check_at is None:
            continue

        if next_check_at <= today:
            result.append(
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "category": item.get("category"),
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

    return result


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up HomePrep sensors."""

    service: HomePrepService = (
        hass.data[DOMAIN][entry.entry_id]
    )

    async_add_entities(
        [
            HomePrepItemsSensor(
                service,
                entry,
            ),
            HomePrepExpiredSensor(
                service,
                entry,
            ),
            HomePrepExpiringSoonSensor(
                service,
                entry,
            ),
            HomePrepDueForCheckSensor(
                service,
                entry,
            ),
            HomePrepStatusSensor(
                service,
                entry,
            ),
        ]
    )


class HomePrepBaseSensor(SensorEntity):
    """Base class for HomePrep sensors."""

    _attr_has_entity_name = True

    def __init__(
        self,
        service: HomePrepService,
        entry: ConfigEntry,
    ) -> None:
        """Initialize a HomePrep sensor."""

        self._service = service

        self._remove_dispatcher = None

        self._attr_device_info = DeviceInfo(
            identifiers={
                (
                    DOMAIN,
                    entry.entry_id,
                )
            },
            name="HomePrep",
            manufacturer="HomePrep",
            model="HomePrep",
            entry_type=DeviceEntryType.SERVICE,
        )

    @property
    def items(self) -> list[dict[str, Any]]:
        """Return all HomePrep items."""

        return self._service.items

    async def async_added_to_hass(
        self,
    ) -> None:
        """Register HomePrep dispatcher listener."""

        self._remove_dispatcher = (
            async_dispatcher_connect(
                self.hass,
                SIGNAL_ITEMS_UPDATED,
                self._handle_items_updated,
            )
        )

    async def async_will_remove_from_hass(
        self,
    ) -> None:
        """Remove HomePrep dispatcher listener."""

        if self._remove_dispatcher:
            self._remove_dispatcher()
            self._remove_dispatcher = None

    def _handle_items_updated(
        self,
    ) -> None:
        """Handle HomePrep item updates."""

        self.async_write_ha_state()


class HomePrepItemsSensor(
    HomePrepBaseSensor
):
    """Total number of HomePrep items."""

    _attr_name = "Items"
    _attr_unique_id = "homeprep_items"
    _attr_icon = "mdi:package-variant"

    @property
    def native_value(self) -> int:
        """Return total number of items."""

        return len(self.items)

    @property
    def extra_state_attributes(
        self,
    ) -> dict[str, Any]:
        """Return inventory statistics."""

        consumables = sum(
            1
            for item in self.items
            if item.get("item_type")
            == "consumable"
        )

        equipment = sum(
            1
            for item in self.items
            if item.get("item_type")
            == "equipment"
        )

        return {
            "consumables": consumables,
            "equipment": equipment,
        }


class HomePrepExpiredSensor(
    HomePrepBaseSensor
):
    """Expired HomePrep items."""

    _attr_name = "Expired"
    _attr_unique_id = "homeprep_expired"
    _attr_icon = "mdi:calendar-remove"

    @property
    def expired_items(
        self,
    ) -> list[dict[str, Any]]:
        """Return expired items."""

        return get_expired_items(
            self.items
        )

    @property
    def native_value(self) -> int:
        """Return number of expired items."""

        return len(
            self.expired_items
        )

    @property
    def extra_state_attributes(
        self,
    ) -> dict[str, Any]:
        """Return expired item details."""

        return {
            "items": self.expired_items,
        }


class HomePrepExpiringSoonSensor(
    HomePrepBaseSensor
):
    """HomePrep items expiring soon."""

    _attr_name = "Expiring soon"
    _attr_unique_id = (
        "homeprep_expiring_soon"
    )
    _attr_icon = "mdi:calendar-alert"

    @property
    def expiring_items(
        self,
    ) -> list[dict[str, Any]]:
        """Return items expiring soon."""

        return get_expiring_items(
            self.items
        )

    @property
    def native_value(self) -> int:
        """Return number of items expiring soon."""

        return len(
            self.expiring_items
        )

    @property
    def extra_state_attributes(
        self,
    ) -> dict[str, Any]:
        """Return item details."""

        return {
            "items": self.expiring_items,
        }


class HomePrepDueForCheckSensor(
    HomePrepBaseSensor
):
    """HomePrep items due for inspection."""

    _attr_name = "Due for check"
    _attr_unique_id = (
        "homeprep_due_for_check"
    )
    _attr_icon = "mdi:clipboard-alert"

    @property
    def due_items(
        self,
    ) -> list[dict[str, Any]]:
        """Return items due for inspection."""

        return get_due_items(
            self.items
        )

    @property
    def native_value(self) -> int:
        """Return number of items due."""

        return len(
            self.due_items
        )

    @property
    def extra_state_attributes(
        self,
    ) -> dict[str, Any]:
        """Return due item details."""

        return {
            "items": self.due_items,
        }


class HomePrepStatusSensor(
    HomePrepBaseSensor
):
    """Overall HomePrep preparedness status."""

    _attr_name = "Status"
    _attr_unique_id = "homeprep_status"

    @property
    def status_data(
        self,
    ) -> dict[str, Any]:
        """Calculate HomePrep status."""

        expired = get_expired_items(
            self.items
        )

        expiring = get_expiring_items(
            self.items
        )

        due = get_due_items(
            self.items
        )

        if expired or due:
            state = "critical"
            icon = "mdi:alert-circle"

        elif expiring:
            state = "attention"
            icon = "mdi:alert"

        else:
            state = "ok"
            icon = "mdi:check-circle"

        return {
            "state": state,
            "icon": icon,
            "expired": expired,
            "expiring": expiring,
            "due": due,
        }

    @property
    def native_value(self) -> str:
        """Return overall HomePrep status."""

        return self.status_data[
            "state"
        ]

    @property
    def icon(self) -> str:
        """Return status icon."""

        return self.status_data[
            "icon"
        ]

    @property
    def extra_state_attributes(
        self,
    ) -> dict[str, Any]:
        """Return HomePrep status details."""

        data = self.status_data

        return {
            "expired": len(
                data["expired"]
            ),
            "expiring_soon": len(
                data["expiring"]
            ),
            "due_for_check": len(
                data["due"]
            ),
            "expired_items":
                data["expired"],
            "expiring_soon_items":
                data["expiring"],
            "due_for_check_items":
                data["due"],
        }
