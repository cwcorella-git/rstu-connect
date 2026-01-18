#!/usr/bin/env python3
"""
Create Matrix rooms for RSTU organizing campaigns

This script:
1. Queries the database for top complexes
2. Creates Matrix rooms for each complex
3. Updates the database with room IDs
"""

import sqlite3
import requests
import os
import re
from pathlib import Path
from typing import List, Dict
import json
import time

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "data"
DB_PATH = DATA_DIR / "databases" / "main_properties.db"

# Matrix configuration
MATRIX_API = "https://matrix.org/_matrix/client/r0"

# Load from environment or prompt
def get_matrix_credentials():
    """Get Matrix access token and user ID"""

    # Try to load from .env file
    env_file = PROJECT_DIR / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if line.startswith("MATRIX_ACCESS_TOKEN="):
                    token = line.split("=", 1)[1].strip()
                elif line.startswith("MATRIX_USER_ID="):
                    user_id = line.split("=", 1)[1].strip()

        if token and user_id:
            print(f"✓ Loaded credentials from .env")
            print(f"  User: {user_id}")
            return token, user_id

    # Otherwise prompt
    print("\n⚠️  No .env file found. You'll need to enter credentials manually.")
    print("\nSee scripts/get_matrix_token.md for how to get your access token.\n")

    token = input("Matrix Access Token: ").strip()
    user_id = input("Matrix User ID (e.g., @username:matrix.org): ").strip()

    # Offer to save
    save = input("\nSave to .env file for future use? (y/n): ").strip().lower()
    if save == 'y':
        with open(env_file, 'w') as f:
            f.write(f"MATRIX_ACCESS_TOKEN={token}\n")
            f.write(f"MATRIX_USER_ID={user_id}\n")
        print(f"✓ Saved to {env_file}")
        print("⚠️  Make sure .env is in your .gitignore!")

    return token, user_id


def slugify(text: str) -> str:
    """Convert building name to URL-safe slug"""
    # Remove LLC, Inc, etc
    text = re.sub(r'\b(LLC|INC|CORPORATION|CORP|LTD|APARTMENTS?|APT)\b', '', text, flags=re.IGNORECASE)
    # Convert to lowercase and replace spaces/special chars
    text = re.sub(r'[^a-z0-9]+', '-', text.lower())
    # Remove leading/trailing dashes
    text = text.strip('-')
    return text


