# Comprehensive Tenant Organizing Platform Proposal for Reno-Sparks Tenants Union

*Converted from: `./Comprehensive Tenant Organizing Platform Proposal for Reno-Sparks Tenants Union.pdf`*  
*Total pages: 22*  
*File size: 143472 bytes*  
*Converted: Mon Sep  8 09:36:34 PM PDT 2025*

---

## Page 1

### Complete Page View
![Page 1 Complete](images/page_001_full.png)

### Extracted Text

```
Comprehensive Tenant Organizing Platform Proposal for Reno-
Sparks Tenants Union
Building community power through collective digital infrastructure
The Reno-Sparks Tenants Union stands at a pivotal moment as Nevada's first publicized tenant union,
 The Nevada Independent   thenevadaindependent   protected by explicit organizing rights under NRS
118A.510(1)(c). Washoe County +2 This proposal outlines a comprehensive digital platform that combines
property mapping, secure organizing tools, and community governance to amplify RSTU's mission of
building tenant power. By leveraging open source technologies, volunteer development models, and
strategic partnerships, this platform will serve as critical infrastructure for transforming housing
justice organizing in Northern Nevada. Stanford Social Innovation Re…

Technical implementation for nonprofit infrastructure

Comprehensive technical architecture
The platform architecture prioritizes accessibility, security, and scalability while maintaining cost-
effectiveness for nonprofit operations. The recommended technology stack combines proven open
source solutions with modern development practices: Tendenci

Core Technology Stack:

 • Backend Framework: Django (Python) with Django REST Framework for API development

 • Database: PostgreSQL 14+ with PostGIS 3.0+ extension for spatial data

 • Frontend: React.js 18+ with TypeScript for type safety

 • Mapping Engine: Leaflet.js 1.9+ with OpenStreetMap base tiles (free) and optional Mapbox GL JS
    for advanced features Leaflet

 • Caching Layer: Redis for session management and query optimization

 • Search Engine: PostgreSQL full-text search initially, Elasticsearch for scale

 • Container Orchestration: Docker with Docker Compose for local development

 • Version Control: Git with GitHub for code management and collaboration

Property mapping and data integration architecture
The mapping platform will display actual building boundaries and ownership networks through
integration with Washoe County's property data systems. The technical implementation leverages
multiple data sources:

Washoe County Data Integration:
```

---

## Page 2

### Complete Page View
![Page 2 Complete](images/page_002_full.png)

### Extracted Text

```
 • Primary Data Source: GSA_QuickInfo.zip bulk download (updated nightly) containing property
   assessment data, ownership records, and sales information Washoe County   washoecounty

 • GIS Services: ArcGIS REST API at wcgisweb.washoecounty.us for real-time parcel boundaries and
   spatial queries Washoecounty

 • Data Pipeline: Automated ETL process using Python scripts to parse tab-delimited files and load
   into PostgreSQL/PostGIS

 • Update Frequency: Nightly synchronization with county assessor data ensuring current
   information washoecounty

Spatial Data Processing:
```

---

## Page 3

### Complete Page View
![Page 3 Complete](images/page_003_full.png)

### Extracted Text

```
sql

-- Property boundaries with ownership tracking
CREATE TABLE properties (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid( ),
     parcel_id VARCHAR(20) UNIQUE NOT NULL,
     address TEXT NOT NULL,
     geometry GEOMETRY(MULTIPOLYGON, 4326),
     centroid GEOMETRY(POINT, 4326),
     unit_count INTEGER,
     building_type VARCHAR(50),
     year_built INTEGER,
     assessed_value DECIMAL(12,2),
     tax_amount DECIMAL(10,2),
     last_sale_date DATE,
     last_sale_price DECIMAL(12,2),
     data_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Landlord portfolio tracking
CREATE TABLE landlords (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid( ),
     name VARCHAR(255) NOT NULL,
     entity_type VARCHAR(50),
     mailing_address TEXT,
     properties_owned INTEGER DEFAULT 0,
     total_units INTEGER DEFAULT 0,
     portfolio_value DECIMAL(15,2),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Property ownership relationships
CREATE TABLE property_ownership (
     property_id UUID REFERENCES properties(id),
     landlord_id UUID REFERENCES landlords(id),
     ownership_percentage DECIMAL(5,2) DEFAULT 100.00,
     acquisition_date DATE,
     ownership_type VARCHAR(50),
     PRIMARY KEY (property_id, landlord_id)
);


-- Spatial indexes for performance
CREATE INDEX idx_properties_geometry ON properties USING GIST (geometry);
CREATE INDEX idx_properties_centroid ON properties USING GIST (centroid);
CREATE INDEX idx_properties_parcel ON properties(parcel_id);
```

