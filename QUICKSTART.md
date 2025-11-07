# CarbonFlux - Quick Start Guide

## 🚀 Deployed and Running!

CarbonFlux is now live and accessible at:

### **Frontend**: http://localhost
### **API**: http://localhost:8000 (or http://localhost/api)
### **API Docs**: http://localhost:8000/docs

---

## ✅ What's Deployed

### Three Docker containers are running:

1. **PostgreSQL** (port 5432)
   - Time-series database
   - Auto-seeded with 30 days history + 72h forecasts
   - Materialized views for fast aggregations

2. **FastAPI Backend** (port 8000)
   - REST API + SSE streams
   - 6 route modules (forecast, salt, dispatch, algae, carbon, admin)
   - Auto-refreshes materialized views every 60s

3. **React Frontend** (port 80)
   - 5 pages: Overview, Thermal Twin, Forecast Lab, Reactor Console, Carbon
   - Served by Nginx with API proxying
   - Production-optimized build (minified, chunked)

---

## 🎯 Quick Demo

### 1. Open the Application
Visit **http://localhost** in your browser

### 2. Explore the Pages

#### **Overview** (/)
- Live animated flow diagram
- SOC gauge showing battery state
- Cumulative CO₂ ticker
- **Try**: Switch scenarios using dropdown (Cloudy, Heatwave, Maintenance)

#### **Thermal Twin** (/thermal)
- Dual-axis temperature + SOC chart
- Heat loss donut visualization
- Round-trip efficiency metrics

#### **Forecast Lab** (/forecast)
- P5-P50-P95 solar forecast fan chart
- Green windows (low-carbon intervals)
- 72-hour forecast horizon

#### **Reactor Console** (/reactor)
- **Live SSE stream** - Look for green "Live" indicator
- 4 real-time charts: pH, DO, Temperature, CO₂ uptake
- Alarm system (try triggering alarms with controls)
- **Try**: Click "Degas Now" or "Aerate Burst" buttons

#### **Carbon & Exports** (/carbon)
- Cumulative CO₂ line chart
- Daily bar chart
- **Try**: Click "Export CSV" or "Export JSON"
- **Try**: Click "Mint Demo Credit" for animation

---

## 🔧 Management Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Stop Services
```bash
# Stop (keeps data)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### Rebuild After Code Changes
```bash
docker-compose up --build -d
```

---

## 🧪 Testing Endpoints

### Health Check
```bash
curl http://localhost/api/healthz
```

### Get Solar Forecast
```bash
curl http://localhost/api/forecast/solar | jq '.forecast | length'
```

### Get Salt State
```bash
curl http://localhost/api/salt/state | jq '.current'
```

### Get Algae Telemetry
```bash
curl http://localhost/api/algae/telemetry?hours=1 | jq '.count'
```

### Switch Scenario
```bash
curl -X POST http://localhost/api/admin/scenario?type=cloudy
```

### Export Carbon Ledger CSV
```bash
curl http://localhost/api/carbon/ledger?export=csv --output carbon.csv
```

---

## 📊 Monitoring

### Check Container Status
```bash
docker-compose ps
```

### Monitor Resource Usage
```bash
docker stats
```

### Check Database Tables
```bash
docker-compose exec postgres psql -U carbonflux -d carbonflux -c "\dt"
```

### Query Data
```bash
# Count solar forecast points
docker-compose exec postgres psql -U carbonflux -d carbonflux \
  -c "SELECT COUNT(*) FROM forecast_solar;"

# Check algae telemetry
docker-compose exec postgres psql -U carbonflux -d carbonflux \
  -c "SELECT time, ph, do_mg_l FROM algae_telemetry ORDER BY time DESC LIMIT 5;"
```

---

## 🐛 Troubleshooting

### Frontend shows blank page
```bash
# Check if frontend container is running
docker-compose ps frontend

# View frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build frontend -d
```

### API not responding
```bash
# Check API health
curl http://localhost/api/healthz

# View API logs
docker-compose logs api

