#!/usr/bin/env python3
"""
Extract enriched building data from SQLite databases for RSTU Connect.

This script queries multiple databases to compile comprehensive building
information including:
- Basic property data (main_properties.db)
- Landlord accountability scores (landlord_accountability.db)
- Organizing intelligence (property_intelligence.db)
- Organizing targets (organizing_targets.db)

Output: src/data/buildings-enriched.json
"""

import json
import sqlite3
import os
from datetime import datetime
from pathlib import Path

try:
    from pyproj import Transformer
    # Nevada State Plane West (NAD83 US feet) to WGS84
    COORD_TRANSFORMER = Transformer.from_crs("EPSG:3423", "EPSG:4326", always_xy=True)
except ImportError:
    print("WARNING: pyproj not installed. Coordinates will not be transformed.")
    COORD_TRANSFORMER = None

def transform_to_wgs84(sp_x, sp_y):
    """Transform Nevada State Plane coordinates to WGS84 (lat/lon)."""
    if COORD_TRANSFORMER is None or sp_x is None or sp_y is None:
        return None, None
    try:
        lon, lat = COORD_TRANSFORMER.transform(sp_x, sp_y)
        # Sanity check: Reno area is ~39.3-39.8°N, ~119.6-120.1°W
        if 39.3 < lat < 39.8 and -120.1 < lon < -119.6:
            return lat, lon
        else:
            print(f"  WARNING: Coordinates outside Reno area: {lat}, {lon}")
            return None, None
    except Exception as e:
        print(f"  ERROR transforming coordinates: {e}")
        return None, None

# Database paths
DB_DIR = Path(__file__).parent.parent / "data" / "databases"
MAIN_DB = DB_DIR / "main_properties.db"
ACCOUNTABILITY_DB = DB_DIR / "landlord_accountability.db"
INTELLIGENCE_DB = DB_DIR / "property_intelligence.db"
TARGETS_DB = DB_DIR / "organizing_targets.db"

# Output path
OUTPUT_PATH = Path(__file__).parent.parent / "src" / "data" / "buildings-enriched.json"

# Current buildings (APNs from page.tsx)
CURRENT_APNS = [
    "1221136", "726128", "726129", "726112", "754215", "726226",
    "8638040", "14021217", "2128106", "16309026", "2128107",
    "3917036", "16401004", "16320003", "1154411"
]

def get_connection(db_path):
    """Get SQLite connection if database exists."""
    if db_path.exists():
        return sqlite3.connect(str(db_path))
    return None

def fetch_main_properties(conn):
    """Fetch base property data from main_properties.db"""
    cursor = conn.cursor()

    # Build query for our APNs
    placeholders = ",".join(["?" for _ in CURRENT_APNS])
    query = f"""
        SELECT
            apn,
            property_address,
            owner_name,
            owner_address,
            legal_description,
            land_use_code,
            land_use_description,
            zoning,
            acres,
            assessed_land_value,
            assessed_improvement_value,
            total_assessed_value,
            year_built,
            building_square_feet,
            units,
            neighborhood,
            school_district,
            centroid_lat,
            centroid_lon
        FROM parcels
        WHERE apn IN ({placeholders})
    """

    cursor.execute(query, CURRENT_APNS)
    columns = [desc[0] for desc in cursor.description]

    results = {}
    for row in cursor.fetchall():
        data = dict(zip(columns, row))
        results[data['apn']] = data

    return results

def fetch_landlord_scores(conn, owner_names):
    """Fetch landlord accountability scores."""
    if not conn:
        return {}

    cursor = conn.cursor()
    scores = {}

    for owner in owner_names:
        # Try exact match first
        cursor.execute("""
            SELECT
                landlord_name,
                total_properties,
                total_units,
                organizing_priority,
                total_violations,
                critical_violations,
                open_violations,
                avg_days_to_resolution,
                violations_per_property,
                total_evictions,
                evictions_per_100_units,
                tenant_defense_rate,
                eviction_success_rate,
                habitability_score,
                tenant_rights_score,
                legal_compliance_score,
                overall_accountability_score,
                worst_landlord_ranking,
                media_attention_count
            FROM landlord_scorecards
            WHERE landlord_name LIKE ?
            LIMIT 1
        """, (f"%{owner.split()[0]}%",))

        row = cursor.fetchone()
        if row:
            columns = [desc[0] for desc in cursor.description]
            scores[owner] = dict(zip(columns, row))

    return scores

