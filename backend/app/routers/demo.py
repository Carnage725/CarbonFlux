from fastapi import APIRouter, Query
from datetime import datetime, timedelta
import random
import math

router = APIRouter(prefix="/demo", tags=["demo"])

def generate_solar_data(points: int, hours: int = 72) -> list:
    """Generate synthetic solar forecast data"""
    data = []
    base_time = datetime.now().replace(minute=0, second=0, microsecond=0)

    for i in range(points):
        # Time progression over the specified hours
        time_offset = (i / (points - 1)) * hours * 3600  # seconds
        time = base_time + timedelta(seconds=time_offset)

        # Solar pattern: peak at noon, zero at night
        hour_of_day = time.hour + time.minute / 60
        solar_angle = (hour_of_day - 12) * 15  # degrees from solar noon
        base_power = max(0, math.cos(math.radians(solar_angle)))

        # Add some cloud variation and noise
        cloud_factor = 0.7 + 0.3 * math.sin(i * 0.01)  # Cloud patterns
        noise = random.gauss(0, 0.1)  # Random noise
        value = max(0, base_power * cloud_factor + noise)

        # Scale to realistic kW values (0-1000 kW system)
        value_kw = value * 800

        data.append({
            "time": time.isoformat(),
            "value_kw": round(value_kw, 2),
            "p5": round(value_kw * (0.8 + random.random() * 0.2), 2),
            "p50": round(value_kw, 2),
            "p95": round(value_kw * (1.0 + random.random() * 0.3), 2)
        })

    return data

def generate_temp_data(points: int, hours: int = 24) -> list:
    """Generate synthetic temperature time-series data"""
    data = []
    base_time = datetime.now().replace(minute=0, second=0, microsecond=0)

    for i in range(points):
        time_offset = (i / (points - 1)) * hours * 3600
        time = base_time + timedelta(seconds=time_offset)

        hour_of_day = time.hour + time.minute / 60

        # Temperature pattern: cooler at night, warmer during day
        base_temp = 20 + 8 * math.sin(math.radians((hour_of_day - 6) * 15))  # Peak at 3 PM

        # Add daily variation and noise
        daily_variation = 2 * math.sin(i * 0.05)
        noise = random.gauss(0, 0.5)
        temp_c = base_temp + daily_variation + noise

        data.append({
            "time": time.isoformat(),
            "temp_c": round(temp_c, 2)
        })

    return data

def generate_ph_data(points: int, hours: int = 24) -> list:
    """Generate synthetic pH time-series data"""
    data = []
    base_time = datetime.now().replace(minute=0, second=0, microsecond=0)

    for i in range(points):
        time_offset = (i / (points - 1)) * hours * 3600
        time = base_time + timedelta(seconds=time_offset)

        # pH typically stable around 7.2 with small variations
        base_ph = 7.2
        variation = 0.1 * math.sin(i * 0.02)  # Slow pH drift
        noise = random.gauss(0, 0.05)
        ph = base_ph + variation + noise

        # Occasional pH events (simulating adjustments)
        if random.random() < 0.001:  # 0.1% chance of pH adjustment event
            ph += random.choice([-0.3, 0.3])

        data.append({
            "time": time.isoformat(),
            "ph": round(ph, 2)
        })

    return data

@router.get("/big")
async def get_big_dataset(
    points: int = Query(100000, description="Number of data points to generate (50k-200k recommended)"),
    type: str = Query("solar", description="Data type: solar, temp, ph"),
    hours: int = Query(72, description="Time span in hours")
):
    """
    Generate large synthetic datasets for chart stress testing.
    Returns 50k-200k data points for performance testing.
    """
    if points < 1000 or points > 500000:
        return {
            "error": "Points must be between 1,000 and 500,000",
            "points_requested": points
        }

    if type not in ["solar", "temp", "ph"]:
        return {
            "error": "Type must be one of: solar, temp, ph",
            "type_requested": type
        }

    # Generate the requested data type
    if type == "solar":
        data = generate_solar_data(points, hours)
    elif type == "temp":
        data = generate_temp_data(points, hours)
    elif type == "ph":
        data = generate_ph_data(points, hours)
    else:
        return {"error": "Invalid data type"}

    return {
        "type": type,
        "points": len(data),
        "hours": hours,
        "data": data,
        "description": f"Synthetic {type} data for chart stress testing"
    }