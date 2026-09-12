"""Repository interface for HomePrep."""

from abc import ABC, abstractmethod
from typing import Any


class HomePrepRepository(ABC):
    """Abstract repository for HomePrep data."""

    @abstractmethod
    async def async_load(self) -> None:
        """Load repository data."""

    @property
    @abstractmethod
    def items(self) -> list[dict[str, Any]]:
        """Return all HomePrep items."""

    @abstractmethod
    def get_item(
        self,
        item_id: str,
    ) -> dict[str, Any] | None:
        """Return an item by ID."""

    @abstractmethod
    async def async_add_item(
        self,
        item: dict[str, Any],
    ) -> None:
        """Add an item."""

    @abstractmethod
    async def async_update_item(
        self,
        item_id: str,
        updates: dict[str, Any],
    ) -> bool:
        """Update an item."""

    @abstractmethod
    async def async_delete_item(
        self,
        item_id: str,
    ) -> bool:
        """Delete an item."""
