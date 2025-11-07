from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse, JSONResponse
from datetime import datetime, timezone
import csv
import io
import json
from ..db.connection import get_pool
from ..models.schemas import CarbonLedgerResponse, CarbonLedgerDailyPoint

router = APIRouter(prefix="/carbon", tags=["carbon"])

@router.get("/ledger")
async def get_carbon_ledger(
    export: str = Query(None, description="Export format: csv or json")
):
    """Get carbon ledger daily rollups with optional CSV/JSON export"""
    pool = await get_pool()

    async with pool.acquire() as conn:
        # Get daily rollups from materialized view
        rows = await conn.fetch(
            """SELECT day, total_co2_in_kg, total_co2_fixed_kg, total_co2_net_kg, records
               FROM mv_daily_ledger
               ORDER BY day DESC"""
        )

    daily = [CarbonLedgerDailyPoint(**dict(row)) for row in rows]
    cumulative_net = sum(d.total_co2_net_kg for d in daily)

    # Handle exports
    if export == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["day", "total_co2_in_kg", "total_co2_fixed_kg", "total_co2_net_kg", "records"])

        for d in daily:
            writer.writerow([
                d.day.isoformat(),
                d.total_co2_in_kg,
                d.total_co2_fixed_kg,
                d.total_co2_net_kg,
                d.records
            ])

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=carbon_ledger.csv"}
        )

    elif export == "json":
        data = {
            "daily": [d.model_dump(mode='json') for d in daily],
            "cumulative_net_kg": cumulative_net,
            "total_days": len(daily),
            "exported_at": datetime.now(timezone.utc).isoformat()
        }

        return StreamingResponse(
            iter([json.dumps(data, indent=2)]),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=carbon_ledger.json"}
        )

    # Default: return API response
    return CarbonLedgerResponse(
        daily=daily,
        cumulative_net_kg=cumulative_net,
        total_days=len(daily)
    )
