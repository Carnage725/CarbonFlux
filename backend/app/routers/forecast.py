from fastapi import APIRouter, Response
from datetime import datetime, timedelta, timezone
from typing import List
from ..db.connection import get_pool
from ..models.schemas import SolarForecastResponse, SolarForecastPoint, GreenWindowsResponse, GreenWindow
from .. import cache

router = APIRouter(prefix="/forecast", tags=["forecast"])

@router.get("/solar", response_model=SolarForecastResponse)
async def get_solar_forecast(response: Response):
    """Get solar forecast with 5-15min nowcast and 24-72h horizon"""
    # Check cache
    cache_key = "forecast_solar"
    cached = cache.get(cache_key)
    if cached:
        response.headers["X-Cache"] = "HIT"
        return cached

    pool = await get_pool()
    now = datetime.now(timezone.utc)

    # Nowcast: next 15 minutes
    nowcast_end = now + timedelta(minutes=15)
    # Forecast: next 72 hours
    forecast_end = now + timedelta(hours=72)

    async with pool.acquire() as conn:
        # Nowcast
        nowcast_rows = await conn.fetch(
            "SELECT time, value_kw, p5, p50, p95 FROM forecast_solar WHERE time >= $1 AND time <= $2 ORDER BY time",
            now, nowcast_end
        )

        # Full forecast
        forecast_rows = await conn.fetch(
            "SELECT time, value_kw, p5, p50, p95 FROM forecast_solar WHERE time >= $1 AND time <= $2 ORDER BY time",
            now, forecast_end
        )

    nowcast = [SolarForecastPoint(**dict(row)) for row in nowcast_rows]
    forecast = [SolarForecastPoint(**dict(row)) for row in forecast_rows]

    result = SolarForecastResponse(
        nowcast=nowcast,
        forecast=forecast,
        generated_at=now
    )

    # Cache the result
    cache.set(cache_key, result)
    response.headers["X-Cache"] = "MISS"

    return result

@router.get("/green-windows", response_model=GreenWindowsResponse)
async def get_green_windows(response: Response):
    """Get low-carbon energy windows for next 72 hours"""
    # Check cache
    cache_key = "forecast_green_windows"
    cached = cache.get(cache_key)
    if cached:
        response.headers["X-Cache"] = "HIT"
        return cached

    pool = await get_pool()
    now = datetime.now(timezone.utc)
    end_time = now + timedelta(hours=72)

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """SELECT id, start_time, end_time, carbon_gco2_kwh,
               EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0 as duration_hours
               FROM forecast_green_windows
               WHERE start_time >= $1 AND end_time <= $2
               ORDER BY carbon_gco2_kwh ASC""",
            now, end_time
        )

    windows = [GreenWindow(**dict(row)) for row in rows]

    result = GreenWindowsResponse(
        windows=windows,
        count=len(windows)
    )

    # Cache the result
    cache.set(cache_key, result)
    response.headers["X-Cache"] = "MISS"

    return result
