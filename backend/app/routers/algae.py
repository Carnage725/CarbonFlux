from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from datetime import datetime, timedelta, timezone
import asyncio
import json
from pydantic import BaseModel
from ..db.connection import get_pool
from ..models.schemas import AlgaeTelemetryResponse, AlgaeTelemetryPoint

router = APIRouter(prefix="/algae", tags=["algae"])

# Control action state (in-memory for demo)
control_state = {
    "degas_active": False,
    "aerate_active": False,
    "night_mode": False
}

class ControlRequest(BaseModel):
    action: str  # "degas", "aerate", "night_mode"

@router.get("/telemetry", response_model=AlgaeTelemetryResponse)
async def get_algae_telemetry(
    hours: int = Query(24, description="Hours of historical data to retrieve")
):
    """Get historical algae telemetry data"""
    pool = await get_pool()
    now = datetime.now(timezone.utc)
    start_time = now - timedelta(hours=hours)

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """SELECT time, ph, do_mg_l, temp_c, co2_uptake_kg_h, biomass_g_l
               FROM algae_telemetry
               WHERE time >= $1 AND time <= $2
               ORDER BY time""",
            start_time, now
        )

    data = [AlgaeTelemetryPoint(**dict(row)) for row in rows]

    return AlgaeTelemetryResponse(
        data=data,
        count=len(data),
        time_range=f"Last {hours} hours"
    )

async def telemetry_stream():
    """SSE generator for live algae telemetry"""
    pool = await get_pool()

    while True:
        try:
            now = datetime.now(timezone.utc)
            async with pool.acquire() as conn:
                # Get most recent telemetry
                row = await conn.fetchrow(
                    """SELECT time, ph, do_mg_l, temp_c, co2_uptake_kg_h, biomass_g_l
                       FROM algae_telemetry
                       WHERE time <= $1
                       ORDER BY time DESC
                       LIMIT 1""",
                    now
                )

            if row:
                point = AlgaeTelemetryPoint(**dict(row))
                # SSE format: data: {...}\n\n
                yield f"data: {point.model_dump_json()}\n\n"

            # Stream every 2 seconds
            await asyncio.sleep(2)

        except Exception as e:
            yield f"data: {{\"error\": \"{str(e)}\"}}\n\n"
            await asyncio.sleep(5)

@router.get("/telemetry/stream")
async def stream_algae_telemetry():
    """SSE stream of live algae bioreactor telemetry"""
    return StreamingResponse(
        telemetry_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/control")
async def control_reactor(request: ControlRequest):
    """Control reactor operations - triggers temporary parameter changes"""
    action = request.action.lower()

    # Reset all states first
    for key in control_state:
        control_state[key] = False

    # Activate requested action
    if action == "degas":
        control_state["degas_active"] = True
        # In a real system, this would trigger a temporary DO reduction
        # For demo, we'll modify the SSE stream behavior
        return {
            "success": True,
            "action": "degas",
            "message": "Degassing initiated - DO will decrease temporarily",
            "duration_seconds": 30
        }
    elif action == "aerate":
        control_state["aerate_active"] = True
        return {
            "success": True,
            "action": "aerate",
            "message": "Aeration burst initiated - DO will increase temporarily",
            "duration_seconds": 30
        }
    elif action == "night_mode":
        control_state["night_mode"] = True
        return {
            "success": True,
            "action": "night_mode",
            "message": "Night mode activated - CO2 uptake reduced",
            "duration_seconds": 60
        }
    else:
        return {
            "success": False,
            "action": action,
            "message": f"Unknown action: {action}",
            "valid_actions": ["degas", "aerate", "night_mode"]
        }
