#!/usr/bin/env python3
"""
Export properties from main_properties.db for client-side search.
Includes ALL rental properties: multi-unit buildings AND corporate/trust-owned SFRs.
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
  ld = landUseDescription (more readable)
  sf = sqft (building square feet)
  nb = neighborhood
  ac = acres
  lv = landValue (assessed land value)
  iv = improvementValue (assessed improvement value)
  t = latitude (centroid for multi-parcel)
  g = longitude (centroid for multi-parcel)
  pt = property type:
       "mc" = multi-unit corporate
       "mi" = multi-unit individual
       "mt" = multi-unit trust
       "sc" = single-family corporate
       "st" = single-family trust (investment)
  apns = list of all APNs (multi-parcel properties only)
  addrs = list of all addresses (multi-parcel properties only)
  mc = management_company_id (extracted from owner_address C/O or ATTN patterns)
  cs = chat_slug (pre-computed for performance)
"""

import json
import re
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
MGMT_OUTPUT_PATH = PROJECT_ROOT / "public/data/management-companies.json"
NAMES_PATH = PROJECT_ROOT / "src/data/property-names.json"

# APNs to exclude (casinos, storage, healthcare, etc.) - from extract-property-names.py
EXCLUDE_APNS = {
    # Casinos/Hotels (original list)
    "1925018", "2025458", "3217228", "729229", "729438", "3843002", "12303101", "3701304", "3701305",
    # Hotels with generic owner names (hotel rooms, not apartments)
    "726128",    # 500 WEST ST - Whitney Peak Hotel (906 rooms) - CCR NEWCO LLC
    "726129",    # 130 W 6TH ST - Whitney Peak Hotel parcel 2 - UCCELLI LIVING TRUST
    "726112",    # 190 W 6TH ST - Whitney Peak Hotel parcel 3 - CCR NEWCO LLC
    "726226",    # 500 N SIERRA ST - Whitney Peak Hotel parcel 4 (673 rooms)
    "721531",    # 650 N SIERRA ST - Whitney Peak Hotel parcel 5
    "3742213",   # 1575 E LINCOLN WAY - Carson City Fitness (not apartments)
    "754215",    # 345 N ARLINGTON AVE - Circus Circus (779 rooms) - JESR LLC
    "1105107",   # 255 N VIRGINIA ST - Fitzgerald (351 rooms) - FITZGERALD REAL PROPERTY LLC
    "1105125",   # 255 N VIRGINIA ST - Fitzgerald parcel 2
    "3217230",   # 1225 VICTORIAN AVE - Nugget Casino Resort (157 rooms) - 1225 SPARKS HOLDINGS LLC
    "803008",    # 701 E 7TH ST - Hotel (139 rooms) - SEVENTH ST RENO HOLDINGS LLC
    "3816003",   # 9400 W 4TH ST - Boomtown (132 rooms) - RIVER CURRENTS LLC
    "1106118",   # 34 W 2ND ST - Hotel (120 rooms) - FCA RIVERBOAT LLC
    "16306215",  # 9845 GATEWAY DR - Hotel (120 rooms) - HPTMI CORPORATION
    "1103110",   # 239 W 2ND ST - El Cortez (115 rooms) - EL CORTEZ RENO HOLDINGS LLC
    "3220120",   # 1125 VICTORIAN AVE - Rail City Casino (94 rooms) - SMOOTH BOURBON LLC
    # Storage facilities
    "14423213", "23814005", "16008404", "1705101",
    # Healthcare
    "725610", "720223", "752201",
    # Government
    "307025", "8614401",
}

# Corporate ownership patterns that indicate rental properties
CORPORATE_PATTERNS = [
    'LLC', 'LP', 'LLP', 'LTD', 'INC', 'CORP', 'CORPORATION',
    'PARTNERSHIP', 'PROPERTIES', 'INVESTMENTS', 'MANAGEMENT',
    'HOLDINGS', 'REALTY', 'RENTAL', 'APARTMENTS', 'VENTURES',
    'CAPITAL', 'ASSET', 'EQUITY', 'FUND', 'GROUP',
]

