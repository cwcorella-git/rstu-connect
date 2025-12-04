# Reno-Sparks Tenants Union: Comprehensive Content Orchestration Plan

*A complete blueprint for organizing content, navigation, and user experience across the Next.js platform*

---

## Executive Summary

This plan orchestrates a sophisticated content ecosystem that transforms the Reno-Sparks Tenants Union from a traditional nonprofit website into a powerful organizing intelligence platform. By integrating 192,463+ property records with community-driven content, we create the definitive tool for strategic tenant organizing.

**Mission-Critical Objective**: Serve 272,044 renters in the Reno-Sparks area with data-driven organizing tools while maintaining community accessibility and security.

---

## I. Site Architecture Overview

### Three-Layer Information Architecture

```
PUBLIC LAYER (Tier 0)
├── Homepage - "Homes for People, Not for Profit"
├── About - Mission, values, and organizing philosophy  
├── News & Updates - Blog posts, policy analysis, victories
├── Community Stories - Member testimonials and experiences
├── Get Involved - Entry points for new members
├── Resources - Public tenant rights and legal information
├── Events - Public organizing activities and meetings
└── Contact - Multiple ways to connect with organizers

ORGANIZING LAYER (Tier 1 - Authenticated Members)
├── Member Dashboard - Personalized organizing hub
├── Property Intelligence - 192K+ property database search
├── Active Campaigns - Current organizing efforts by location
├── Mutual Aid Network - Community resource sharing
├── Member Stories Hub - Extended testimonials with organizing context
├── Event Planning - RSVP, coordination, and follow-up
├── Communication Tools - Secure messaging and coordination
└── Resource Library - Internal organizing guides and templates

STRATEGIC LAYER (Tier 2/3 - Advanced Security)
├── Corporate Analysis - 50+ landlord portfolios ($930M+ tracked)
├── Market Intelligence - Rent trends, displacement patterns
├── Campaign Strategy - Advanced planning and coordination tools
├── Coalition Network - Partner organization integration
├── Legal Action Center - Lawsuit coordination and documentation
├── Research Hub - Data analysis and report generation
└── Leadership Council - Strategic decision-making tools
```

### URL Structure Strategy

**Public Content (SEO-Optimized)**
- `/` - Homepage with strategic messaging
- `/about` - Mission and organizational context
- `/news/[category]/[slug]` - Blog posts with rich SEO
- `/stories/[slug]` - Individual member stories
- `/events/[slug]` - Public event listings
- `/resources/tenant-rights` - Legal information hub
- `/get-involved` - Membership entry points

**Member Organizing Portal**
- `/organize` - Member dashboard and hub
- `/organize/property-search` - Database interface
- `/organize/property/[id]` - Individual property intelligence
- `/organize/campaigns/[slug]` - Campaign-specific coordination
- `/organize/mutual-aid` - Community resource network
- `/organize/events` - Member event coordination
- `/organize/stories` - Extended member story hub

**Strategic Intelligence**
- `/intelligence` - Advanced tools dashboard  
- `/intelligence/corporate-analysis/[landlord]` - Portfolio analysis
- `/intelligence/market-research` - Data analytics and trends
- `/intelligence/campaign-planning` - Strategic organizing tools
- `/intelligence/reports` - Generated organizing intelligence

---

## II. Navigation Architecture

### Primary Header Navigation

**Public Navigation (Unauthenticated Users)**
```
[LOGO: RSTU] | News | Stories | Events | Resources | Get Involved | [JOIN BUTTON]
```

**Member Navigation (Authenticated - Tier 1)**
```
[LOGO: RSTU] | Dashboard | Properties | Campaigns | Community | Events | Tools | [PROFILE]
```

**Strategic Navigation (Advanced Security - Tier 2/3)**
```
[LOGO: RSTU] | Intelligence | Analysis | Planning | Coalition | Reports | [SECURE PROFILE]
```

### Mobile Navigation Strategy

**Hybrid Drawer + Tab Bar System**
- **Hamburger drawer**: Full navigation with progressive disclosure
- **Bottom tab bar**: Quick access to core organizing functions
- **Floating action button**: Context-aware urgent actions
- **Swipe gestures**: Efficient navigation for field organizing

**Mobile Tab Bar (Authenticated Users)**
```
[🏠 Dashboard] [🔍 Search] [📢 Campaigns] [🤝 Aid] [📅 Events]
```

