"""Notification service for HomePrep."""
from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util


STORAGE_VERSION = 1
STORAGE_KEY = "homeprep.notifications"
CHECK_INTERVAL = timedelta(hours=1)

DEFAULT_SETTINGS: dict[str, Any] = {
    "enabled": False,
    "targets": [],
    "events": {
        "inventory_expiring": True,
        "inventory_expired": True,
        "task_reminder": True,
        "task_due": True,
        "task_overdue": True,
    },
    "expiry_warning_days": 30,
}


class HomePrepNotificationService:
    """Evaluate HomePrep dates and deliver HA notifications."""

    def __init__(self, hass: HomeAssistant, inventory_service: Any, task_service: Any) -> None:
        self._hass = hass
        self._inventory_service = inventory_service
        self._task_service = task_service
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._settings: dict[str, Any] = self._normalize_settings(DEFAULT_SETTINGS)
        self._sent: dict[str, str] = {}
        self._unsub_interval = None

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self._settings = self._normalize_settings(data.get("settings", DEFAULT_SETTINGS))
        self._sent = dict(data.get("sent", {}))

    def start(self) -> None:
        if self._unsub_interval is not None:
            return

        async def _scheduled_check(_now) -> None:
            await self.async_check()

        self._unsub_interval = async_track_time_interval(self._hass, _scheduled_check, CHECK_INTERVAL)

    def stop(self) -> None:
        if self._unsub_interval is not None:
            self._unsub_interval()
            self._unsub_interval = None

    @property
    def settings(self) -> dict[str, Any]:
        return {
            "enabled": bool(self._settings["enabled"]),
            "targets": list(self._settings["targets"]),
            "events": dict(self._settings["events"]),
            "expiry_warning_days": int(self._settings["expiry_warning_days"]),
        }

    def available_targets(self) -> list[dict[str, str]]:
        services = self._hass.services.async_services().get("notify", {})
        result: list[dict[str, str]] = []

        for service_name in sorted(services):
            if service_name in {"send_message", "persistent_notification"}:
                continue

            label = service_name.replace("_", " ").title()
            if service_name.startswith("mobile_app_"):
                device = service_name.removeprefix("mobile_app_").replace("_", " ").title()
                label = f"Mobile app · {device}"

            result.append({"id": service_name, "label": label})

        return result

    async def async_update_settings(self, settings: dict[str, Any]) -> dict[str, Any]:
        self._settings = self._normalize_settings(settings)
        await self._save()
        return self.settings

    async def async_send_test(self) -> dict[str, Any]:
        targets = self._valid_targets(self._settings.get("targets", []))
        sent = 0
        for target in targets:
            if await self._async_send(target, "HomePrep test notification", "Notifications are configured correctly."):
                sent += 1
        return {"requested": len(targets), "sent": sent}

    async def async_check(self) -> None:
        if not self._settings.get("enabled"):
            return

        targets = self._valid_targets(self._settings.get("targets", []))
        if not targets:
            return

        today = dt_util.now().date()
        events = self._settings["events"]
        expiry_warning_days = int(self._settings["expiry_warning_days"])
        pending: list[tuple[str, str, str]] = []

        for item in self._inventory_service.items:
            expiry_raw = item.get("expires_at")
            if not expiry_raw:
                continue
            try:
                expiry = date.fromisoformat(expiry_raw)
            except ValueError:
                continue

            days = (expiry - today).days
            item_id = item.get("id", "unknown")
            item_name = item.get("name", "Inventory item")

            if days < 0 and events.get("inventory_expired"):
                pending.append((f"inventory_expired:{item_id}:{expiry_raw}", "HomePrep · Inventory expired", f"{item_name} expired on {expiry_raw}."))
            elif 0 <= days <= expiry_warning_days and events.get("inventory_expiring"):
                when = "today" if days == 0 else f"in {days} day{'s' if days != 1 else ''}"
                pending.append((f"inventory_expiring:{item_id}:{expiry_raw}", "HomePrep · Inventory expiring soon", f"{item_name} expires {when} ({expiry_raw})."))

        for task in self._task_service.tasks:
            if not task.get("enabled", True):
                continue
            due_raw = task.get("next_due_at")
            if not due_raw:
                continue
            try:
                due = date.fromisoformat(due_raw)
            except ValueError:
                continue

            days = (due - today).days
            task_id = task.get("id", "unknown")
            task_name = task.get("name", "HomePrep task")
            reminder_days = max(0, int(task.get("reminder_before_days", 0) or 0))

            if days < 0 and events.get("task_overdue"):
                pending.append((f"task_overdue:{task_id}:{due_raw}", "HomePrep · Task overdue", f"{task_name} was due on {due_raw}."))
            elif days == 0 and events.get("task_due"):
                pending.append((f"task_due:{task_id}:{due_raw}", "HomePrep · Task due today", f"{task_name} is due today."))
            elif 0 < days <= reminder_days and events.get("task_reminder"):
                pending.append((f"task_reminder:{task_id}:{due_raw}", "HomePrep · Task due soon", f"{task_name} is due in {days} day{'s' if days != 1 else ''} ({due_raw})."))

        changed = False
        for event_key, title, message in pending:
            if event_key in self._sent:
                continue
            delivered = False
            for target in targets:
                delivered = await self._async_send(target, title, message) or delivered
            if delivered:
                self._sent[event_key] = today.isoformat()
                changed = True

        if changed:
            if len(self._sent) > 1000:
                self._sent = dict(list(self._sent.items())[-1000:])
            await self._save()

    async def _async_send(self, target: str, title: str, message: str) -> bool:
        if not self._hass.services.has_service("notify", target):
            return False
        try:
            await self._hass.services.async_call("notify", target, {"title": title, "message": message}, blocking=False)
            return True
        except Exception:
            return False

    def _valid_targets(self, targets: list[str]) -> list[str]:
        available = {x["id"] for x in self.available_targets()}
        return [target for target in targets if target in available]

    def _normalize_settings(self, settings: dict[str, Any]) -> dict[str, Any]:
        raw_events = settings.get("events", {}) if isinstance(settings, dict) else {}
        events = {key: bool(raw_events.get(key, default)) for key, default in DEFAULT_SETTINGS["events"].items()}
        raw_targets = settings.get("targets", []) if isinstance(settings, dict) else []
        targets = [str(x) for x in raw_targets if x]
        try:
            warning_days = int(settings.get("expiry_warning_days", 30))
        except (TypeError, ValueError):
            warning_days = 30
        return {
            "enabled": bool(settings.get("enabled", False)) if isinstance(settings, dict) else False,
            "targets": list(dict.fromkeys(targets)),
            "events": events,
            "expiry_warning_days": min(365, max(1, warning_days)),
        }

    async def _save(self) -> None:
        await self._store.async_save({"settings": self._settings, "sent": self._sent})