---

## Page 4

### Complete Page View
![Page 4 Complete](images/page_004_full.png)

### Extracted Text

```
Database design for organizing infrastructure
The database schema supports comprehensive tenant organizing workflows while maintaining security
and privacy:
```

---

## Page 5

### Complete Page View
![Page 5 Complete](images/page_005_full.png)

### Extracted Text

```
sql

-- Tenant information with privacy controls
CREATE TABLE tenants (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid( ),
     display_name VARCHAR(100),
     email_encrypted BYTEA,
     phone_encrypted BYTEA,
     property_id UUID REFERENCES properties(id),
     unit_number VARCHAR(20),
     lease_start DATE,
     lease_end DATE,
     monthly_rent DECIMAL(8,2),
     verified BOOLEAN DEFAULT FALSE,
     anonymous_mode BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Organizing campaigns
CREATE TABLE campaigns (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid( ),
     name VARCHAR(255) NOT NULL,
     campaign_type VARCHAR(50), -- rent_strike, repairs, policy_advocacy
     target_landlord_id UUID REFERENCES landlords(id),
     target_properties UUID[ ],
     status VARCHAR(50) DEFAULT 'planning',
     participant_count INTEGER DEFAULT 0,
     demands TEXT,
     victories TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Issue tracking and patterns
CREATE TABLE issues (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid( ),
     tenant_id UUID REFERENCES tenants(id),
     property_id UUID REFERENCES properties(id),
     category VARCHAR(100), -- habitability, harassment, illegal_rent_increase
     description TEXT,
     severity VARCHAR(20),
     evidence_urls TEXT[ ],
     status VARCHAR(50) DEFAULT 'reported',
     reported_date DATE,
     resolved_date DATE
);
```

---

## Page 6

### Complete Page View
![Page 6 Complete](images/page_006_full.png)

### Extracted Text

```
  -- Organizing progress tracking
  CREATE TABLE organizing_metrics (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid( ),
       property_id UUID REFERENCES properties(id),
       total_units INTEGER,
       contacted_units INTEGER DEFAULT 0,
       organized_units INTEGER DEFAULT 0,
       active_issues INTEGER DEFAULT 0,
       last_canvas_date DATE,
       notes TEXT,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );


Security architecture and anti-infiltration protocols
The platform implements defense-in-depth security strategies informed by activist security best
practices and historical anti-infiltration measures:

Technical Security Measures:

 • End-to-End Encryption: Field-level encryption for sensitive tenant data using AES-256

 • Multi-Factor Authentication: TOTP-based 2FA mandatory for all organizer accounts
        activisthandbook

 • Role-Based Access Control: Granular permissions system with principle of least privilege

 • Audit Logging: Comprehensive activity logging with tamper-proof storage

 • API Security: Rate limiting, JWT authentication, CORS configuration

 • Database Security: Connection pooling, prepared statements, SQL injection prevention

Anti-Infiltration Framework:

 • Progressive Trust Levels: New members start with limited access, expanding over time

 • Verification Workflows: Multi-step verification including existing member vouching

 • Activity Monitoring: Anomaly detection for suspicious access patterns

 • Information Compartmentalization: Sensitive strategic data isolated from general access

 • Secure Communications: Signal integration for leadership coordination Signal +2

 • Regular Security Audits: Quarterly reviews of access permissions and user activities

Privacy Protection Implementation:
```

---

## Page 7

### Complete Page View
![Page 7 Complete](images/page_007_full.png)

### Extracted Text

