# Reno-Sparks Tenants Union Website Rebuild Plan

**Foundation-to-Platform Migration Strategy** - September 8, 2025

---

## 🎯 **PROJECT OVERVIEW**

**Mission**: Transform the existing WordPress-based tenant union website into a **comprehensive Next.js organizing intelligence platform** that combines community organizing with data-driven landlord accountability.

**Foundation Analysis**: 20+ existing HTML pages provide proven content structure, navigation patterns, and community engagement features that will be enhanced with our new organizing intelligence capabilities.

---

## 📋 **FOUNDATION CONTENT ANALYSIS**

### **Existing Content Structure (Foundation Files)**
```
Homepage: Reno Sparks Tenants Union - Homes for People, Not for Profit
Blog System: 12+ blog articles with organizing content
Member Stories: Community testimonials and "I Didn't Ask For This" series  
About Pages: Jack Woods leadership, organizational mission
Resource Pages: Legal aid connections, tenant rights information
Community Features: Mutual aid requests, upcoming events
Policy Content: Anti-homeless ordinance opposition, rent stabilization advocacy
```

### **Design & Navigation Patterns Identified**
- **Clean, professional design** with red (#cc0000) and dark red (#7a0000) branding
- **Accessible navigation** with clear hierarchy and mobile-friendly structure
- **Community-focused messaging** emphasizing collective action and mutual aid
- **Blog-based engagement** with regular organizing updates and policy analysis
- **Resource integration** connecting tenants to legal aid and support services

---

## 🏗️ **NEXT.JS PLATFORM ARCHITECTURE**

### **Site Structure: Foundation Enhanced with Intelligence**

```
MAIN NAVIGATION HEADER:
├── Home (Enhanced with Data Dashboard)
├── Organizing (NEW - Core Platform Features)
├── About (Foundation Content + Leadership)
├── Resources (Foundation + Intelligence Tools)
├── Blog (Foundation Migration + New Content)
├── Get Involved (Foundation + Data-Driven Actions)
└── Contact (Foundation Enhanced)
```

### **Page-by-Page Rebuild Strategy**

---

## 🏠 **1. HOMEPAGE: "Homes for People, Not for Profit"**

**Foundation Source**: `Reno Sparks Tenants Union - Homes for People, Not for Profit (9_8_2025 12：42：22 PM).html`

**Enhanced Features**:
- **Hero Section**: Maintain current messaging with data-driven impact stats
- **Corporate Landlord Quick Stats**: "192,398 properties mapped, 19 corporate targets identified"
- **Recent Victories**: Community organizing wins with data backing
- **Action Dashboard**: Quick access to organizing tools and corporate landlord lookup

**Key Additions**:
```tsx
// Homepage Dashboard Component
<OrganizingDashboard>
  <CorporateLandlordStats />
  <RecentVictories />
  <TakeActionNow />
  <CommunityMap />
</OrganizingDashboard>
```

---

## 🎯 **2. ORGANIZING SECTION (NEW - CORE PLATFORM)**

**Primary Navigation**: `/organizing/`

### **2.1 Corporate Landlords** (`/organizing/corporate-landlords/`)
- **Interactive Map**: Visualize all 192,398 properties with corporate ownership overlay
- **Landlord Database**: Searchable database of all corporate entities
- **Top Targets**: Detailed profiles of 19 high-priority organizing targets
- **Violation Reports**: Integration with code enforcement data (Phase 2)

### **2.2 Property Intelligence** (`/organizing/property-intelligence/`)
- **Property Lookup**: Enter any address to see ownership, violations, organizing status
- **Neighborhood Analysis**: Corporate ownership concentration by area
- **Multi-Unit Properties**: 5,695 properties with organizing potential
- **Market Analysis**: Rent burden mapping and profit margin analysis

### **2.3 Tenant Organizing Tools** (`/organizing/tools/`)
- **Campaign Builder**: Templates for organizing against specific corporate landlords
- **Tenant Network**: Connect tenants facing same corporate landlord
- **Violation Tracker**: Report and track landlord violations
- **Eviction Defense**: Early warning system and defense resources

### **2.4 Data & Reports** (`/organizing/data/`)
- **Corporate Ownership Reports**: Downloadable analysis for campaigns
- **Market Concentration Data**: Evidence for policy advocacy
- **Organizing Metrics**: Track campaign success and community growth
- **Public Records**: Links to all data sources and legal documentation

---

## 📚 **3. RESOURCES SECTION (FOUNDATION ENHANCED)**

**Foundation Sources**: Legal aid pages, tenant rights content, resource directories

### **3.1 Know Your Rights** (`/resources/rights/`)
- **Foundation Content**: Migrate existing tenant rights information
- **Nevada Law Guide**: NRS Chapter 118A organizing protections
- **Legal Aid Directory**: Enhanced with organizing-specific legal resources
- **Violation Reporting**: Step-by-step guides for documenting landlord violations

### **3.2 Organizing Guides** (`/resources/organizing/`)
- **Foundation Source**: "How to Organize a Tenants Association" content
- **Corporate Landlord Campaigns**: Specific strategies for data-driven organizing  
- **Building Committees**: Templates and guides for property-level organizing
- **Coalition Building**: Partner with other tenant unions and community organizations

### **3.3 Legal & Support Services** (`/resources/support/`)
- **Foundation Sources**: Civil Self-Help Law Center, Northern Nevada Legal Aid pages
- **Enhanced Directory**: Real-time contact information and specialization data
- **Referral System**: Automated connection to appropriate legal/support services
- **Mutual Aid Network**: Enhanced mutual aid request system

---

## 📰 **4. BLOG SECTION (FOUNDATION MIGRATION)**

**Foundation Source**: `Blog - Reno Sparks Tenants Union` (12+ existing articles)

### **Enhanced Blog Features**:
- **Foundation Content Migration**: All existing blog posts with improved SEO
- **Data-Driven Articles**: Regular reports on corporate landlord research
- **Campaign Updates**: Real-time organizing campaign progress
- **Policy Analysis**: Enhanced with corporate ownership data backing

### **New Content Categories**:
- **Corporate Landlord Investigations**: Monthly deep-dives on major landlords
- **Organizing Victories**: Success stories with data evidence
- **Policy Advocacy**: Legislative updates with organizing intelligence
- **Community Stories**: Enhanced member testimonials with organizing context

---

## 👥 **5. ABOUT SECTION (FOUNDATION + LEADERSHIP)**

**Foundation Sources**: Jack Woods page, organizational mission content

### **Enhanced About Structure**:
- **Mission & Vision**: Foundation content enhanced with organizing intelligence capabilities
- **Leadership Team**: Jack Woods bio + community organizing team profiles
- **Our Approach**: Data-driven organizing methodology explanation
- **Community Impact**: Statistics on organizing victories and community growth

---

## 🤝 **6. GET INVOLVED (FOUNDATION + ACTIONS)**

**Foundation Sources**: Events, mutual aid, community engagement content

### **Enhanced Engagement Features**:
- **Take Action Now**: Data-driven action alerts for specific corporate landlords
- **Join a Campaign**: Active organizing campaigns with volunteer opportunities
- **Community Events**: Enhanced event calendar with organizing focus
- **Volunteer Opportunities**: Skills-based volunteering for platform development

---

## 🗺️ **7. SPECIAL FEATURE: COMPREHENSIVE ORGANIZING MAP**

**Strategic Requirement**: "VERY-WELL thought out map to help users understand the full-scope of ownership and the total support/connections our union is making"

### **Interactive Map Features (`/map/`)**:

**Corporate Ownership Visualization**:
- **Property Layer**: All 192,398 properties with corporate/individual ownership indicators
- **Corporate Concentration**: Heat map showing corporate landlord density by neighborhood
- **Multi-Unit Properties**: Special markers for 5,695+ properties with high organizing potential
- **Campaign Status**: Visual indicators showing active organizing campaigns

**Community Support Network**:
- **Legal Aid Locations**: Northern Nevada Legal Aid, Civil Self-Help Law Center
- **Community Partners**: Nevada Housing Justice Alliance, coalition organizations
- **Tenant Union Chapters**: Building-level organizing committees and contacts
- **Resource Centers**: Food banks, mutual aid distribution points, community resources

**Organizing Intelligence Overlay**:
- **Violation Hotspots**: Areas with highest code enforcement violations (Phase 2)
- **Eviction Patterns**: Geographic patterns of corporate landlord evictions (Phase 2)
- **Rent Burden Areas**: Census tract data showing highest housing cost burden
- **Success Stories**: Locations of organizing victories and tenant union recognition

**Technical Implementation**:
```tsx
// Interactive Map Component Stack
<OrganizingMap>
  <PropertyOwnershipLayer />
  <CorporateConcentrationHeatMap />
  <CommunityResourceLayer />
  <OrganizingCampaignLayer />
  <LegalAidPartnerLayer />
  <VictoryMarkerLayer />
</OrganizingMap>
```

---

## 🔧 **TECHNICAL IMPLEMENTATION PLAN**

### **Next.js 15 Architecture**:
```
src/
├── app/                          # App Router pages
│   ├── page.tsx                  # Homepage (foundation enhanced)
│   ├── organizing/               # Core platform features
│   │   ├── corporate-landlords/  # Landlord database & profiles
│   │   ├── property-intelligence/ # Property lookup & analysis
│   │   ├── tools/                # Tenant organizing tools
│   │   └── data/                 # Reports & public records
│   ├── resources/                # Foundation content enhanced
│   ├── blog/                     # Foundation blog migration
│   ├── about/                    # Leadership & mission
│   ├── map/                      # Comprehensive organizing map
│   └── get-involved/             # Community engagement
├── components/
│   ├── organizing/               # Data visualization components
│   ├── maps/                     # Interactive map components
│   ├── foundation/               # Migrated foundation components
│   └── ui/                       # Design system components
├── lib/
│   ├── organizing/               # Corporate landlord intelligence
│   ├── data/                     # Database connections
│   └── content/                  # Content management system
└── data/
    ├── washoe_parcels.db         # Property intelligence database
    └── foundation_content/       # Migrated WordPress content
```

### **Database Integration**:
- **Property Intelligence**: SQLite database with 192,398+ records
- **Content Management**: Markdown-based system for blog/resource content  
- **User Management**: Community member profiles and organizing participation
- **Campaign Tracking**: Organizing campaign progress and victory documentation

---

## 📅 **IMPLEMENTATION TIMELINE**

### **Phase 1: Foundation Migration (Weeks 1-2)**
- Set up Next.js 15 project with Tailwind CSS
- Migrate all foundation HTML content to React components
- Implement core navigation and design system
- Deploy basic website with enhanced foundation content

### **Phase 2: Organizing Intelligence Integration (Weeks 3-4)**
- Integrate property database with corporate landlord profiles
- Build interactive map with property ownership visualization
- Create corporate landlord lookup and analysis tools
- Launch organizing intelligence features

### **Phase 3: Community Features (Weeks 5-6)**
- Enhanced blog system with organizing content categories
- Community engagement tools and campaign coordination
- Legal aid integration and resource directory enhancement
- Mobile-responsive optimization and accessibility improvements

### **Phase 4: Advanced Features (Weeks 7-8)**
- Real-time data updates and monitoring systems
- Advanced map features with organizing campaign tracking
- Community member profiles and organizing participation tracking
- Performance optimization and SEO enhancement

---

## 🎯 **SUCCESS METRICS**

### **Community Engagement**:
- Increased website traffic and user engagement
- Growth in organizing campaign participation
- Enhanced community resource utilization
- Improved tenant union membership and retention

### **Organizing Effectiveness**:
- More strategic corporate landlord campaign targeting
- Increased organizing victory rates
- Better community coordination and resource sharing
- Enhanced policy advocacy with data backing

### **Platform Performance**:
- Fast, accessible website performance on all devices
- Reliable property database and search functionality
- Effective integration with community organizing workflows
- Successful migration from WordPress with zero content loss

---

## 📋 **CONTENT MIGRATION CHECKLIST**

### **Foundation Content to Migrate**:
- ✅ Homepage design and messaging structure
- ✅ 12+ blog articles with organizing content
- ✅ Member stories and "I Didn't Ask For This" testimonials
- ✅ Jack Woods leadership profile and organizational mission
- ✅ Legal aid resource pages and tenant rights information
- ✅ Community event calendar and mutual aid request system
- ✅ Policy advocacy content (rent stabilization, anti-homeless ordinances)
- ✅ Navigation structure and accessibility features

### **Enhanced Features to Add**:
- 🚀 Corporate landlord database and property intelligence
- 🚀 Interactive organizing map with comprehensive data overlay
- 🚀 Tenant organizing tools and campaign coordination features
- 🚀 Real-time data dashboards and organizing metrics
- 🚀 Enhanced community engagement and volunteer coordination
- 🚀 Mobile-first progressive web app capabilities

---

## 🎉 **EXPECTED IMPACT**

**Transformational Website Enhancement**:
- **Foundation Preserved**: All existing community engagement and organizing content maintained
- **Intelligence Added**: Comprehensive corporate landlord accountability system integrated
- **Community Empowered**: Tools for data-driven organizing and coordinated tenant campaigns
- **Platform Future-Ready**: Scalable architecture for continued organizing intelligence development

**Organizing Power Multiplication**:
- Individual website visitors → Strategic organizing campaign participants
- General tenant resources → Targeted corporate landlord accountability tools
- Static content → Dynamic organizing intelligence and real-time campaign coordination
- Community website → Comprehensive tenant organizing platform

**The rebuilt website will serve as the **digital headquarters for data-driven tenant organizing in Nevada**, combining proven community engagement with unprecedented corporate landlord accountability capabilities.**

---

*Implementation begins upon approval - Foundation preserved, Intelligence integrated, Community empowered.*

**🏠 Homes for People, Not for Profit 🏠**