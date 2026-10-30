import os
import sqlite3
from pathlib import Path
import pg8000.dbapi
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "database" / "ipl_analysis.db"

class DatabaseManager:
    def __init__(self):
        self.mode = "unknown"
        self.error = None
        self._check_connection()

    def _check_connection(self):
        pg_pass = os.getenv("PGPASSWORD")
        pg_host = os.getenv("PGHOST", "127.0.0.1")
        pg_port = int(os.getenv("PGPORT", "5432"))
        pg_user = os.getenv("PGUSER", "postgres")
        pg_db = os.getenv("PGDATABASE", "ipl_analysis")

        if pg_pass:
            try:
                conn = pg8000.dbapi.connect(
                    host=pg_host,
                    port=pg_port,
                    user=pg_user,
                    password=pg_pass,
                    database=pg_db,
                )
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                # Verify that tables actually exist in PostgreSQL
                cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'players'")
                row = cursor.fetchone()
                has_tables = row and row[0] > 0
                cursor.close()
                conn.close()
                if has_tables:
                    self.mode = "postgresql"
                    self.error = None
                    return
                else:
                    self.error = "PostgreSQL tables not initialized. Falling back to SQLite."
            except Exception as e:
                self.error = f"PostgreSQL connection failed: {e}"
        else:
            self.error = "PostgreSQL password (PGPASSWORD) is not set in environment or .env."

        # Fallback to local SQLite DB
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        if not DB_PATH.exists():
            try:
                from scripts.build_sqlite_db import build_sqlite
                build_sqlite()
            except Exception as e:
                self.error = f"SQLite build failed: {e}"

        if DB_PATH.exists():
            self.mode = "sqlite"
            self.error = None
        else:
            self.mode = "error"

    def get_connection(self):
        pg_pass = os.getenv("PGPASSWORD")
        if self.mode == "postgresql" and pg_pass:
            try:
                conn = pg8000.dbapi.connect(
                    host=os.getenv("PGHOST", "127.0.0.1"),
                    port=int(os.getenv("PGPORT", "5432")),
                    user=os.getenv("PGUSER", "postgres"),
                    password=pg_pass,
                    database=os.getenv("PGDATABASE", "ipl_analysis"),
                )
                return conn, "postgresql"
            except Exception:
                pass

        # Fallback to local SQLite DB
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        if not DB_PATH.exists():
            from scripts.build_sqlite_db import build_sqlite
            build_sqlite()

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        # Performance tuning for SQLite
        conn.execute("PRAGMA cache_size = -64000") # 64MB cache
        conn.execute("PRAGMA temp_store = MEMORY")
        return conn, "sqlite"

db_manager = DatabaseManager()

def execute_query(query: str, params: tuple = (), fetchall: bool = True):
    conn, mode = db_manager.get_connection()
    try:
        cursor = conn.cursor()
        if mode == "sqlite":
            query = query.replace("%s", "?")
        else:
            query = query.replace("?", "%s")

        cursor.execute(query, params)
        if fetchall:
            rows = cursor.fetchall()
            if mode == "sqlite":
                result = [dict(row) for row in rows]
            else:
                col_names = [desc[0] for desc in cursor.description]
                result = [dict(zip(col_names, row)) for row in rows]
            return result
        else:
            row = cursor.fetchone()
            if row is None:
                return None
            if mode == "sqlite":
                return dict(row)
            else:
                col_names = [desc[0] for desc in cursor.description]
                return dict(zip(col_names, row))
    except Exception as e:
        # If postgres fails at runtime, fallback to sqlite immediately
        if mode == "postgresql":
            db_manager.mode = "sqlite"
            conn.close()
            conn, mode = db_manager.get_connection()
            cursor = conn.cursor()
            query = query.replace("%s", "?")
            cursor.execute(query, params)
            if fetchall:
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
            else:
                row = cursor.fetchone()
                return dict(row) if row else None
        raise e
    finally:
        conn.close()
