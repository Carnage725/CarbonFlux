from fastapi import APIRouter
from datetime import datetime, timedelta, timezone
from ..db.connection import get_pool
from ..models.schemas import DispatchPlanResponse, DispatchPlanPoint

router = APIRouter(prefix="/dispatch", tags=["dispatch"])

@router.post("/plan", response_model=DispatchPlanResponse)
async def generate_dispatch_plan():
    """Generate minute-level dispatch plan for next 24 hours"""
    pool = await get_pool()
    now = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    end_time = now + timedelta(hours=24)

    async with pool.acquire() as conn:
        # Get existing dispatch plan
        rows = await conn.fetch(
            "SELECT time, charge_kw, discharge_kw, feasible FROM dispatch_plan WHERE time >= $1 AND time < $2 ORDER BY time",
            now, end_time
        )

    plan = [DispatchPlanPoint(**dict(row)) for row in rows]

    # Calculate totals
    total_charge_kwh = sum(p.charge_kw / 60.0 for p in plan)  # Convert kW to kWh
    total_discharge_kwh = sum(p.discharge_kw / 60.0 for p in plan)

    return DispatchPlanResponse(
        plan=plan,
        total_charge_kwh=total_charge_kwh,
        total_discharge_kwh=total_discharge_kwh,
        duration_hours=24
    )
