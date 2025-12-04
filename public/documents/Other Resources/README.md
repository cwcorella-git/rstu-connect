# Reno Sparks Tenants Union - Comprehensive Organizing Platform

**"Homes for People, Not for Profit"**

A comprehensive tenant organizing platform that empowers community-driven housing justice through secure communications, property mapping, and collective action tools.

## Project Vision

This is **NOT** just a website rebuild - we're building a sophisticated tenant organizing platform with:

- 🗺️ **Interactive property mapping** with Washoe County's 190,000+ property records
- 🔐 **Three-tier security system** protecting organizers from surveillance and infiltration  
- 📱 **Mobile-first Progressive Web App** for field organizing
- 🌐 **Bilingual operations** (English/Spanish) from inception
- 🤝 **Community verification** and anti-infiltration measures
- 💬 **Secure communications** via Matrix protocol integration
- 📊 **Ownership network analysis** to track corporate landlord power

## Technical Architecture

### Core Stack
- **Backend**: Discourse forum software on PostgreSQL with PostGIS
- **Frontend**: Next.js 15 with React 18, mobile-first design
- **Mapping**: Leaflet.js with heat maps and property visualization
- **Security**: Cryptographic address verification, community-based verification
- **Communications**: Matrix protocol for encrypted organizing channels
- **Hosting**: DreamHost nonprofit hosting (free for 501(c)(3)s)

### Data Integration
- **Washoe County Assessor**: 190,000+ property records with ownership and geographic data
- **Nevada Legal Framework**: NRS Chapter 118A tenant organizing protections
- **HUD Housing Market Analysis**: Comprehensive market data for Nevada metros
- **US Census ACS**: Demographic and housing statistics overlay
- **Nevada Secretary of State**: Corporate business entity identification

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-4, ~$50)
- ✅ Deploy Discourse on DreamHost nonprofit hosting
- ✅ Configure PostgreSQL with PostGIS for spatial data
- ✅ Implement Smarty address verification API
- ✅ Create property database with Washoe County integration
- ✅ Begin WordPress content migration

### Phase 2: Core Organizing (Weeks 5-8, ~$30/month)
- 🔄 Build Leaflet.js mapping with organizing density visualization
- 🔄 Implement cryptographic address verification system
- 🔄 Deploy community-based verification workflows
- 🔄 Create tenant rights resource library
- 🔄 Add Signal integration and security tutorials

### Phase 3: Advanced Features (Weeks 9-12, ~$20/month additional)
- ⏳ Integrate Matrix server for secure communications
- ⏳ Build D3.js ownership network visualizations
- ⏳ Implement Progressive Web App features
- ⏳ Deploy Spanish language support
- ⏳ Create coalition partner portal

### Phase 4: Scaling (Months 4-6)
- ⏳ Transition to member dues model ($5-15/month sliding scale)
- ⏳ Advanced security features including Tor hidden service
- ⏳ Las Vegas expansion planning
- ⏳ API integrations with legal aid organizations

## Project Structure

```
tenants-union-main/
├── 📋 CLAUDE.md                    # Project guidance and architecture
├── 🔬 RESEARCH_FINDINGS.md         # Data source research and alternatives
├── 📁 plan/                        # Planning documents and strategy
├── 🏠 foundation/                  # Current WordPress site for migration
├── 📝 docs/                        # Technical documentation
│   ├── architecture/               # System architecture specs
│   ├── security/                   # Security implementation guides
│   └── deployment/                 # Hosting and deployment guides
├── ⚙️ backend/                     # Server-side systems
│   ├── discourse/                  # Forum software configuration
│   ├── api/                        # Custom API services
│   ├── database/                   # Database schemas and migrations
│   └── integrations/               # External API integrations
├── 💻 frontend/                    # Next.js web platform
│   └── src/
│       ├── components/             # React components
│       │   ├── mapping/            # Leaflet.js mapping
│       │   ├── organizing/         # Organizing workflows
│       │   ├── security/           # Security and verification UI
│       │   └── content/            # Content management
│       ├── lib/                    # Utilities and services  
│       ├── pages/                  # Next.js pages and API routes
│       └── styles/                 # Tailwind CSS design system
├── 🛠️ scripts/                     # Automation and data processing
│   ├── migration/                  # WordPress content migration
│   ├── data-import/               # Property data processing
│   └── security/                   # Security setup automation
└── 📚 research/                    # Ongoing research and investigation
    ├── wayback-machine/            # Archived data recovery
    ├── alternative-sources/        # Data source alternatives
    └── legal-research/             # Tenant law and organizing research
```

## Security & Privacy

### Community-First Security
- **No plaintext addresses** - all location data cryptographically hashed
- **Three-tier progressive security** - basic, intermediate, advanced
- **Community verification** - existing tenants vouch for new members
- **Time-locked progression** - prevents rapid infiltration
- **Transparent governance** - open-source code, community control

### Legal Protection
Nevada Revised Statutes Chapter 118A provides exceptional legal protections:
- Explicitly protects tenants who "organized or become a member of a tenant's union"
- Prohibits landlord retaliation for organizing activities
- Civil remedies and district attorney enforcement powers
- 14-day repair timeline creates leverage for collective action

## Getting Started

### Development Environment
```bash
# Clone repository
git clone [tenant-union-repo] tenants-union-main
cd tenants-union-main

# Install dependencies
cd frontend && npm install

# Set up local database
createdb tenants_union_dev
psql tenants_union_dev -c "CREATE EXTENSION postgis;"

# Start development servers
npm run dev              # Frontend (localhost:3000)
npm run discourse:dev    # Forum software
npm run matrix:dev       # Secure communications
```

### Production Deployment
- **DreamHost Nonprofit Hosting** (free for 501(c)(3) organizations)
- **SSL/TLS** encryption for all traffic
- **PostgreSQL with PostGIS** for spatial property data
- **CDN integration** for optimized asset delivery
- **Automated backup** for all organizing data

## Community Partnership

### Legal Aid Integration
- **Northern Nevada Legal Aid** (7,600+ individuals served annually)
- Referral systems for legal services
- Coordinated eviction defense campaigns
- Joint advocacy for policy reform

### Policy Advocacy
- **Nevada Housing Coalition** statewide alignment
- Evidence-based legislative campaigns
- Corporate ownership concentration analysis
- Platform data supporting policy reform

### Organizing Network
- **Matrix protocol federation** with other tenant unions
- Resource sharing across organizing networks
- Collective bargaining power through coordination
- Reno-Sparks focus with Las Vegas expansion planned

## Contributing

This platform is built by and for the tenant organizing community. We welcome contributions from:

- **Tenant organizers** - feature requests, usability feedback, organizing workflow input
- **Community technologists** - code contributions, security audits, accessibility improvements
- **Legal advocates** - legal framework integration, policy analysis, rights education
- **Language justice advocates** - Spanish translation, cultural accessibility, community outreach

### Core Values
1. **Community ownership** over technical sophistication
2. **Security through simplicity** - protection without excluding non-technical tenants
3. **Data as organizing tool** - never for surveillance or exploitation
4. **Mobile-first field organizing** - built for where organizing happens
5. **Language justice** - bilingual operations from day 1

## Contact

- **Email**: [tenant-union-contact]
- **Organizing Hub**: Reno-Sparks area focus, Nevada statewide vision
- **Platform**: Built for organizers, by organizers
- **Mission**: Homes for People, Not for Profit

---

**Remember**: The platform serves organizing. Organizing doesn't serve the platform.

*This project represents community-owned technology that genuinely empowers tenant organizing through collective action while protecting organizers from surveillance and infiltration.*