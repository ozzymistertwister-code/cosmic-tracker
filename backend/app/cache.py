import json
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional, Tuple


class EphemerisCache:
    def __init__(self, path: str, ttl_hours: int = 6):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.ttl = timedelta(hours=ttl_hours)
        with sqlite3.connect(self.path) as db:
            db.execute("CREATE TABLE IF NOT EXISTS ephemerides (cache_key TEXT PRIMARY KEY, created_at TEXT NOT NULL, payload TEXT NOT NULL)")

    def get(self, key: str) -> Optional[Tuple[dict, bool]]:
        with sqlite3.connect(self.path) as db:
            row = db.execute("SELECT created_at, payload FROM ephemerides WHERE cache_key = ?", (key,)).fetchone()
        if not row:
            return None
        created = datetime.fromisoformat(row[0])
        return json.loads(row[1]), datetime.now(timezone.utc) - created > self.ttl

    def put(self, key: str, payload: dict) -> None:
        now = datetime.now(timezone.utc).isoformat()
        with sqlite3.connect(self.path) as db:
            db.execute("INSERT OR REPLACE INTO ephemerides(cache_key, created_at, payload) VALUES(?, ?, ?)", (key, now, json.dumps(payload)))
            db.commit()

