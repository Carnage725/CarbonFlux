"""Background tasks for CarbonFlux"""
import asyncio
from .db.connection import get_pool

_refresh_task = None

async def refresh_materialized_views():
    """Background task to refresh materialized views every 60 seconds"""
    while True:
        try:
            await asyncio.sleep(60)
            pool = await get_pool()

            async with pool.acquire() as conn:
                # Refresh hourly rollups
                await conn.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hourly_rollups")
                # Refresh daily ledger
                await conn.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_ledger")

            print("✓ Materialized views refreshed")

        except asyncio.CancelledError:
            print("Background task cancelled")
            break
        except Exception as e:
            print(f"Error refreshing materialized views: {e}")
            await asyncio.sleep(5)

async def start_background_tasks():
    """Start all background tasks"""
    global _refresh_task
    _refresh_task = asyncio.create_task(refresh_materialized_views())
    print("✓ Background tasks started")

async def stop_background_tasks():
    """Stop all background tasks"""
    global _refresh_task
    if _refresh_task:
        _refresh_task.cancel()
        try:
            await _refresh_task
        except asyncio.CancelledError:
            pass
    print("✓ Background tasks stopped")
