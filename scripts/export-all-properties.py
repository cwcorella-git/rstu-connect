#!/usr/bin/env python3
"""
Export properties from main_properties.db for client-side search.
Includes multi-unit buildings AND LLC-owned single-family rentals.
Generates a compressed JSON with essential fields only.

Output: public/data/all-properties.json
Format: {"p": [...properties], "c": count}

Property keys are abbreviated to minimize file size:
  a = apn (primary parcel)
  d = address (primary street address)
  n = name (property marketing name, if available)
  o = owner
  u = units
  v = value
  y = yearBuilt
  z = zoning
  l = landUseCode
  t = latitude (centroid for multi-parcel)
  g = longitude (centroid for multi-parcel)
  pt = property type: "m" (multi-unit) or "s" (single-family rental)
  apns = list of all APNs (multi-parcel properties only)
  addrs = list of all addresses (multi-parcel properties only)
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

    # Get multi-unit properties (units > 1) AND LLC-owned single-family rentals
    # LLC ownership is a strong indicator of rental property (vs family trusts)
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
        WHERE (units > 1 OR (units = 1 AND owner_name LIKE '%LLC%'))
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

        # Determine property type: multi-unit or single-family rental
        prop_type = "m" if (units or 0) > 1 else "s"

        prop = {
            "a": apn,
            "d": address,
            "o": owner or "Unknown",
            "u": units or 0,
            "v": value,  # Can be null
            "y": year_built,  # Can be null
            "z": zoning,  # Can be null
            "l": land_use,  # Can be null
            "pt": prop_type,  # "m" = multi-unit, "s" = single-family rental
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
    # We preserve all parcel info (APNs, addresses, coords) for multi-parcel properties

    # First pass: group by name or normalized address
    named_groups = {}  # name -> list of properties
    address_groups = {}  # normalized address -> list of properties
    ungrouped = []  # properties that don't fit into groups

    for prop in raw_properties:
        name = prop.get("n")
        address = prop.get("d", "")

        if name:
            if name not in named_groups:
                named_groups[name] = []
            named_groups[name].append(prop)
        else:
            norm_addr = normalize_address(address)
            if norm_addr:
                if norm_addr not in address_groups:
                    address_groups[norm_addr] = []
                address_groups[norm_addr].append(prop)
            else:
                ungrouped.append(prop)

    # Second pass: merge groups into single properties with parcel info
    properties = []
    dedup_count = 0

    for name, group in named_groups.items():
        if len(group) == 1:
            # Single parcel - just add it
            properties.append(group[0])
        else:
            # Multiple parcels - merge into one with parcel list
            dedup_count += len(group) - 1

            # Sort by units desc, then by address to get primary
            group.sort(key=lambda x: (-x.get("u", 0), x.get("d", "")))
            primary = group[0].copy()

            # Collect all unique addresses (floors/units)
            addresses = []
            apns = []
            coords_list = []
            for p in group:
                apns.append(p["a"])
                addr = p.get("d", "")
                if addr and addr not in addresses:
                    addresses.append(addr)
                if p.get("t") and p.get("g"):
                    coords_list.append((p["t"], p["g"]))

            # Store parcel info
            primary["apns"] = apns  # All APNs
            if len(addresses) > 1:
                primary["addrs"] = addresses  # All unique addresses

            # Use average coordinates for multi-parcel properties
            if coords_list:
                avg_lat = sum(c[0] for c in coords_list) / len(coords_list)
                avg_lon = sum(c[1] for c in coords_list) / len(coords_list)
                primary["t"] = round(avg_lat, 6)
                primary["g"] = round(avg_lon, 6)

            properties.append(primary)

    for norm_addr, group in address_groups.items():
        if len(group) == 1:
            properties.append(group[0])
        else:
            # Multiple parcels at same address - merge
            dedup_count += len(group) - 1
            group.sort(key=lambda x: -x.get("u", 0))
            primary = group[0].copy()

            apns = [p["a"] for p in group]
            primary["apns"] = apns

            # Average coords
            coords_list = [(p["t"], p["g"]) for p in group if p.get("t") and p.get("g")]
            if coords_list:
                avg_lat = sum(c[0] for c in coords_list) / len(coords_list)
                avg_lon = sum(c[1] for c in coords_list) / len(coords_list)
                primary["t"] = round(avg_lat, 6)
                primary["g"] = round(avg_lon, 6)

            properties.append(primary)

    # Add ungrouped properties
    properties.extend(ungrouped)

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

    # Count properties by type
    named_count = sum(1 for p in properties if 'n' in p)
    coords_count = sum(1 for p in properties if 't' in p)
    multi_parcel_count = sum(1 for p in properties if 'apns' in p)
    total_parcels = sum(len(p.get('apns', [p['a']])) for p in properties)
    multi_unit_count = sum(1 for p in properties if p.get('pt') == 'm')
    sfr_count = sum(1 for p in properties if p.get('pt') == 's')

    print(f"Exported {len(properties):,} properties")
    print(f"  Multi-unit buildings: {multi_unit_count:,}")
    print(f"  Single-family rentals (LLC): {sfr_count:,}")
    print(f"  Raw parcels: {len(raw_properties):,}")
    print(f"  Multi-parcel properties: {multi_parcel_count:,} (containing {total_parcels - len(properties) + multi_parcel_count:,} extra parcels)")
    print(f"  With names: {named_count:,}")
    print(f"  With coords: {coords_count:,}")
    print(f"  Excluded: {excluded_count:,}")
    print(f"Output: {OUTPUT_PATH}")
    print(f"Size: {size_mb:.2f} MB")


if __name__ == "__main__":
    main()