# Patterns to ALWAYS exclude - religious organizations (small properties, not housing)
EXCLUDE_OWNER_PATTERNS = [
    'CHURCH',
    'DIOCESE',
    'PARISH',
    'TEMPLE',
    'MOSQUE',
    'SYNAGOGUE',
    'CONGREGATION',
    'ASSEMBLY OF GOD',
    'BAPTIST',
    'METHODIST',
    'PRESBYTERIAN',
    'LUTHERAN',
    'EPISCOPAL',
    'LATTER DAY',
    'JEHOVAH',
]

# Property types to exclude (not residential - storage, hospitals, govt, etc.)
EXCLUDE_PROPERTY_TYPES = [
    # Storage facilities
    'STORAGE', 'MINI STORAGE', 'SELF STORAGE', 'WAREHOUSE',
    # Government (not housing) - Housing Authority is in KEEP_PATTERNS
    'UNITED STATES OF AMERICA',
    'STATE OF NEVADA',
    'WASHOE COUNTY',
    'CITY OF RENO',
    'CITY OF SPARKS',
    # Railroads & utilities
    'RAILROAD', 'RAILWAY', 'UNION PACIFIC', 'BNSF',
    'NV ENERGY', 'SIERRA PACIFIC POWER',
    'WATER AUTHORITY',
    # Public districts
    'FIRE DISTRICT', 'FIRE PROTECTION DIST',
    'SCHOOL DISTRICT',
    # Hospitals (beds, not apartments)
    'HOSPITAL',
    'HEALTHCARE SERVICES',
    'MEDICAL CENTER',
    # Universities
    'UNIVERSITY OF NEVADA',
    'BOARD OF REGENTS',
    # AMERCO = U-Haul storage
    'AMERCO',
    # Fitness/Gyms (not residential)
    'FITNESS',
    'GYM',
    'ATHLETIC',
    # Casinos & Gaming (hotel rooms, not apartments)
    'CASINO',
    'CASINOS',
    'GAMING',
    'ELDORADO',
    'PEPPERMILL',
    'CIRCUS',
    'ATLANTIS',
    'NUGGET HOTEL',
    'GRAND SIERRA',
    'SILVER LEGACY',
    'HARRAHS',
    "HARRAH'S",
    'BALLY',
    'CAESARS',
    # Hotels & Resorts (short-term, not rentable long-term)
    'HOTEL',
    'HOTELS',
    'RESORT',
    'RESORTS',
    'MOTEL',
    'MOTELS',
    'INN ',  # With space to avoid "QUINN" etc.
    ' INN',
    'LODGE',
    'SUITES',  # Hotel suites
    'MARRIOTT',
    'HILTON',
    'HYATT',
    'HOLIDAY INN',
    'BEST WESTERN',
    'HAMPTON',
    'COURTYARD',
    'RESIDENCE INN',
    'FAIRFIELD',
    'SPRINGHILL',
    'TRENDWEST',  # Timeshare
    'WYNDHAM',
    'VACATION',
]

# Owner patterns that indicate HOA (not a landlord)
HOA_PATTERNS = [
    'OWNERS ASSOCIATION',
    'HOMEOWNERS ASSOCIATION',
    'UNIT-OWNERS',
    ' HOA',
]

# Exceptions - keep these even if they match exclusion patterns
KEEP_PATTERNS = [
    'HOUSING AUTHORITY',
    'CATHOLIC COMMUNITY SERVICES',
    'CATHOLIC CHARITIES',
]

# Trust patterns - these are INCLUDED if multi-unit, evaluated for SFR
TRUST_PATTERNS = [
    'TRUST',
    'TRUSTEE',
    'TR ',  # Common abbreviation like "SMITH TR"
]

# Family trust patterns - more likely owner-occupied for SFR
FAMILY_TRUST_PATTERNS = [
    'FAMILY TRUST',
    'LIVING TRUST',
    'REVOCABLE TRUST',
    'SURVIVOR TRUST',
    'BYPASS TRUST',
    'MARITAL TRUST',
]

