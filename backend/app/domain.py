from dataclasses import dataclass
from datetime import datetime, timezone
from math import sqrt
import re
from typing import Dict, List, Union

AU_KM = 149_597_870.7


@dataclass(frozen=True)
class StateVector:
    timestamp: str
    x: float
    y: float
    z: float
    vx: float
    vy: float
    vz: float
    source: str
    coverage: str = "unknown"
    epoch_tdb: str = ""

    @property
    def distance_km(self) -> float:
        return sqrt(self.x**2 + self.y**2 + self.z**2)

    @property
    def speed_km_s(self) -> float:
        return sqrt(self.vx**2 + self.vy**2 + self.vz**2)


def parse_horizons_result(result: str, source: str) -> List[StateVector]:
    """Parse the documented Horizons $$SOE vector block."""
    if "$$SOE" not in result or "$$EOE" not in result:
        raise ValueError("Horizons response does not contain an ephemeris block")
    coverage = "forecast" if "pred" in result.lower() else "reconstructed"
    points: List[StateVector] = []
    inside = False
    current: Dict[str, Union[float, str]] = {}
    for raw in result.splitlines():
        line = raw.strip()
        if line == "$$SOE":
            inside = True
            continue
        if line == "$$EOE":
            inside = False
            if len(current) == 8:
                points.append(StateVector(source=source, coverage=coverage, **current))
            current = {}
            continue
        if not inside:
            continue
        if " = A.D." in line:
            if len(current) == 8:
                points.append(StateVector(source=source, coverage=coverage, **current))
                current = {}
            current["timestamp"] = line.split(" = ", 1)[0]
            calendar = re.search(r"A\.D\. (\d{4}-[A-Za-z]{3}-\d{2} \d{2}:\d{2}:\d{2}\.\d+) TDB", line)
            if calendar:
                current["epoch_tdb"] = datetime.strptime(calendar.group(1), "%Y-%b-%d %H:%M:%S.%f").replace(tzinfo=timezone.utc).isoformat()
        else:
            matches = re.findall(r"\b(VX|VY|VZ|X|Y|Z)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:E[+-]?\d+)?)", line)
            for key, value in matches:
                current[key.lower()] = float(value)
    if not points:
        raise ValueError("Horizons ephemeris block contains no complete vectors")
    return points


def parse_epoch(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def vector_distance(a: StateVector, b: StateVector) -> float:
    return sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)

