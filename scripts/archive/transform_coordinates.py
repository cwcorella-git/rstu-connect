#!/usr/bin/env python3
"""
Transform Nevada State Plane coordinates to WGS84 (lat/lon)
Convert all 192,463 properties in washoe_parcels.db
"""

import sqlite3
import sys
from pathlib import Path
from typing import Tuple

try:
    from pyproj import Transformer
except ImportError:
    print("ERROR: pyproj not installed. Install with: pip install pyproj")
    sys.exit(1)

# Database paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "data"
DB_PATH = DATA_DIR / "databases" / "washoe_parcels.db"

# Nevada State Plane West (NAD83 feet) to WGS84 (lat/lon)
TRANSFORMER = Transformer.from_crs("EPSG:2769", "EPSG:4326", always_xy=True)

def transform_coordinates(x: float, y: float) -> Tuple[float, float]:
    """
    Transform Nevada State Plane coordinates to WGS84

    Args:
        x: X coordinate in State Plane (feet, NAD83)
        y: Y coordinate in State Plane (feet, NAD83)

    Returns:
        (longitude, latitude) in WGS84
    """
    if x is None or y is None:
        return None, None

    try:
        lon, lat = TRANSFORMER.transform(x, y)
        return lon, lat
    except Exception as e:
        print(f"ERROR transforming ({x}, {y}): {e}")
        return None, None

def test_transformation():
    """Test transformation with known address"""
    print("\n" + "="*60)
    print("TESTING COORDINATE TRANSFORMATION")
    print("="*60)

    # Test coordinate from database (should be Reno area)
    # Nevada State Plane West coordinates for downtown Reno area
    test_x, test_y = 2264101.995143, 14871920.15470144
    lon, lat = transform_coordinates(test_x, test_y)

    print(f"\nInput (State Plane): X={test_x}, Y={test_y}")
    print(f"Output (WGS84): Lon={lon:.4f}, Lat={lat:.4f}")
    print(f"Expected area: ~39.5°N (latitude), ~119.8°W (longitude)")

    if lat and 39 < lat < 40:
        print("✓ Latitude looks correct for Reno, NV")
    else:
        print("✗ WARNING: Latitude seems off")

    if lon and -120 < lon < -119:
        print("✓ Longitude looks correct for Reno, NV")
    else:
        print("✗ WARNING: Longitude seems off")

    return lon, lat

def verify_database_connection():
    """Verify database exists and is readable"""
    if not DB_PATH.exists():
        print(f"ERROR: Database not found at {DB_PATH}")
        sys.exit(1)

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Check for required columns
        cursor.execute("PRAGMA table_info(parcels)")
        columns = [row[1] for row in cursor.fetchall()]

        required = ['apn', 'centroid_lat', 'centroid_lon', 'property_address']
        missing = [col for col in required if col not in columns]

        if missing:
            print(f"ERROR: Missing columns in parcels table: {missing}")
            conn.close()
            sys.exit(1)

        conn.close()
        print(f"✓ Database connection verified: {DB_PATH}")
        return True
    except Exception as e:
        print(f"ERROR: Cannot open database: {e}")
        sys.exit(1)

def add_wgs84_columns():
    """Add WGS84 latitude/longitude columns if they don't exist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if columns already exist
    cursor.execute("PRAGMA table_info(parcels)")
    columns = [row[1] for row in cursor.fetchall()]

    if 'wgs84_lat' not in columns:
        print("\nAdding wgs84_lat column...")
        cursor.execute("ALTER TABLE parcels ADD COLUMN wgs84_lat REAL")
        conn.commit()
        print("✓ Added wgs84_lat")

    if 'wgs84_lon' not in columns:
        print("Adding wgs84_lon column...")
        cursor.execute("ALTER TABLE parcels ADD COLUMN wgs84_lon REAL")
        conn.commit()
        print("✓ Added wgs84_lon")

    conn.close()

def count_properties():
    """Count total properties in database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM parcels WHERE centroid_lat IS NOT NULL AND centroid_lon IS NOT NULL")
    count = cursor.fetchone()[0]
    conn.close()
    return count