# Restart API
docker-compose restart api
```

### SSE not connecting (Reactor Console)
- Check browser console for errors
- Verify "Live" indicator appears
- Check API logs: `docker-compose logs api | grep telemetry`
- Restart API: `docker-compose restart api`

### Database connection issues
```bash
# Check postgres is healthy
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Reset database (WARNING: deletes all data)
docker-compose down -v && docker-compose up -d
```

---

## 🎬 Demo Flow

Perfect demo sequence to showcase CarbonFlux:

1. **Start at Overview**
   - Point out animated flow diagram
   - Show real-time SOC gauge
   - Show cumulative CO₂ ticker

2. **Switch Scenario to "Cloudy"**
   - Watch data update across all components
   - Notice solar power reduction
   - See CO₂ capture adjust

3. **Navigate to Reactor Console**
   - Point out "Live" indicator (SSE connection)
   - Watch charts update in real-time
   - Click "Degas Now" - show button goes active
   - Wait for DO chart to respond

4. **Open Carbon & Exports**
   - Show cumulative capture trend
   - Click "Export JSON" - file downloads
   - Click "Mint Demo Credit" - watch animation

5. **Return to Overview**
   - Switch back to "Clear Sky" scenario
   - Show system returns to optimal state

---

## 📦 What's Included

### Backend APIs (FastAPI)
- ✅ `/forecast/solar` - Solar forecast with percentiles
- ✅ `/forecast/green-windows` - Low-carbon intervals
- ✅ `/salt/state` - Battery SOC and temperatures
- ✅ `/salt/simulate` - Dispatch schedule validation
- ✅ `/dispatch/plan` - Generate dispatch plan
- ✅ `/algae/telemetry` - Historical bioreactor data
- ✅ `/algae/telemetry/stream` - SSE live stream
- ✅ `/algae/control` - Reactor control actions
- ✅ `/carbon/ledger` - Daily CO₂ rollups
- ✅ `/admin/seed` - Reseed database
- ✅ `/admin/scenario` - Switch scenarios

### Frontend Pages (React + D3)
- ✅ Overview - Flow diagram, SOC gauge, CO₂ ticker
- ✅ Thermal Twin - Temperature charts, efficiency metrics
- ✅ Forecast Lab - P5-P95 fan chart, green windows
- ✅ Reactor Console - Live SSE, 4 charts, alarms, controls
- ✅ Carbon & Exports - Cumulative/daily charts, CSV/JSON export

### Database (PostgreSQL)
- ✅ 6 time-series tables
- ✅ 2 materialized views
- ✅ Auto-refresh every 60 seconds
- ✅ 30 days historical data
- ✅ 72 hours forecast data

---

## 🌐 Next Steps

### Deploy to Production VPS

1. **Get a VPS** (DigitalOcean, Linode, etc.)
2. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
3. **Clone repo** and deploy:
   ```bash
   git clone <your-repo>
   cd CarbonFlux
   docker-compose up -d
   ```
4. **Point domain** to VPS IP
5. **Add SSL** with Let's Encrypt:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Deploy to Fly.io (Recommended)

See `DEPLOYMENT.md` for detailed Fly.io instructions.

### Deploy to Render/Vercel

See `DEPLOYMENT.md` for no-ops deployment options.

---

## 📝 Notes

- **Auto-seed**: Database reseeds on every API restart (SEED=1)
- **To disable**: Change `SEED: "1"` to `SEED: "0"` in docker-compose.yml
- **Materialized views**: Auto-refresh every 60 seconds for performance
- **SSE streams**: Emit data every 2 seconds for smooth visualization
- **Port 80**: May require sudo on some systems, change to 3000 if needed

---

## 🎉 Success Checklist

- [x] Frontend loads at http://localhost
- [x] All 5 pages render without errors
- [x] API health check returns {"status": "healthy"}
- [x] Scenario switcher updates data
- [x] Reactor Console shows "Live" indicator
- [x] D3 charts animate on page load
- [x] Export buttons download CSV/JSON files
- [x] No console errors in browser

---

**Congratulations! CarbonFlux is live.** 🚀

For more details, see `DEPLOYMENT.md` and `CLAUDE.md`
