#!/usr/bin/env python3
"""
Export ALL multi-unit properties from main_properties.db for client-side search.
Generates a compressed JSON with essential fields only.

Output: public/data/all-properties.json
Format: {"p": [...properties], "c": count}

Property keys are abbreviated to minimize file size:
  a = apn
  d = address
  o = owner
  u = units
  v = value
  y = yearBuilt
  z = zoning
  l = landUseCode
"""

import json
import sqlite3
from pathlib import Path

# Paths relative to script location
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
DB_PATH = PROJECT_ROOT / "data/databases/main_properties.db"
OUTPUT_PATH = PROJECT_ROOT / "public/data/all-properties.json"


def main():
    if not DB_PATH.exists():
        print(f"Database not found: {DB_PATH}")
        return

    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()

    # Get all multi-unit properties (units > 1) with valid owner data
    # This filters out single-family homes to reduce dataset size
    cursor.execute("""
        SELECT
            apn,
            property_address,
            owner_name,
            units,
            total_assessed_value,
            year_built,
            zoning,
            land_use_code
        FROM parcels
        WHERE units > 1
          AND owner_name IS NOT NULL
          AND owner_name != ''
          AND property_address IS NOT NULL
          AND property_address != ''
        ORDER BY units DESC
    """)

    properties = []
    for row in cursor.fetchall():
        apn, address, owner, units, value, year_built, zoning, land_use = row

        # Skip if essential data is missing
        if not apn or not address:
            continue

        properties.append({
            "a": apn,
            "d": address,
            "o": owner or "Unknown",
            "u": units or 0,
            "v": value,  # Can be null
            "y": year_built,  # Can be null
            "z": zoning,  # Can be null
            "l": land_use,  # Can be null
        })

    conn.close()

    # Ensure output directory exists
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Write compressed JSON (no whitespace)
    with open(OUTPUT_PATH, 'w') as f:
        json.dump({
            "p": properties,
            "c": len(properties)
        }, f, separators=(',', ':'))

    # Calculate file size
    file_size = OUTPUT_PATH.stat().st_size
    size_mb = file_size / (1024 * 1024)

    print(f"Exported {len(properties):,} multi-unit properties")
    print(f"Output: {OUTPUT_PATH}")
    print(f"Size: {size_mb:.2f} MB")


if __name__ == "__main__":
    main()