def create_room(building_name: str, address: str, token: str, user_id: str) -> Dict:
    """Create a Matrix room for a building"""

    alias = slugify(building_name)

    payload = {
        "room_alias_name": alias,
        "name": f"{building_name} Organizing",
        "topic": f"Tenant organizing for {address}",
        "preset": "private_chat",
        "visibility": "private",
        "initial_state": [
            {
                "type": "m.room.encryption",
                "state_key": "",
                "content": {"algorithm": "m.megolm.v1.aes-sha2"}
            },
            {
                "type": "m.room.join_rules",
                "state_key": "",
                "content": {"join_rule": "invite"}
            },
            {
                "type": "m.room.history_visibility",
                "state_key": "",
                "content": {"history_visibility": "invited"}
            }
        ]
    }

    try:
        response = requests.post(
            f"{MATRIX_API}/createRoom",
            json=payload,
            params={"access_token": token}
        )

        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "room_id": data["room_id"],
                "alias": f"#{alias}:matrix.org"
            }
        else:
            return {
                "success": False,
                "error": response.text
            }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_top_complexes(limit: int = 50) -> List[Dict]:
    """Get top N complexes by unit count from database"""

    if not DB_PATH.exists():
        print(f"❌ Database not found: {DB_PATH}")
        return []

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
            total_assessed_value
        FROM parcels
        WHERE units >= 20
          AND property_address IS NOT NULL
          AND property_address NOT LIKE '0 %'
        ORDER BY units DESC, total_assessed_value DESC
        LIMIT ?
    """, (limit,))

    complexes = []
    for row in cursor.fetchall():
        complexes.append({
            "apn": row[0],
            "address": row[1],
            "owner": row[2],
            "units": row[3],
            "year_built": row[4],
            "value": row[5]
        })

    conn.close()
    return complexes


def update_database_with_rooms(room_mappings: List[Dict]):
    """Update database with Matrix room IDs"""

    # Create or update curated_buildings table
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if matrix_room_id column exists
    cursor.execute("PRAGMA table_info(parcels)")
    columns = [col[1] for col in cursor.fetchall()]

    if 'matrix_room_id' not in columns:
        print("Adding matrix_room_id column to parcels table...")
        cursor.execute("ALTER TABLE parcels ADD COLUMN matrix_room_id TEXT")

    if 'matrix_room_alias' not in columns:
        print("Adding matrix_room_alias column to parcels table...")
        cursor.execute("ALTER TABLE parcels ADD COLUMN matrix_room_alias TEXT")

    # Update rows
    for mapping in room_mappings:
        if mapping['success']:
            cursor.execute("""
                UPDATE parcels
                SET matrix_room_id = ?,
                    matrix_room_alias = ?
                WHERE apn = ?
            """, (mapping['room_id'], mapping['alias'], mapping['apn']))

    conn.commit()
    conn.close()
    print(f"✓ Updated database with {len(room_mappings)} room IDs")


def main():
    print("=" * 60)
    print("RSTU Matrix Room Creation Script")
    print("=" * 60)

    # Get credentials
    print("\n1. Getting Matrix credentials...")
    try:
        token, user_id = get_matrix_credentials()
    except Exception as e:
        print(f"❌ Error getting credentials: {e}")
        return

    # Get complexes
    print("\n2. Querying database for top complexes...")
    limit = int(input("How many complexes to create rooms for? (default: 50): ").strip() or "50")
    complexes = get_top_complexes(limit)

    if not complexes:
        print("❌ No complexes found in database")
        return

    print(f"\n✓ Found {len(complexes)} complexes")
    print("\nTop 5:")
    for i, c in enumerate(complexes[:5], 1):
        print(f"  {i}. {c['address']} - {c['units']} units (Owner: {c['owner']})")

    # Confirm
    confirm = input(f"\nCreate {len(complexes)} Matrix rooms? (y/n): ").strip().lower()
    if confirm != 'y':
        print("Cancelled.")
        return

    # Create rooms
    print(f"\n3. Creating {len(complexes)} Matrix rooms...")
    print("   (This may take a few minutes - Matrix API has rate limits)")

    room_mappings = []
    success_count = 0

    for i, complex in enumerate(complexes, 1):
        building_name = complex['address'].split(',')[0]  # Use address as name

        print(f"\n[{i}/{len(complexes)}] {building_name}...")

        result = create_room(building_name, complex['address'], token, user_id)

        if result['success']:
            print(f"  ✓ Created: {result['alias']}")
            print(f"    Room ID: {result['room_id']}")
            success_count += 1

            room_mappings.append({
                "success": True,
                "apn": complex['apn'],
                "room_id": result['room_id'],
                "alias": result['alias'],
                "address": complex['address']
            })
        else:
            print(f"  ❌ Failed: {result['error']}")
            room_mappings.append({
                "success": False,
                "apn": complex['apn'],
                "error": result['error']
            })

        # Rate limiting - wait 1 second between requests
        if i < len(complexes):
            time.sleep(1)

    # Update database
    if success_count > 0:
        print(f"\n4. Updating database with {success_count} room IDs...")
        update_database_with_rooms([r for r in room_mappings if r['success']])

    # Save results to file
    output_file = DATA_DIR / "matrix_rooms_created.json"
    with open(output_file, 'w') as f:
        json.dump(room_mappings, f, indent=2)

    print(f"\n✓ Saved results to: {output_file}")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total complexes: {len(complexes)}")
    print(f"Rooms created: {success_count}")
    print(f"Failed: {len(complexes) - success_count}")

    if success_count > 0:
        print("\n✓ Matrix rooms are ready!")
        print("  Next steps:")
        print("  1. Update your website to load room IDs from database")
        print("  2. Invite tenant organizers to rooms")
        print("  3. Start organizing!")


if __name__ == "__main__":
    main()
