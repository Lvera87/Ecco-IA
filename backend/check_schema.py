
import sqlite3
import os

# Path to the database
db_path = "./sql_app.db"

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("PRAGMA table_info(consumption_readings)")
    columns = cursor.fetchall()
    
    print("Columns in consumption_readings:")
    found_cost = False
    for col in columns:
        print(f"- {col[1]} ({col[2]})")
        if col[1] == 'cost':
            found_cost = True
            
    if found_cost:
        print("\nSUCCESS: 'cost' column exists.")
    else:
        print("\nFAILURE: 'cost' column IS MISSING.")
        
except Exception as e:
    print(f"Error checking schema: {e}")
finally:
    conn.close()
