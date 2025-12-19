#!/usr/bin/env python3
"""
Extract property names from owner names and other data.
Outputs a CSV of properties that need manual research.
"""

import sqlite3
import re
import json
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "databases" / "main_properties.db"
OUTPUT_JSON = Path(__file__).parent.parent / "src" / "data" / "property-names.json"
NEEDS_RESEARCH_CSV = Path(__file__).parent.parent / "data" / "needs-name-research.csv"

# Manual overrides for known property names (APN -> name)
MANUAL_NAMES = {
    # Featured 15 buildings (already researched)
    "1221136": "Gage Village",
    "726128": "Circus Circus Reno",
    "726112": "Circus Circus Reno",
    "726129": "Circus Circus Reno",
    "754215": "J Resort",
    "726226": "Circus Circus Reno",
    "8638040": "The Lakes at Lemmon Valley",
    "14021217": "Palomino",
    "2128106": "Rosewood Park",
    "16309026": "Double R",
    "2128107": "Rosewood Park",
    "3917036": "Montebello at Summit Ridge",
    "16401004": "The Enclave",
    "16320003": "Vintage at South Meadows",
    "1154411": "The Montage",
    # Casinos/Hotels (not residential - mark to filter)
    "1925018": "_CASINO_",  # Peppermill
    "2025458": "_CASINO_",  # Atlantis
    "3217228": "_CASINO_",  # Nugget
    "729229": "_CASINO_",   # Eldorado
    "729438": "_CASINO_",   # Eldorado
    "3843002": "_CASINO_",  # Boomtown
    "12303101": "_CASINO_", # MontBleu
    "3701304": "_CASINO_",  # Western Village
    "3701305": "_CASINO_",  # Western Village
    # Storage facilities (not residential)
    "14423213": "_STORAGE_",
    "23814005": "_STORAGE_",
    "16008404": "_STORAGE_",
    "1705101": "_STORAGE_",
    # Healthcare (not residential)
    "725610": "_HEALTHCARE_",
    "720223": "_HEALTHCARE_",
    "752201": "_HEALTHCARE_",
    # Government/University
    "307025": "_GOVT_",
    "8614401": "_GOVT_",
    # The Montage (condo building - multiple APNs)
    "1154420": "The Montage",
    "1154421": "The Montage",
    "1154422": "The Montage",
    "1154423": "The Montage",
    "1154424": "The Montage",
    "1154623": "The Montage",
    "1154624": "The Montage",
    "1155020": "The Montage",
    "1155121": "The Montage",
    "1155221": "The Montage",
    "1155320": "The Montage",
    "1155421": "The Montage",
    "1155520": "The Montage",
    "1155621": "The Montage",
    "1155721": "The Montage",
    "1155821": "The Montage",
    "1155921": "The Montage",
    "1156021": "The Montage",
    "1156121": "The Montage",
    "1156221": "The Montage",
    "1156321": "The Montage",
    "1156420": "The Montage",
    "1156517": "The Montage",
    "1156602": "The Montage",
    "1159014": "The Montage",
    "1159417": "The Montage",
    "1159502": "The Montage",
    # Researched 2024-12-17
    "1107126": "Reno City Center",           # 200 UNIVERSITY WAY
    "52001217": "Rowan",                      # 6026 GOLDEN TRIANGLE WAY
    "1522079": "Atwood at RED",               # 2060 EXPERIENCE AVE
    "8639032": "North Peak",                  # 8001 MILITARY RD
    "16007026": "The Alexander",              # 11380 S VIRGINIA ST
    "40030101": "The Retreat",                # 1100 SOLITUDE TRAIL
    "1207136": "Riverwood",                   # 805 KUENZLI ST
    "2549115": "Halcyon",                     # 825 E PATRIOT BLVD
    "52833020": "Lumina at Spanish Springs",  # 6600 ROLLING MEADOWS DR
    "40004005": "The Peak at Sky Mountain",   # 1675 SKY MOUNTAIN DR
    "21214102": "Vida",                       # 6900 SHARLANDS AVE
    "3024182": "Eastland Hills",              # 1855 BARING BLVD
    "3702072": "Azure",                       # 550 MARINA GATEWAY DR
    "40004002": "Apex at Sky Valley",         # 1555 SKY VALLEY DR
    "802111": "The Villager",                 # 575 SADLEIR WAY
    "16401006": "Hillview Terrace",           # 8200 OFFENHAUSER DR
    "14101047": "Harvest at Damonte Ranch",   # 1851 STEAMBOAT PKWY
    "14101044": "Harvest at Damonte Ranch",   # 1851 STEAMBOAT PKWY (Phase III)
    "14101043": "Harvest at Damonte Ranch",   # 1851 STEAMBOAT PKWY (Phase II)
    "16401005": "The Verge",                  # 8000 OFFENHAUSER DR
    "40004013": "The Boulders",               # 4775 SUMMIT RIDGE DR
    "51434017": "High Rock 5300",             # 5300 S LOS ALTOS PKWY
    "1522065": "Emory at RED",                # 2020 RED DR
    "20002005": "Club Ambassador",            # 6402 MAE ANNE AVE
    # Researched 2024-12-19 (via web search)
    "701513": "The Dean Reno",                 # 1475 N VIRGINIA ST (196 units)
    "315029": "Park Place at Reno",            # 1651 N VIRGINIA ST (267 units)
    "315020": "LEV Apartments",                # 1617 N VIRGINIA ST (128 units)
    "316015": "Uncommon Reno",                 # 1669 N VIRGINIA ST (125 units)
    "701113": "Fifteen51",                     # 1551 N VIRGINIA ST (100 units)
    "1106119": "Nevadan Tower",                # 133 N VIRGINIA ST (182 units)
    "1106211": "The Virginian",                # 140 N VIRGINIA ST (120 units)
    "1106221": "The Virginian",                # 130 N VIRGINIA ST (120 units)
    # Batch 2 - 2024-12-19
    "1933201": "Sundance West",                # 3245 CLOVER WAY (278 units)
    "16226001": "Elysium",                     # 11700 SOUTH HILLS DR (271 units)
    "4222302": "Aspen Ridge",                  # 1555 RIDGEVIEW DR (260 units)
    "1112610": "ParcOne60",                    # 160 SINCLAIR ST (258 units)
    "2602151": "Boulder Creek",                # 4005 MOORPARK CT (250 units)
    "20216003": "Austin Crest",                # 1295 GRAND SUMMIT DR (249 units)
    "727443": "The Onyx at 695",               # 695 3RD ST (240 units)
    "730122": "Reno Regency",                  # 590 LAKE ST (238 units)
    "1104212": "The Westlyn",                  # 118 WEST ST (238 units)
    "2628503": "Sand Pebble Spanish Oaks",     # 1877 EL RANCHO DR (236 units)
    "413093": "The Edison",                    # 2450 VALLEY RD (232 units)
    "2101001": "Bristle Pointe",               # 2050 LONGLEY LN (224 units)
    "1530306": "2300 West",                    # 2300 HARVARD WAY (220 units)
    "2618266": "Sagecliff",                    # 2777 NORTHTOWNE LN (220 units)
    "52802048": "Seasons at Stonebrook",       # 7755 TIERRA DEL SOL PKWY (217 units)
    "408160": "The View",                      # 1195 SELMI DR (216 units)
    "3843055": "The Kallan",                   # 350 BOOMTOWN GARSON RD (243 units)
    # Batch 3 - 2024-12-19
    "413081": "The Highlands",                 # 2800 ENTERPRISE RD (216 units)
    "1308317": "The Rivet",                    # 2050 MARKET ST (216 units)
    "2644132": "Sierra Woods",                 # 2244 GREENBRAE DR (215 units)
    "2644131": "Sierra Woods",                 # 2244 GREENBRAE DR (88 units)
    "2034107": "Peaks at the Park",            # 950 NUTMEG PL (213 units)
    "2628502": "Sand Pebble Spanish Oaks",     # 1855 EL RANCHO DR A (212 units)
    "51048208": "Vineyards at Galleria",       # 290 DISC DR (211 units)
}

