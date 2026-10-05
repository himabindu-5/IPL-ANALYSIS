
import os
import sys
from pathlib import Path

import pg8000
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("PGHOST", "localhost")
DB_PORT = int(os.getenv("PGPORT", "5432"))
DB_USER = os.getenv("PGUSER", "postgres")
DB_PASSWORD = os.getenv("PGPASSWORD")
DB_NAME = os.getenv("PGDATABASE", "ipl_analysis")


def main():
    schema_path = Path("sql/schema.sql")

    if not schema_path.exists():
        print(f"ERROR: {schema_path} was not found.")
        sys.exit(1)

    if not DB_PASSWORD:
        print("ERROR: PostgreSQL password is not set.")
        sys.exit(1)

    try:
        schema = schema_path.read_text(encoding="utf-8")

        print("Connecting to PostgreSQL database...")
        print(f"Database: {DB_NAME}")

        conn = pg8000.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
        )

        try:
            cursor = conn.cursor()
            cursor.execute(schema)
            conn.commit()
            cursor.close()

            print("All tables and indexes created successfully.")
        finally:
            conn.close()

    except Exception as error:
        print("\nDATABASE ERROR:")
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    print("\nIPL ANALYSIS DATABASE TABLE SETUP")
    print("=" * 45)
    main()
    print("\nDatabase table setup completed.")