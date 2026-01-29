
import sqlite3
import os

db_path = "./sql_app.db"

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    print("Attempting to add 'cost' column...")
    cursor.execute("ALTER TABLE consumption_readings ADD COLUMN cost FLOAT;")
    conn.commit()
    print("SUCCESS: Added 'cost' column.")
except sqlite3.OperationalError as e:
    if "duplicate column" in str(e):
        print("Column 'cost' already exists (or verified).")
    else:
        print(f"Operational Error: {e}")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