```
 • Data Minimization: Collect only essential information for organizing purposes Home Made Blog

 • Anonymization Options: Allow tenants to participate without revealing identity

 • Consent Management: Explicit opt-in for data collection and usage Home Made Blog

 • Right to Deletion: Automated data purging workflows

 • Nevada SB 220 Compliance: Privacy policy with opt-out mechanisms TrustArc        Clym


Infrastructure cost estimates
Based on AWS and Google Cloud pricing for nonprofit organizations:

Initial Development Infrastructure (Monthly):

 • Development Environment: $50-75
     • EC2 t3.small instance: $15/month

     • RDS PostgreSQL t3.micro: $25/month

     • S3 storage (10GB): $3/month

     • CloudFront CDN: $10/month

Production Environment (Monthly):

 • Small Scale (< 1,000 properties): $150-400
     • EC2 t3.medium with auto-scaling: $35-70/month

     • RDS PostgreSQL t3.medium with backups: $60-100/month

     • S3 storage and backups: $20-40/month

     • CloudFront CDN: $15-30/month

     • Application monitoring: $20-40/month

Scaling Considerations (1,000-10,000 properties): $400-1,200/month with reserved instances
providing 30-60% savings

Cost Optimization Strategies:

 • Apply for AWS Nonprofit Credit Program ($1,000 initial credit) Amazon Web Services
    Amazon Web Services

 • Utilize Google for Nonprofits for additional credits Google Cloud

 • Implement aggressive caching to reduce database load

 • Use spot instances for batch processing tasks

Nonprofit-focused organizing strategy

Digital tools for tenant connection and collective action
```

---

## Page 8

### Complete Page View
![Page 8 Complete](images/page_008_full.png)

### Extracted Text

```
The platform provides comprehensive tools designed specifically for building tenant power through
collective organizing: Stanford Social Innovation Re…

Building-Level Organizing Tools:

  • Digital Door-Knocking: Mobile app for canvassers to track outreach, record conversations, and
    identify tenant leaders

  • Tenant Matching System: Automated matching of tenants in same building or with same landlord

  • Issue Aggregation: Pattern detection across properties to identify systemic problems

  • Anonymous Reporting: Secure submission system for tenants fearful of retaliation

Campaign Coordination Features:

  • Campaign Dashboard: Real-time tracking of participation, milestones, and victories

  • Secure Messaging: Encrypted group chats for campaign participants

  • Document Generation: Automated creation of demand letters, petitions, and legal notices

  • Event Management: Meeting scheduling, RSVP tracking, and reminder systems

  • Resource Library: Templates, know-your-rights guides, and organizing materials

Collective Action Infrastructure:

  • Escalation Ladders: Progressive engagement tracking from issue reporting to leadership

  • Solidarity Networks: Cross-building support systems for rent strikes and campaigns

  • Rapid Response System: Emergency alerts for evictions or urgent situations

  • Story Collection: Multimedia testimonials for media and advocacy campaigns

Integration with legal aid and community partners
The platform establishes seamless connections with Nevada's legal aid infrastructure and community
organizations:

Legal Aid Integration:

  • Direct Referral System: Automated referrals to Nevada Legal Services and Washoe Legal Services
     Nevada Legal Services   nevadalegalservices

  • Case Documentation: Evidence collection tools meeting legal standards

  • Court Date Tracking: Calendar integration for hearings and deadlines

  • Document Templates: Pre-populated forms for common legal procedures

Community Partnership Framework:
```

---

## Page 9

### Complete Page View
![Page 9 Complete](images/page_009_full.png)

### Extracted Text

