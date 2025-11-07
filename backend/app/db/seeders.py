import asyncpg
from datetime import datetime, timedelta, timezone
import numpy as np
from typing import List, Tuple

def generate_solar_forecast(start: datetime, days_history: int, hours_future: int, scenario: str = "clear") -> List[Tuple]:
    """Generate solar forecast with p5/p50/p95 percentiles"""
    total_minutes = (days_history * 24 * 60) + (hours_future * 60)
    times = [start + timedelta(minutes=i) for i in range(-days_history * 24 * 60, hours_future * 60)]

    # Scenario-specific parameters
    if scenario == "cloudy":
        cloud_min, cloud_max = 0.5, 0.7  # Heavy clouds
    elif scenario == "heatwave":
        cloud_min, cloud_max = 0.85, 1.0  # Clear skies, more heat
    else:  # clear or maintenance
        cloud_min, cloud_max = 0.7, 1.0

    data = []
    for t in times:
        hour = t.hour + t.minute / 60.0
        # Clipped sinusoid: solar peak at noon
        base = max(0, np.sin((hour - 6) * np.pi / 12)) * 1000  # 0-1000 kW

        # Add cloud attenuation (scenario-dependent)
        cloud_factor = np.random.uniform(cloud_min, cloud_max)
        value_kw = base * cloud_factor

        # Percentiles with uncertainty
        p5 = value_kw * 0.85
        p50 = value_kw
        p95 = value_kw * 1.15

        data.append((t, value_kw, p5, p50, p95))

    return data

def generate_green_windows(start: datetime, days: int) -> List[Tuple]:
    """Generate low-carbon energy windows"""
    windows = []
    for day in range(days):
        day_start = start + timedelta(days=day)
        # Typically 3 windows per day during solar peaks
        for window_idx in range(3):
            start_hour = 10 + window_idx * 3 + np.random.randint(-1, 2)
            window_start = day_start.replace(hour=start_hour, minute=0, second=0, microsecond=0)
            window_end = window_start + timedelta(hours=2)
            carbon_intensity = np.random.uniform(50, 150)  # gCO2/kWh
            windows.append((window_start, window_end, carbon_intensity))

    return windows

def generate_salt_state(start: datetime, days_history: int, hours_future: int, scenario: str = "clear") -> List[Tuple]:
    """Generate molten-salt storage state with SOC and temps"""
    total_minutes = (days_history * 24 * 60) + (hours_future * 60)
    times = [start + timedelta(minutes=i) for i in range(-days_history * 24 * 60, hours_future * 60)]

    # Scenario-specific parameters
    if scenario == "heatwave":
        heat_loss_multiplier = 1.5  # 50% more heat loss
        temp_offset = 10  # Hotter ambient temps
    else:
        heat_loss_multiplier = 1.0
        temp_offset = 0

    data = []
    soc = 5.0  # Start at 5 MWh

    for t in times:
        hour = t.hour + t.minute / 60.0

        # Charge during day (10-16), discharge at night (17-24)
        if 10 <= hour < 16:
            charge_rate = 0.01  # MWh per minute
            soc = min(10.0, soc + charge_rate)
        elif 17 <= hour < 24:
            discharge_rate = 0.008
            soc = max(0.0, soc - discharge_rate)

        # Temps track SOC with noise
        temp_hot = 565 + (soc / 10.0) * 20 + np.random.normal(0, 2) + temp_offset
        temp_cold = 290 + (soc / 10.0) * 5 + np.random.normal(0, 1) + temp_offset
        heat_loss = (10 + (soc / 10.0) * 5) * heat_loss_multiplier  # kW loss increases with charge

        data.append((t, soc, temp_hot, temp_cold, heat_loss))

    return data

def generate_dispatch_plan(start: datetime, hours: int) -> List[Tuple]:
    """Generate minute-level charge/discharge schedule"""
    total_minutes = hours * 60
    times = [start + timedelta(minutes=i) for i in range(total_minutes)]

    data = []
    for t in times:
        hour = t.hour + t.minute / 60.0

        # Simple dispatch: charge during solar (10-16), discharge at night (17-24)
        if 10 <= hour < 16:
            charge_kw = 600 + np.random.uniform(-50, 50)
            discharge_kw = 0
            feasible = True
        elif 17 <= hour < 24:
            charge_kw = 0
            discharge_kw = 480 + np.random.uniform(-30, 30)
            feasible = True
        else:
            charge_kw = 0
            discharge_kw = 0
            feasible = True

        data.append((t, charge_kw, discharge_kw, feasible))

    return data

