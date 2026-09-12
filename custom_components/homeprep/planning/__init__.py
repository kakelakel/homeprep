"""HomePrep planning domain.

The planning package is intentionally platform-independent domain logic.
Home Assistant is only one client of this layer.
"""

from .models import (
    create_household_profile,
    create_target,
    normalize_household_profile,
    normalize_target,
)
from .recommendations import RecommendationCatalog
from .service import HomePrepPlanningService

__all__ = [
    "HomePrepPlanningService",
    "RecommendationCatalog",
    "create_household_profile",
    "create_target",
    "normalize_household_profile",
    "normalize_target",
]
