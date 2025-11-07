Phase 0: Repo, containers, scaffolding (2–3 hours)
- Monorepo: backend/ (FastAPI), frontend/ (React+Vite+D3), docker-compose.yml (api, postgres).
- FastAPI boot: Uvicorn entrypoint, Pydantic v2 models, routers for /forecast, /salt, /dispatch, /algae, /carbon, /admin.
- Postgres init: migrations or SQL file to create base tables and materialized views.
- Seed hooks: on_startup() seeding; /admin/seed?reset=1 endpoint to reseed scenarios.

Phase 1: Database schema and seeders (3–4 hours)
- Tables:
  - forecast_solar(time timestamptz pk, value_kw, p5, p50, p95)
  - forecast_green_windows(id, start_time, end_time, carbon_gco2_kwh)
  - salt_state(time pk, soc_mwh, temp_hot_c, temp_cold_c, heat_loss_kw)
  - dispatch_plan(time pk, charge_kw, discharge_kw, feasible bool)
  - algae_telemetry(time pk, ph, do_mg_l, temp_c, co2_uptake_kg_h, biomass_g_l)
  - carbon_ledger(time pk, co2_in_kg, co2_fixed_kg, co2_net_kg)
- Materialized views:
  - mv_hourly_rollups per table (avg, min, max, sum)
  - mv_daily_ledger (daily total net CO₂)
- Seeders:
  - Solar: clipped sinusoid + random attenuation for clouds; fill 30 days history + 72h future.
  - Green windows: select top 3–6 low-carbon intervals/day.
  - Salt: SOC ODE (charge 10:00–16:00, discharge 17:00–24:00), temps track SOC with noise.
  - Algae: pH ~ 7.2±0.2, DO ~ 7±1 mg/L, temp ~ 24–28°C, uptake peaks in day; nightly respiration reduces net.
  - Carbon ledger: rollups from telemetry (simple conversions).

Phase 2: Core APIs (5–6 hours)
- GET /forecast/solar: returns 5–15 min nowcast + 24–72h horizon, with p5/p50/p95 arrays.
- GET /forecast/green-windows: returns time ranges with carbon intensity.
- GET /salt/state: last 24h SOC/temps + current snapshot.
- POST /salt/simulate: accepts schedule [{t, charge_kw, discharge_kw}], returns time-series feasibility + SOC/temps/heat_loss.
- POST /dispatch/plan: generates minute-level plan for next 24h using simple rules (charge at windows, cap rates, respect bounds).
- GET /algae/telemetry/stream: SSE stream of {time, ph, do, temp, co2_uptake, biomass}.
- GET /carbon/ledger: returns daily/batch totals; add ?export=csv|json.

Phase 3: Scenario controls and caching (3–4 hours)
- /admin/scenario?type=cloudy|heatwave|maintenance: reseeds with changed parameters.
- Cache precomputed arrays in memory (or Redis later). Invalidate cache on scenario change.
- Materialized view refresh job every 60 seconds.

Phase 4: Frontend shell and design system (3–4 hours) — React + Vite
- Vite + React + TypeScript + Tailwind; layout with sidebar (Overview, Thermal Twin, Forecast Lab, Reactor Console, Carbon).
- Theme: slate/emerald; large typography; subtle glass panels; 300ms transitions.
- Fetch utils with SSE (EventSource) support; simple state store (Zustand or React Context).

Phase 5: D3 Overview page (5–6 hours)
- Animated flow chart: Solar → Salt → Loads (SVG Sankey-like). Flow widths update every few seconds.
- SOC gauge: circular gradient gauge with numeric SOC% and color state (green >60, amber 30–60, red <30).
- Timeline:
  - Solar p50 curve with p5–p95 fan.
  - “Green window” ribbons shaded under the curve.
  - Dispatch overlays (green = charge, blue = discharge).
- CO₂ capture ticker: cumulative counter increasing in real time; display daily net and per-minute rate.

Phase 6: D3 Thermal Twin page (3–4 hours)
- Dual-axis chart: hot/cold tank temps (bands with shaded error); overlay SOC line.
- Heat loss donut and live round-trip efficiency tile.
- Dispatch events (vertical stripes) to correlate SOC and temp changes.

Phase 7: Forecast Lab page (3–4 hours)
- Overlay chart: solar p50 + fan bands; draggable window handles to “force” charge/discharge adjustments.
- Recompute: call /dispatch/plan with new constraints; instant redraw of overlays and SOC changes.

Phase 8: Reactor Console page (4–5 hours)
- Linked D3 charts:
  - pH with safe band shading.
  - DO mg/L with alarm thresholds.
  - Temp with comfort envelope.
  - CO₂ uptake with day/night pattern.
- Alarms: pill badges (O₂ inhibition risk, pH out-of-range, overtemp).
- Buttons: “Degas now”, “Aerate burst”, “Night mode”—trigger minor changes in stream.

Phase 9: Carbon & Exports page (2–3 hours)
- Cumulative net CO₂ line chart + daily bar chart.
- Export buttons (CSV/JSON); animated “Mint demo credit” button triggers download of an audit-like JSON.

Phase 10: Performance polish (3–4 hours)
- Client-side decimation for large series (largest triangle three buckets).
- SSE smoothing (throttle to 5–10 messages/sec).
- Materialized view refresh indicator (shows “live” badge).
- Add /demo/big endpoint to return 50k–200k points; chart stress test button.

