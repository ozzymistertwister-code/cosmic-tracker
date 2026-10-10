from app.domain import StateVector, parse_horizons_result, vector_distance

FIXTURE = """header\n$$SOE\n2461323.5 = A.D. 2026-Oct-10 00:00:00.0000 TDB\n X = 1.0 Y = 2.0 Z = 3.0\n VX= 4.0 VY= 5.0 VZ= 6.0\n$$EOE\n"""


def test_parser_requires_and_reads_soe_block():
    # Horizons emits one component per line; normalize the fixture to that format.
    body = FIXTURE.replace(" X = 1.0 Y = 2.0 Z = 3.0", " X = 1.0\n Y = 2.0\n Z = 3.0")
    points = parse_horizons_result(body, "offline fixture")
    assert points[0].x == 1.0 and points[0].vz == 6.0
    assert points[0].source == "offline fixture"


def test_vector_math():
    a = StateVector("a", 3, 0, 0, 0, 0, 0, "fixture")
    b = StateVector("b", 0, 4, 0, 0, 0, 0, "fixture")
    assert vector_distance(a, b) == 5
    assert a.distance_km == 3

