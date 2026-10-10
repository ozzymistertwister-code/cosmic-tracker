from datetime import datetime, timezone

from app.adapters.horizons import classify_coverage
from app.domain import StateVector


def vector(epoch_utc: str = "") -> StateVector:
    return StateVector("fixture", 0, 0, 0, 0, 0, 0, "fixture", epoch_utc=epoch_utc)


def test_coverage_is_explicitly_classified_against_utc_epoch():
    now = datetime(2026, 10, 10, tzinfo=timezone.utc)
    assert classify_coverage(vector("2026-10-09T23:58:50.818Z"), now) == "reconstructed"
    assert classify_coverage(vector("2026-10-11T23:58:50.818Z"), now) == "forecast"
    assert classify_coverage(vector(), now) == "unknown"
