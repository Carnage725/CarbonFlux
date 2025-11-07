from fastapi import APIRouter, Query
from ..db.seeders import seed_all_data

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/seed")
async def seed_database(reset: bool = Query(False, description="Clear all data before seeding")):
    """Seed database with generated time-series data"""
    await seed_all_data(reset=reset)
    return {
        "status": "success",
        "message": f"Database seeded successfully (reset={reset})",
        "data_ranges": {
            "history": "30 days",
            "forecast": "72 hours"
        }
    }
