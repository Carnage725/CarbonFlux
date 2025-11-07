from fastapi import APIRouter
from datetime import datetime, timedelta, timezone
from ..db.connection import get_pool
from ..models.schemas import (
    SaltStateResponse, SaltStatePoint,
    SaltSimulateRequest, SaltSimulateResponse
)

router = APIRouter(prefix="/salt", tags=["salt"])

@router.get("/state", response_model=SaltStateResponse)
async def get_salt_state():
    """Get current salt storage state and last 24h history"""
    pool = await get_pool()
    now = datetime.now(timezone.utc)
    history_start = now - timedelta(hours=24)

    async with pool.acquire() as conn:
        # Current state (most recent)
        current_row = await conn.fetchrow(
            "SELECT time, soc_mwh, temp_hot_c, temp_cold_c, heat_loss_kw FROM salt_state WHERE time <= $1 ORDER BY time DESC LIMIT 1",
            now
        )

        # Last 24h history
        history_rows = await conn.fetch(
            "SELECT time, soc_mwh, temp_hot_c, temp_cold_c, heat_loss_kw FROM salt_state WHERE time >= $1 AND time <= $2 ORDER BY time",
            history_start, now
        )

    current = SaltStatePoint(**dict(current_row))
    history = [SaltStatePoint(**dict(row)) for row in history_rows]

    return SaltStateResponse(
        current=current,
        history_24h=history,
        capacity_mwh=10.0,
        soc_percent=(current.soc_mwh / 10.0) * 100
    )

@router.post("/simulate", response_model=SaltSimulateResponse)
async def simulate_salt_storage(request: SaltSimulateRequest):
    """Simulate salt storage with given charge/discharge schedule"""
    soc = request.initial_soc_mwh
    capacity = 10.0  # MWh
    results = []
    total_heat_loss = 0.0
    total_charge = 0.0
    total_discharge = 0.0

    for point in request.schedule:
        # Convert kW to MWh per minute
        charge_mwh = (point.charge_kw / 1000.0) / 60.0
        discharge_mwh = (point.discharge_kw / 1000.0) / 60.0

        # Update SOC
        soc += charge_mwh - discharge_mwh
        total_charge += charge_mwh
        total_discharge += discharge_mwh

        # Check bounds
        if soc < 0 or soc > capacity:
            return SaltSimulateResponse(
                feasible=False,
                schedule=[],
                final_soc_mwh=soc,
                total_heat_loss_kwh=0,
                round_trip_efficiency=0
            )

        # Calculate temps and heat loss
        temp_hot = 565 + (soc / capacity) * 20
        temp_cold = 290 + (soc / capacity) * 5
        heat_loss_kw = 10 + (soc / capacity) * 5
        total_heat_loss += heat_loss_kw / 60.0  # kWh

        results.append(SaltStatePoint(
            time=point.time,
            soc_mwh=soc,
            temp_hot_c=temp_hot,
            temp_cold_c=temp_cold,
            heat_loss_kw=heat_loss_kw
        ))

    # Round-trip efficiency
    efficiency = (total_discharge / total_charge * 100) if total_charge > 0 else 0

    return SaltSimulateResponse(
        feasible=True,
        schedule=results,
        final_soc_mwh=soc,
        total_heat_loss_kwh=total_heat_loss,
        round_trip_efficiency=efficiency
    )