def generate_algae_telemetry(start: datetime, days_history: int, hours_future: int, scenario: str = "clear") -> List[Tuple]:
    """Generate bioreactor telemetry with day/night patterns"""
    total_minutes = (days_history * 24 * 60) + (hours_future * 60)
    times = [start + timedelta(minutes=i) for i in range(-days_history * 24 * 60, hours_future * 60)]

    # Scenario-specific parameters
    if scenario == "maintenance":
        capacity_factor = 0.6  # 40% reduced capacity
        biomass_start = 1.5
    else:
        capacity_factor = 1.0
        biomass_start = 2.0

    data = []
    biomass = biomass_start  # g/L

    for t in times:
        hour = t.hour + t.minute / 60.0

        # Day/night patterns
        is_day = 6 <= hour < 18

        # pH: stable around 7.2
        ph = 7.2 + np.random.normal(0, 0.15)

        # DO: higher during day (photosynthesis), lower at night
        do_mg_l = 7.5 if is_day else 6.0
        do_mg_l += np.random.normal(0, 0.5)

        # Temp: slightly warmer during day
        temp_c = 26 if is_day else 24
        temp_c += np.random.normal(0, 1)

        # CO2 uptake: peaks during day, respiration at night (scaled by capacity)
        if is_day:
            co2_uptake_kg_h = (0.8 + np.random.uniform(-0.1, 0.2)) * capacity_factor
            biomass += 0.0001 * capacity_factor  # Growth
        else:
            co2_uptake_kg_h = -0.2 + np.random.uniform(-0.05, 0.05)  # Respiration

        biomass = max(0.5, min(5.0, biomass))  # Keep in bounds

        data.append((t, ph, do_mg_l, temp_c, co2_uptake_kg_h, biomass))

    return data

def generate_carbon_ledger(start: datetime, days_history: int) -> List[Tuple]:
    """Generate carbon ledger from simulated uptake"""
    total_hours = days_history * 24
    times = [start + timedelta(hours=i) for i in range(-days_history * 24, 0)]

    data = []
    for t in times:
        hour = t.hour
        is_day = 6 <= hour < 18

        # CO2 in (supplied to reactor)
        co2_in_kg = 1.0 if is_day else 0.3

        # CO2 fixed (captured by algae)
        co2_fixed_kg = 0.8 if is_day else 0.1

        # Net = fixed - respiration
        co2_net_kg = co2_fixed_kg - (0.2 if not is_day else 0.05)

        data.append((t, co2_in_kg, co2_fixed_kg, co2_net_kg))

    return data

async def seed_all_data(reset: bool = False, scenario: str = "clear"):
    """Seed all tables with realistic data"""
    from .connection import get_pool
    from .init_db import clear_database

    pool = await get_pool()

    if reset:
        await clear_database()

    now = datetime.now(timezone.utc).replace(second=0, microsecond=0)

    print(f"Seeding forecast_solar (scenario={scenario})...")
    solar_data = generate_solar_forecast(now, days_history=30, hours_future=72, scenario=scenario)
    await pool.executemany(
        "INSERT INTO forecast_solar (time, value_kw, p5, p50, p95) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (time) DO NOTHING",
        solar_data
    )

    print("Seeding forecast_green_windows...")
    windows_data = generate_green_windows(now - timedelta(days=30), days=30 + 3)
    await pool.executemany(
        "INSERT INTO forecast_green_windows (start_time, end_time, carbon_gco2_kwh) VALUES ($1, $2, $3)",
        windows_data
    )

    print(f"Seeding salt_state (scenario={scenario})...")
    salt_data = generate_salt_state(now, days_history=30, hours_future=72, scenario=scenario)
    await pool.executemany(
        "INSERT INTO salt_state (time, soc_mwh, temp_hot_c, temp_cold_c, heat_loss_kw) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (time) DO NOTHING",
        salt_data
    )

    print("Seeding dispatch_plan...")
    dispatch_data = generate_dispatch_plan(now, hours=24)
    await pool.executemany(
        "INSERT INTO dispatch_plan (time, charge_kw, discharge_kw, feasible) VALUES ($1, $2, $3, $4) ON CONFLICT (time) DO NOTHING",
        dispatch_data
    )

    print(f"Seeding algae_telemetry (scenario={scenario})...")
    algae_data = generate_algae_telemetry(now, days_history=30, hours_future=72, scenario=scenario)
    await pool.executemany(
        "INSERT INTO algae_telemetry (time, ph, do_mg_l, temp_c, co2_uptake_kg_h, biomass_g_l) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (time) DO NOTHING",
        algae_data
    )

    print("Seeding carbon_ledger...")
    carbon_data = generate_carbon_ledger(now, days_history=30)
    await pool.executemany(
        "INSERT INTO carbon_ledger (time, co2_in_kg, co2_fixed_kg, co2_net_kg) VALUES ($1, $2, $3, $4) ON CONFLICT (time) DO NOTHING",
        carbon_data
    )

    # Refresh materialized views
    print("Refreshing materialized views...")
    async with pool.acquire() as conn:
        await conn.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hourly_rollups")
        await conn.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_ledger")

    print("✓ All data seeded successfully")
