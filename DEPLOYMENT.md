# CarbonFlux Deployment Guide

## Quick Start (Docker Compose)

### Prerequisites
- Docker and Docker Compose installed
- Ports 80 (frontend) and 8000 (API) available

### Deploy All Services

```bash
# Build and start all services (PostgreSQL + Backend + Frontend)
docker-compose up --build -d

# View logs
docker-compose logs -f

# Check service health
curl http://localhost/api/healthz
```

### Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000 (direct) or http://localhost/api (proxied)
- **API Docs**: http://localhost:8000/docs

### Stop Services

```bash
# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Browser (Port 80)                      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  Frontend (Nginx)                       │
│  - Serves React app                     │
│  - Proxies /api/* to Backend            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  Backend (FastAPI) - Port 8000          │
│  - REST API endpoints                   │
│  - SSE streams                          │
│  - Auto-seed on startup (SEED=1)        │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  PostgreSQL - Port 5432                 │
│  - Time-series data                     │
│  - Materialized views                   │
└─────────────────────────────────────────┘
```

---

## Services

### 1. PostgreSQL (postgres)
- **Image**: postgres:16
- **Port**: 5432
- **Database**: carbonflux
- **User/Pass**: carbonflux/carbonflux
- **Volume**: postgres_data (persistent)

### 2. Backend API (api)
- **Build**: ./backend/Dockerfile
- **Port**: 8000
- **Environment**:
  - PG_DSN: Database connection string
  - SEED: 1 (auto-seed data on startup)
- **Command**: uvicorn with hot-reload (dev mode)

### 3. Frontend (frontend)
- **Build**: ./frontend/Dockerfile (multi-stage)
- **Port**: 80
- **Nginx**: Serves static files + proxies API
- **Environment**: NODE_ENV=production

---

## Environment Variables

### Backend (.env.production)
```bash
PG_DSN=postgresql://carbonflux:carbonflux@postgres:5432/carbonflux
SEED=1        # Set to 0 after first successful deployment
PORT=8000
```

### Frontend (.env)
```bash
VITE_API_BASE=/api    # Proxied through Nginx
```

---

## Production Deployment

### Option 1: VPS (DigitalOcean, Linode, etc.)

1. **Set up VPS** with Docker installed
2. **Clone repository**:
   ```bash
   git clone <repo-url>
   cd CarbonFlux
   ```
3. **Configure domain** (if using):
   - Point DNS A record to VPS IP
   - Update nginx.conf with your domain
4. **Deploy**:
   ```bash
   docker-compose up --build -d
   ```
5. **SSL/TLS** (optional, recommended):
   ```bash
   # Install certbot
   sudo apt-get install certbot python3-certbot-nginx

   # Get certificate
   sudo certbot --nginx -d yourdomain.com
   ```

### Option 2: Fly.io

1. **Install flyctl**: https://fly.io/docs/hands-on/install-flyctl/
2. **Create apps**:
   ```bash
   # Backend
   cd backend
   flyctl launch --name carbonflux-api

   # Frontend
   cd ../frontend
   flyctl launch --name carbonflux-web
   ```
3. **Set secrets**:
   ```bash
   flyctl secrets set PG_DSN=<your-postgres-url> -a carbonflux-api
   ```
4. **Deploy**:
   ```bash
   flyctl deploy -a carbonflux-api
   flyctl deploy -a carbonflux-web
   ```

### Option 3: Render

1. **Connect GitHub repo** to Render
2. **Create PostgreSQL database** (managed)
3. **Create Web Service** (backend):
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment: Set PG_DSN
4. **Create Static Site** (frontend):
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment: Set VITE_API_BASE to backend URL

---

## Troubleshooting

### Frontend not loading
```bash
# Check if frontend container is running
docker-compose ps

# View frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build frontend
```

### API not responding
```bash
# Check API health
curl http://localhost/api/healthz

# View API logs
docker-compose logs api

# Check database connection
docker-compose exec postgres psql -U carbonflux -d carbonflux -c "SELECT 1;"
```

### Database issues
```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up --build -d

# View database logs
docker-compose logs postgres

# Check if tables exist
docker-compose exec postgres psql -U carbonflux -d carbonflux -c "\dt"
```

### SSE not connecting on Reactor Console
- Check nginx.conf has `proxy_buffering off` for /api/
- Verify VITE_API_BASE is set to `/api`
- Check browser console for connection errors

---

## Post-Deployment Checklist

- [ ] Frontend loads at http://localhost
- [ ] All 5 pages render without errors
- [ ] Scenario switcher works (dropdown changes data)
- [ ] Reactor Console shows "Live" indicator
- [ ] D3 charts animate on load
- [ ] Export CSV/JSON buttons download files
- [ ] No console errors in browser
- [ ] Health check returns 200: `curl http://localhost/api/healthz`

---

## Performance Tips

### Disable auto-seed after first run
After successful deployment with data:
```bash
# Edit docker-compose.yml
# Change SEED: "1" to SEED: "0"

# Restart API
docker-compose restart api
```

### Enable Uvicorn workers (production)
Edit `backend/Dockerfile` CMD:
```dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Monitor resource usage
```bash
docker stats
```

---

## Maintenance

### Backup Database
```bash
docker-compose exec postgres pg_dump -U carbonflux carbonflux > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U carbonflux carbonflux < backup.sql
```

### Update Application
```bash
git pull
docker-compose down
docker-compose up --build -d
```

---

## Support

- **Frontend Issues**: Check browser console + frontend logs
- **API Issues**: Check API logs + health endpoint
- **Database Issues**: Check postgres logs + connection
- **SSE Issues**: Check nginx config + browser Network tab

For more details, see CLAUDE.md and build_plan.md