### Footer Architecture

**Public Footer**
```
ORGANIZATION                RESOURCES                   CONNECT
├── About RSTU             ├── Tenant Rights Guide     ├── Contact Us
├── Mission & Values       ├── Legal Aid Directory     ├── Join Our Movement  
├── Leadership Team        ├── Emergency Resources     ├── Newsletter Signup
├── Annual Reports         ├── Know Your Rights        ├── Social Media Links
└── Press & Media          └── Community Partners      └── Report Issues

LEGAL                      ORGANIZING                  SUPPORT
├── Privacy Policy         ├── Campaign Victories      ├── Donate
├── Terms of Service       ├── Current Actions         ├── Volunteer
├── Security Practices     ├── Training Resources      ├── Partnerships
└── Accessibility          └── Coalition Partners      └── Contact Form
```

**Member Footer (Authenticated)**
```
ORGANIZING                 INTELLIGENCE                COMMUNITY
├── My Campaigns          ├── Property Database        ├── Member Directory
├── Action History        ├── Corporate Analysis       ├── Mutual Aid Network
├── Training Progress     ├── Market Reports           ├── Story Submissions
└── Tools & Resources     └── Strategic Planning       └── Event Coordination

SECURITY                   ACCOUNT                     SUPPORT
├── Privacy Settings      ├── Profile Management       ├── Help Center
├── Two-Factor Auth       ├── Communication Prefs      ├── Report Issues
├── Data Export           ├── Membership Status        ├── Feedback
└── Security Logs         └── Account History          └── Technical Support
```

---

## III. Content Type Architecture

### 1. Editorial Content (Blog Posts & News)

**Categories & Organization**
- **Policy Analysis** - Rent control, tenant protections, housing policy
- **Campaign Updates** - Active organizing efforts and victories  
- **Community News** - Local housing developments, political updates
- **Legal Updates** - Court decisions, new laws, enforcement actions
- **Coalition News** - Partner organization activities and joint actions

**Content Structure**
```typescript
interface BlogPost {
  title: string;
  slug: string;
  author: AuthorProfile;
  publishDate: Date;
  categories: string[];
  tags: string[];
  featuredImage: ImageAsset;
  content: RichTextContent;
  seoMetadata: SEOData;
  relatedProperties?: PropertyReference[];
  relatedCampaigns?: CampaignReference[];
  memberOnlyContent?: boolean;
  securityTier: 0 | 1 | 2 | 3;
}
```

### 2. Member Stories & Testimonials

**Story Categories**
- **Organizing Victories** - Successful campaigns and tenant wins
- **Challenges & Solutions** - Problem-solving and mutual aid
- **Community Spotlights** - Member leadership and contributions
- **Anonymous Testimonials** - Protected stories requiring privacy
- **Campaign Experiences** - First-person organizing accounts

**Privacy-First Architecture**
```typescript
interface MemberStory {
  id: string;
  title: string;
  content: MarkdownContent;
  author: {
    name: string | 'Anonymous';
    verified: boolean;
    protectionLevel: 'public' | 'member' | 'anonymous';
  };
  propertyContext: {
    hashedAddress: string; // Cryptographically protected
    landlordEntity: string;
    buildingType: string;
    organizingContext: string;
  };
  outcomes: string[];
  relatedCampaigns: CampaignReference[];
  moderationStatus: 'pending' | 'approved' | 'featured';
}
```

### 3. Property Intelligence System

**Database Integration (192,463+ Records)**
```typescript
interface PropertyIntelligence {
  // Core property data
  parcelId: string;
  address: string;
  ownerName: string;
  corporateEntity?: CorporateProfile;
  assessedValue: number;
  unitCount: number;
  buildingType: string;
  
  // Organizing intelligence
  organizingPriority: 'high' | 'medium' | 'low';
  activeCampaigns: Campaign[];
  memberStories: MemberStory[];
  mutualAidHistory: MutualAidRequest[];
  legalActions: LegalAction[];
  
  // Strategic analysis
  portfolioAnalysis?: CorporatePortfolio;
  neighborhoodContext: NeighborhoodData;
  organizingOpportunities: OrganizingOpportunity[];
}
```

**Corporate Landlord Profiles**
- Portfolio value analysis ($930M+ total tracked)
- Property concentration mapping
- Organizing target prioritization
- Campaign planning intelligence
- Success rate tracking

