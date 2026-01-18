#!/usr/bin/env python3
"""
Export top complexes to CSV for manual Matrix room creation

If you prefer to create rooms manually via Element web UI,
this script generates a CSV you can reference.
"""

import sqlite3
import csv
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "data"
DB_PATH = DATA_DIR / "databases" / "main_properties.db"
OUTPUT_CSV = DATA_DIR / "top_complexes_for_matrix.csv"


def export_complexes(limit: int = 50):
    """Export top complexes to CSV"""

    if not DB_PATH.exists():
        print(f"❌ Database not found: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get top complexes
    cursor.execute("""
        SELECT
            apn,
            property_address,
            owner_name,
            units,
            year_built,
            total_assessed_value,
            wgs84_lat,
            wgs84_lon
        FROM parcels
        WHERE units >= 20
          AND property_address IS NOT NULL
          AND property_address NOT LIKE '0 %'
        ORDER BY units DESC, total_assessed_value DESC
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()
    conn.close()

    # Write to CSV
    with open(OUTPUT_CSV, 'w', newline='') as f:
        writer = csv.writer(f)

        # Headers
        writer.writerow([
            'APN',
            'Address',
            'Owner',
            'Units',
            'Year Built',
            'Value',
            'Latitude',
            'Longitude',
            'Matrix Room ID',
            'Matrix Room Alias',
            'Notes'
        ])

        # Data
        for row in rows:
            writer.writerow(list(row) + ['', '', ''])  # Add empty columns for Matrix data

    print(f"✓ Exported {len(rows)} complexes to: {OUTPUT_CSV}")
    print("\nYou can:")
    print("1. Open this CSV in a spreadsheet")
    print("2. Create Matrix rooms manually via https://app.element.io")
    print("3. Fill in the 'Matrix Room ID' and 'Matrix Room Alias' columns")
    print("4. Use the completed CSV to update your website")


if __name__ == "__main__":
    print("Export Top Complexes for Matrix Room Creation")
    print("=" * 60)

    limit = int(input("How many complexes to export? (default: 50): ").strip() or "50")
    export_complexes(limit)
