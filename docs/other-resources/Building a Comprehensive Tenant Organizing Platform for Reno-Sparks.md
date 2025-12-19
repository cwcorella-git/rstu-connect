# Building a Comprehensive Tenant Organizing Platform for Reno-Sparks

*Converted from: `./Building a Comprehensive Tenant Organizing Platform for Reno-Sparks.pdf`*  
*Total pages: 5*  
*File size: 74900 bytes*  
*Converted: Mon Sep  8 09:36:28 PM PDT 2025*

---

## Page 1

### Complete Page View
![Page 1 Complete](images/page_001_full.png)

### Extracted Text

```
Building a comprehensive tenant organizing platform for Reno-
Sparks
This report synthesizes extensive research on technical architecture, privacy systems, mapping
solutions, and successful organizing platforms to provide an implementable blueprint for the Reno-
Sparks Tenants Union. The recommendations prioritize practical solutions that a single developer can
prototype while establishing foundations for future expansion across Nevada's distinct rental markets.

Technical foundation balances security with accessibility
The research identifies Discourse forum software running on PostgreSQL with PostGIS as the
optimal technical stack for the Reno-Sparks platform. This combination provides professional
community features, geographic data capabilities, and nonprofit-friendly hosting options while
remaining manageable for a single developer. GeoPerformans +2 DreamHost's free hosting for 501(c)(3)
organizations eliminates infrastructure costs, allowing resources to focus on development and
organizing. DreamHost     Zeffy   The platform should integrate Smarty's address verification API ($0.60-
$0.80 per 1000 requests) to validate tenant residency without storing sensitive location data. Smarty

For database architecture, PostgreSQL with PostGIS extensions enables sophisticated property
tracking while maintaining simplicity. GeoPerformans +2 The system can store property records with
geographic coordinates, landlord information as JSON objects, and tenant turnover patterns without
exposing individual tenant data. GitHub This structure supports both immediate organizing needs and
future expansion to complex ownership network analysis.

Privacy architecture protects organizers from surveillance
Research into labor organizing security and anti-doxxing measures reveals that layered security
approaches work best for non-technical users. Activist Handbook +3 The platform should implement
three tiers of protection: basic security using Signal and strong passwords for all members,
intermediate protection adding Tor Browser and VPN usage for active organizers, and advanced
measures including burner devices and zero-knowledge proofs for high-risk situations.
 Infosecforactivists +5


The most critical innovation involves cryptographic address verification without data exposure. By
hashing verified addresses with salts and storing only the hash, the platform can confirm tenant
residency while preventing landlords from identifying specific participants. Wilson Center   Wikipedia   This
approach, combined with time-locked membership progression and community-based verification
where existing tenants vouch for new members, creates robust anti-infiltration measures without
sacrificing usability.
```

---

## Page 2

### Complete Page View
![Page 2 Complete](images/page_002_full.png)

### Extracted Text

```
For communication security, the platform should integrate Matrix protocol for decentralized
messaging alongside Signal for sensitive organizing. The Commons Social Change … Matrix's federation
capabilities allow tenant organizations to run their own servers, eliminating single points of control
while maintaining end-to-end encryption through Olm and Megolm cryptographic ratchets.
 Matrix.org +3   This dual approach provides both immediate secure communication and long-term
infrastructure independence.

Mapping visualizes power dynamics and organizing progress
The Anti-Eviction Mapping Project's methodologies demonstrate that Leaflet.js provides the optimal
balance between functionality and accessibility for property visualization. Antievictionmap +4 Its 42KB
footprint and mobile-first design enable rapid deployment of interactive maps showing ownership
concentration, rent prices, and organizing density. The platform should layer multiple data
visualizations: heat maps for organizing membership density using gradient colors from blue (low) to
red (high), choropleth maps linking census tracts to rent burden data, Plotly and clustering algorithms
to identify corporate ownership patterns.

Washoe County's comprehensive property data systems offer exceptional accessibility through
multiple channels. The Washoe Regional Mapping System provides GIS-ready parcel data,
 Washoecounty    while the Assessor's database contains 190,000+ downloadable property records.
 Washoe County    By combining these sources with Nevada Secretary of State business entity data, the
platform can automatically identify ownership networks and track corporate landlord portfolios across
the region.

Successful platforms demonstrate essential features
Analysis of JustFix.nyc, ACORN UK, and the LA Tenants Union reveals core features that drive
organizing success. Antievictionmap    Pubpub   JustFix's open-source Django/React architecture
supporting 1,200+ families provides a proven technical template, GitHub while their integration with
NYC's HPD registration data demonstrates the power of public records integration. The platform
achieved sustained impact by focusing on practical tools: documenting apartment conditions with
geotagged photos, navigating bureaucratic complaint systems, and connecting tenants across building
portfolios. JustFix    NYHC


ACORN UK's £11/month membership model demonstrates financial sustainability through member
dues rather than grant dependency. Their "eviction resistance bootcamps" and direct action
coordination tools show how digital platforms must support physical organizing. Acorninternational The
LA Tenants Union's commitment to bilingual operations from inception, not as an afterthought, proves
essential for inclusive organizing in diverse communities like Reno-Sparks. Latenantsunion   latenantsunion
```

---

## Page 3

### Complete Page View
![Page 3 Complete](images/page_003_full.png)

### Extracted Text

