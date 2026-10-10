import asyncio
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.adapters.horizons import HorizonsError, fetch_vectors, serialize_point
from app.cache import EphemerisCache

API_PREFIX = os.getenv("API_PREFIX", "/api").rstrip("/")
CACHE_PATH = os.getenv("EPHEMERIS_CACHE", str(Path(__file__).parents[1] / "data" / "ephemerides.sqlite3"))
cache = EphemerisCache(CACHE_PATH)
app = FastAPI(title="Cosmic Tracker API", version="0.1.0", root_path="")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_methods=["GET"], allow_headers=["*"])

CATALOG = {
    "sun": "10", "mercury": "199", "venus": "299", "earth": "399", "mars": "499", "jupiter": "599", "saturn": "699", "uranus": "799", "neptune": "899",
    "parker": "-96", "voyager1": "-31", "voyager2": "-32", "new-horizons": "-98", "juice": "-28", "europa-clipper": "-159",
}


def route(path: str) -> str:
    return f"{API_PREFIX}{path}"


@app.get(route("/health"))
async def health() -> dict:
    return {"status": "ok", "service": "cosmic-tracker-api", "source": "NASA/JPL Horizons", "cache": str(CACHE_PATH)}


@app.get(route("/objects"))
async def objects() -> dict:
    return {"objects": [{"id": key, "targetId": value} for key, value in CATALOG.items()]}


@app.get(route("/ephemerides"))
async def ephemerides(ids: str = Query(...), start: Optional[str] = None, end: Optional[str] = None, step: str = "1 d") -> JSONResponse:
    epoch = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0) if not start else datetime.fromisoformat(start.replace("Z", "+00:00"))
    stop = datetime.fromisoformat(end.replace("Z", "+00:00")) if end else epoch + timedelta(days=1)
    requested = [item.strip() for item in ids.split(",") if item.strip()]
    output: dict[str, dict] = {}
    limiter = asyncio.Semaphore(3)
    async def one(object_id: str) -> None:
        target = CATALOG.get(object_id)
        if not target:
            output[object_id] = {"points": [], "sourceStatus": "unavailable", "error": "Unknown object id"}
            return
        key = f"parser-v3|{target}|{epoch.isoformat()}|{stop.isoformat()}|{step}|heliocentric-ecliptic-j2000"
        cached = cache.get(key)
        if cached and not cached[1]:
            output[object_id] = {**cached[0], "sourceStatus": "cached"}
            return
        try:
            async with limiter:
                points = await fetch_vectors(target, epoch.strftime("%Y-%m-%d"), stop.strftime("%Y-%m-%d"), step)
            payload = {"points": [serialize_point(point) for point in points], "sourceStatus": "live"}
            cache.put(key, payload)
            output[object_id] = payload
        except (HorizonsError, ValueError, OSError, TimeoutError) as exc:
            if cached:
                output[object_id] = {**cached[0], "sourceStatus": "offline-cache", "error": str(exc)}
            else:
                output[object_id] = {"points": [], "sourceStatus": "unavailable", "error": str(exc)}
    await asyncio.gather(*(one(item) for item in requested))
    return JSONResponse({"generatedAt": datetime.now(timezone.utc).isoformat(), "epoch": epoch.isoformat(), "frame": "Ecliptic J2000 heliocentric", "units": "km, km/s", "source": "NASA/JPL Horizons", "objects": output})

