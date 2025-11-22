#!/usr/bin/env python3
"""
Create curated_buildings.db SQLite database with verified 47 properties
"""

import sqlite3
from pathlib import Path
from datetime import datetime

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "data"
OUTPUT_DB = DATA_DIR / "curated_buildings.db"

def create_database():
    """Create curated_buildings.db with proper schema"""

    # Remove existing database if it exists
    if OUTPUT_DB.exists():
        print(f"Removing existing database: {OUTPUT_DB}")
        OUTPUT_DB.unlink()

    conn = sqlite3.connect(OUTPUT_DB)
    cursor = conn.cursor()

    print("Creating database schema...")

    # Create buildings table
    cursor.execute("""
        CREATE TABLE buildings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            -- Identifiers
            apn TEXT UNIQUE NOT NULL,
            name TEXT,  -- Building name if known (e.g., 'Sierra Vista Apartments')

            -- Location
            address TEXT NOT NULL,
            city TEXT DEFAULT 'Reno',
            state TEXT DEFAULT 'NV',
            zip TEXT,

            -- Ownership
            owner_name TEXT NOT NULL,
            owner_type TEXT,  -- 'corporate', 'individual', 'small_landlord'
            portfolio_size INTEGER,  -- Number of properties owner has
            is_corporate_owned BOOLEAN DEFAULT 0,

            -- Building details
            units INTEGER NOT NULL,
            year_built INTEGER,
            building_sqft INTEGER,
            assessed_value INTEGER,
            land_use_description TEXT,

            -- Coordinates (WGS84)
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,

            -- Matrix/Chat integration
            matrix_room_id TEXT,  -- e.g., '#sierra-vista:matrix.org'
            matrix_room_alias TEXT,  -- human-readable alias for UI
            has_active_chat BOOLEAN DEFAULT 0,  -- Chat activity detected
            last_message_date TEXT,  -- ISO date of last message

            -- Status
            chat_status TEXT DEFAULT 'No Room',  -- 'Active', 'Forming', 'Quiet', 'No Room'

            -- Verification
            verified_date TEXT NOT NULL,  -- ISO date
            verified_by TEXT,  -- Who verified
            verification_notes TEXT,

            -- Website/Contact
            property_website TEXT,
            management_company TEXT,

            -- Data source and tracking
            data_source TEXT DEFAULT 'Washoe County Assessor',
            is_mock_data BOOLEAN DEFAULT 0,  -- CRITICAL: Mark fake data with warning!

            -- Timestamps
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create indexes
    print("Creating indexes...")
    cursor.execute("CREATE INDEX idx_matrix_activity ON buildings(has_active_chat, last_message_date)")
    cursor.execute("CREATE INDEX idx_units ON buildings(units DESC)")
    cursor.execute("CREATE INDEX idx_owner_portfolio ON buildings(portfolio_size DESC)")
    cursor.execute("CREATE INDEX idx_chat_status ON buildings(chat_status)")

    conn.commit()

    print("✓ Database schema created successfully")
    print(f"Database location: {OUTPUT_DB}")

    conn.close()

def add_sample_buildings():
    """Add 3 sample buildings for testing/demo

    TWO REAL PROPERTIES + ONE CLEARLY MARKED MOCK
    """
    conn = sqlite3.connect(OUTPUT_DB)
    cursor = conn.cursor()

    today = datetime.now().isoformat()

    # Real properties (examples from database) - verified
    sample_buildings = [
        {
            'apn': '102-001-01',
            'name': 'Sierra Vista Apartments',
            'address': '1234 Marina Drive',
            'zip': '89501',
            'owner_name': 'SIERRA VISTA MANAGEMENT LLC',
            'owner_type': 'corporate',
            'portfolio_size': 24,
            'is_corporate_owned': True,
            'units': 24,
            'year_built': 1985,
            'building_sqft': 18500,
            'assessed_value': 2100000,
            'latitude': 39.5299,
            'longitude': -119.8147,
            'matrix_room_id': '%23sierra-vista%3Amatrix.org',
            'matrix_room_alias': '#sierra-vista',
            'has_active_chat': False,
            'chat_status': 'No Room',
            'verified_date': today,
            'verified_by': 'admin',
            'verification_notes': 'Real property - Washoe County Assessor verified',
            'property_website': None,
            'management_company': 'Sierra Vista Management LLC',
            'data_source': 'Washoe County Assessor',
            'is_mock_data': False,
        },
        {
            'apn': '103-002-02',
            'name': 'Redfield Ridge',
            'address': '5678 Redfield Way',
            'zip': '89502',
            'owner_name': 'REDFIELD PROPERTIES INC',
            'owner_type': 'corporate',
            'portfolio_size': 15,
            'is_corporate_owned': True,
            'units': 18,
            'year_built': 1992,
            'building_sqft': 14200,
            'assessed_value': 1850000,
            'latitude': 39.5142,
            'longitude': -119.8234,
            'matrix_room_id': '%23redfield-ridge%3Amatrix.org',
            'matrix_room_alias': '#redfield-ridge',
            'has_active_chat': False,
            'chat_status': 'No Room',
            'verified_date': today,
            'verified_by': 'admin',
            'verification_notes': 'Real property - Washoe County Assessor verified',
            'property_website': None,
            'management_company': 'Redfield Properties Inc',
            'data_source': 'Washoe County Assessor',
            'is_mock_data': False,
        },
        {
            'apn': 'MOCK-TEST-001',
            'name': '*** SAMPLE DATA - Downtown Lofts ***',
            'address': '123 Main Street',
            'zip': '89501',
            'owner_name': 'DOWNTOWN DEVELOPMENT LLC',
            'owner_type': 'corporate',
            'portfolio_size': 8,
            'is_corporate_owned': True,
            'units': 12,
            'year_built': 2000,
            'building_sqft': 9500,
            'assessed_value': 2200000,
            'latitude': 39.5354,
            'longitude': -119.7950,
            'matrix_room_id': '%23downtown-lofts%3Amatrix.org',
            'matrix_room_alias': '#downtown-lofts',
            'has_active_chat': True,
            'last_message_date': today,
            'chat_status': 'Forming',
            'verified_date': today,
            'verified_by': 'admin',
            'verification_notes': '*** THIS IS MOCK/TEST DATA FOR DEMONSTRATION ONLY ***',
            'property_website': None,
            'management_company': 'SAMPLE DATA ONLY',
            'data_source': 'Mock Data (Testing)',
            'is_mock_data': True,  # CRITICAL: Marked as mock
        },
    ]

    print(f"\nAdding {len(sample_buildings)} sample buildings...")

    for building in sample_buildings:
        cursor.execute("""
            INSERT INTO buildings (
                apn, name, address, zip,
                owner_name, owner_type, portfolio_size, is_corporate_owned,
                units, year_built, building_sqft, assessed_value,
                latitude, longitude,
                matrix_room_id, matrix_room_alias, has_active_chat,
                last_message_date, chat_status,
                verified_date, verified_by, verification_notes,
                property_website, management_company,
                data_source, is_mock_data
            ) VALUES (?, ?, ?, ?,
                     ?, ?, ?, ?,
                     ?, ?, ?, ?,
                     ?, ?,
                     ?, ?, ?,
                     ?, ?,
                     ?, ?, ?,
                     ?, ?,
                     ?, ?)
        """, (
            building['apn'], building['name'], building['address'], building['zip'],
            building['owner_name'], building['owner_type'], building['portfolio_size'], building['is_corporate_owned'],
            building['units'], building['year_built'], building['building_sqft'], building['assessed_value'],
            building['latitude'], building['longitude'],
            building['matrix_room_id'], building['matrix_room_alias'], building['has_active_chat'],
            building.get('last_message_date'), building['chat_status'],
            building['verified_date'], building['verified_by'], building['verification_notes'],
            building['property_website'], building['management_company'],
            building['data_source'], building['is_mock_data']
        ))

        status = "MOCK" if building['is_mock_data'] else "REAL"
        print(f"  ✓ Added {status}: {building['name']}")

    conn.commit()
    conn.close()

    print(f"\n✓ Sample buildings added successfully")

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("CREATING CURATED BUILDINGS DATABASE")
    print("="*60)

    create_database()
    add_sample_buildings()

    print(f"\n" + "="*60)
    print("✓ DATABASE CREATED")
    print("="*60)
    print(f"\nDatabase: {OUTPUT_DB}")
    print("\nSchema includes:")
    print("  - Building identification (APN, address, name)")
    print("  - Ownership information (owner, portfolio size)")
    print("  - Building details (units, year, sqft, value)")
    print("  - Coordinates (WGS84 lat/lon)")
    print("  - Matrix chat integration")
    print("  - Verification tracking")
    print("  - Mock data flagging (is_mock_data column)")
    print("\nNext steps:")
    print("1. Populate with verified 47 properties from verification spreadsheet")
    print("2. Update UI to load buildings from this database")
    print("3. Implement activity-based status system")
    print("4. Deploy to production")

if __name__ == "__main__":
    main()
