#!/usr/bin/env python3
"""
Export ALL multi-unit properties from main_properties.db for client-side search.
Generates a compressed JSON with essential fields only.

Output: public/data/all-properties.json
Format: {"p": [...properties], "c": count}

Property keys are abbreviated to minimize file size:
  a = apn
  d = address (street address)
  n = name (property marketing name, if available)
  o = owner
  u = units
  v = value
  y = yearBuilt
  z = zoning
  l = landUseCode
  t = latitude
  g = longitude
"""

import json
import sqlite3
from pathlib import Path

# For coordinate transformation
try:
    from pyproj import Transformer
    COORD_TRANSFORMER = Transformer.from_crs("EPSG:3423", "EPSG:4326", always_xy=True)
    HAS_PYPROJ = True
except ImportError:
    HAS_PYPROJ = False
    print("Warning: pyproj not available, coordinates will not be transformed")

# Paths relative to script location
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
DB_PATH = PROJECT_ROOT / "data/databases/main_properties.db"
OUTPUT_PATH = PROJECT_ROOT / "public/data/all-properties.json"
NAMES_PATH = PROJECT_ROOT / "src/data/property-names.json"

# APNs to exclude (casinos, storage, healthcare, etc.) - from extract-property-names.py
EXCLUDE_APNS = {
    # Casinos/Hotels
    "1925018", "2025458", "3217228", "729229", "729438", "3843002", "12303101", "3701304", "3701305",
    # Storage facilities
    "14423213", "23814005", "16008404", "1705101",
    # Healthcare
    "725610", "720223", "752201",
    # Government
    "307025", "8614401",
}


def transform_coords(sp_x: float, sp_y: float) -> tuple[float, float] | None:
    """Transform State Plane NAD83 (US feet) to WGS84."""
    if not HAS_PYPROJ or not sp_x or not sp_y:
        return None
    try:
        lon, lat = COORD_TRANSFORMER.transform(sp_x, sp_y)
        # Validate Reno area bounds
        if 39.3 <= lat <= 39.8 and -120.1 <= lon <= -119.6:
            return (round(lat, 6), round(lon, 6))
    except Exception:
        pass
    return None


def main():
    if not DB_PATH.exists():
        print(f"Database not found: {DB_PATH}")
        return

    # Load property names if available
    property_names = {}
    if NAMES_PATH.exists():
        with open(NAMES_PATH) as f:
            data = json.load(f)
            property_names = {apn: info['name'] for apn, info in data.get('names', {}).items()}
        print(f"Loaded {len(property_names):,} property names")

    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()

    # Get all multi-unit properties (units > 1) with valid owner data
    # Include coordinates for map display
    cursor.execute("""
        SELECT
            apn,
            property_address,
            owner_name,
            units,
            total_assessed_value,
            year_built,
            zoning,
            land_use_code,
            centroid_lon,
            centroid_lat
        FROM parcels
        WHERE units > 1
          AND owner_name IS NOT NULL
          AND owner_name != ''
          AND property_address IS NOT NULL
          AND property_address != ''
        ORDER BY units DESC
    """)

    properties = []
    excluded_count = 0
    for row in cursor.fetchall():
        apn, address, owner, units, value, year_built, zoning, land_use, sp_x, sp_y = row

        # Skip if essential data is missing
        if not apn or not address:
            continue

        # Skip excluded properties (casinos, storage, etc.)
        if apn in EXCLUDE_APNS:
            excluded_count += 1
            continue

        prop = {
            "a": apn,
            "d": address,
            "o": owner or "Unknown",
            "u": units or 0,
            "v": value,  # Can be null
            "y": year_built,  # Can be null
            "z": zoning,  # Can be null
            "l": land_use,  # Can be null
        }

        # Add property name if available
        if apn in property_names:
            prop["n"] = property_names[apn]

        # Add coordinates if available
        coords = transform_coords(sp_x, sp_y)
        if coords:
            prop["t"] = coords[0]  # latitude
            prop["g"] = coords[1]  # longitude

        properties.append(prop)

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

    # Count properties with names
    named_count = sum(1 for p in properties if 'n' in p)
    coords_count = sum(1 for p in properties if 't' in p)

    print(f"Exported {len(properties):,} multi-unit properties")
    print(f"  With names: {named_count:,}")
    print(f"  With coords: {coords_count:,}")
    print(f"  Excluded: {excluded_count:,}")
    print(f"Output: {OUTPUT_PATH}")
    print(f"Size: {size_mb:.2f} MB")


if __name__ == "__main__":
    main()