Phase 11: Demo script and guardrails (1–2 hours)
- Script:
  - Start with “Clear Sky”.
  - Flip to “Cloudy”—show forecast drops, dispatch shifts, SOC and CO₂ respond.
  - Trigger “Degas now”—watch O₂ inhibition clear.
  - Export ledger and show JSON.
- Guardrails:
  - Fallback UI if API 500s (show cached arrays).
  - Retry on SSE disconnect.

Stretch (if time remains)
- IsolationForest anomaly: simple /algae/anomaly endpoint to flag fouling/under-performance using rolling stats.
- Tiny Locust test to print throughput for /forecast/solar and /salt/state.
- Grafana panel embedding (if you want ops eye-candy).

Time summary (approx.)
- Day 1: DB + seed + core APIs + Overview base.
- Day 2: Thermal Twin + Forecast Lab + scenario + caching.
- Day 3: Reactor Console + Carbon & Exports + SSE polish.
- Day 4: Performance + demo script + visual refinement.

Deliverables checklist
- FastAPI endpoints live with examples in Swagger.
- Beautiful Overview/Thermal/Forecast/Reactor/Carbon pages with animated D3 charts (built with React + Vite).
- Scenario toggles that morph the entire dashboard in seconds.
- Exportable ledger JSON/CSV and a convincing “mint demo credit” artifact.
- One-liner run via docker-compose up.

React + Vite tips
- Scaffold: npm create vite@latest carbonflux-mini -- --template react-ts
- Install: npm i d3 zustand @tanstack/react-query tailwindcss postcss autoprefixer
- Init Tailwind: npx tailwindcss init -p
- Env: VITE_API_BASE=http://localhost:8000
- SSE hook: wrap EventSource with auto-retry and throttle to keep 60 FPS on charts.



#DEPLOYMENT choices after building everything and testing:

Prep
- Environment variables:
  - API: PORT=8000, PG_DSN=postgres://user:pass@postgres:5432/carbonflux
  - FE: VITE_API_BASE=http://localhost:8000 (or your public API URL)
- One command dev: docker-compose up — builds API, Postgres, and runs frontend dev or static server.

Option A — Local + Docker (fastest demo)
1) Compose file
- Services: api (FastAPI+Uvicorn), db (Postgres), frontend (Node for build + Nginx to serve)
- Volumes for db data persistence; expose 8000 (API), 5173/80 (FE)

2) Build + run
- docker-compose build
- docker-compose up
- Visit http://localhost:80 (frontend), http://localhost:8000/docs (Swagger)

3) Warm seed
- Call POST /admin/seed?reset=1
- Switch scenarios: POST /admin/scenario?type=cloudy

Option B — Fly.io (fast, global, cheap)
1) Fly setup
- flyctl launch (one app per service or a single app with a Procfile)
- fly postgres create —name carbonflux-db
- Set secrets: fly secrets set PG_DSN=...

2) Deploy API
- Dockerfile with Uvicorn CMD
- flyctl deploy —config fly.api.toml
- map /admin and /docs paths

3) Deploy frontend
- Build: npm run build (Vite -> dist)
- Serve via Nginx container (Dockerfile.web), set VITE_API_BASE to API URL
- flyctl deploy —config fly.frontend.toml

Option C — Render/Heroku/Koyeb (zero-ops)
- API: connect Git repo → Docker or Python service → set PG_DSN env → autoscale off for stability
- DB: provision managed Postgres → copy DSN
- FE: Static site with build command npm run build; publish dist; set VITE_API_BASE to API’s public URL

Database migration + seed on deploy
- Entrypoint script:
  - Apply SQL migrations (or alembic upgrade head if using Alembic)
  - Run a seed script when SEED=1 (idempotent) to fill 30 days + 72h forecasts
- Health checks:
  - /healthz on API returns {db: ok, seed: ok, version}

Caching + performance knobs (prod)
- API:
  - Enable Uvicorn workers = 2–4 (uvicorn app.main:app --workers 2)
  - Turn on GZip middleware for large payloads
  - Cache precomputed arrays in memory (expires on scenario switch)
- Postgres:
  - Create indexes: (time) on all telemetry/forecast tables
  - Refresh materialized views every 60s via a lightweight background task
- Frontend:
  - Preload critical chunks; use immutable cache headers on dist assets
  - SSE proxy (Nginx: proxy_buffering off) to keep streams smooth

Domains and TLS
- Point domain to FE (Netlify/Vercel/Fly static)
- CORS allow FE domain on API
- Force HTTPS and HSTS for a clean browser experience

Smoke test script (post-deploy)
- GET /forecast/solar → 200 with arrays (72h)
- GET /salt/state → has last 24h SOC/temps
- POST /dispatch/plan → returns minute-level schedule
- SSE /algae/telemetry/stream → events arrive in <3s
- GET /carbon/ledger → daily totals non-zero
- Frontend loads Overview and animates within 2s TTI

Demo toggles (live)
- POST /admin/scenario?type=cloudy — see charts adapt in <2s
- Click “Export JSON” on Carbon page — downloads ledger
- Click “Degas now” on Reactor Console — telemetry shifts within a few ticks

Rollbacks
- Fly/Render: keep previous deployment; one command rollback
- DB: keep schema changes additive for demo; avoid destructive migrations

One-liners
- Local: docker-compose up —build
- Fly: fly deploy (API) + fly deploy (FE)
- Render: push to main; auto-deploy runs seeding on first boot
