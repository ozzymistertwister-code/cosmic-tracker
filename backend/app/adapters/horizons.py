import httpx
from typing import List, Optional
import asyncio
from dataclasses import replace
from datetime import datetime, timezone

from app.domain import StateVector, parse_horizons_result

HORIZONS_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"


class HorizonsError(RuntimeError):
    pass


def classify_coverage(point: StateVector, now: Optional[datetime] = None) -> str:
    """Classify a parsed epoch explicitly; parser text is never used as a signal."""
    if not point.epoch_utc:
        return "unknown"
    reference = now or datetime.now(timezone.utc)
    epoch = datetime.fromisoformat(point.epoch_utc.replace("Z", "+00:00"))
    return "forecast" if epoch > reference else "reconstructed"


async def fetch_vectors(target_id: str, start: str, stop: str, step: str = "1 d") -> List[StateVector]:
    params = {
        "format": "json", "COMMAND": f"'{target_id}'", "EPHEM_TYPE": "VECTORS", "VEC_TABLE": "2",
        "CENTER": "500@10", "REF_PLANE": "ECLIPTIC", "OUT_UNITS": "KM-S", "VEC_CORR": "NONE",
        "START_TIME": f"'{start}'", "STOP_TIME": f"'{stop}'", "STEP_SIZE": f"'{step}'",
    }
    async with httpx.AsyncClient(timeout=20) as client:
        response = None
        for attempt in range(5):
            response = await client.get(HORIZONS_URL, params=params)
            if response.status_code not in (429, 500, 502, 503, 504) or attempt == 4:
                break
            await asyncio.sleep(0.8 * (attempt + 1))
        assert response is not None
    if response.status_code != 200:
        raise HorizonsError(f"Horizons HTTP {response.status_code}")
    body = response.json()
    if "error" in body or "result" not in body:
        raise HorizonsError(str(body.get("message", "Horizons returned no result")))
    points = parse_horizons_result(body["result"], "NASA/JPL Horizons")
    now = datetime.now(timezone.utc)
    classified = [replace(point, coverage=classify_coverage(point, now)) for point in points]
    return classified


def serialize_point(point: StateVector) -> dict:
    return {
        "timestamp": point.timestamp, "x": point.x, "y": point.y, "z": point.z,
        "vx": point.vx, "vy": point.vy, "vz": point.vz, "source": point.source,
        "coverage": point.coverage, "epochTdb": point.epoch_tdb, "epochUtc": point.epoch_utc,
    }

