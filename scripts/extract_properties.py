#!/usr/bin/env python3
"""
Extract 47 properties using stratified sampling strategy
- 15 large multi-unit (20-100 units)
- 15 medium multi-unit (5-19 units)
- 12 corporate single-family (1-4 units, corporate owner with 5+ properties)
- 5 small landlords (2-4 units, non-corporate)
"""

import sqlite3
import csv
from pathlib import Path
from typing import List, Dict

# Database path
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "data"
DB_PATH = DATA_DIR / "databases" / "washoe_parcels.db"
OUTPUT_CSV = DATA_DIR / "extracted_47_properties.csv"

def get_db_connection():
    """Create database connection"""
    return sqlite3.connect(DB_PATH)

def extract_large_multiunits(limit: int = 15) -> List[Dict]:
    """Extract 15 large multi-unit properties (20-100 units)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            apn,
            property_address,
            owner_name,
            units,
            year_built,
            building_square_feet,
            total_assessed_value,
            wgs84_lat,
            wgs84_lon,
            'large' as category
        FROM parcels
        WHERE units BETWEEN 20 AND 100
          AND property_address NOT LIKE '0 %'
          AND property_address IS NOT NULL
          AND wgs84_lat IS NOT NULL
          AND wgs84_lon IS NOT NULL
        ORDER BY units DESC, total_assessed_value DESC
        LIMIT ?
    """, (limit,))

    properties = []
    for row in cursor.fetchall():
        properties.append({
            'apn': row[0],
            'address': row[1],
            'owner_name': row[2],
            'units': row[3],
            'year_built': row[4],
            'sqft': row[5],
            'assessed_value': row[6],
            'lat': row[7],
            'lon': row[8],
            'category': row[9]
        })

    conn.close()
    return properties

def extract_medium_multiunits(limit: int = 15) -> List[Dict]:
    """Extract 15 medium multi-unit properties (5-19 units)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            apn,
            property_address,
            owner_name,
            units,
            year_built,
            building_square_feet,
            total_assessed_value,
            wgs84_lat,
            wgs84_lon,
            'medium' as category
        FROM parcels
        WHERE units BETWEEN 5 AND 19
          AND property_address NOT LIKE '0 %'
          AND property_address IS NOT NULL
          AND wgs84_lat IS NOT NULL
          AND wgs84_lon IS NOT NULL
        ORDER BY units DESC, total_assessed_value DESC
        LIMIT ?
    """, (limit,))

    properties = []
    for row in cursor.fetchall():
        properties.append({
            'apn': row[0],
            'address': row[1],
            'owner_name': row[2],
            'units': row[3],
            'year_built': row[4],
            'sqft': row[5],
            'assessed_value': row[6],
            'lat': row[7],
            'lon': row[8],
            'category': row[9]
        })

    conn.close()
    return properties

