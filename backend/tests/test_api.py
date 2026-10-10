from fastapi.testclient import TestClient

from app.main import app
import app.main as main_module


def test_health():
    client = TestClient(app)
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["source"] == "NASA/JPL Horizons"


def test_ephemerides_rejects_unbounded_request():
    client = TestClient(app)
    response = client.get('/api/ephemerides', params={'ids': 'earth', 'start': '2020-01-01T00:00:00Z', 'end': '2043-01-01T00:00:00Z', 'step': '1 d'})
    assert response.status_code == 400


def test_horizons_failure_is_unavailable(monkeypatch):
    async def fail(*_args, **_kwargs):
        raise main_module.HorizonsError('simulated NASA timeout')

    monkeypatch.setattr(main_module, 'fetch_vectors', fail)
    client = TestClient(app)
    response = client.get('/api/ephemerides', params={'ids': 'earth', 'start': '2040-02-01T00:00:00Z', 'end': '2040-02-03T00:00:00Z', 'step': '1 d'})
    assert response.status_code == 200
    assert response.json()['objects']['earth']['sourceStatus'] == 'unavailable'
    assert 'simulated NASA timeout' in response.json()['objects']['earth']['error']