### 4. Mutual Aid Network

**Request Types & Categories**
- **Housing Assistance** - Rent help, housing search, emergency shelter
- **Legal Support** - Tenant rights, court accompaniment, document help
- **Financial Aid** - Emergency funds, utility assistance, moving costs
- **Community Resources** - Childcare, transportation, language support
- **Organizing Support** - Campaign volunteers, meeting attendance, outreach

**Privacy-Protected Matching System**
```typescript
interface MutualAidRequest {
  id: string;
  type: MutualAidCategory;
  urgency: 1 | 2 | 3 | 4 | 5;
  description: string;
  location: {
    hashedAddress: string;
    generalArea: string;
    accessibleTransport: boolean;
  };
  requester: {
    verified: boolean;
    anonymous: boolean;
    memberSince: Date;
  };
  matching: {
    skillsNeeded: string[];
    resourcesNeeded: string[];
    timeCommitment: string;
    availability: TimeWindow[];
  };
  fulfillmentHistory: FulfillmentRecord[];
}
```

### 5. Events & Actions Coordination

**Event Types**
- **General Meetings** - Monthly membership gatherings
- **Direct Actions** - Protests, demonstrations, pressure campaigns
- **Training Sessions** - Organizing skills, legal rights, leadership development
- **Social Events** - Community building, relationship development
- **Coalition Events** - Joint actions with partner organizations

**Event Management System**
```typescript
interface OrganizingEvent {
  id: string;
  title: string;
  type: EventType;
  datetime: {
    start: Date;
    end: Date;
    timeZone: string;
  };
  location: {
    venue: string;
    address: string;
    accessibility: AccessibilityInfo;
    safetyConsiderations: string[];
  };
  organizing: {
    targetProperty?: PropertyReference;
    relatedCampaign?: CampaignReference;
    expectedAttendance: number;
    roles: EventRole[];
    materials: EventMaterial[];
  };
  registration: {
    required: boolean;
    memberOnly: boolean;
    securityTier: number;
    customFields: FormField[];
  };
  followUp: {
    attendanceTracking: boolean;
    actionItems: ActionItem[];
    nextSteps: string[];
  };
}
```

---

## IV. User Journey Orchestration

### Journey 1: Casual Visitor → Community Member

**Entry Points**
1. **Google Search** - "rent control Reno" → Policy blog post → Newsletter signup
2. **Social Media** - Facebook event share → Event page → Membership information
3. **Word of Mouth** - Member stories page → Community connection → Meeting attendance

**Conversion Pathway**
```
Landing Page → Educational Content → Success Stories → Local Events → Join Movement
     ↓              ↓                    ↓              ↓               ↓
   Context      →  Education       →  Inspiration  →  Action      →  Commitment
```

### Journey 2: New Member → Active Organizer

**Onboarding Sequence**
1. **Registration** - Account creation with basic security tier
2. **Property Context** - Search their address/neighborhood for relevant intelligence
3. **Campaign Matching** - Connect with active campaigns in their area
4. **Skill Assessment** - Identify interests and capabilities for organizing roles
5. **First Action** - Attend meeting, volunteer task, or mutual aid contribution

**Progressive Engagement**
```
Registration → Property Search → Campaign Discovery → Skill Matching → First Action → Regular Participation
     ↓             ↓                ↓                  ↓              ↓              ↓
   Access      →  Context      →  Relevance      →  Capability   →  Action     →  Commitment
```

### Journey 3: Active Organizer → Strategic Leader

**Leadership Development Path**
1. **Consistent Participation** - Regular meeting attendance, campaign involvement
2. **Skill Demonstration** - Successful organizing tasks, community leadership
3. **Security Upgrade** - Time-locked access to advanced tools (14-90 days)
4. **Strategic Responsibility** - Campaign planning, coalition coordination
5. **Advanced Intelligence** - Access to sensitive organizing data and analysis

**Leadership Capabilities Unlock**
```
Regular Member → Campaign Leadership → Coalition Coordination → Strategic Planning → Advanced Security
      ↓               ↓                     ↓                     ↓                  ↓
   Participation →  Leadership       →   Coalition        →   Strategy      →   Intelligence
```

---

## V. Feature Architecture

### Core Platform Features

