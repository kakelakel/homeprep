"""Sensors for HomePrep."""

from datetime import date, timedelta

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, SIGNAL_ITEMS_UPDATED
from .store import HomePrepStore


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up HomePrep sensors."""

    store: HomePrepStore = hass.data[DOMAIN][entry.entry_id]

    async_add_entities(
        [
            HomePrepItemsSensor(store, entry),
            HomePrepExpiredSensor(store, entry),
            HomePrepExpiringSoonSensor(store, entry),
            HomePrepDueForCheckSensor(store, entry),
            HomePrepStatusSensor(store, entry),
        ]
    )


class HomePrepSensor(SensorEntity):
    """Base class for HomePrep sensors."""

    def __init__(
        self,
        store: HomePrepStore,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        self._store = store
        self._entry = entry

    async def async_added_to_hass(self) -> None:
        """Subscribe to HomePrep storage updates."""

        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                SIGNAL_ITEMS_UPDATED,
                self._handle_store_update,
            )
        )

    @callback
    def _handle_store_update(self) -> None:
        """Handle a HomePrep storage update."""
        self.async_write_ha_state()


def get_expired_items(store: HomePrepStore) -> list[dict]:
    """Return expired HomePrep items."""

    today = date.today()
    expired_items = []

    for item in store.items:
        expires_at = item.get("expires_at")

        if not expires_at:
            continue

        try:
            expiry_date = date.fromisoformat(expires_at)
        except ValueError:
            continue

        if expiry_date < today:
            expired_items.append(
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "category": item.get("category"),
                    "expires_at": expires_at,
                    "days_overdue": (today - expiry_date).days,
                }
            )

    return expired_items


def get_expiring_items(store: HomePrepStore) -> list[dict]:
    """Return items expiring within 30 days."""

    today = date.today()
    limit = today + timedelta(days=30)

    expiring_items = []

    for item in store.items:
        expires_at = item.get("expires_at")

        if not expires_at:
            continue

        try:
            expiry_date = date.fromisoformat(expires_at)
        except ValueError:
            continue

        if today <= expiry_date <= limit:
            expiring_items.append(
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "category": item.get("category"),
                    "expires_at": expires_at,
                    "days_remaining": (expiry_date - today).days,
                }
            )

    return expiring_items


def get_due_items(store: HomePrepStore) -> list[dict]:
    """Return items due for check."""

    today = date.today()
    due_items = []

    for item in store.items:
        next_check_at = item.get("next_check_at")

        if not next_check_at:
            continue

        try:
            check_date = date.fromisoformat(next_check_at)
        except ValueError:
            continue

        if check_date <= today:
            due_items.append(
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "category": item.get("category"),
                    "next_check_at": next_check_at,
                    "days_overdue": (today - check_date).days,
                }
            )

    return due_items


class HomePrepItemsSensor(HomePrepSensor):
    """Sensor showing total number of HomePrep items."""

    _attr_name = "HomePrep Items"
    _attr_icon = "mdi:package-variant"

    def __init__(
        self,
        store: HomePrepStore,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(store, entry)
        self._attr_unique_id = f"{entry.entry_id}_items"

    @property
    def native_value(self) -> int:
        """Return total number of items."""
        return len(self._store.items)

    @property
    def extra_state_attributes(self) -> dict:
        """Return item type statistics."""

        consumables = sum(
            1
            for item in self._store.items
            if item.get("item_type") == "consumable"
        )

        equipment = sum(
            1
            for item in self._store.items
            if item.get("item_type") == "equipment"
        )

        return {
            "consumables": consumables,
            "equipment": equipment,
        }


class HomePrepExpiredSensor(HomePrepSensor):
    """Sensor showing expired HomePrep items."""

    _attr_name = "HomePrep Expired"
    _attr_icon = "mdi:calendar-remove"

    def __init__(
        self,
        store: HomePrepStore,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(store, entry)
        self._attr_unique_id = f"{entry.entry_id}_expired"

    @property
    def native_value(self) -> int:
        """Return number of expired items."""
        return len(get_expired_items(self._store))

    @property
    def extra_state_attributes(self) -> dict:
        """Return expired item details."""
        return {
            "items": get_expired_items(self._store),
        }


class HomePrepExpiringSoonSensor(HomePrepSensor):
    """Sensor showing items expiring soon."""

    _attr_name = "HomePrep Expiring Soon"
    _attr_icon = "mdi:calendar-alert"

    def __init__(
        self,
        store: HomePrepStore,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(store, entry)
        self._attr_unique_id = f"{entry.entry_id}_expiring_soon"

    @property
    def native_value(self) -> int:
        """Return number of items expiring within 30 days."""
        return len(get_expiring_items(self._store))

    @property
    def extra_state_attributes(self) -> dict:
        """Return details about expiring items."""
        return {
            "items": get_expiring_items(self._store),
        }


class HomePrepDueForCheckSensor(HomePrepSensor):
    """Sensor showing items due for check."""

    _attr_name = "HomePrep Due For Check"
    _attr_icon = "mdi:clipboard-alert"

    def __init__(
        self,
        store: HomePrepStore,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(store, entry)
        self._attr_unique_id = f"{entry.entry_id}_due_for_check"

    @property
    def native_value(self) -> int:
        """Return number of items due for check."""
        return len(get_due_items(self._store))

    @property
    def extra_state_attributes(self) -> dict:
        """Return details about items due for check."""
        return {
            "items": get_due_items(self._store),
        }


class HomePrepStatusSensor(HomePrepSensor):
    """Sensor showing overall HomePrep status."""

    _attr_name = "HomePrep Status"

    def __init__(
        self,
        store: HomePrepStore,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(store, entry)
        self._attr_unique_id = f"{entry.entry_id}_status"

    @property
    def native_value(self) -> str:
        """Return overall HomePrep status."""

        expired = get_expired_items(self._store)
        expiring = get_expiring_items(self._store)
        due = get_due_items(self._store)

        if expired or due:
            return "critical"

        if expiring:
            return "attention"

        return "ok"

    @property
    def icon(self) -> str:
        """Return icon based on current status."""

        if self.native_value == "critical":
            return "mdi:alert-circle"

        if self.native_value == "attention":
            return "mdi:alert"

        return "mdi:check-circle"

    @property
    def extra_state_attributes(self) -> dict:
        """Return complete HomePrep attention summary."""

        expired = get_expired_items(self._store)
        expiring = get_expiring_items(self._store)
        due = get_due_items(self._store)

        return {
            "expired": len(expired),
            "expiring_soon": len(expiring),
            "due_for_check": len(due),
            "expired_items": expired,
            "expiring_soon_items": expiring,
            "due_for_check_items": due,
        }