# Investment trust patterns - likely rental property
INVESTMENT_TRUST_PATTERNS = [
    'INVESTMENT',
    'RENTAL',
    'PROPERTY',
    'CAPITAL',
    'ASSET',
    'DST',  # Delaware Statutory Trust
    'REIT',
]

# ============================================================
# MANAGEMENT COMPANY EXTRACTION
# ============================================================

# Patterns for extracting management company from owner_address
# "675 W MOANA LN, C/O TRIEX MANAGEMENT, RENO" -> "TRIEX MANAGEMENT"
CO_PATTERN = re.compile(r'C/O\s+([^,]+)', re.IGNORECASE)

# "PO BOX 123, ATTN: PROPERTY TAX SERVICE, DALLAS" -> "PROPERTY TAX SERVICE"
ATTN_PATTERN = re.compile(r'ATTN:?\s*([^,]+)', re.IGNORECASE)

# Noise patterns to filter (corporate departments, not property managers)
# Only 56 entries filtered, ~10k units - clearly internal contacts
MGMT_NOISE_PATTERNS = [
    'ACCOUNTING', 'LEGAL COUNSEL', 'PROPERTY TAX', 'TAX DEPARTMENT', 'TAX DEPT',
    'CONTROLLER', 'ASST CONTROLLER', 'CFO', 'TREASURER', 'BUSINESS OFFICE',
    'COMMUNITY SERVICES DEPT', 'DIVISION OF STATE', 'DEPARTMENT OF', 'LANDS DEPT',
    'ACCOUNTS PAYABLE', 'LEGAL DEPT', 'TAX OFFICE',
]


def extract_management_company(owner_address: str) -> tuple[str | None, str]:
    """
    Extract management company from owner_address field.
    Returns (company_name, detection_method) where method is 'c/o', 'attn', or 'none'.
    """
    if not owner_address:
        return None, 'none'

    # Try C/O pattern first (higher confidence)
    match = CO_PATTERN.search(owner_address)
    if match:
        name = match.group(1).strip().upper()
        if not any(noise in name for noise in MGMT_NOISE_PATTERNS):
            return name, 'c/o'

    # Try ATTN pattern
    match = ATTN_PATTERN.search(owner_address)
    if match:
        name = match.group(1).strip().upper()
        if not any(noise in name for noise in MGMT_NOISE_PATTERNS):
            return name, 'attn'

    return None, 'none'


def generate_mgmt_id(name: str) -> str:
    """Generate URL-safe slug ID for management company."""
    if not name:
        return ""
    # Convert to lowercase, replace spaces and special chars
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug[:50]  # Limit length


# ============================================================
# ADDRESS-BASED PORTFOLIO DETECTION
# ============================================================

def normalize_mailing_address(addr: str) -> str | None:
    """
    Normalize mailing address for grouping.
    Returns None for addresses that shouldn't be grouped.
    """
    if not addr or len(addr) < 15:
        return None

    # Skip generic/invalid addresses
    skip_patterns = [
        'COMMON AREA', 'NONE', 'N/A', 'NOT AVAILABLE',
        'SAME AS PROPERTY', 'SAME AS ABOVE',
    ]
    upper = addr.upper()
    if any(skip in upper for skip in skip_patterns):
        return None

    # Skip addresses that contain noise patterns (tax services, accounting, etc.)
    # These are correspondence addresses, not landlord offices
    noise_in_address = [
        'PROPERTY TAX', 'TAX SERVICE', 'TAX DEPARTMENT', 'TAX DEPT',
        'ACCOUNTING', 'ACCOUNTS PAYABLE', 'LEGAL COUNSEL',
        'ATTN TAX', 'ATTN PROPERTY TAX', 'ATTN: TAX',
    ]
    if any(noise in upper for noise in noise_in_address):
        return None

    # Extract first 50 chars, normalize
    normalized = upper[:50]
    # Remove C/O and ATTN portions (we track those separately)
    normalized = re.sub(r',?\s*C/O\s+[^,]+', '', normalized)
    normalized = re.sub(r',?\s*ATTN:?\s*[^,]+', '', normalized)
    # Remove suite/unit variations at end
    normalized = re.sub(r'\s+(STE|SUITE|UNIT|APT|#|FLOOR|FL)\s*[A-Z0-9\-]+\s*$', '', normalized)
    # Standardize common abbreviations
    normalized = normalized.replace(' STREET', ' ST').replace(' AVENUE', ' AVE')
    normalized = normalized.replace(' DRIVE', ' DR').replace(' ROAD', ' RD')
    normalized = normalized.replace(' BOULEVARD', ' BLVD').replace(' LANE', ' LN')
    # Remove extra whitespace
    normalized = ' '.join(normalized.split())

    return normalized if len(normalized) >= 15 else None