def transform_all_properties(batch_size: int = 1000):
    """Transform all properties and update database"""

    total = count_properties()
    print(f"\n" + "="*60)
    print(f"TRANSFORMING {total:,} PROPERTIES")
    print("="*60)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Fetch all properties with coordinates
    cursor.execute("""
        SELECT apn, centroid_lat, centroid_lon, property_address
        FROM parcels
        WHERE centroid_lat IS NOT NULL AND centroid_lon IS NOT NULL
        ORDER BY apn
    """)

    rows = cursor.fetchall()
    failures = 0
    successes = 0

    print(f"\nProcessing {len(rows):,} properties...\n")

    # Process in batches
    for i, (apn, x, y, address) in enumerate(rows):
        lon, lat = transform_coordinates(x, y)

        if lon is not None and lat is not None:
            cursor.execute("""
                UPDATE parcels
                SET wgs84_lon = ?, wgs84_lat = ?
                WHERE apn = ?
            """, (lon, lat, apn))
            successes += 1
        else:
            failures += 1
            if failures <= 5:  # Only print first 5 failures
                print(f"  ✗ Failed to transform {apn}: {address}")

        # Commit in batches
        if (i + 1) % batch_size == 0:
            conn.commit()
            progress = (i + 1) / len(rows) * 100
            print(f"  [{i+1:,}/{len(rows):,}] {progress:.1f}% complete")

    # Final commit
    conn.commit()

    print(f"\n" + "="*60)
    print("TRANSFORMATION COMPLETE")
    print("="*60)
    print(f"✓ Success: {successes:,} properties")
    print(f"✗ Failures: {failures:,} properties")
    print(f"Total: {len(rows):,} properties")

    if failures > 0:
        print(f"\n⚠️  {failures} properties failed to transform (see above for details)")

    conn.close()

def verify_transformation():
    """Spot-check transformation results"""
    print(f"\n" + "="*60)
    print("VERIFYING TRANSFORMATION")
    print("="*60)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get a sample of transformed properties
    cursor.execute("""
        SELECT apn, property_address, wgs84_lat, wgs84_lon
        FROM parcels
        WHERE wgs84_lat IS NOT NULL AND wgs84_lon IS NOT NULL
        ORDER BY RANDOM()
        LIMIT 10
    """)

    print("\nSpot-check: 10 random transformed properties\n")
    print(f"{'APN':<10} {'Latitude':<12} {'Longitude':<12} {'Address':<40}")
    print("-" * 75)

    reno_count = 0
    for apn, address, lat, lon in cursor.fetchall():
        # Reno area is approximately 39.5°N, 119.8°W
        is_reno = 39 < lat < 40 and -120 < lon < -119
        reno_count += is_reno

        status = "✓" if is_reno else "?"
        address_short = address[:40] if address else "N/A"
        print(f"{apn:<10} {lat:<12.4f} {lon:<12.4f} {address_short:<40} {status}")

    print(f"\nProperties in Reno area: {reno_count}/10")

    conn.close()

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("NEVADA STATE PLANE TO WGS84 COORDINATE TRANSFORMATION")
    print("="*60)

    # Step 1: Verify database
    print("\nStep 1: Verifying database...")
    verify_database_connection()

    # Step 2: Test transformation
    print("\nStep 2: Testing transformation with known coordinates...")
    test_transformation()

    # Step 3: Add columns
    print("\nStep 3: Preparing database...")
    add_wgs84_columns()

    # Step 4: Transform all
    print("\nStep 4: Transforming all properties...")
    transform_all_properties()

    # Step 5: Verify results
    print("\nStep 5: Verifying transformation...")
    verify_transformation()

    print(f"\n" + "="*60)
    print("✓ TRANSFORMATION COMPLETE")
    print("="*60)
    print(f"\nDatabase updated: {DB_PATH}")
    print("New columns added: wgs84_lat, wgs84_lon")
    print("\nNext steps:")
    print("1. Run: python scripts/extract_properties.py")
    print("2. Manually verify extracted properties")
    print("3. Create curated database")

if __name__ == "__main__":
    main()
