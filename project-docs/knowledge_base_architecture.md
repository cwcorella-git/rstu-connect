# Knowledge Base Architecture Design

## Executive Summary

Based on analysis of 79 content files, this knowledge base will serve as the central information hub for the Reno-Sparks Tenants Union platform. The architecture supports both **public education** (tenant rights, housing policy) and **internal organizing coordination** (strategy guides, meeting records) with bilingual capabilities and robust search functionality.

## Primary User Types & Needs

### 1. **New Tenants** (Public Access)
- **Need**: Basic tenant rights education
- **Priority Content**: Legal protections, how-to guides, local resources
- **Access Level**: Full public access to educational materials

### 2. **Tenant Organizers** (Member Access) 
- **Need**: Strategic organizing resources and tools
- **Priority Content**: Organizing guides, campaign strategies, legal analysis
- **Access Level**: Member-verified access to organizing content

### 3. **Established Tenant Leaders** (Advanced Access)
- **Need**: Research data, policy analysis, coalition resources
- **Priority Content**: Property ownership data, legislative tracking, corporate analysis
- **Access Level**: Leadership access to sensitive research and data

### 4. **Community Partners** (Partner Access)
- **Need**: Collaborative resources and data sharing
- **Priority Content**: Housing policy updates, coalition strategies, resource directories
- **Access Level**: Partner organization access

## Content Architecture (Based on Analysis)

### Tier 1: Core Educational Content (Public Access)

#### **A. Tenant Rights & Legal Protections** (28 files)
*Foundation: Nevada Revised Statutes 118A - explicit tenant organizing protections*

**Sub-Categories:**
- **Nevada Tenant Law (NRS 118A)**: Complete legal framework with plain-language summaries
- **Landlord-Tenant Rights**: Practical guides from NLS handbook and organizing resources  
- **Eviction Defense**: Legal processes, timelines, and resources
- **Repair & Habitability**: Tenant rights and enforcement procedures
- **Security Deposits**: Legal requirements and recovery processes

**Content Sources:**
- Nevada Legislature statutes (verified working)
- Landlord-Tenant Handbook (78,000 words)
- Educational materials from organizing sessions

#### **B. Local Housing Policy & News** (83 files total)
*Current housing crisis responses and policy developments*

**Sub-Categories:**
- **Reno-Specific Policy** (27 files): City council actions, ordinances, zoning changes
- **Nevada Housing Policy** (56 files): State-level housing initiatives, legislative updates
- **Federal Housing Policy**: HUD data, federal programs affecting Nevada
- **News & Analysis** (6 files): Current coverage of housing issues

**Content Sources:**
- Nevada Current articles (archive access needed)
- Carson Now policy coverage (verified working)
- City of Reno official updates
- Legislative session coverage

#### **C. Community Resources & Mutual Aid** (52 files)
*Direct assistance and community support networks*

**Sub-Categories:**
- **Legal Aid Services**: Northern Nevada Legal Aid, pro bono resources
- **Emergency Assistance**: Rent assistance, utility help, food resources  
- **Housing Services**: Search assistance, mediation services
- **Mental Health & Support**: Crisis resources, community support groups
- **Translation Services**: Bilingual resources and interpretation

### Tier 2: Organizing Strategy & Tools (Member Access)

#### **D. Organizing Resources & Strategy Guides** (27 files)
*Tactical and strategic organizing knowledge*

**Sub-Categories:**
- **Building Tenant Associations**: Step-by-step organizing guides
- **Campaign Development**: Strategic planning for housing campaigns
- **Coalition Building**: Partner organization development
- **Communication Strategy**: Media relations, social media, messaging
- **Direct Action Tactics**: Legal protest strategies, tenant rights enforcement

**Content Sources:**
- Autonomous Tenants Union Network resources (verified working)
- Tenant Union Flatbush organizing guide (verified working)
- Local organizing experiences and case studies
- Meeting records and strategic planning documents (11 files)

#### **E. Legislative Tracking & Analysis** (15 files)
*Current and proposed legislation affecting tenant organizing*

**Sub-Categories:**
- **2025 Legislative Session**: Bills affecting housing, tenant rights, organizing
- **Bill Analysis**: Impact assessments for tenant organizing
- **Voting Records**: Legislator positions on housing issues  
- **Advocacy Strategies**: Lobbying and public comment processes
- **Coalition Positions**: Unified advocacy with partner organizations