def generate_portfolio_id(address: str) -> str:
    """Generate URL-safe slug ID for portfolio based on address."""
    if not address:
        return ""
    # Take first meaningful part of address
    slug = address.lower()[:40]
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return 'addr-' + slug[:45]


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


def is_corporate_owner(owner: str) -> bool:
    """Check if owner name matches corporate patterns indicating rental property."""
    if not owner:
        return False
    owner_upper = owner.upper()
    return any(pattern in owner_upper for pattern in CORPORATE_PATTERNS)


def is_trust_owner(owner: str) -> bool:
    """Check if owner is a trust of any kind."""
    if not owner:
        return False
    owner_upper = owner.upper()
    return any(pattern in owner_upper for pattern in TRUST_PATTERNS)


def is_family_trust(owner: str) -> bool:
    """Check if owner is likely a family/living trust (owner-occupied)."""
    if not owner:
        return False
    owner_upper = owner.upper()
    return any(pattern in owner_upper for pattern in FAMILY_TRUST_PATTERNS)


def is_investment_trust(owner: str) -> bool:
    """Check if trust name suggests investment property."""
    if not owner:
        return False
    owner_upper = owner.upper()
    return any(pattern in owner_upper for pattern in INVESTMENT_TRUST_PATTERNS)


def should_exclude_owner(owner: str) -> bool:
    """Check if owner should be excluded (religious organizations)."""
    if not owner:
        return False
    owner_upper = owner.upper()
    return any(pattern in owner_upper for pattern in EXCLUDE_OWNER_PATTERNS)


def should_exclude_property_type(owner: str, address: str) -> tuple[bool, str]:
    """
    Check if property should be excluded based on type.
    Returns (should_exclude, reason).

    Excludes: storage, hospitals, government (except housing auth),
    universities, HOAs, railroads, utilities, vacant land.
    """
    if not owner:
        return False, ''

    owner_upper = owner.upper()
    addr_upper = (address or '').upper()

    # First check if it's an exception we should keep
    if any(pattern in owner_upper for pattern in KEEP_PATTERNS):
        return False, ''

    # Check for vacant/no address (0 West St, 0 Howard Dr, etc.)
    if addr_upper.startswith('0 ') or addr_upper == '0':
        return True, 'vacant'

    # Check HOA patterns (not landlords)
    if any(pattern in owner_upper for pattern in HOA_PATTERNS):
        return True, 'hoa'

    # Check property type exclusions
    for pattern in EXCLUDE_PROPERTY_TYPES:
        if pattern in owner_upper:
            return True, pattern.lower().replace(' ', '_')

    return False, ''


def get_property_type(owner: str, units: int) -> str | None:
    """
    Determine property type code based on owner and units.
    Returns None if property should be excluded.

    Types:
      mc = multi-unit corporate
      mi = multi-unit individual
      mt = multi-unit trust
      sc = single-family corporate
      st = single-family trust (investment)
    """
    # Exclude properties with 0 units (vacant lots, HOA areas, commercial, etc.)
    if not units or units < 1:
        return None

    is_multi = units > 1
    is_corp = is_corporate_owner(owner)
    is_trust = is_trust_owner(owner)

    if is_multi:
        # ALL multi-unit properties are included
        if is_corp:
            return "mc"  # multi-unit corporate
        elif is_trust:
            return "mt"  # multi-unit trust
        else:
            return "mi"  # multi-unit individual
    else:
        # Single-family: only include corporate or CLEARLY investment trusts
        if is_corp:
            return "sc"  # single-family corporate
        elif is_trust:
            # Be conservative: only include trusts that are CLEARLY investments
            # Exclude family trusts and generic "LASTNAME TRUST" patterns
            if is_family_trust(owner):
                return None  # Exclude family trusts
            elif is_investment_trust(owner):
                return "st"  # single-family trust (investment)
            else:
                # Generic trust like "JOHN SMITH TRUST" - likely owner-occupied
                return None
        else:
            # Individual-owned single-family - exclude (owner-occupied)
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