```
  • API Access: Secure data sharing with trusted partner organizations

  • Coalition Dashboards: Shared metrics for joint campaigns

  • Resource Coordination: Centralized directory of services and support

  • Training Modules: Onboarding materials for partner organization staff

Volunteer development and maintenance models
The platform adopts proven open source governance models to ensure sustainable volunteer-driven
development: Wikipedia

Development Structure:

  • Core Team: 3-5 committed volunteers managing architecture and releases

  • Working Groups: Specialized teams for frontend, backend, security, and documentation

  • Contributor Levels: Clear progression from bug fixes to feature development to core team

  • Mentorship Program: Pairing experienced developers with newcomers

Technical Contribution Framework:

  • Good First Issues: Clearly labeled tasks for new contributors

  • Progressive Complexity: Graduated difficulty levels for different skill sets

  • Code Review Process: Peer review ensuring quality and knowledge transfer

  • Documentation Standards: Comprehensive inline comments and API documentation

Community Engagement:

  • Weekly Development Calls: Open meetings for coordination and planning

  • Quarterly Hackathons: Intensive development sprints with community participation

  • University Partnerships: Engagement with UNR computer science programs

  • Skills Workshops: Regular training on platform technologies

Community ownership and governance
The platform implements democratic governance ensuring community control over development and
data: Wikipedia +2

Governance Structure:

  • Steering Committee: 7 members elected annually by RSTU membership

  • Technical Advisory Board: 5 volunteers providing architectural guidance

  • Community Forums: Monthly open meetings for input and feedback

  • Decision Framework: Major decisions require 60% membership approval
```

---

## Page 10

### Complete Page View
![Page 10 Complete](images/page_010_full.png)

### Extracted Text

```
Data Governance Policies:

 • Community Data Ownership: All data remains property of RSTU membership

 • Privacy Committee: Oversight of data collection and usage practices

 • Transparency Reports: Quarterly updates on data requests and security incidents

 • Audit Rights: Annual third-party security and privacy audits

Implementation roadmap for established nonprofit

Phase 1: Foundation building (Months 1-3)
Technical Setup:

 • Establish development environment and Git repositories

 • Configure CI/CD pipeline with automated testing

 • Implement core database schema and API framework

 • Deploy basic authentication and security infrastructure

Data Integration:

 • Develop Washoe County data ingestion pipeline

 • Build initial property and ownership database

 • Create basic mapping interface with property boundaries

 • Implement search and filtering capabilities

Team Formation:

 • Recruit 5-10 volunteer developers through community outreach Bloomerang   Tech Jobs for Good

 • Establish working groups and communication channels

 • Create contribution guidelines and code of conduct

 • Launch mentorship program for new contributors

Success Metrics:

 • Development environment operational

 • 500+ properties loaded with ownership data

 • 10+ active volunteer contributors

 • Basic platform accessible to core organizing team

Phase 2: Core features deployment (Months 4-6)
Organizing Tools:
```

---

## Page 11

### Complete Page View
![Page 11 Complete](images/page_011_full.png)

### Extracted Text

```
 • Launch tenant registration and verification system

 • Deploy issue reporting and tracking features

 • Implement campaign management dashboard

 • Create secure messaging infrastructure

Mapping Enhancement:

 • Add heat maps for issue concentration

 • Implement landlord portfolio visualization

 • Create building-level organizing views

 • Deploy mobile-responsive interface

Security Hardening:

 • Complete security audit and penetration testing

 • Implement comprehensive encryption

 • Deploy anti-infiltration measures

 • Establish incident response procedures

Success Metrics:

 • 100+ registered tenant users

 • 50+ issues documented

 • 3+ active campaigns tracked

 • Security audit passed

Phase 3: Advanced capabilities (Months 7-9)
Integration Development:

 • Connect with legal aid referral systems

 • Implement document generation tools

 • Deploy automated pattern detection

 • Create public-facing advocacy dashboards

Scale Optimization:
```

---

## Page 12

### Complete Page View
![Page 12 Complete](images/page_012_full.png)

### Extracted Text

```
 • Performance tuning for 10,000+ properties

 • Implement advanced caching strategies

 • Deploy content delivery network

 • Optimize database queries

Community Features:

 • Launch volunteer contributor portal

 • Implement community governance tools

 • Deploy training and documentation platform

 • Create feedback and support systems

Success Metrics:

 • 500+ active users

 • 2,000+ properties mapped

 • 20+ volunteer contributors

 • 5+ organizational partnerships established

Phase 4: Full platform launch (Months 10-12)
Production Deployment:

 • Complete security hardening and compliance verification

 • Launch production environment with monitoring

 • Implement backup and disaster recovery

 • Deploy comprehensive logging and analytics

Community Rollout:

 • Public launch with media campaign

 • Onboard existing RSTU membership

 • Train volunteer organizers on platform usage

 • Establish support and feedback channels

Sustainability Planning:
```

