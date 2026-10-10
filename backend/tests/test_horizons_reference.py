import asyncio
import os

import pytest

from app.adapters.horizons import fetch_vectors


REFERENCE = {
    "2025-01-01": (-26730662.2989, 144658567.1920, -7643.5894),
    "2026-01-01": (-26072138.4482, 144774673.8210, -8892.8619),
    "2027-01-01": (-25406150.8200, 144895560.9617, -8552.6894),
}


@pytest.mark.skipif(os.getenv("COSMIC_LIVE_HORIZONS") != "1", reason="set COSMIC_LIVE_HORIZONS=1 for the NASA integration check")
def test_earth_fixed_horizons_dates():
    """Reference check recorded from CENTER=500@10, ECLIPTIC J2000, km/s."""
    for date, expected in REFERENCE.items():
        next_day = f"{date[:8]}{int(date[8:]) + 1:02d}"
        point = asyncio.run(fetch_vectors("399", date, next_day, "1 d"))[0]
        assert point.epoch_tdb.startswith(date)
        assert point.x == pytest.approx(expected[0], abs=1)
        assert point.y == pytest.approx(expected[1], abs=1)
        assert point.z == pytest.approx(expected[2], abs=1)