# APNs to exclude from the list entirely (not residential apartments)
EXCLUDE_APNS = {apn for apn, name in MANUAL_NAMES.items() if name.startswith('_')}

# Words to strip from owner names when extracting property name
STRIP_SUFFIXES = [
    r'\s+LLC$', r'\s+LP$', r'\s+LTD$', r'\s+INC$', r'\s+CORP$',
    r'\s+PTSP$', r'\s+et al$', r'\s+SPE$', r'\s+DST$',
    r'\s+HOLDINGS$', r'\s+PROPERTIES$', r'\s+PROPERTY$',
    r'\s+INVESTORS$', r'\s+INVESTMENTS$', r'\s+ASSOCIATES$',
    r'\s+PARTNERS$', r'\s+VENTURES?$', r'\s+GROUP$',
    r'\s+OWNER$', r'\s+OWNERS$', r'\s+MASTER$',
    r'\s+RENO$', r'\s+SPARKS$', r'\s+NV$', r'\s+NEVADA$',
    r'\s+I+$', r'\s+[IVX]+$',  # Roman numerals
    r'\s+\d+$',  # Trailing numbers
    r'\s+PHASE\s+\w+$',
]

# Patterns that indicate property name is in owner name
NAME_INDICATORS = [
    'APARTMENTS', 'APARTMENT', 'APTS',
    'VILLAGE', 'VILLAS', 'VILLA',
    'TERRACE', 'TERRACES',
    'MANOR', 'MANORS',
    'GARDENS', 'GARDEN',
    'ESTATES', 'ESTATE',
    'MEADOWS', 'MEADOW',
    'HEIGHTS', 'RIDGE', 'SUMMIT',
    'CREEK', 'LAKE', 'LAKES',
    'PARK', 'PLACE', 'PLAZA',
    'CROSSING', 'CROSSINGS',
    'POINTE', 'POINT',
    'CANYON', 'BLUFFS', 'HILLS',
    'VINTAGE', 'OVERLOOK',
]

