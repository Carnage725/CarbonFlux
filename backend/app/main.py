import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.connection import get_pool, close_pool
from app.db.init_db import init_database
from app.db.seeders import seed_all_data
from app.routers import admin, forecast, salt, dispatch, algae, carbon, demo
from app.background_tasks import start_background_tasks, stop_background_tasks

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting CarbonFlux API...")
    await get_pool()
    await init_database()

    # Auto-seed if SEED=1
    if os.getenv("SEED") == "1":
        print("🌱 Auto-seeding database...")
        await seed_all_data(reset=False)

    # Start background tasks
    await start_background_tasks()

    yield

    # Shutdown
    print("👋 Shutting down...")
    await stop_background_tasks()
    await close_pool()

app = FastAPI(
    title="CarbonFlux API",
    description="Solar-powered molten-salt storage with algae photobioreactors",
    version="0.1.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(admin.router)
app.include_router(forecast.router)
app.include_router(salt.router)
app.include_router(dispatch.router)
app.include_router(algae.router)
app.include_router(carbon.router)
app.include_router(demo.router)

@app.get("/")
async def root():
    return {
        "name": "CarbonFlux API",
        "version": "0.1.0",
        "status": "operational"
    }

@app.get("/healthz")
async def health_check():
    """Health check endpoint"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return {
            "status": "healthy",
            "db": "ok",
            "version": "0.1.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "db": "error",
            "error": str(e)
        }