def fetch_intelligence(conn, apns):
    """Fetch organizing intelligence data."""
    if not conn:
        return {}

    cursor = conn.cursor()
    results = {}

    for apn in apns:
        cursor.execute("""
            SELECT
                organizing_priority,
                organizing_status,
                is_corporate_owned,
                portfolio_size,
                tenant_turnover_pattern,
                last_contact_date,
                campaign_notes,
                entity_type
            FROM properties
            WHERE apn = ?
            LIMIT 1
        """, (apn,))

        row = cursor.fetchone()
        if row:
            columns = [desc[0] for desc in cursor.description]
            results[apn] = dict(zip(columns, row))

    return results

def fetch_targets(conn, apns):
    """Fetch organizing targets data."""
    if not conn:
        return {}

    cursor = conn.cursor()
    results = {}

    for apn in apns:
        cursor.execute("""
            SELECT
                organizing_priority,
                estimated_tenants,
                corporate_landlord,
                landlord_portfolio_size,
                lat,
                lon
            FROM organizing_targets
            WHERE apn = ?
            LIMIT 1
        """, (apn,))

        row = cursor.fetchone()
        if row:
            columns = [desc[0] for desc in cursor.description]
            results[apn] = dict(zip(columns, row))

    return results

def calculate_mortgage_status(year_built):
    """Estimate mortgage status based on year built + 30 years."""
    if not year_built:
        return {"status": "unknown", "estimatedPayoffYear": None}

    current_year = datetime.now().year
    payoff_year = year_built + 30

    if payoff_year < current_year:
        return {"status": "likely_paid", "estimatedPayoffYear": payoff_year}
    else:
        return {"status": "likely_active", "estimatedPayoffYear": payoff_year}

def generate_chat_slug(address):
    """Generate a chat slug from address."""
    # Extract street portion
    street = address.split(",")[0] if "," in address else address
    # Normalize
    slug = street.lower()
    slug = slug.replace(" ", "-")
    slug = "".join(c for c in slug if c.isalnum() or c == "-")
    return f"rstu-{slug}"

