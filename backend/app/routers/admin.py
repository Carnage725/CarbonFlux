from fastapi import APIRouter, Query
from ..db.seeders import seed_all_data
from .. import cache

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/seed")
async def seed_database(reset: bool = Query(False, description="Clear all data before seeding")):
    """Seed database with generated time-series data"""
    await seed_all_data(reset=reset)
    cache.clear()
    return {
        "status": "success",
        "message": f"Database seeded successfully (reset={reset})",
        "data_ranges": {
            "history": "30 days",
            "forecast": "72 hours"
        }
    }

@router.post("/scenario")
async def switch_scenario(type: str = Query(..., description="Scenario type: cloudy, heatwave, or maintenance")):
    """Switch to a different scenario by reseeding with scenario-specific parameters"""
    valid_scenarios = ["cloudy", "heatwave", "maintenance", "clear"]

    if type not in valid_scenarios:
        return {
            "status": "error",
            "message": f"Invalid scenario. Must be one of: {', '.join(valid_scenarios)}"
        }

    # Clear cache before reseeding
    cache.clear()

    # Reseed with scenario parameters
    await seed_all_data(reset=True, scenario=type)

    return {
        "status": "success",
        "scenario": type,
        "message": f"Switched to '{type}' scenario and reseeded all data",
        "description": _get_scenario_description(type)
    }

def _get_scenario_description(scenario: str) -> str:
    """Get human-readable scenario description"""
    descriptions = {
        "clear": "Normal operating conditions with typical solar output",
        "cloudy": "Reduced solar output (50-70% of normal) with heavy cloud cover",
        "heatwave": "Increased ambient temperatures causing 50% higher heat loss in storage",
        "maintenance": "Reduced bioreactor capacity (60% of normal) due to maintenance operations"
    }
    return descriptions.get(scenario, "Unknown scenario")