#### 1. Property Intelligence Engine
- **Search Interface**: Address, owner, or neighborhood lookup across 192K+ properties
- **Corporate Analysis**: Automated portfolio analysis for 50+ major landlords  
- **Organizing Prioritization**: Algorithm-based targeting for campaign planning
- **Market Intelligence**: Rent trends, displacement patterns, investment activity
- **Legal Integration**: Connection to court records, violation reports, legal actions

#### 2. Campaign Coordination Hub
- **Campaign Creation**: Template-based campaign planning with property intelligence
- **Member Recruitment**: Targeted outreach based on location and interests
- **Action Planning**: Event coordination, timeline management, task assignment
- **Communication Tools**: Encrypted messaging, broadcast updates, secure file sharing
- **Success Tracking**: Metrics dashboard, outcome measurement, impact reporting

#### 3. Community Network Platform
- **Member Directory**: Skill-based networking with privacy controls
- **Mutual Aid Matching**: Automated matching of needs and resources
- **Story Collection**: Facilitated testimonial gathering with organizing context
- **Event Coordination**: Registration, attendance tracking, follow-up automation
- **Coalition Integration**: Partner organization connectivity and joint action planning

#### 4. Security & Privacy System
- **Progressive Authentication**: Three-tier time-locked access system
- **Address Protection**: Cryptographic hashing prevents location exposure  
- **Communication Security**: End-to-end encryption for sensitive organizing discussions
- **Anonymous Options**: Protected story submission and resource requests
- **Data Sovereignty**: Community control over data use and sharing

#### 5. Mobile Organizing Tools
- **Field Property Lookup**: GPS-based property intelligence for door-to-door organizing
- **Offline Capability**: Critical data cached for areas with poor connectivity
- **Voice Recording**: Interview capture with transcription for story collection
- **Emergency Contacts**: One-tap access to legal aid, organizers, emergency resources
- **Action Alerts**: Push notifications for urgent campaign needs

### Advanced Features (Security Tier 2/3)

#### 1. Strategic Intelligence Dashboard
- **Market Analysis**: Corporate investment patterns, gentrification indicators
- **Opposition Research**: Landlord network analysis, political connections
- **Campaign Analytics**: Success rate analysis, strategy optimization recommendations
- **Coalition Mapping**: Relationship network visualization, partnership opportunities
- **Threat Assessment**: Early warning system for displacement and retaliation

#### 2. Legal Action Integration
- **Case Management**: Lawsuit coordination, document management, deadline tracking
- **Evidence Collection**: Systematic documentation of violations and harms
- **Witness Coordination**: Secure witness management with privacy protection
- **Legal Resource Library**: Template documents, precedent cases, procedural guides
- **Attorney Network**: Integration with tenant rights lawyers and legal aid organizations

---

## VI. Technical Implementation Strategy

### Development Phases

#### Phase 1: Foundation & Public Content (Weeks 1-4)
**Deliverables:**
- Next.js 15 App Router architecture with TypeScript
- Design system implementation (200+ CSS custom properties)
- Public content pages (homepage, about, news, stories, events)
- Basic SEO optimization and accessibility compliance
- Mobile-first responsive design across all breakpoints

**Key Features:**
- Blog content management with markdown support
- Member story submission with privacy options  
- Event listings with public registration
- Newsletter integration and social media connectivity
- Basic property search interface (public data only)

#### Phase 2: Member Platform & Property Intelligence (Weeks 5-8)  
**Deliverables:**
- Authentication system with progressive security tiers
- Property database integration (192K+ records)
- Member dashboard with personalized content
- Campaign creation and coordination tools
- Mutual aid network functionality

**Key Features:**
- Comprehensive property search and analysis
- Corporate landlord portfolio intelligence
- Campaign planning templates and workflows
- Secure member-to-member communication
- Event coordination with RSVP management

#### Phase 3: Advanced Intelligence & Security (Weeks 9-12)
**Deliverables:**
- Strategic intelligence dashboard for advanced users
- Enhanced security features and encrypted communications
- Legal action coordination tools
- Coalition partner integration APIs
- Advanced analytics and reporting system

**Key Features:**
- Market analysis and trend identification
- Opposition research and threat assessment tools
- Legal case management integration
- Coalition partnership workflows
- Advanced campaign analytics and optimization

#### Phase 4: Optimization & Community Features (Weeks 13-16)
**Deliverables:**
- Performance optimization for large datasets
- Advanced community networking features
- Mobile app-like experience with offline capabilities
- Comprehensive testing and quality assurance
- Community feedback integration and iterative improvements