---

## Page 13

### Complete Page View
![Page 13 Complete](images/page_013_full.png)

### Extracted Text

```
 • Document all systems and processes

 • Establish long-term governance structures

 • Secure multi-year funding commitments

 • Create succession planning for key roles

Success Metrics:

 • 1,000+ registered users

 • 5,000+ properties in database

 • 10+ successful campaigns supported

 • Sustainable volunteer development team

Training and adoption strategies
Organizer Training Program:

 • Week 1: Platform basics and navigation (2 hours)

 • Week 2: Data collection and tenant outreach (2 hours)

 • Week 3: Campaign management and coordination (2 hours)

 • Week 4: Security practices and privacy protection (2 hours) activisthandbook

 • Ongoing: Monthly skill-building workshops

Tenant Onboarding:

 • 15-minute quick registration process

 • Video tutorials in English and Spanish

 • Peer support groups for new users

 • Regular "know your rights" workshops integrated with platform training

Developer Onboarding:

 • Comprehensive development environment setup guide

 • Architecture overview and codebase tour

 • Pairing with experienced contributors

 • Clear documentation of contribution process

Success metrics for organizing effectiveness
Base Building Metrics:
```

---

## Page 14

### Complete Page View
![Page 14 Complete](images/page_014_full.png)

### Extracted Text

```
 • Tenant participation rate by building/neighborhood

 • Geographic coverage across Reno-Sparks

 • Membership growth and retention rates

 • Leadership development pipeline

Campaign Effectiveness:

 • Issue resolution rates

 • Average time from report to resolution

 • Collective action participation rates

 • Policy victories and legal wins

Platform Engagement:

 • Daily/monthly active users

 • Feature utilization rates

 • User satisfaction scores

 • Support ticket resolution times

Community Strength:

 • Volunteer contributor retention Kindful

 • Cross-campaign solidarity actions

 • Media mentions and narrative influence

 • Partner organization engagement

Nonprofit partnership framework

Legal aid organization integration
The platform establishes deep integration with Nevada's legal aid infrastructure to provide
comprehensive tenant support:

Nevada Legal Services Partnership:

 • Direct API integration for case referrals

 • Shared intake forms reducing duplication

 • Joint case tracking for systemic issues

 • Regular data sharing on violation patterns

Washoe Legal Services Collaboration:
```

---

## Page 15

### Complete Page View
![Page 15 Complete](images/page_015_full.png)

### Extracted Text

```
 • Co-located organizing and legal clinics

 • Integrated calendar for court dates and deadlines

 • Document sharing for evidence collection

 • Joint training on legal rights and organizing

Implementation Framework:

 • Memorandums of understanding defining data sharing

 • Technical integration through secure APIs

 • Regular coordination meetings

 • Joint funding proposals for integrated services

Housing justice coalition building
Regional Partnerships:

 • Nevada Housing Justice Alliance: Statewide coordination on policy campaigns

 • Faith Organizing Alliance: Congregation-based organizing support

 • Labor Union Partnerships: Joint campaigns on affordable housing

 • Student Organizations: UNR and TMCC student tenant organizing

National Networks:

 • Autonomous Tenants Union Network: Atun-rsia Resource sharing and strategy coordination

 • Right to the City Alliance: National campaign participation

 • Homes Guarantee Coalition: Federal policy advocacy

Coalition Infrastructure:

 • Shared campaign tracking systems

 • Cross-organization data agreements

 • Joint communications strategies

 • Coordinated legal support networks

Academic partnerships and research
University of Nevada, Reno Collaboration:
```

---

## Page 16

### Complete Page View
![Page 16 Complete](images/page_016_full.png)

### Extracted Text

