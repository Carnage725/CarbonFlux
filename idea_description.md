Here’s a simplified, show-ready software solution built on FastAPI + PostgreSQL + D3 that maximizes visual impact and output.

Product summary
- Name: CarbonFlux
- Purpose: Orchestrate Solar → Molten-Salt Storage → Algae Photobioreactors with forecasts, simulations, dispatch plans, and live dashboards, optimized for a beautiful, high‑throughput demo.
- Core idea: Precompute rich time-series, stream live telemetry, visualize everything with animated D3 charts, and expose clean REST endpoints for plug-and-play API use.

What it does
- Forecasts: Generates day-ahead solar and “green windows” (cleanest energy periods) plus minute-level nowcasts for realism.
- Salt storage twin: Simulates a two‑tank molten-salt system (hot/cold temps, state‑of‑charge, heat loss) and validates charge/discharge schedules.
- Dispatch planner: Creates a 24‑hour minute-by-minute schedule to charge on solar peaks and discharge to run algae bioreactors at night.
- Bioreactor controller (sim): Produces CO₂ uptake, pH, DO, and temperature curves; toggles O₂ stripping and aeration cycles; tracks biomass growth and net CO₂ captured.
- Carbon ledger: Rolls up interval data into daily/batch net capture; exports JSON/CSV for “credit-like” artifacts.
- Live dashboards: Beautiful D3-based charts—animated flows (solar → salt → loads), thermal bands, green-window ribbons, CO₂ capture tickers, and health alarms.

Tech stack (opinionated and minimal)
- Backend: FastAPI (Uvicorn) with Pydantic v2 for strict schemas; pure REST + Server-Sent Events (SSE) for live streams.
- Database: PostgreSQL (single instance) with time-series tables (minute granularity) and materialized views for fast aggregations.
- Frontend: D3.js (for custom, polished charts), React + Vite (or Next.js if preferred) + Tailwind CSS for a clean modern UI; SSE for live telemetry.

Data model (PostgreSQL)
- tables:
  - forecast_solar(time, value_kw, p5, p50, p95)
  - forecast_green_windows(start_time, end_time, carbon_gco2_kwh)
  - salt_state(time, soc_mwh, temp_hot_c, temp_cold_c, heat_loss_kw)
  - dispatch_plan(time, charge_kw, discharge_kw, feasible)
  - algae_telemetry(time, ph, do_mg_l, temp_c, co2_uptake_kg_h, biomass_g_l)
  - carbon_ledger(time, co2_in_kg, co2_fixed_kg, co2_net_kg)
- materialized views:
  - mv_hourly_rollups (per-table hourly aggregates)
  - mv_daily_ledger (daily net capture and KPIs)

Core endpoints (FastAPI)
- GET /forecast/solar → 5–15 min nowcast + 24–72 hr curves with percentiles
- GET /forecast/green-windows → list of clean-energy intervals and intensity
- POST /salt/simulate → input schedule; output SOC, temps, losses time-series
- GET /salt/state → current SOC/temps plus last 24h series
- POST /dispatch/plan → returns minute-level charge/discharge schedule
- GET /algae/telemetry/stream → SSE of pH/DO/temp/CO₂ uptake every 1–5s
- GET /carbon/ledger → daily/batch rollups + downloadable JSON/CSV
- POST /admin/seed?scenario=cloudy|heatwave|maintenance → reseed demo data quickly

Frontend pages (D3-first, designed to impress)
- Live Overview
  - Animated Sankey/flow: Solar → Salt → Loads
  - SOC gauge with gradient fill
  - “Green window” ribbons over the timeline
  - CO₂ capture ticker that climbs in real time
- Thermal Twin
  - Dual temperature band chart (hot/cold tanks) with shaded heat loss
  - SOC vs time with dispatch overlays (charge in green, discharge in blue)
- Forecast Lab
  - Overlay of solar p50 with p5–p95 fan chart
  - Toggle green windows and see dispatch shifts live
- Reactor Console
  - Linked D3 charts of pH, DO, temperature, CO₂ uptake
  - Alarm badges (O₂ inhibition, out-of-range pH/DO/temp)
- Carbon & Exports
  - Cumulative net CO₂ chart + daily bars
  - “Export JSON/CSV” buttons styled for show
  - “Mint demo credit” button that downloads an audit JSON

Design language (beautiful by default)
- Tailwind + a minimalist theme (e.g., slate/emerald); large typography; glassmorphism panels; smooth 300ms transitions.
- D3 visual polish: eased animations, subtle gradients, blur/glow on active flows, responsive SVG with tooltips and scrubber timelines.

High-output tricks (so it feels alive)
- Precompute arrays for the next 24–72 hours and cache them; serve large payloads instantly.
- SSE streams for algae telemetry and “nowcast” updates; client-side decimation for smooth rendering of 50k+ points.
- Materialized views refresh every minute for “instant” hourly/daily charts.
- Admin scenario switches that re-seed curves and trigger frontend to morph in seconds.

Developer workflow (fast)
- Docker Compose: api, postgres, frontend
- `on_startup` seeds 30 days of history + 24–72 hr forecasts
- `npm run dev` and `uvicorn app.main:app --reload` for hot reload everywhere
- One shared schema.ts/Pydantic models for strict contract between API and UI

What you’ll demo in 3–5 minutes
- Click “Cloudy day” scenario—watch solar drop, dispatch shift, salt charge shrink, and CO₂ capture adapt in real time.
- Open Thermal Twin—show tank temps, losses, and round-trip efficiency responding to the new plan.
- Reactor Console—see pH/DO/temp stabilize with aeration/degassing cycles; alarms flash then clear.
- Carbon & Exports—download a daily ledger JSON; the cumulative net CO₂ line rises and the “credit” button produces a slick artifact.

Build order (2–4 days)
- Day 1: DB schema, seeders, /forecast + /salt/state + /algae/telemetry (SSE), basic Overview page with D3 line charts and a SOC bar.
- Day 2: /salt/simulate + /dispatch/plan, Thermal Twin + Forecast Lab pages, green-window ribbons.
- Day 3: Carbon ledger rollups + export, Reactor Console with alarms, polish D3 animations, add scenario admin.
- Day 4: Visual refinements, caching, large payloads & SSE tuning, final demo script and screenshots.

Why this works
- FastAPI gives instant, self-documented APIs and low-latency responses ideal for big JSON payloads and live streams.  
- PostgreSQL keeps everything simple and reliable while still handling time-series at demo scale via materialized views and indexes.  
- D3 makes your charts look custom, animated, and premium—judges will feel the system working in real time.  

This is the simplest stack that still looks world‑class and outputs a lot: FastAPI + PostgreSQL + D3, with SSE streams, cached forecasts, and gorgeous, animated dashboards.