def merge_building_data(main_data, accountability, intelligence, targets):
    """Merge all data sources into enriched building objects."""
    buildings = []

    for apn, base in main_data.items():
        # Start with base data
        building = {
            # Core fields (existing)
            "apn": apn,
            "address": base.get("property_address", ""),
            "owner": base.get("owner_name", ""),
            "units": base.get("units") or 0,
            "value": base.get("total_assessed_value") or 0,
            "yearBuilt": base.get("year_built"),
            "sqft": base.get("building_square_feet"),
            "chatSlug": generate_chat_slug(base.get("property_address", "")),

            # Extended property data
            "ownerAddress": base.get("owner_address"),
            "legalDescription": base.get("legal_description"),
            "landUseCode": base.get("land_use_code"),
            "landUseDescription": base.get("land_use_description"),
            "zoning": base.get("zoning"),
            "acres": base.get("acres"),
            "assessedLandValue": base.get("assessed_land_value"),
            "assessedImprovementValue": base.get("assessed_improvement_value"),
            "neighborhood": base.get("neighborhood"),
            "schoolDistrict": base.get("school_district"),
        }

        # Transform coordinates from State Plane to WGS84
        # Note: DB has centroid_lat=Y (northing), centroid_lon=X (easting)
        sp_x = base.get("centroid_lon")  # Easting
        sp_y = base.get("centroid_lat")  # Northing
        lat, lon = transform_to_wgs84(sp_x, sp_y)
        building["latitude"] = lat
        building["longitude"] = lon

        # Calculate mortgage status
        mortgage = calculate_mortgage_status(building["yearBuilt"])
        building["estimatedMortgageStatus"] = mortgage["status"]
        building["estimatedMortgageYear"] = mortgage["estimatedPayoffYear"]

        # Calculate value per unit
        if building["units"] and building["units"] > 0 and building["value"]:
            building["valuePerUnit"] = round(building["value"] / building["units"], 2)
        else:
            building["valuePerUnit"] = None

        # Add landlord accountability data
        owner = base.get("owner_name", "")
        if owner in accountability:
            scores = accountability[owner]
            building.update({
                "habitabilityScore": scores.get("habitability_score"),
                "tenantRightsScore": scores.get("tenant_rights_score"),
                "legalComplianceScore": scores.get("legal_compliance_score"),
                "overallAccountabilityScore": scores.get("overall_accountability_score"),
                "worstLandlordRanking": scores.get("worst_landlord_ranking"),
                "totalViolations": scores.get("total_violations"),
                "criticalViolations": scores.get("critical_violations"),
                "openViolations": scores.get("open_violations"),
                "avgDaysToResolution": scores.get("avg_days_to_resolution"),
                "violationsPerProperty": scores.get("violations_per_property"),
                "evictionsPer100Units": scores.get("evictions_per_100_units"),
                "tenantDefenseRate": scores.get("tenant_defense_rate"),
                "evictionSuccessRate": scores.get("eviction_success_rate"),
                "mediaAttentionCount": scores.get("media_attention_count"),
            })

        # Add intelligence data
        if apn in intelligence:
            intel = intelligence[apn]
            building.update({
                "organizingPriority": intel.get("organizing_priority"),
                "organizingStatus": intel.get("organizing_status"),
                "isCorporateOwned": bool(intel.get("is_corporate_owned")),
                "portfolioSize": intel.get("portfolio_size"),
                "tenantTurnoverPattern": intel.get("tenant_turnover_pattern"),
                "lastContactDate": intel.get("last_contact_date"),
                "campaignNotes": intel.get("campaign_notes"),
                "entityType": intel.get("entity_type"),
            })

        # Add targets data (may override some intel fields)
        if apn in targets:
            target = targets[apn]
            if target.get("organizing_priority"):
                building["organizingPriority"] = target.get("organizing_priority")
            building["estimatedTenants"] = target.get("estimated_tenants")
            if target.get("corporate_landlord") is not None:
                building["isCorporateOwned"] = bool(target.get("corporate_landlord"))
            if target.get("landlord_portfolio_size"):
                building["landlordPortfolioSize"] = target.get("landlord_portfolio_size")
            # Note: targets table may have raw State Plane coords too
            # Only use if our transformed coords are missing
            if building["latitude"] is None and target.get("lat") and target.get("lon"):
                target_lat, target_lon = transform_to_wgs84(target.get("lon"), target.get("lat"))
                if target_lat and target_lon:
                    building["latitude"] = target_lat
                    building["longitude"] = target_lon

        buildings.append(building)

    # Sort by units descending
    buildings.sort(key=lambda b: b.get("units", 0), reverse=True)

    return buildings

def main():
    print("Extracting building data from databases...")

    # Connect to databases
    main_conn = get_connection(MAIN_DB)
    if not main_conn:
        print(f"ERROR: Main database not found at {MAIN_DB}")
        return

    accountability_conn = get_connection(ACCOUNTABILITY_DB)
    intelligence_conn = get_connection(INTELLIGENCE_DB)
    targets_conn = get_connection(TARGETS_DB)

    try:
        # Fetch data
        print(f"  - Fetching from main_properties.db...")
        main_data = fetch_main_properties(main_conn)
        print(f"    Found {len(main_data)} properties")

        # Get owner names for accountability lookup
        owner_names = list(set(d.get("owner_name", "") for d in main_data.values() if d.get("owner_name")))

        print(f"  - Fetching landlord accountability data...")
        accountability = fetch_landlord_scores(accountability_conn, owner_names)
        print(f"    Found {len(accountability)} landlord records")

        print(f"  - Fetching organizing intelligence...")
        intelligence = fetch_intelligence(intelligence_conn, CURRENT_APNS)
        print(f"    Found {len(intelligence)} intelligence records")

        print(f"  - Fetching organizing targets...")
        targets = fetch_targets(targets_conn, CURRENT_APNS)
        print(f"    Found {len(targets)} target records")

        # Merge all data
        print("  - Merging data...")
        buildings = merge_building_data(main_data, accountability, intelligence, targets)

        # Ensure output directory exists
        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

        # Write output
        output = {
            "generated": datetime.now().isoformat(),
            "buildingCount": len(buildings),
            "buildings": buildings
        }

        with open(OUTPUT_PATH, "w") as f:
            json.dump(output, f, indent=2)

        print(f"\n✅ Generated {OUTPUT_PATH}")
        print(f"   {len(buildings)} buildings with enriched data")

    finally:
        main_conn.close()
        if accountability_conn:
            accountability_conn.close()
        if intelligence_conn:
            intelligence_conn.close()
        if targets_conn:
            targets_conn.close()

if __name__ == "__main__":
    main()
