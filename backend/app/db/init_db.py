from pathlib import Path
from .connection import get_pool

async def init_database():
    """Initialize database schema"""
    pool = await get_pool()
    schema_path = Path(__file__).parent / "schema.sql"
    schema_sql = schema_path.read_text()

    async with pool.acquire() as conn:
        await conn.execute(schema_sql)
        print("✓ Database schema initialized")

async def clear_database():
    """Clear all data from tables"""
    pool = await get_pool()
    tables = [
        "forecast_solar",
        "forecast_green_windows",
        "salt_state",
        "dispatch_plan",
        "algae_telemetry",
        "carbon_ledger"
    ]

    async with pool.acquire() as conn:
        for table in tables:
            await conn.execute(f"TRUNCATE TABLE {table} CASCADE")
        print("✓ Database cleared")
