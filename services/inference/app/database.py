from __future__ import annotations

from datetime import datetime, timezone

import psycopg


CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS processing_runs (
    run_id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    model_provider TEXT NOT NULL,
    model_variant TEXT NOT NULL,
    feedback TEXT NULL CHECK (feedback IS NULL OR feedback IN ('great', 'too_much_removed', 'background_left')),
    feedback_at TIMESTAMPTZ NULL
)
"""
CREATE_EXPIRY_INDEX = "CREATE INDEX IF NOT EXISTS processing_runs_expires_at_idx ON processing_runs (expires_at)"


class RunStore:
    """Short-lived PostgreSQL metadata store. It never accepts image bytes, filenames, or image URLs."""

    def __init__(self, database_url: str) -> None:
        self.database_url = database_url.strip()
        self.ready = False

    def _connect(self):
        return psycopg.connect(self.database_url, connect_timeout=5, autocommit=True)

    def initialize(self) -> bool:
        if not self.database_url:
            return False
        with self._connect() as conn:
            conn.execute(CREATE_TABLE)
            conn.execute(CREATE_EXPIRY_INDEX)
            conn.execute("DELETE FROM processing_runs WHERE expires_at <= NOW()")
        self.ready = True
        return True

    def disable(self) -> None:
        self.ready = False

    def create_run(self, run_id: str, expires_at_epoch: float, provider: str, variant: str) -> None:
        expires_at = datetime.fromtimestamp(expires_at_epoch, tz=timezone.utc)
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO processing_runs (run_id, expires_at, model_provider, model_variant)
                VALUES (%s, %s, %s, %s)
                """,
                (run_id, expires_at, provider, variant),
            )

    def consume_run(self, run_id: str, feedback: str) -> bool:
        with self._connect() as conn:
            row = conn.execute(
                """
                UPDATE processing_runs
                SET feedback = %s, feedback_at = NOW()
                WHERE run_id = %s AND expires_at > NOW() AND feedback IS NULL
                RETURNING run_id
                """,
                (feedback, run_id),
            ).fetchone()
        return row is not None

    def prune_expired(self) -> int:
        with self._connect() as conn:
            cursor = conn.execute("DELETE FROM processing_runs WHERE expires_at <= NOW()")
            return max(0, cursor.rowcount or 0)