def extract_corporate_singlefamily(limit: int = 12) -> List[Dict]:
    """Extract 12 corporate single-family properties"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # First, get list of corporate owners with 5+ properties
    cursor.execute("""
        SELECT owner_name, COUNT(*) as portfolio_count
        FROM parcels
        WHERE units BETWEEN 1 AND 4
          AND property_address NOT LIKE '0 %'
          AND property_address IS NOT NULL
        GROUP BY owner_name
        HAVING COUNT(*) >= 5
        ORDER BY COUNT(*) DESC
    """)

    corporate_owners = [row[0] for row in cursor.fetchall()]

    if not corporate_owners:
        print("WARNING: No corporate single-family owners found")
        return []

    # Now get specific properties from these owners
    placeholders = ','.join(['?' for _ in corporate_owners])

    cursor.execute(f"""
        SELECT
            apn,
            property_address,
            owner_name,
            units,
            year_built,
            building_square_feet,
            total_assessed_value,
            wgs84_lat,
            wgs84_lon,
            'corporate_sf' as category
        FROM parcels
        WHERE units BETWEEN 1 AND 4
          AND owner_name IN ({placeholders})
          AND property_address NOT LIKE '0 %'
          AND property_address IS NOT NULL
          AND wgs84_lat IS NOT NULL
          AND wgs84_lon IS NOT NULL
        ORDER BY RANDOM()
        LIMIT ?
    """, corporate_owners + [limit])

    properties = []
    for row in cursor.fetchall():
        properties.append({
            'apn': row[0],
            'address': row[1],
            'owner_name': row[2],
            'units': row[3],
            'year_built': row[4],
            'sqft': row[5],
            'assessed_value': row[6],
            'lat': row[7],
            'lon': row[8],
            'category': row[9]
        })

    conn.close()
    return properties

def extract_small_landlords(limit: int = 5) -> List[Dict]:
    """Extract 5 small landlord properties (2-4 units, non-corporate)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            apn,
            property_address,
            owner_name,
            units,
            year_built,
            building_square_feet,
            total_assessed_value,
            wgs84_lat,
            wgs84_lon,
            'small_landlord' as category
        FROM parcels
        WHERE units BETWEEN 2 AND 4
          AND owner_name NOT LIKE '%LLC%'
          AND owner_name NOT LIKE '%INC%'
          AND owner_name NOT LIKE '%CORP%'
          AND owner_name NOT LIKE '%LTD%'
          AND property_address NOT LIKE '0 %'
          AND property_address IS NOT NULL
          AND wgs84_lat IS NOT NULL
          AND wgs84_lon IS NOT NULL
        ORDER BY RANDOM()
        LIMIT ?
    """, (limit,))

    properties = []
    for row in cursor.fetchall():
        properties.append({
            'apn': row[0],
            'address': row[1],
            'owner_name': row[2],
            'units': row[3],
            'year_built': row[4],
            'sqft': row[5],
            'assessed_value': row[6],
            'lat': row[7],
            'lon': row[8],
            'category': row[9]
        })

    conn.close()
    return properties

def export_to_csv(properties: List[Dict]):
    """Export properties to CSV for manual verification"""
    with open(OUTPUT_CSV, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'apn', 'address', 'owner_name', 'units', 'year_built',
            'sqft', 'assessed_value', 'lat', 'lon', 'category',
            'address_verified', 'owner_verified', 'details_verified',
            'coords_verified', 'notes'
        ])
        writer.writeheader()

        for prop in properties:
            writer.writerow({
                **prop,
                'address_verified': '',
                'owner_verified': '',
                'details_verified': '',
                'coords_verified': '',
                'notes': ''
            })

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EXTRACTING 47 PROPERTIES - STRATIFIED SAMPLE")
    print("="*60)

    print("\nExtracting properties...")

    # Extract each category
    print("  Extracting large multi-unit (20-100 units)...")
    large = extract_large_multiunits(15)
    print(f"    ✓ Found {len(large)} properties")

    print("  Extracting medium multi-unit (5-19 units)...")
    medium = extract_medium_multiunits(15)
    print(f"    ✓ Found {len(medium)} properties")

    print("  Extracting corporate single-family (1-4 units, 5+ portfolio)...")
    corporate_sf = extract_corporate_singlefamily(12)
    print(f"    ✓ Found {len(corporate_sf)} properties")

    print("  Extracting small landlords (2-4 units, non-corporate)...")
    small = extract_small_landlords(5)
    print(f"    ✓ Found {len(small)} properties")

    # Combine
    all_properties = large + medium + corporate_sf + small

    print(f"\n" + "="*60)
    print(f"TOTAL: {len(all_properties)} properties extracted")
    print("="*60)

    print(f"\nBreakdown:")
    print(f"  Large multi-unit (20-100 units): {len(large)}")
    print(f"  Medium multi-unit (5-19 units): {len(medium)}")
    print(f"  Corporate single-family: {len(corporate_sf)}")
    print(f"  Small landlords: {len(small)}")

    # Export to CSV
    print(f"\nExporting to CSV for verification...")
    export_to_csv(all_properties)
    print(f"✓ Exported to: {OUTPUT_CSV}")

    print(f"\n" + "="*60)
    print("NEXT STEPS:")
    print("="*60)
    print("1. Open extracted_47_properties.csv in spreadsheet")
    print("2. Fill in verification columns:")
    print("   - address_verified: Y/N (Google Maps)")
    print("   - owner_verified: Y/N (Nevada SOS search)")
    print("   - details_verified: Y/N (year, units, value)")
    print("   - coords_verified: Y/N (lat/lon on map)")
    print("3. Add any notes in notes column")
    print("4. Save completed verification spreadsheet")
    print("5. Run: python scripts/create_curated_buildings.py")

if __name__ == "__main__":
    main()
