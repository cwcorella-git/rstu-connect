#!/usr/bin/env python3
"""
Scrape property marketing names from apartments.com based on addresses.
Updates property-names.json with discovered names.
"""

import json
import re
import sqlite3
import time
import urllib.parse
import urllib.request
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "databases" / "main_properties.db"
NAMES_JSON = Path(__file__).parent.parent / "src" / "data" / "property-names.json"
CACHE_FILE = Path(__file__).parent.parent / "data" / "scraped-names-cache.json"

# Rate limiting
REQUEST_DELAY = 2.0  # seconds between requests

# User agent to avoid blocks
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}


def load_cache() -> dict:
    """Load previously scraped results."""
    if CACHE_FILE.exists():
        with open(CACHE_FILE) as f:
            return json.load(f)
    return {}


def save_cache(cache: dict):
    """Save scraped results to cache."""
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f, indent=2)


def normalize_address(addr: str) -> str:
    """Normalize address for searching."""
    # Remove unit numbers, clean up
    addr = re.sub(r'\s+(APT|UNIT|STE|#)\s*\S+', '', addr, flags=re.IGNORECASE)
    addr = re.sub(r'\s+\d+$', '', addr)  # Trailing unit numbers
    return addr.strip()


def search_apartments_com(address: str, city: str = "Reno", state: str = "NV") -> str | None:
    """
    Search apartments.com for a property by address.
    Returns the property name if found.
    """
    # Build search URL
    query = f"{address} {city} {state}"
    encoded_query = urllib.parse.quote(query)
    url = f"https://www.apartments.com/services/search/?query={encoded_query}"

    # Also try direct address search
    addr_slug = re.sub(r'[^a-z0-9]+', '-', address.lower()).strip('-')
    direct_url = f"https://www.apartments.com/{addr_slug}-{city.lower()}-{state.lower()}/"

    try:
        # Try search API first
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as response:
            data = response.read().decode('utf-8')

            # Parse JSON response
            try:
                results = json.loads(data)
                if results and isinstance(results, list) and len(results) > 0:
                    for result in results:
                        if 'name' in result and result.get('type') == 'property':
                            name = result['name']
                            # Skip if it's just the address
                            if not re.match(r'^\d+\s+', name):
                                return name
            except json.JSONDecodeError:
                pass

    except Exception as e:
        pass

    # Try scraping the direct URL
    try:
        req = urllib.request.Request(direct_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')

            # Look for property name in title or og:title
            title_match = re.search(r'<title>([^<]+)</title>', html)
            if title_match:
                title = title_match.group(1)
                # Extract name before " - Apartments"
                name_match = re.match(r'^([^-|]+)', title)
                if name_match:
                    name = name_match.group(1).strip()
                    # Skip if it's just address or generic
                    if not re.match(r'^\d+\s+', name) and name not in ['Apartments', 'Apartment']:
                        return name

            # Try og:title
            og_match = re.search(r'property="og:title"\s+content="([^"]+)"', html)
            if og_match:
                name = og_match.group(1).split('|')[0].split('-')[0].strip()
                if not re.match(r'^\d+\s+', name) and len(name) > 3:
                    return name

    except Exception as e:
        pass

    return None


def search_google_places(address: str) -> str | None:
    """
    Search via Google (scraping, no API key needed).
    Returns property name if found.
    """
    query = f"{address} Reno NV apartments"
    encoded = urllib.parse.quote(query)
    url = f"https://www.google.com/search?q={encoded}"

    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')

            # Look for property names in search results
            # Pattern: property names often appear in bold or title tags
            patterns = [
                r'<h3[^>]*>([^<]+)</h3>',  # Search result titles
                r'"name"\s*:\s*"([^"]+)"',  # JSON-LD data
            ]

            for pattern in patterns:
                matches = re.findall(pattern, html)
                for match in matches:
                    # Clean up and validate
                    name = match.strip()
                    # Skip if it's an address, generic, or too short
                    if (not re.match(r'^\d+\s+', name) and
                        len(name) > 3 and
                        'apartment' not in name.lower() and
                        'zillow' not in name.lower() and
                        'rent' not in name.lower()):
                        return name

    except Exception as e:
        pass

    return None


def get_needs_research() -> list[dict]:
    """Get properties that need name research."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Load existing names to skip
    existing = set()
    if NAMES_JSON.exists():
        with open(NAMES_JSON) as f:
            data = json.load(f)
            existing = set(data.get('names', {}).keys())

    # Get large properties without names
    cur.execute("""
        SELECT apn, property_address, owner_name, units
        FROM parcels
        WHERE units >= 20
          AND owner_name NOT LIKE '%APARTMENT%'
          AND owner_name NOT LIKE '%VILLAGE%'
          AND owner_name NOT LIKE '%MANOR%'
          AND owner_name NOT LIKE '%TERRACE%'
          AND owner_name NOT LIKE '%GARDEN%'
          AND owner_name NOT LIKE '%ESTATE%'
          AND owner_name NOT LIKE '%CASINO%'
          AND owner_name NOT LIKE '%RESORT%'
          AND owner_name NOT LIKE '%HOTEL%'
          AND owner_name NOT LIKE '%STORAGE%'
          AND owner_name NOT LIKE '%UNIVERSITY%'
          AND owner_name NOT LIKE '%COUNTY%'
        ORDER BY units DESC
    """)

    results = []
    for row in cur.fetchall():
        apn = row['apn']
        if apn not in existing:
            results.append({
                'apn': apn,
                'address': row['property_address'],
                'owner': row['owner_name'],
                'units': row['units']
            })

    conn.close()
    return results


def main():
    print("=== Property Name Scraper ===\n")

    # Load cache
    cache = load_cache()

    # Get properties needing research
    properties = get_needs_research()
    print(f"Properties to research: {len(properties)}")

    # Skip already cached
    to_scrape = [p for p in properties if p['apn'] not in cache]
    print(f"Already cached: {len(properties) - len(to_scrape)}")
    print(f"To scrape: {len(to_scrape)}\n")

    if not to_scrape:
        print("Nothing new to scrape!")
        return

    # Limit to avoid too many requests
    MAX_REQUESTS = 50
    to_scrape = to_scrape[:MAX_REQUESTS]

    found = 0
    not_found = 0

    for i, prop in enumerate(to_scrape):
        apn = prop['apn']
        address = normalize_address(prop['address'])

        print(f"[{i+1}/{len(to_scrape)}] {address} ({prop['units']} units)...", end=" ", flush=True)

        # Try apartments.com first
        name = search_apartments_com(address)

        if not name:
            # Try Google as backup
            time.sleep(1)
            name = search_google_places(address)

        if name:
            print(f"✓ {name}")
            cache[apn] = {
                'name': name,
                'address': prop['address'],
                'units': prop['units'],
                'source': 'scraped'
            }
            found += 1
        else:
            print("✗ not found")
            cache[apn] = {
                'name': None,
                'address': prop['address'],
                'units': prop['units'],
                'source': 'scraped'
            }
            not_found += 1

        # Save cache periodically
        if (i + 1) % 10 == 0:
            save_cache(cache)

        # Rate limit
        time.sleep(REQUEST_DELAY)

    # Final save
    save_cache(cache)

    print(f"\n=== Results ===")
    print(f"Found: {found}")
    print(f"Not found: {not_found}")
    print(f"Cache saved to: {CACHE_FILE}")

    # Show found names
    if found > 0:
        print(f"\n=== Found Names ===")
        for apn, data in cache.items():
            if data.get('name'):
                print(f"  {data['name']:30} | {data['address']}")

        print(f"\nTo add these to property-names.json, run:")
        print(f"  python3 scripts/merge-scraped-names.py")


if __name__ == '__main__':
    main()
