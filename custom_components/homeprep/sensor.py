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
            HomePrepExpiringSoonSensor(store, entry),
            HomePrepDueForCheckSensor(store, entry),
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

        today = date.today()
        limit = today + timedelta(days=30)

        count = 0

        for item in self._store.items:
            expires_at = item.get("expires_at")

            if not expires_at:
                continue

            expiry_date = date.fromisoformat(expires_at)

            if today <= expiry_date <= limit:
                count += 1

        return count


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

        today = date.today()

        count = 0

        for item in self._store.items:
            next_check_at = item.get("next_check_at")

            if not next_check_at:
                continue

            check_date = date.fromisoformat(next_check_at)

            if check_date <= today:
                count += 1

        return count