def generate_chat_slug(address: str) -> str:
    """
    Generate a chat slug from an address.
    Must match the JavaScript version in BuildingList.tsx for consistency.
    Example: "2500 E 2ND ST" -> "rstu-2500-e-2nd-st"
    """
    if not address:
        return ""
    # Convert to lowercase, replace non-alphanumeric with dashes, trim dashes
    slug = address.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    # Prefix with rstu- and limit length
    return 'rstu-' + slug[:50]


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

    # Get multi-unit properties (units > 1) AND corporate-owned single-family rentals
    # Corporate ownership patterns indicate rental properties vs owner-occupied homes
    cursor.execute("""
        SELECT
            apn,
            property_address,
            owner_name,
            owner_address,
            units,
            total_assessed_value,
            year_built,
            zoning,
            land_use_code,
            land_use_description,
            building_square_feet,
            neighborhood,
            acres,
            assessed_land_value,
            assessed_improvement_value,
            centroid_lon,
            centroid_lat
        FROM parcels
        WHERE owner_name IS NOT NULL
          AND owner_name != ''
          AND property_address IS NOT NULL
          AND property_address != ''
        ORDER BY units DESC
    """)

    raw_properties = []
    skipped_non_rental = 0
    excluded_by_type = {}  # Track exclusions by type for reporting

    # Track management companies for separate export
    management_companies = {}  # mgmt_id -> {name, properties, units, method}

    # Track properties by normalized mailing address for portfolio detection
    address_portfolios = {}  # normalized_addr -> {owners: set, apns: [], units: int}

    for row in cursor.fetchall():
        (apn, address, owner, owner_address, units, value, year_built, zoning, land_use,
         land_use_desc, sqft, neighborhood, acres, land_value, improvement_value,
         sp_x, sp_y) = row

        # Skip if essential data is missing
        if not apn or not address:
            continue

        # Skip excluded properties by APN (legacy list)
        if apn in EXCLUDE_APNS:
            excluded_by_type['apn_list'] = excluded_by_type.get('apn_list', 0) + 1
            continue

        # Skip excluded property types (storage, hospitals, govt, etc.)
        exclude, reason = should_exclude_property_type(owner, address)
        if exclude:
            excluded_by_type[reason] = excluded_by_type.get(reason, 0) + 1
            continue

        # Skip religious organizations (small properties, not housing)
        if should_exclude_owner(owner):
            excluded_by_type['religious'] = excluded_by_type.get('religious', 0) + 1
            continue

        # Determine property type - returns None if should be excluded
        prop_type = get_property_type(owner, units)

        if prop_type is None:
            # Skip individual/family-owned single-family homes
            skipped_non_rental += 1
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
            "pt": prop_type,  # "m" = multi-unit, "s" = single-family rental
            "cs": generate_chat_slug(address),  # Pre-computed chat slug
        }

        # Add new metadata fields if available
        if land_use_desc:
            prop["ld"] = land_use_desc
        if sqft:
            prop["sf"] = sqft
        if neighborhood:
            prop["nb"] = neighborhood
        if acres:
            prop["ac"] = round(acres, 3)
        if land_value:
            prop["lv"] = land_value
        if improvement_value:
            prop["iv"] = improvement_value

        # Add property name if available
        if apn in property_names:
            prop["n"] = property_names[apn]

        # Add coordinates if available
        coords = transform_coords(sp_x, sp_y)
        if coords:
            prop["t"] = coords[0]  # latitude
            prop["g"] = coords[1]  # longitude

        # Extract management company from owner_address (C/O or ATTN patterns)
        mgmt_name, mgmt_method = extract_management_company(owner_address)
        if mgmt_name:
            mgmt_id = generate_mgmt_id(mgmt_name)
            prop["mc"] = mgmt_id

            # Track for management companies export
            if mgmt_id not in management_companies:
                management_companies[mgmt_id] = {
                    "id": mgmt_id,
                    "name": mgmt_name,
                    "detection_method": mgmt_method,
                    "properties": 0,
                    "units": 0,
                    "apns": [],
                }
            management_companies[mgmt_id]["properties"] += 1
            management_companies[mgmt_id]["units"] += units or 0
            management_companies[mgmt_id]["apns"].append(apn)

        # Track by normalized mailing address for portfolio detection
        # (even if already has C/O management company - we track all)
        norm_mail_addr = normalize_mailing_address(owner_address)
        if norm_mail_addr:
            if norm_mail_addr not in address_portfolios:
                address_portfolios[norm_mail_addr] = {
                    "owners": set(),
                    "apns": [],
                    "units": 0,
                }
            address_portfolios[norm_mail_addr]["owners"].add(owner)
            address_portfolios[norm_mail_addr]["apns"].append(apn)
            address_portfolios[norm_mail_addr]["units"] += units or 0
            # Store for later portfolio assignment
            prop["_norm_mail_addr"] = norm_mail_addr

        raw_properties.append(prop)

    conn.close()

    # ============================================================
    # PHASE 2: Detect address-based portfolios (2+ distinct owners)
    # ============================================================
    portfolios = {}  # portfolio_id -> {address, owners, properties, units}
    portfolio_by_addr = {}  # normalized_addr -> portfolio_id

    for norm_addr, data in address_portfolios.items():
        # Only create portfolios for addresses with 2+ distinct owners
        if len(data["owners"]) >= 2:
            portfolio_id = generate_portfolio_id(norm_addr)
            portfolios[portfolio_id] = {
                "id": portfolio_id,
                "name": norm_addr,  # Use address as name
                "detection_method": "address",
                "owner_count": len(data["owners"]),
                "properties": len(data["apns"]),
                "units": data["units"],
                "owners": list(data["owners"])[:5],  # Top 5 owners for reference
            }
            portfolio_by_addr[norm_addr] = portfolio_id

    print(f"Detected {len(portfolios)} address-based portfolios")

    # Assign portfolio IDs to properties that don't have management company
    portfolio_assigned = 0
    for prop in raw_properties:
        norm_addr = prop.pop("_norm_mail_addr", None)  # Remove temp field
        if norm_addr and norm_addr in portfolio_by_addr:
            # Only assign portfolio if no management company
            if "mc" not in prop:
                prop["pf"] = portfolio_by_addr[norm_addr]
                portfolio_assigned += 1

    print(f"Assigned portfolio ID to {portfolio_assigned} properties")

    # Merge portfolios into management_companies for unified export
    for pf_id, pf_data in portfolios.items():
        management_companies[pf_id] = {
            "id": pf_id,
            "name": pf_data["name"],
            "detection_method": "address",
            "properties": pf_data["properties"],
            "units": pf_data["units"],
            "apns": [],  # Too many to include
        }

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

    # Export management companies
    # Sort by units descending
    mgmt_list = sorted(
        management_companies.values(),
        key=lambda x: -x["units"]
    )
    # Remove apns list from export (too large), just keep count
    for mgmt in mgmt_list:
        mgmt["property_count"] = mgmt["properties"]
        del mgmt["properties"]
        del mgmt["apns"]

    with open(MGMT_OUTPUT_PATH, 'w') as f:
        json.dump({
            "companies": mgmt_list,
            "count": len(mgmt_list)
        }, f, separators=(',', ':'))

    # Calculate file size
    file_size = OUTPUT_PATH.stat().st_size
    size_mb = file_size / (1024 * 1024)

    # Count properties by type
    named_count = sum(1 for p in properties if 'n' in p)
    coords_count = sum(1 for p in properties if 't' in p)
    multi_parcel_count = sum(1 for p in properties if 'apns' in p)
    total_parcels = sum(len(p.get('apns', [p['a']])) for p in properties)
    with_sqft = sum(1 for p in properties if 'sf' in p)
    with_neighborhood = sum(1 for p in properties if 'nb' in p)

    # Count by property type
    type_counts = {}
    for p in properties:
        pt = p.get('pt', 'unknown')
        type_counts[pt] = type_counts.get(pt, 0) + 1

    multi_corp = type_counts.get('mc', 0)
    multi_indiv = type_counts.get('mi', 0)
    multi_trust = type_counts.get('mt', 0)
    sfr_corp = type_counts.get('sc', 0)
    sfr_trust = type_counts.get('st', 0)
    total_multi = multi_corp + multi_indiv + multi_trust
    total_sfr = sfr_corp + sfr_trust

    print(f"Exported {len(properties):,} properties")
    print(f"  Multi-unit buildings: {total_multi:,}")
    print(f"    - Corporate (mc): {multi_corp:,}")
    print(f"    - Individual (mi): {multi_indiv:,}")
    print(f"    - Trust (mt): {multi_trust:,}")
    print(f"  Single-family rentals: {total_sfr:,}")
    print(f"    - Corporate (sc): {sfr_corp:,}")
    print(f"    - Trust (st): {sfr_trust:,}")
    print(f"  Raw parcels: {len(raw_properties):,}")
    print(f"  Multi-parcel properties: {multi_parcel_count:,} (containing {total_parcels - len(properties) + multi_parcel_count:,} extra parcels)")
    print(f"  With names: {named_count:,}")
    print(f"  With coords: {coords_count:,}")
    print(f"  With sqft: {with_sqft:,}")
    print(f"  With neighborhood: {with_neighborhood:,}")
    total_excluded = sum(excluded_by_type.values())
    print(f"  Excluded (non-residential): {total_excluded:,}")
    for reason, count in sorted(excluded_by_type.items(), key=lambda x: -x[1]):
        print(f"    - {reason}: {count:,}")
    print(f"  Skipped (non-rental): {skipped_non_rental:,}")
    print(f"Output: {OUTPUT_PATH}")
    print(f"Size: {size_mb:.2f} MB")

    # Management company stats
    with_mgmt = sum(1 for p in properties if 'mc' in p)
    mgmt_units = sum(p.get('u', 0) for p in properties if 'mc' in p)
    # Split stats by detection method
    co_attn_companies = [m for m in mgmt_list if m.get('detection_method') in ('c/o', 'attn')]
    addr_portfolios = [m for m in mgmt_list if m.get('detection_method') == 'address']

    with_portfolio = sum(1 for p in properties if 'pf' in p)
    portfolio_units = sum(p.get('u', 0) for p in properties if 'pf' in p)

    print(f"\nManagement Companies (C/O + ATTN patterns):")
    print(f"  Companies: {len(co_attn_companies):,}")
    print(f"  Properties with mc: {with_mgmt:,}")
    print(f"  Units covered: {mgmt_units:,}")
    print(f"  Top 5 by units:")
    for mgmt in co_attn_companies[:5]:
        print(f"    - {mgmt['name']}: {mgmt['units']:,} units, {mgmt['property_count']} properties")

    print(f"\nAddress-Based Portfolios (2+ owners at same address):")
    print(f"  Portfolios: {len(addr_portfolios):,}")
    print(f"  Properties with pf: {with_portfolio:,}")
    print(f"  Units covered: {portfolio_units:,}")
    print(f"  Top 5 by units:")
    for pf in addr_portfolios[:5]:
        print(f"    - {pf['name'][:40]}: {pf['units']:,} units, {pf['property_count']} properties")

    total_linked = with_mgmt + with_portfolio
    total_linked_units = mgmt_units + portfolio_units
    print(f"\nTOTAL LINKED:")
    print(f"  Properties: {total_linked:,} / {len(properties):,} ({total_linked/len(properties)*100:.1f}%)")
    print(f"  Units: {total_linked_units:,}")

    print(f"\nOutput: {MGMT_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