**Content Sources:**
- Assembly and Senate bills (comprehensive analysis of 10 major bills)
- Legislative session coverage
- Bill tracking and analysis documents

### Tier 3: Advanced Research & Intelligence (Leadership Access)

#### **F. Property Ownership & Corporate Analysis** (19 files)
*Strategic intelligence for organizing campaigns*

**Sub-Categories:**
- **Washoe County Property Data**: 190,000+ property records with ownership mapping
- **Corporate Landlord Research**: REIT analysis, ownership networks, tax strategies
- **Market Analysis**: Rent trends, ownership concentration, investment patterns
- **Development Tracking**: New construction, zoning changes, gentrification patterns
- **Ownership Verification**: Tools and processes for campaign target research

**Content Sources:**
- Washoe County Assessor database (verified working)
- Property Records of Nevada (verified working) 
- Corporate analysis research
- Urban Institute methodology guides

#### **G. Coalition & Partnership Resources** 
*Inter-organizational collaboration and resource sharing*

**Sub-Categories:**
- **Partner Organizations**: Legal aid, housing advocates, community groups
- **Resource Sharing**: Mutual aid networks, skill sharing, capacity building
- **Joint Campaigns**: Multi-organization housing initiatives
- **Grant & Funding**: Collaborative funding opportunities and resource development
- **Best Practices**: Successful organizing models from other regions

### Tier 4: Internal Operations (Member Access)

#### **H. Organizational Documents** (5 files)
*Internal governance and operational resources*

**Sub-Categories:**
- **Bylaws & Governance**: Current organizational structure and decision-making
- **Mission & Values**: Organizational principles and strategic direction
- **Meeting Records** (11 files): Historical meeting notes, agenda templates
- **Member Resources**: Onboarding materials, role definitions, training resources
- **Communication Protocols**: Internal communication standards and security practices

## Search & Discovery Architecture

### 1. **Full-Text Search System**
- **Primary Engine**: FTS5 (SQLite Full-Text Search) for speed and offline capability
- **Search Scope**: All public content, member-restricted content based on access level
- **Features**: Boolean operators, phrase search, wildcard support, relevance ranking

### 2. **Faceted Navigation**
- **By Content Type**: Legal, organizing, news, research, internal
- **By Geography**: Reno-specific, Nevada-wide, federal, national models
- **By Topic**: Housing policy, tenant rights, organizing strategy, corporate research
- **By Date**: Recent updates, legislative sessions, campaign periods

### 3. **Tag System**
- **Auto-Generated Tags**: Location names, legislator names, bill numbers, organization names
- **Manual Tags**: Campaign relevance, organizing phase, legal complexity, language level
- **User Tags**: Members can add community-relevant tags

### 4. **Smart Recommendations**
- **Related Content**: Cross-reference similar topics and complementary resources
- **Update Notifications**: Alert users to new content in their areas of interest
- **Learning Paths**: Guided sequences for new organizers and tenant education

## Bilingual Content Management (English/Spanish)

### Translation Strategy
1. **Priority Content for Translation**:
   - Core tenant rights (NRS 118A summaries)
   - Basic organizing guides
   - Community resource directories
   - Emergency assistance information

2. **Translation Workflow**:
   - Professional translation for legal content
   - Community member translation for organizing content
   - Review process with bilingual tenant leaders
   - Regular updates maintaining language parity

3. **Bilingual Navigation**:
   - Language toggle on all pages
   - Search results in selected language
   - Mixed-language content clearly marked
   - Cultural adaptation, not just literal translation

### Content Organization
- **Parallel Structure**: Same category system in both languages
- **Cross-Reference**: English-Spanish document linking
- **Search Integration**: Bilingual search with language filtering
- **Community Input**: Spanish-speaking member feedback integration

## Content Update Workflows

### 1. **Legislative Tracking** (Automated + Manual)
- **Automated**: RSS feeds from Nevada Legislature, bill status changes
- **Manual Review**: Impact analysis, organizing implications, action items
- **Community Input**: Member feedback on bill impacts and priorities
- **Update Frequency**: Weekly during legislative sessions, monthly otherwise

### 2. **News & Policy Updates** (Manual Curation)
- **Source Monitoring**: Nevada Current, Carson Now, local news sources
- **Content Verification**: Fact-checking, source validation, bias assessment  
- **Community Relevance**: Local impact analysis, organizing opportunities
- **Archive Management**: Link verification, alternative source research