```
Failed platforms consistently share three vulnerabilities: over-reliance on grant funding versus
member-driven sustainability, tools built without sufficient organizer input that fail to gain adoption,
and inadequate privacy protections that expose tenant information to landlords or law enforcement.
These lessons mandate community-centered design, sustainable funding models, and security-first
architecture.

Nevada's legal framework enables robust organizing
Nevada provides exceptionally strong legal protections for tenant organizing under NRS Chapter
118A, explicitly protecting tenants who "organized or become a member of a tenant's union."
 Nevada Legislature   These protections exceed many states' frameworks, prohibiting landlord retaliation
for organizing activities with civil remedies and district attorney enforcement powers. Nevada Legislature
The 14-day repair timeline and tenant right to withhold rent or repair-and-deduct create leverage for
collective action. Nevada Legislature

The research reveals that while Las Vegas and Reno-Sparks share statewide legal protections, their
400+ mile separation creates distinct organizing environments. Reno-Sparks' smaller market
(470,000 population) with higher median income ($3,603/month) and tech sector growth differs
substantially from Las Vegas' larger service economy (2.3 million population) with lower median
income ($3,022/month). Norada Real Estate      Steadily   This geographic reality recommends initial focus on
Reno-Sparks with separate but coordinated Las Vegas expansion after establishing the platform's core
functionality.

Implementation roadmap prioritizes rapid prototyping

Phase 1: Foundation Sprint (Weeks 1-4)
Deploy basic infrastructure using Discourse on DreamHost's nonprofit hosting. DreamHost             Zeffy

Configure PostgreSQL with PostGIS for spatial data support. PostGIS           Colostate   Implement Smarty
address verification API for residency confirmation. Smarty Create initial property database schema
linking addresses to organizing status. This phase costs approximately $50 for domain registration and
initial API testing.

Phase 2: Core Organizing Features (Weeks 5-8)
Build property ownership lookup using Washoe County's 190,000+ record dataset. Washoe County
Implement anonymous user registration with cryptographic address hashing. Deploy Leaflet.js
mapping showing properties and organizing density. Create document library for tenant resources and
rights information. Add Signal integration guidelines and security tutorials. Infosecforactivists +2 Total
additional cost: $30/month for API usage at modest scale.

Phase 3: Advanced Capabilities (Weeks 9-12)
```

---

## Page 4

### Complete Page View
![Page 4 Complete](images/page_004_full.png)

### Extracted Text

```
Integrate Matrix server for decentralized communication ($20/month for small VPS).
The Commons Social Change …   Matrix   Add D3.js visualizations for ownership network analysis. D3
Implement mobile Progressive Web App for field organizing. Create automated scraping for property
ownership updates. Deploy multi-language support for Spanish-speaking tenants. Build coalition
partner portal for legal aid organizations.

Phase 4: Scaling and Sustainability (Months 4-6)
Transition to member dues model ($5-15/month sliding scale). Establish data governance committee
with tenant representatives. Create organizer training materials and video tutorials. Implement
advanced security features including Tor hidden service access. Medium Develop API for partner
organization integration. Plan Las Vegas market expansion with separate infrastructure.

Critical success factors shape development priorities
Community ownership over technical sophistication emerges as the paramount principle. The
platform must remain under tenant control through transparent governance, open-source code, and
member-driven feature development. Tenants Together +2 Technical decisions should prioritize organizer
needs over developer preferences, with regular feedback loops ensuring the platform serves its
intended users.

Security through simplicity provides protection without excluding non-technical tenants. Rather than
complex cryptographic systems, the platform should implement straightforward measures like Signal
for communication, strong passwords with manager apps, and clear visual indicators for security
status. Infosecforactivists +3 Advanced features remain available but optional, preventing security theater
from impeding organizing.

Data as organizing tool, not surveillance risk requires careful architecture. The platform should
collect only essential information, implement automatic data expiration for sensitive records, and
maintain transparent logs of data access. Minut Property ownership data remains public and
searchable, while tenant information stays encrypted and minimal. Digital Impact

Collaboration strategy leverages existing networks
Northern Nevada Legal Aid's established presence serving 7,600+ individuals annually provides
immediate partnership potential. NYC Public Advocate The platform should integrate referral systems for
legal services, share aggregated data on tenant outcomes, and coordinate eviction defense campaigns.
Joint grant applications can fund platform development while maintaining tenant organization
independence.
```

---

## Page 5

### Complete Page View
![Page 5 Complete](images/page_005_full.png)

### Extracted Text

```
The Nevada Housing Coalition's statewide advocacy creates policy alignment opportunities. Platform
data visualizations can support legislative campaigns, demonstrating ownership concentration and
displacement patterns to lawmakers. This evidence-based advocacy strengthens both digital
organizing and policy reform efforts.

Conclusion
This comprehensive research demonstrates that building an effective tenant organizing platform for
Reno-Sparks requires synthesizing technical capability with organizing wisdom. The recommended
architecture—Discourse forums, PostgreSQL with PostGIS, Leaflet.js mapping, and Matrix
communication—provides professional functionality at minimal cost while remaining manageable for a
single developer. Nodebb +4 By implementing cryptographic address verification, layered security
measures, and community-based anti-infiltration systems, the platform protects organizers without
sacrificing accessibility. Wilson Center   Wikipedia


Success depends not on technical sophistication but on alignment with organizing principles: member
control, financial sustainability through dues, focus on relationship building over pure digital
engagement, and commitment to language justice and accessibility. Tenants Together +2 The platform
serves as infrastructure for human organizing, not a replacement for it. With Nevada's strong legal
protections and accessible property data systems, the Reno-Sparks Tenants Union possesses
exceptional conditions for launching this transformative organizing tool. Nevada Legislature The 10-12
week implementation timeline and sub-$200 annual operating costs make this vision immediately
achievable, with clear paths for expansion across Nevada's distinct rental markets.
```

---

