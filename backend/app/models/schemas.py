from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

# Solar Forecast
class SolarForecastPoint(BaseModel):
    time: datetime
    value_kw: float
    p5: float
    p50: float
    p95: float

class SolarForecastResponse(BaseModel):
    nowcast: List[SolarForecastPoint] = Field(description="5-15 minute nowcast")
    forecast: List[SolarForecastPoint] = Field(description="24-72 hour forecast")
    generated_at: datetime

# Green Windows
class GreenWindow(BaseModel):
    id: int
    start_time: datetime
    end_time: datetime
    carbon_gco2_kwh: float
    duration_hours: float

class GreenWindowsResponse(BaseModel):
    windows: List[GreenWindow]
    count: int

# Salt Storage
class SaltStatePoint(BaseModel):
    time: datetime
    soc_mwh: float
    temp_hot_c: float
    temp_cold_c: float
    heat_loss_kw: float

class SaltStateResponse(BaseModel):
    current: SaltStatePoint
    history_24h: List[SaltStatePoint]
    capacity_mwh: float = 10.0
    soc_percent: float

# Salt Simulation
class DispatchSchedulePoint(BaseModel):
    time: datetime
    charge_kw: float
    discharge_kw: float

class SaltSimulateRequest(BaseModel):
    schedule: List[DispatchSchedulePoint]
    initial_soc_mwh: Optional[float] = 5.0

class SaltSimulateResponse(BaseModel):
    feasible: bool
    schedule: List[SaltStatePoint]
    final_soc_mwh: float
    total_heat_loss_kwh: float
    round_trip_efficiency: float

# Dispatch Plan
class DispatchPlanPoint(BaseModel):
    time: datetime
    charge_kw: float
    discharge_kw: float
    feasible: bool

class DispatchPlanResponse(BaseModel):
    plan: List[DispatchPlanPoint]
    total_charge_kwh: float
    total_discharge_kwh: float
    duration_hours: int

# Algae Telemetry
class AlgaeTelemetryPoint(BaseModel):
    time: datetime
    ph: float
    do_mg_l: float
    temp_c: float
    co2_uptake_kg_h: float
    biomass_g_l: float

class AlgaeTelemetryResponse(BaseModel):
    data: List[AlgaeTelemetryPoint]
    count: int
    time_range: str

# Carbon Ledger
class CarbonLedgerPoint(BaseModel):
    time: datetime
    co2_in_kg: float
    co2_fixed_kg: float
    co2_net_kg: float

class CarbonLedgerDailyPoint(BaseModel):
    day: datetime
    total_co2_in_kg: float
    total_co2_fixed_kg: float
    total_co2_net_kg: float
    records: int

class CarbonLedgerResponse(BaseModel):
    daily: List[CarbonLedgerDailyPoint]
    cumulative_net_kg: float
    total_days: int