```
 • Computer Science Department: Capstone projects for platform development

 • School of Social Work: Research on organizing effectiveness

 • Geography Department: GIS analysis and mapping support

 • Law School Clinic: Pro bono legal research and support

Research Initiatives:

 • Longitudinal studies on organizing impact

 • Housing condition surveys and analysis

 • Displacement and gentrification mapping

 • Policy evaluation and recommendations

Student Engagement:

 • Semester-long development projects

 • Summer internship programs

 • Thesis and dissertation research opportunities

 • Service learning course integration

Community partner integration
Social Service Providers:

 • Food banks and emergency assistance programs

 • Healthcare and mental health services

 • Workforce development organizations

 • Childcare and family support services

Integration Methods:

 • Shared resource directories

 • Warm handoff referral systems

 • Co-location of services

 • Joint case management protocols

Legal considerations for nonprofit operations

Nevada tenant protection laws and organizing rights
The platform operates within Nevada's legal framework, leveraging explicit protections for tenant
organizing:
```

---

## Page 17

### Complete Page View
![Page 17 Complete](images/page_017_full.png)

### Extracted Text

```
Key Legal Protections:

 • NRS 118A.510(1)(c): Prohibits landlord retaliation against tenants for joining unions state

 • First Amendment Rights: Constitutional protections for assembly and speech

 • Fair Housing Act: Protection against discrimination in organizing activities state

Platform Compliance Features:

 • Automated notices ensuring legal compliance

 • Template generation for legally required communications

 • Audit trails documenting organizing activities

 • Integration with legal deadlines and requirements

Privacy and data protection compliance
Nevada Privacy Law (SB 220) Implementation:

 • Opt-out mechanisms for data sales (though no sales planned) TrustArc     TermsFeed

 • Privacy policy clearly stating data usage TrustArc

 • Verification procedures for data requests TrustArc

 • 60-day response timeline for privacy requests TrustArc

Data Protection Framework:

 • Encryption at rest and in transit

 • Regular security audits and updates

 • Incident response procedures

 • Data breach notification protocols

GDPR-Inspired Principles:

 • Data minimization and purpose limitation Home Made Blog

 • Consent management and withdrawal Home Made Blog

 • Right to access and portability

 • Privacy by design architecture

Nonprofit compliance requirements
501(c)(3) Compliance:
```

---

## Page 18

### Complete Page View
![Page 18 Complete](images/page_018_full.png)

### Extracted Text

```
 • Prohibition on partisan political activity

 • Limitation on legislative lobbying (20% rule)

 • Public support test maintenance

 • Annual Form 990 reporting

501(c)(4) Alternative:

 • Greater flexibility for advocacy

 • Unlimited lobbying for mission advancement

 • Political activity as non-primary purpose

 • Simplified reporting requirements

Nevada State Requirements:

 • Annual list filing with Secretary of State Nevadasbdc   501c3.org

 • Registered agent maintenance

 • Charitable solicitation registration

 • Business license compliance Nevadasbdc

Insurance and liability management
Coverage Requirements:

 • General Liability: $1-2 million for operations

 • Directors & Officers: Protection for board decisions

 • Cyber Liability: Data breach and privacy coverage

 • Professional Liability: Errors and omissions protection

Risk Management Strategies:

 • Clear disclaimers on legal advice limitations

 • Separation between organizing and legal services

 • Volunteer screening and training

 • Regular legal review of materials

Implementation through Nonprofits Insurance Alliance:
```

---

## Page 19

### Complete Page View
![Page 19 Complete](images/page_019_full.png)

### Extracted Text

```
 • Specialized coverage for organizing activities Insurancefornonprofits

 • Risk management resources and training

 • Claims advocacy and support

 • Premium financing options

Technology governance for nonprofit sustainability

Open source development model
The platform adopts proven open source governance ensuring long-term sustainability and community
control: Wikipedia

License Selection:

 • GNU Affero General Public License (AGPL) v3: Ensures derivative works remain open source
     Opensource.com

 • Creative Commons BY-SA: Documentation and content licensing

 • Open Database License (ODbL): Community data remains accessible

Contribution Framework:


  markdown

  ## Contribution Levels
  1. **Contributor**: Anyone submitting patches, documentation, or translations
  2. **Committer**: Regular contributors with direct repository access
  3. **Core Team**: Architecture decisions and release management
  4. **Steering Committee**: Strategic direction and governance


  ## Advancement Criteria
  - Contributors → Committers: 10+ quality contributions over 3 months
  - Committers → Core Team: 6 months active participation, peer nomination
  - Core Team → Steering: Annual election by RSTU membership


Development Workflow:

 • Feature branches with pull request reviews

 • Continuous integration with automated testing

 • Semantic versioning for releases

 • Regular security updates and patches

Community input and decision processes
Decision-Making Framework:
```

