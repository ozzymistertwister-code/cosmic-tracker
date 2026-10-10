from app.adapters.horizons import classify_coverage
from app.domain import StateVector


def vector(epoch_utc: str = "") -> StateVector:
    return StateVector("fixture", 0, 0, 0, 0, 0, 0, "fixture", epoch_utc=epoch_utc)


def test_coverage_stays_unknown_without_explicit_source_metadata():
    assert classify_coverage(vector("2026-10-09T23:58:50.818Z")) == "unknown"
    assert classify_coverage(vector("2026-10-11T23:58:50.818Z")) == "unknown"
    assert classify_coverage(vector()) == "unknown"