**Key Features:**
- Offline-first mobile experience for field organizing
- Advanced mutual aid matching algorithms
- Comprehensive member story collection workflows
- Real-time campaign coordination features
- Integration with external organizing tools and platforms

### Content Management Workflows

#### Editorial Content
- **Git-based workflow**: Markdown files with frontmatter for blog posts and pages
- **Property integration**: Reference property data directly in content
- **Member contributions**: Community submission system with moderation workflow
- **SEO automation**: Structured data generation and social sharing optimization

#### Database-Driven Content
- **Automated intelligence**: Generated reports from property database analysis
- **Real-time updates**: Campaign progress tracking and event coordination
- **User personalization**: Customized dashboards based on location and interests
- **Data visualization**: Interactive charts and maps for organizing intelligence

#### Community Content
- **Story collection**: Facilitated submission with organizing context integration
- **Privacy protection**: Cryptographic address hashing and anonymous options
- **Community moderation**: Member-based verification and approval workflows
- **Organizing integration**: Direct connection between stories and active campaigns

---

## VII. Success Metrics & Community Impact

### Organizing Effectiveness Metrics
- **Member Engagement**: Active monthly members, event attendance, campaign participation
- **Campaign Success**: Victory rate, timeline efficiency, membership growth through campaigns
- **Community Reach**: Geographic coverage, demographic diversity, coalition partnership growth
- **Platform Adoption**: Feature usage patterns, mobile vs. desktop engagement, security tier progression

### Platform Performance Indicators  
- **Technical Performance**: Page load speeds, database query efficiency, mobile experience quality
- **User Experience**: Task completion rates, accessibility compliance, user satisfaction surveys
- **Content Effectiveness**: Story engagement, resource utilization, educational content impact
- **Security Compliance**: Threat mitigation, privacy protection effectiveness, incident response quality

### Community Organizing Outcomes
- **Tenant Victories**: Rent stabilization wins, habitability improvements, anti-displacement actions
- **Policy Influence**: Legislative advocacy success, regulatory enforcement, local policy changes  
- **Coalition Building**: Partner organization engagement, joint action effectiveness, resource sharing
- **Community Power**: Member leadership development, democratic participation, grassroots capacity

---

## VIII. Implementation Timeline & Resource Requirements

### Development Resources
- **Technical Team**: 2-3 full-stack developers, 1 UI/UX designer, 1 security specialist
- **Content Team**: 1 content manager, 2-3 community contributors, 1 SEO specialist  
- **Organizing Integration**: 2-3 experienced tenant organizers for workflow consultation
- **Quality Assurance**: 1 accessibility specialist, 1 performance optimization expert

### Community Engagement Requirements
- **Member Testing**: Beta testing with 20-30 active members across security tiers
- **Content Creation**: Initial content migration and story collection from existing community
- **Training Development**: User onboarding materials and security training resources
- **Feedback Integration**: Regular community input sessions and iterative improvement cycles

### Launch Strategy
- **Soft Launch**: Limited beta with core membership for testing and feedback (Month 3)
- **Community Launch**: Full platform availability with educational campaign (Month 4)
- **Public Launch**: Media outreach, coalition announcements, broader community invitation (Month 5)
- **Optimization Cycle**: Quarterly improvements based on usage data and community feedback

---

## Conclusion

This comprehensive content orchestration plan transforms the Reno-Sparks Tenants Union digital presence from a traditional nonprofit website into a sophisticated organizing intelligence platform. By integrating 192,463+ property records with community-driven content and progressive security systems, we create an unparalleled tool for strategic tenant organizing.

The platform serves dual missions: engaging the broader community with accessible, inspiring content while providing active organizers with the advanced intelligence and coordination tools needed for effective campaign work. Through careful attention to mobile optimization, accessibility, and security, the system ensures that technology serves organizing rather than creating barriers.

Success will be measured not just in technical performance, but in tangible organizing victories, community empowerment, and the platform's role in building tenant power across the Reno-Sparks area. The ultimate goal is creating a replicable model for community-controlled organizing technology that can support tenant unions nationwide.

---

*This plan represents the synthesis of comprehensive site analysis, expert consultation on frontend architecture and content management, and deep integration with the operational tenant organizing database. Implementation should proceed with community input and iterative development to ensure the platform serves its organizing mission effectively.*