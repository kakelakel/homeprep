"""Recurring schedule calculations for HomePrep tasks."""

from __future__ import annotations

from calendar import monthrange
from datetime import date, timedelta
from typing import Any


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(value[:10])


def add_months(value: date, months: int) -> date:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, monthrange(year, month)[1])
    return date(year, month, day)


def add_years(value: date, years: int) -> date:
    year = value.year + years
    day = min(value.day, monthrange(year, value.month)[1])
    return date(year, value.month, day)


def calculate_next_due(task: dict[str, Any], *, completed_on: date) -> date:
    base = completed_on

    if task.get("reschedule_mode") == "scheduled":
        scheduled = parse_date(task.get("next_due_at"))
        if scheduled is not None:
            base = scheduled

    recurrence_type = task["recurrence_type"]
    interval = int(task["recurrence_interval"])

    def advance(value: date) -> date:
        if recurrence_type == "days":
            return value + timedelta(days=interval)
        if recurrence_type == "weeks":
            return value + timedelta(weeks=interval)
        if recurrence_type == "months":
            return add_months(value, interval)
        if recurrence_type == "years":
            return add_years(value, interval)
        raise ValueError(f"Unsupported recurrence type: {recurrence_type}")

    next_due = advance(base)

    if task.get("reschedule_mode") == "scheduled":
        while next_due <= completed_on:
            next_due = advance(next_due)

    return next_due


def task_status(task: dict[str, Any], *, today: date | None = None) -> str:
    if not task.get("enabled", True):
        return "disabled"

    due = parse_date(task.get("next_due_at"))
    if due is None:
        return "unscheduled"

    today = today or date.today()
    reminder_days = int(task.get("reminder_before_days", 0))

    if due < today:
        return "overdue"
    if due == today:
        return "due"
    if reminder_days and today >= due - timedelta(days=reminder_days):
        return "upcoming"
    return "ok"
