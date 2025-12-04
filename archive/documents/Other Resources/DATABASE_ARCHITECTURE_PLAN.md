# Tenant Organizing Intelligence Database Architecture

**Comprehensive Data Architecture for Overwhelming Intelligence** - September 8, 2025

---

## 🚨 **REALITY CHECK: MANAGING THE DATA OVERWHELMING**

**Problem**: We've collected SO MUCH organizing intelligence that we risk information overload
**Solution**: Systematic database architecture that organizes complexity into manageable, purpose-driven systems

---

## 🎯 **CORE DATABASE DESIGN PRINCIPLES**

### **1. Purpose-Driven Data Organization**
- **Organizing Intelligence**: Data that directly supports tenant campaigns
- **Community Management**: Member and volunteer coordination
- **Accountability Systems**: Corporate landlord tracking and violation documentation
- **Resource Coordination**: Legal aid, mutual aid, and community support networks

### **2. Progressive Complexity Management**
- **Phase 1**: Core organizing essentials (property ownership, corporate targets)
- **Phase 2**: Enhanced intelligence (violations, evictions, market analysis)
- **Phase 3**: Advanced coordination (real-time campaigns, network effects)
- **Phase 4**: Predictive systems (risk assessment, campaign optimization)

### **3. Community-First Data Architecture**
- **Tenant Privacy**: All personal information cryptographically protected
- **Community Control**: Tenant representatives control data governance
- **Organizing Focus**: Every data point serves organizing goals
- **Transparency**: Open documentation of all data collection and use

---

## 🗄️ **PRIMARY DATABASE ARCHITECTURE**

### **DATABASE 1: PROPERTY INTELLIGENCE** (`organizing_intelligence.db`)

**Purpose**: Corporate landlord accountability and strategic organizing target identification

