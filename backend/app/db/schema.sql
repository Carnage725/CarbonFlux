-- Core time-series tables

CREATE TABLE IF NOT EXISTS forecast_solar (
    time TIMESTAMPTZ PRIMARY KEY,
    value_kw REAL NOT NULL,
    p5 REAL NOT NULL,
    p50 REAL NOT NULL,
    p95 REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_forecast_solar_time ON forecast_solar(time);

CREATE TABLE IF NOT EXISTS forecast_green_windows (
    id SERIAL PRIMARY KEY,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    carbon_gco2_kwh REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_green_windows_time ON forecast_green_windows(start_time, end_time);

CREATE TABLE IF NOT EXISTS salt_state (
    time TIMESTAMPTZ PRIMARY KEY,
    soc_mwh REAL NOT NULL,
    temp_hot_c REAL NOT NULL,
    temp_cold_c REAL NOT NULL,
    heat_loss_kw REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_salt_state_time ON salt_state(time);

CREATE TABLE IF NOT EXISTS dispatch_plan (
    time TIMESTAMPTZ PRIMARY KEY,
    charge_kw REAL NOT NULL,
    discharge_kw REAL NOT NULL,
    feasible BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dispatch_plan_time ON dispatch_plan(time);

CREATE TABLE IF NOT EXISTS algae_telemetry (
    time TIMESTAMPTZ PRIMARY KEY,
    ph REAL NOT NULL,
    do_mg_l REAL NOT NULL,
    temp_c REAL NOT NULL,
    co2_uptake_kg_h REAL NOT NULL,
    biomass_g_l REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_algae_telemetry_time ON algae_telemetry(time);

CREATE TABLE IF NOT EXISTS carbon_ledger (
    time TIMESTAMPTZ PRIMARY KEY,
    co2_in_kg REAL NOT NULL,
    co2_fixed_kg REAL NOT NULL,
    co2_net_kg REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_carbon_ledger_time ON carbon_ledger(time);

-- Materialized views

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_hourly_rollups AS
SELECT
    date_trunc('hour', time) as hour,
    'solar' as source,
    AVG(value_kw) as avg_value,
    MIN(value_kw) as min_value,
    MAX(value_kw) as max_value,
    SUM(value_kw) as sum_value
FROM forecast_solar
GROUP BY date_trunc('hour', time)
UNION ALL
SELECT
    date_trunc('hour', time) as hour,
    'salt_soc' as source,
    AVG(soc_mwh) as avg_value,
    MIN(soc_mwh) as min_value,
    MAX(soc_mwh) as max_value,
    NULL as sum_value
FROM salt_state
GROUP BY date_trunc('hour', time)
UNION ALL
SELECT
    date_trunc('hour', time) as hour,
    'algae_co2' as source,
    AVG(co2_uptake_kg_h) as avg_value,
    MIN(co2_uptake_kg_h) as min_value,
    MAX(co2_uptake_kg_h) as max_value,
    SUM(co2_uptake_kg_h) as sum_value
FROM algae_telemetry
GROUP BY date_trunc('hour', time);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_hourly_rollups ON mv_hourly_rollups(hour, source);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_ledger AS
SELECT
    date_trunc('day', time) as day,
    SUM(co2_in_kg) as total_co2_in_kg,
    SUM(co2_fixed_kg) as total_co2_fixed_kg,
    SUM(co2_net_kg) as total_co2_net_kg,
    COUNT(*) as records
FROM carbon_ledger
GROUP BY date_trunc('day', time);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_ledger ON mv_daily_ledger(day);