### 3. **Organizing Content** (Community-Contributed)
- **Member Contributions**: Campaign reports, tactical innovations, local adaptations
- **Review Process**: Organizer review for accuracy, legal review for risk assessment
- **Version Control**: Historical tracking of organizing strategy evolution
- **Success Stories**: Campaign victories, lessons learned, replicable tactics

### 4. **Research Data** (Quarterly Updates)
- **Property Data Refresh**: Washoe County assessor database synchronization  
- **Market Analysis**: Rent trend updates, ownership concentration tracking
- **Federal Data**: HUD reports, Census updates, policy changes
- **Verification Protocol**: Data accuracy checks, source validation, error correction

## Technical Implementation

### Database Schema
```sql
-- Core content table
knowledge_base_articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  content TEXT NOT NULL,
  content_spanish TEXT, -- Parallel Spanish content
  access_level ENUM('public', 'member', 'leadership', 'partner'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  source_url TEXT, -- Original source if applicable
  source_verified BOOLEAN DEFAULT false,
  last_verified TIMESTAMP
);

-- Category hierarchy
categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_spanish VARCHAR(100), -- Spanish category names
  parent_id INTEGER REFERENCES categories(id),
  access_level ENUM('public', 'member', 'leadership', 'partner'),
  sort_order INTEGER DEFAULT 0
);

-- Flexible tagging system
article_tags (
  article_id INTEGER REFERENCES knowledge_base_articles(id),
  tag_name VARCHAR(50),
  tag_type ENUM('auto', 'manual', 'user'),
  created_by INTEGER REFERENCES users(id),
  PRIMARY KEY (article_id, tag_name)
);

-- Full-text search index (FTS5)
CREATE VIRTUAL TABLE article_search USING fts5(
  title, content, category, tags,
  content='knowledge_base_articles'
);
```

### Search Implementation
- **Primary Search**: FTS5 virtual table with content tokenization
- **Advanced Search**: Boolean queries, date ranges, category filters
- **Multilingual**: Separate FTS5 tables for English and Spanish content
- **Performance**: Indexed on frequently searched fields, cached common queries

### Access Control Integration
- **User Roles**: Public, Member, Leadership, Partner mapped to content access levels
- **Dynamic Filtering**: Search results filtered by user access level
- **Audit Logging**: Track access to sensitive organizing and research content
- **Time-Based Access**: Progressive access for member verification levels

### Content Management Interface
- **Web-Based Editor**: Markdown support with live preview
- **Bulk Import**: CSV/Markdown file upload for content migration
- **Translation Interface**: Side-by-side editor for bilingual content management
- **Approval Workflow**: Draft → Review → Publish with role-based permissions

## Community Contribution System

### Member Contributions
1. **Content Suggestions**: Community-identified gaps in knowledge base
2. **Experience Reports**: Campaign outcomes, tactical lessons, local adaptations  
3. **Resource Updates**: New community resources, contact changes, service updates
4. **Translation Assistance**: Community translation and cultural adaptation
5. **Fact Checking**: Community verification of information accuracy

### Quality Assurance
1. **Editorial Review**: Experienced organizers review contributed content
2. **Legal Review**: Attorney review for legal accuracy and organizing safety
3. **Community Feedback**: Member comments and corrections on published content
4. **Regular Audits**: Systematic review of content accuracy and relevance
5. **Source Verification**: Annual verification of external links and references

## Success Metrics

### Usage Analytics
- **Search Queries**: Most common searches, successful vs. failed queries
- **Content Views**: Most accessed articles, category usage patterns  
- **User Pathways**: Common content sequences, effective learning paths
- **Download Tracking**: Resource usage, offline content access

### Community Engagement
- **Contribution Volume**: Member-contributed content, translation assistance
- **Feedback Quality**: Community corrections, content improvements
- **Knowledge Application**: Reported use of knowledge base in organizing campaigns
- **Multilingual Usage**: Spanish content access and effectiveness

### Organizing Impact
- **Campaign Support**: Knowledge base resources used in organizing campaigns
- **New Organizer Development**: Educational content effectiveness in training
- **Legal Compliance**: Reduced legal violations through better tenant education  
- **Coalition Building**: Resource sharing effectiveness with partner organizations

This architecture creates a comprehensive, accessible, and strategically valuable knowledge base that serves the full spectrum of tenant organizing needs while maintaining security, accuracy, and community ownership of information.