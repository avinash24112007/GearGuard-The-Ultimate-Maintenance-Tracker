import sqlite3

def migrate():
    try:
        conn = sqlite3.connect('gearguard.db')
        cursor = conn.cursor()
        print("Checking schema...")
        
        # Check if column exists
        cursor.execute("PRAGMA table_info(maintenance_logs)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'equipment_name' not in columns:
            print("Adding missing column 'equipment_name'...")
            cursor.execute("ALTER TABLE maintenance_logs ADD COLUMN equipment_name VARCHAR")
            conn.commit()
            print("Migration successful: Added equipment_name.")
        else:
            print("Column 'equipment_name' already exists.")
            
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
