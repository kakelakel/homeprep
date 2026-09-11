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

    def _get_expiring_items(self) -> list[dict]:
        """Return items expiring within 30 days."""

        today = date.today()
        limit = today + timedelta(days=30)

        expiring_items = []

        for item in self._store.items:
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
                        "expires_at": expires_at,
                        "days_remaining": (expiry_date - today).days,
                    }
                )

        return expiring_items

    @property
    def native_value(self) -> int:
        """Return number of items expiring within 30 days."""
        return len(self._get_expiring_items())

    @property
    def extra_state_attributes(self) -> dict:
        """Return details about expiring items."""
        return {
            "items": self._get_expiring_items(),
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

    def _get_due_items(self) -> list[dict]:
        """Return items due for check."""

        today = date.today()

        due_items = []

        for item in self._store.items:
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
                        "next_check_at": next_check_at,
                        "days_overdue": (today - check_date).days,
                    }
                )

        return due_items

    @property
    def native_value(self) -> int:
        """Return number of items due for check."""
        return len(self._get_due_items())

    @property
    def extra_state_attributes(self) -> dict:
        """Return details about items due for check."""
        return {
            "items": self._get_due_items(),
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

    def _get_counts(self) -> dict[str, int]:
        """Calculate HomePrep status counts."""

        today = date.today()
        expiry_limit = today + timedelta(days=30)

        expired = 0
        expiring_soon = 0
        due_for_check = 0

        for item in self._store.items:
            expires_at = item.get("expires_at")

            if expires_at:
                try:
                    expiry_date = date.fromisoformat(expires_at)
                except ValueError:
                    expiry_date = None

                if expiry_date is not None:
                    if expiry_date < today:
                        expired += 1
                    elif expiry_date <= expiry_limit:
                        expiring_soon += 1

            next_check_at = item.get("next_check_at")

            if next_check_at:
                try:
                    check_date = date.fromisoformat(next_check_at)
                except ValueError:
                    check_date = None

                if check_date is not None and check_date <= today:
                    due_for_check += 1

        return {
            "expired": expired,
            "expiring_soon": expiring_soon,
            "due_for_check": due_for_check,
        }

    @property
    def native_value(self) -> str:
        """Return overall HomePrep status."""

        counts = self._get_counts()

        if counts["expired"] > 0 or counts["due_for_check"] > 0:
            return "critical"

        if counts["expiring_soon"] > 0:
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
        """Return status details."""
        return self._get_counts()