# Owner name patterns to skip (not extractable)
SKIP_PATTERNS = [
    r'^[A-Z]\s*&\s*[A-Z]\s+',  # "B & D PROPERTIES"
    r'TRUST$',
    r'^HOUSING AUTHORITY',
    r'^UNIVERSITY OF',
    r'^UNITED STATES',
    r'^WASHOE COUNTY',
    r'^CITY OF',
    r'HEALTHCARE',
    r'STORAGE',
    r'SELF STORAGE',
    r'CASINO',
    r'RESORT',
    r'HOTEL',
    r'MOTOR INN',
]


def extract_name_from_owner(owner: str) -> str | None:
    """Try to extract a property name from owner name."""
    if not owner:
        return None

    # Check skip patterns
    for pattern in SKIP_PATTERNS:
        if re.search(pattern, owner, re.IGNORECASE):
            return None

    # Check if owner contains name indicators
    has_indicator = any(ind in owner.upper() for ind in NAME_INDICATORS)
    if not has_indicator:
        return None

    # Extract the name part
    name = owner.upper()

    # Strip suffixes iteratively
    changed = True
    while changed:
        changed = False
        for suffix in STRIP_SUFFIXES:
            new_name = re.sub(suffix, '', name, flags=re.IGNORECASE).strip()
            if new_name != name:
                name = new_name
                changed = True

    # Clean up
    name = re.sub(r'\s+', ' ', name).strip()

    # Title case
    name = name.title()

    # Fix common words
    name = name.replace(' At ', ' at ')
    name = name.replace(' By ', ' by ')
    name = name.replace(' Of ', ' of ')
    name = name.replace(' The ', ' the ')
    name = name.replace(' On ', ' on ')

    # Don't return if too short or just numbers
    if len(name) < 3 or name.isdigit():
        return None

    # Don't return generic names
    generic = ['Apartments', 'Properties', 'Reno', 'Sparks', 'Owner', 'Master']
    if name in generic:
        return None

    return name


def get_property_name(apn: str, owner: str, address: str, units: int) -> tuple[str | None, str]:
    """
    Get property name with source.
    Returns (name, source) where source is 'manual', 'extracted', 'address', 'excluded', or 'needs_research'
    """
    # Check if excluded (casinos, storage, healthcare, etc.)
    if apn in EXCLUDE_APNS:
        return None, 'excluded'

    # Check manual overrides first
    if apn in MANUAL_NAMES:
        return MANUAL_NAMES[apn], 'manual'

    # Try to extract from owner name
    extracted = extract_name_from_owner(owner)
    if extracted:
        return extracted, 'extracted'

    # For small properties (< 10 units), just use address
    if units < 10:
        return None, 'address'

    # Larger properties need research
    return None, 'needs_research'


def main():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    cur = db.cursor()

    # Get all multi-unit properties
    cur.execute("""
        SELECT apn, owner_name, property_address, units
        FROM parcels
        WHERE units >= 2
        ORDER BY units DESC
    """)

    properties = cur.fetchall()
    db.close()

    # Process each property
    names = {}  # APN -> {name, source}
    needs_research = []

    stats = {'manual': 0, 'extracted': 0, 'address': 0, 'needs_research': 0, 'excluded': 0}

    for prop in properties:
        apn = prop['apn']
        owner = prop['owner_name'] or ''
        address = prop['property_address'] or ''
        units = prop['units'] or 0

        name, source = get_property_name(apn, owner, address, units)

        stats[source] += 1

        if name:
            names[apn] = {'name': name, 'source': source}

        if source == 'needs_research':
            needs_research.append({
                'apn': apn,
                'address': address,
                'owner': owner,
                'units': units
            })

    # Write property names JSON
    with open(OUTPUT_JSON, 'w') as f:
        json.dump({
            'generated': __import__('datetime').datetime.now().isoformat(),
            'stats': stats,
            'names': names
        }, f, indent=2)

    print(f"=== Property Name Extraction Results ===")
    print(f"Total properties: {len(properties):,}")
    print(f"  Manual names:     {stats['manual']:,}")
    print(f"  Extracted names:  {stats['extracted']:,}")
    print(f"  Using address:    {stats['address']:,} (small properties)")
    print(f"  Excluded:         {stats['excluded']:,} (casinos, storage, etc.)")
    print(f"  Needs research:   {stats['needs_research']:,}")
    print(f"\nOutput: {OUTPUT_JSON}")

    # Write needs-research CSV
    if needs_research:
        with open(NEEDS_RESEARCH_CSV, 'w') as f:
            f.write("apn,address,owner,units\n")
            for p in needs_research:
                # Escape quotes in fields
                addr = p['address'].replace('"', '""')
                owner = p['owner'].replace('"', '""')
                f.write(f'"{p["apn"]}","{addr}","{owner}",{p["units"]}\n')

        print(f"Research needed: {NEEDS_RESEARCH_CSV}")
        print(f"\nTop 20 needing research:")
        for p in needs_research[:20]:
            print(f"  {p['units']:>4} units | {p['owner'][:40]:<40} | {p['address']}")


if __name__ == '__main__':
    main()
