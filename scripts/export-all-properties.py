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
        # Validate Washoe County bounds (includes Reno, Sparks, Lake Tahoe, Incline Village)
        # Lat: ~39.0 (south Lake Tahoe) to ~41.0 (north county)
        # Lon: ~-120.2 (west Lake Tahoe) to ~-119.2 (east county)
        if 39.0 <= lat <= 41.0 and -120.2 <= lon <= -119.2:
            return (round(lat, 6), round(lon, 6))
    except Exception:
        pass
    return None


def normalize_address(addr: str) -> str:
    """
    Normalize address to group multi-parcel properties.
    Strips unit numbers like "255 N SIERRA ST 140" -> "255 N SIERRA ST"
    """
    import re
    if not addr:
        return ""
    # Remove trailing unit/suite numbers (common patterns: " 140", " STE 100", " UNIT A")
    normalized = re.sub(r'\s+(STE|SUITE|UNIT|APT|#)?\s*[A-Z0-9]+$', '', addr.strip())
    return normalized


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

    raw_properties = []
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

        raw_properties.append(prop)

    conn.close()

    # Deduplicate properties by name or normalized address
    # Multi-parcel properties (condos, large complexes) have same name across multiple APNs
    seen_names = {}  # name -> best property
    seen_addresses = {}  # normalized address -> best property
    properties = []
    dedup_count = 0

    for prop in raw_properties:
        name = prop.get("n")
        address = prop.get("d", "")

        # Properties with names: dedupe by name
        if name:
            if name in seen_names:
                # Keep the one with more units, or first seen
                existing = seen_names[name]
                if prop.get("u", 0) > existing.get("u", 0):
                    seen_names[name] = prop
                dedup_count += 1
                continue
            seen_names[name] = prop
            properties.append(prop)
        else:
            # No name: dedupe by normalized address
            norm_addr = normalize_address(address)
            if norm_addr and norm_addr in seen_addresses:
                existing = seen_addresses[norm_addr]
                if prop.get("u", 0) > existing.get("u", 0):
                    # Replace with higher unit count
                    idx = properties.index(existing)
                    properties[idx] = prop
                    seen_addresses[norm_addr] = prop
                dedup_count += 1
                continue
            if norm_addr:
                seen_addresses[norm_addr] = prop
            properties.append(prop)

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
    print(f"  Raw count: {len(raw_properties):,}")
    print(f"  Deduplicated: {dedup_count:,}")
    print(f"  With names: {named_count:,}")
    print(f"  With coords: {coords_count:,}")
    print(f"  Excluded: {excluded_count:,}")
    print(f"Output: {OUTPUT_PATH}")
    print(f"Size: {size_mb:.2f} MB")


if __name__ == "__main__":
    main()