---

## Page 20

### Complete Page View
![Page 20 Complete](images/page_020_full.png)

### Extracted Text

```
 • Operational Decisions: Core team consensus with lazy approval

 • Technical Architecture: Technical advisory board recommendations

 • Strategic Direction: Steering committee with membership input

 • Major Changes: 60% membership approval required

Feedback Mechanisms:

 • Monthly community calls open to all

 • Quarterly surveys on platform effectiveness

 • Issue tracking for bugs and feature requests

 • Community forum for discussion and support

Transparency Measures:

 • Public meeting minutes and recordings

 • Open financial reporting

 • Development roadmap visibility

 • Regular progress updates to membership

Data ownership and privacy policies
Data Governance Principles:

 • Community Ownership: All data belongs to RSTU membership collectively

 • Individual Control: Tenants maintain rights to their personal information Minut   Aaron Hall

 • Transparency: Clear documentation of data usage and sharing

 • Security First: Protection against unauthorized access or misuse Aaron Hall

Privacy Policy Framework:
```

---

## Page 21

### Complete Page View
![Page 21 Complete](images/page_021_full.png)

### Extracted Text

```
  markdown

  ## Data Collection
  - Minimum necessary for organizing purposes
  - Explicit consent for sensitive information
  - Clear purpose limitation statements
  - Regular review and data purging


  ## Data Usage
  - Internal organizing only (no commercial use)
  - Aggregate analysis for campaigns
  - Pattern detection for systemic issues
  - Research with appropriate anonymization


  ## Data Sharing
  - Only with explicit consent
  - Partner organizations under data agreements
  - Legal requirements with notification
  - Never sold or commercialized



Volunteer recruitment and management
Recruitment Strategy: Kindful          Bloomerang


 • University partnerships for student developers Tech Jobs for Good

 • Tech worker solidarity networks

 • Code for America brigade engagement GitHub            Wikipedia

 • Progressive tech communities outreach

Volunteer Support System: Kindful           Bloomerang


 • Comprehensive onboarding documentation Kindful             Developforgood

 • Mentorship program for skill development Bloomerang               Developforgood

 • Recognition system for contributions Kindful

 • Professional development opportunities Kindful

Retention Strategies: Kindful         Bloomerang


 • Clear impact communication

 • Flexible engagement levels Kindful

 • Social community building

 • Skills-based project matching
```

---

## Page 22

### Complete Page View
![Page 22 Complete](images/page_022_full.png)

### Extracted Text

```
Management Infrastructure:

 • Project management tools (GitHub Projects)

 • Communication platforms (Discord/Matrix)

 • Documentation wikis

 • Regular contributor gatherings

Conclusion: Building power through community technology
The Reno-Sparks Tenants Union platform represents more than technical infrastructure—it embodies
a vision of community-controlled technology serving housing justice. The Nevada Independent +2 By
combining sophisticated mapping capabilities with secure organizing tools, democratic governance
with volunteer sustainability, and legal compliance with bold organizing strategies, this platform
positions RSTU to lead transformative change in Nevada's housing landscape. Notes From Below

The implementation roadmap provides a clear path from foundation to full deployment, while the
governance structure ensures the platform remains accountable to the community it serves. Through
strategic partnerships with legal aid organizations, academic institutions, and allied movements, the
platform amplifies collective tenant power while maintaining the security and sustainability essential
for long-term organizing success. Pubpub

This comprehensive approach—rooted in open source principles, protected by Nevada law,
Nevada Legislature   state   and sustained by community ownership—creates the digital infrastructure
necessary for building a powerful, lasting tenant movement in Northern Nevada and beyond.
Mission +2
```

---