```sql
-- Core property ownership data (EXISTING - 192,463 records)
CREATE TABLE properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    apn TEXT UNIQUE NOT NULL,                    -- Assessor Parcel Number
    property_address TEXT NOT NULL,              -- Physical location
    owner_name TEXT NOT NULL,                    -- Extracted owner name
    owner_address TEXT,                          -- Mailing address for organizing
    entity_type TEXT CHECK(entity_type IN ('individual', 'corporate', 'government', 'trust', 'joint')),
    property_type TEXT,                          -- Single-family, multi-unit, commercial
    units INTEGER DEFAULT 1,                     -- Number of housing units
    total_assessed_value REAL,                   -- Property value for profit analysis
    land_use_description TEXT,                   -- Official land use classification
    zoning TEXT,                                 -- Zoning designation
    year_built INTEGER,                          -- Construction year
    building_square_feet INTEGER,               -- Building size
    centroid_lat REAL,                          -- Geographic coordinates
    centroid_lon REAL,                          -- Geographic coordinates
    raw_attributes TEXT,                        -- Complete JSON for future analysis
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Organizing intelligence fields
    organizing_priority INTEGER DEFAULT 0,      -- 1-10 scale, calculated
    organizing_status TEXT DEFAULT 'inactive' CHECK(organizing_status IN 
        ('inactive', 'initial_contact', 'building_committee', 'active_campaign', 'victory')),
    campaign_notes TEXT,                        -- Organizing campaign progress
    last_organizing_activity TIMESTAMP,         -- Track organizing engagement
    
    -- Corporate analysis fields
    is_corporate_owned BOOLEAN DEFAULT FALSE,
    parent_company TEXT,                        -- Corporate parent identification
    portfolio_size INTEGER DEFAULT 1,          -- Properties owned by same entity
    
    UNIQUE(apn)
);

-- Corporate entity consolidated analysis (DERIVED DATA)
CREATE TABLE corporate_entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_name TEXT UNIQUE NOT NULL,
    entity_type TEXT NOT NULL,
    total_properties INTEGER DEFAULT 0,
    total_units INTEGER DEFAULT 0,
    total_assessed_value REAL DEFAULT 0,
    organizing_priority INTEGER DEFAULT 0,     -- 1-10 calculated priority
    organizing_status TEXT DEFAULT 'inactive',
    
    -- Business intelligence
    business_registration_state TEXT,
    registered_agent TEXT,
    business_address TEXT,
    
    -- Organizing campaign data
    active_campaigns INTEGER DEFAULT 0,
    campaign_victories INTEGER DEFAULT 0,
    last_campaign_activity TIMESTAMP,
    
    -- Violation and legal history (Phase 2)
    total_violations INTEGER DEFAULT 0,
    total_evictions_filed INTEGER DEFAULT 0,
    violation_score REAL DEFAULT 0,            -- Calculated landlord accountability score
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **DATABASE 2: ORGANIZING CAMPAIGNS** (`campaign_management.db`)

**Purpose**: Coordinate active tenant organizing campaigns and community engagement

```sql
-- Active organizing campaigns
CREATE TABLE campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT CHECK(campaign_type IN 
        ('corporate_accountability', 'habitability', 'anti_eviction', 'rent_stabilization', 'community_organizing')),
    
    -- Target information
    target_entity_id INTEGER REFERENCES corporate_entities(id),
    target_properties TEXT,                     -- JSON array of property IDs
    affected_units INTEGER DEFAULT 0,
    estimated_affected_tenants INTEGER DEFAULT 0,
    
    -- Campaign status and timeline
    status TEXT DEFAULT 'planning' CHECK(status IN 
        ('planning', 'recruiting', 'active', 'negotiating', 'victory', 'paused', 'closed')),
    start_date DATE,
    target_resolution_date DATE,
    actual_resolution_date DATE,
    
    -- Organizing progress
    volunteer_count INTEGER DEFAULT 0,
    tenant_participant_count INTEGER DEFAULT 0,
    committee_meetings_held INTEGER DEFAULT 0,
    public_actions_taken INTEGER DEFAULT 0,
    media_coverage_count INTEGER DEFAULT 0,
    
    -- Campaign assets and documentation
    campaign_materials TEXT,                    -- JSON of organizing materials
    legal_strategy TEXT,                        -- Legal approach documentation
    media_strategy TEXT,                        -- Public pressure strategy
    victory_conditions TEXT,                    -- Success criteria
    
    -- Privacy and security
    secure_communications_channel TEXT,         -- Matrix room ID or Signal group
    confidential_notes TEXT,                   -- Sensitive organizing information
    
    created_by INTEGER REFERENCES community_members(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign activities and timeline tracking
CREATE TABLE campaign_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER REFERENCES campaigns(id),
    activity_type TEXT CHECK(activity_type IN 
        ('meeting', 'action', 'media', 'legal', 'victory', 'setback', 'volunteer_recruitment')),
    activity_date DATE NOT NULL,
    activity_description TEXT NOT NULL,
    participants_count INTEGER DEFAULT 0,
    outcome_notes TEXT,
    
    -- Documentation
    photos TEXT,                               -- JSON array of photo URLs
    documents TEXT,                            -- JSON array of document URLs
    media_links TEXT,                          -- JSON array of media coverage
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **DATABASE 3: COMMUNITY COORDINATION** (`community_management.db`)

**Purpose**: Manage tenant union members, volunteers, and community engagement

```sql
-- Community member profiles (PRIVACY PROTECTED)
CREATE TABLE community_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Identity (encrypted/hashed for privacy)
    member_hash TEXT UNIQUE NOT NULL,          -- Cryptographic identity hash
    display_name TEXT,                         -- Public organizing name
    
    -- Verification and security
    verification_level TEXT DEFAULT 'basic' CHECK(verification_level IN 
        ('basic', 'intermediate', 'advanced')),
    verification_date TIMESTAMP,
    time_lock_progress INTEGER DEFAULT 0,      -- Days in current security tier
    security_training_completed TEXT,          -- JSON of completed training
    
    -- Organizing participation
    member_since DATE DEFAULT CURRENT_DATE,
    organizing_role TEXT CHECK(organizing_role IN 
        ('member', 'volunteer', 'organizer', 'campaign_lead', 'coordinator', 'leader')),
    primary_interests TEXT,                    -- JSON of organizing focus areas
    skills_offered TEXT,                       -- JSON of volunteer skills
    availability TEXT,                         -- JSON of time availability
    
    -- Engagement tracking
    campaigns_participated INTEGER DEFAULT 0,
    meetings_attended INTEGER DEFAULT 0,
    volunteer_hours INTEGER DEFAULT 0,
    referrals_made INTEGER DEFAULT 0,
    
    -- Communication preferences
    preferred_contact_method TEXT CHECK(preferred_contact_method IN 
        ('email', 'signal', 'matrix', 'phone', 'in_person')),
    notification_preferences TEXT,             -- JSON of notification settings
    
    -- Privacy and security
    address_hash TEXT,                         -- Hashed address for geographic organizing
    phone_hash TEXT,                           -- Hashed phone for secure communication
    emergency_contact_hash TEXT,               -- Encrypted emergency contact
    
    -- Community connections
    referred_by INTEGER REFERENCES community_members(id),
    community_references INTEGER DEFAULT 0,    -- Number of member vouches
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure privacy protection
    CHECK(member_hash IS NOT NULL),
    CHECK(LENGTH(member_hash) >= 32)           -- Minimum hash length requirement
);

-- Property-level organizing committees
CREATE TABLE building_committees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER REFERENCES properties(id),
    committee_name TEXT NOT NULL,
    
    -- Committee status and organization
    status TEXT DEFAULT 'forming' CHECK(status IN 
        ('forming', 'active', 'recognized', 'dissolved')),
    formation_date DATE DEFAULT CURRENT_DATE,
    recognition_date DATE,                     -- When landlord recognizes committee
    
    -- Committee composition
    tenant_member_count INTEGER DEFAULT 0,
    committee_leader_id INTEGER REFERENCES community_members(id),
    
    -- Organizing progress
    tenant_participation_rate REAL DEFAULT 0, -- Percentage of tenants participating
    meetings_held INTEGER DEFAULT 0,
    grievances_filed INTEGER DEFAULT 0,
    victories_achieved INTEGER DEFAULT 0,
    
    -- Communication and coordination
    meeting_schedule TEXT,                     -- Regular meeting times
    secure_communication_channel TEXT,         -- Matrix room or Signal group
    committee_documents TEXT,                  -- JSON of important documents
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **DATABASE 4: LANDLORD ACCOUNTABILITY** (`accountability_system.db`)

**Purpose**: Track landlord violations, legal history, and accountability campaigns (Phase 2)

```sql
-- Code enforcement violations (Phase 2 - FUTURE)
CREATE TABLE code_violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER REFERENCES properties(id),
    entity_id INTEGER REFERENCES corporate_entities(id),
    
    -- Violation details
    violation_date DATE NOT NULL,
    violation_type TEXT NOT NULL,
    violation_description TEXT NOT NULL,
    violation_severity TEXT CHECK(violation_severity IN ('minor', 'major', 'critical')),
    
    -- Enforcement details
    enforcement_agency TEXT NOT NULL,          -- Washoe County, City of Reno, etc.
    case_number TEXT,
    inspector_name TEXT,
    
    -- Resolution tracking
    resolution_required_date DATE,
    actual_resolution_date DATE,
    resolution_status TEXT DEFAULT 'open' CHECK(resolution_status IN 
        ('open', 'resolved', 'appealed', 'dismissed')),
    resolution_notes TEXT,
    
    -- Financial impact
    fines_assessed REAL DEFAULT 0,
    fines_paid REAL DEFAULT 0,
    
    -- Organizing intelligence
    tenant_impact_severity TEXT CHECK(tenant_impact_severity IN ('low', 'moderate', 'high', 'critical')),
    organizing_opportunity BOOLEAN DEFAULT FALSE,
    campaign_potential_score INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Eviction tracking and pattern analysis (Phase 2 - FUTURE)
CREATE TABLE eviction_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER REFERENCES properties(id),
    entity_id INTEGER REFERENCES corporate_entities(id),
    
    -- Case details
    case_number TEXT UNIQUE NOT NULL,
    filing_date DATE NOT NULL,
    eviction_reason TEXT,
    amount_claimed REAL DEFAULT 0,
    
    -- Case outcome
    case_status TEXT DEFAULT 'pending' CHECK(case_status IN 
        ('pending', 'dismissed', 'judgment_landlord', 'judgment_tenant', 'settled')),
    resolution_date DATE,
    final_judgment_amount REAL DEFAULT 0,
    
    -- Tenant protection analysis
    tenant_had_legal_representation BOOLEAN DEFAULT FALSE,
    tenant_organized_defense BOOLEAN DEFAULT FALSE,
    organizing_intervention BOOLEAN DEFAULT FALSE,
    
    -- Pattern analysis
    serial_eviction_pattern BOOLEAN DEFAULT FALSE,
    retaliatory_eviction_suspected BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **DATABASE 5: RESOURCE COORDINATION** (`resource_management.db`)

**Purpose**: Manage legal aid, mutual aid, and community resource coordination

```sql
-- Legal aid and support service directory
CREATE TABLE support_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_name TEXT NOT NULL,
    service_type TEXT CHECK(service_type IN 
        ('legal_aid', 'housing_counseling', 'mutual_aid', 'mental_health', 'emergency_services')),
    
    -- Contact and location
    contact_phone TEXT,
    contact_email TEXT,
    website_url TEXT,
    physical_address TEXT,
    service_area TEXT,                         -- Geographic coverage area
    
    -- Service details
    services_offered TEXT,                     -- JSON array of specific services
    eligibility_requirements TEXT,             -- JSON of eligibility criteria
    languages_supported TEXT,                  -- JSON array of languages
    
    -- Availability and capacity
    hours_of_operation TEXT,                   -- JSON of operating hours
    appointment_required BOOLEAN DEFAULT TRUE,
    current_capacity TEXT CHECK(current_capacity IN ('available', 'limited', 'unavailable')),
    average_wait_time_days INTEGER DEFAULT 0,
    
    -- Partnership and integration
    partnership_status TEXT CHECK(partnership_status IN ('partner', 'referral', 'resource')),
    integration_level TEXT CHECK(integration_level IN ('automated', 'manual', 'none')),
    referral_protocol TEXT,                   -- How to refer community members
    
    -- Quality and effectiveness tracking
    community_rating REAL DEFAULT 0,          -- 1-5 star rating from community
    successful_referrals INTEGER DEFAULT 0,
    resolution_success_rate REAL DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community mutual aid requests and coordination
CREATE TABLE mutual_aid_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Request details (privacy protected)
    requester_hash TEXT NOT NULL,             -- Cryptographic identity protection
    request_type TEXT CHECK(request_type IN 
        ('financial', 'food', 'housing', 'transportation', 'childcare', 'legal', 'emotional_support', 'other')),
    request_description TEXT NOT NULL,
    urgency_level TEXT DEFAULT 'moderate' CHECK(urgency_level IN ('low', 'moderate', 'high', 'emergency')),
    
    -- Request status and fulfillment
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'fulfilled', 'expired', 'withdrawn')),
    posted_date DATE DEFAULT CURRENT_DATE,
    needed_by_date DATE,
    fulfilled_date DATE,
    
    -- Resource coordination
    estimated_cost REAL DEFAULT 0,
    resource_type TEXT CHECK(resource_type IN ('monetary', 'material', 'service', 'time')),
    volunteer_hours_needed INTEGER DEFAULT 0,
    
    -- Community response tracking
    responses_received INTEGER DEFAULT 0,
    volunteers_assigned INTEGER DEFAULT 0,
    resources_pledged REAL DEFAULT 0,
    
    -- Privacy and security
    public_visibility BOOLEAN DEFAULT TRUE,
    contact_method TEXT CHECK(contact_method IN ('platform', 'signal', 'email', 'phone')),
    geographic_area TEXT,                      -- General area for local coordination
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📊 **DATABASE INTEGRATION & RELATIONSHIPS**

### **Cross-Database Relationships**
```sql
-- Key relationships that connect the organizing intelligence
-- Property -> Corporate Entity -> Active Campaigns -> Community Members -> Support Resources

-- Example: Find all community members organizing against a specific corporate landlord
SELECT cm.display_name, c.campaign_name, ce.entity_name, p.property_address
FROM community_members cm
JOIN campaign_activities ca ON cm.id = ca.participant_id  
JOIN campaigns c ON ca.campaign_id = c.id
JOIN corporate_entities ce ON c.target_entity_id = ce.id
JOIN properties p ON ce.id = p.parent_entity_id
WHERE ce.entity_name = 'TOLL NORTH RENO LLC'
AND c.status = 'active';
```

### **Data Flow Architecture**
```
1. PROPERTY INTELLIGENCE → Corporate entity identification → Organizing priority scoring
2. CORPORATE ENTITIES → Campaign targeting → Community member recruitment  
3. CAMPAIGNS → Community coordination → Resource mobilization
4. ACCOUNTABILITY SYSTEM → Violation documentation → Public pressure campaigns
5. RESOURCE COORDINATION → Community support → Organizing sustainability
```

---

## 🔧 **PROGRESSIVE DATABASE IMPLEMENTATION**

### **Phase 1: Essential Organizing Intelligence (CURRENT)**
- ✅ `properties` table (192,463 records operational)
- ✅ `corporate_entities` table (derived from property analysis)
- 🔄 Basic campaign tracking structure
- 🔄 Community member registration system

### **Phase 2: Enhanced Accountability (30 days)**
- 📅 `code_violations` table with automated data collection
- 📅 `eviction_cases` table with Justice Court integration
- 📅 Enhanced corporate entity analysis with violation scoring
- 📅 Landlord accountability scorecard generation

### **Phase 3: Community Coordination (60 days)**
- 📅 Full `community_members` system with privacy protection
- 📅 `building_committees` organizing coordination
- 📅 `mutual_aid_requests` enhanced community support
- 📅 Campaign activity tracking and success metrics

### **Phase 4: Advanced Intelligence (90 days)**
- 📅 Predictive organizing analytics
- 📅 Real-time violation and eviction monitoring
- 📅 Automated campaign opportunity identification
- 📅 Network effect analysis for maximum organizing impact

---

## 🛡️ **PRIVACY & SECURITY ARCHITECTURE**

### **Tenant Privacy Protection**
```sql
-- Example: Cryptographic address hashing for geographic organizing without surveillance
CREATE TRIGGER hash_member_address
BEFORE INSERT ON community_members
FOR EACH ROW
BEGIN
  UPDATE community_members SET 
    address_hash = hex(randomblob(16)) || hex(hash_function(NEW.raw_address))
  WHERE id = NEW.id;
END;
```

### **Community Data Governance**
- **Tenant Representative Board**: Community control of data decisions  
- **Data Minimization**: Collect only essential organizing intelligence
- **Automatic Expiration**: Sensitive data expires after organizing campaigns
- **Transparent Operations**: All data collection documented and community-approved

### **Security Through Design**
- **No Plaintext Personal Information**: All PII cryptographically protected
- **Public Records Focus**: Corporate landlord data remains public, tenant data protected
- **Community-First Architecture**: Technology serves organizing, not surveillance

---

## 📈 **DATA ANALYTICS & ORGANIZING INTELLIGENCE**

### **Automated Organizing Opportunity Detection**
```sql
-- Example: Identify properties with highest organizing potential
SELECT 
  p.property_address,
  ce.entity_name,
  p.units,
  ce.organizing_priority,
  COUNT(cv.id) as violation_count,
  COUNT(ec.id) as eviction_count,
  (ce.organizing_priority + COUNT(cv.id) + COUNT(ec.id)) as combined_score
FROM properties p
JOIN corporate_entities ce ON p.parent_entity_id = ce.id  
LEFT JOIN code_violations cv ON p.id = cv.property_id
LEFT JOIN eviction_cases ec ON p.id = ec.property_id
WHERE p.units > 5 AND ce.organizing_priority >= 6
GROUP BY p.id
ORDER BY combined_score DESC
LIMIT 20;
```

### **Campaign Success Tracking**
- Organizing victory rates by corporate landlord type
- Community member engagement and retention analysis
- Resource mobilization effectiveness measurement
- Policy advocacy impact assessment with data evidence

---

## 🎯 **MANAGING THE OVERWHELMING: PRACTICAL IMPLEMENTATION**

### **Start Simple, Scale Systematically**
1. **Phase 1**: Focus on core property intelligence (DONE)
2. **Phase 2**: Add ONE accountability system (code violations)
3. **Phase 3**: Add community member coordination
4. **Phase 4**: Integrate advanced intelligence features

### **Purpose-Driven Feature Development**
- **Every database table** serves specific organizing campaigns
- **Every data point** enables strategic tenant union actions
- **Every analysis** supports community-controlled decision making
- **Every feature** multiplies organizing power, never creates surveillance

### **Community-Controlled Complexity**
- **Tenant Representatives** control which data systems to implement
- **Organizing Priorities** determine technical development roadmap
- **Community Capacity** determines implementation pace
- **Victory Requirements** shape database architecture decisions

---

## 💪 **THE DATABASE AS ORGANIZING POWER MULTIPLIER**

**Individual Tenant Problems → Systemic Corporate Accountability:**
- Single violation complaint → Corporate landlord violation pattern documentation
- Individual eviction threat → Portfolio-wide eviction defense coordination  
- Isolated housing struggle → Strategic organizing campaign with data evidence
- Personal tenant experience → Community-wide corporate landlord accountability

**The database architecture transforms overwhelming data complexity into strategic organizing simplicity - every data point serves the mission of tenant power and corporate landlord accountability.**

---

*Database architecture serves organizing. Organizing doesn't serve the database.*

**🏠 Homes for People, Not for Profit 🏠**