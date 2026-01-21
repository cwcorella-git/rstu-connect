---
title: "RSTU Connect Governance Guide"
author: "Reno-Sparks Tenants Union"
date: 2025
---

# RSTU Connect Governance Guide

This document explains the democratic systems built into RSTU Connect, Nevada's first tenant organizing platform. These systems ensure that power flows from tenants, not administrators, following the Bookchin principle of participatory democracy.

---

## 1. DEMOCRATIC PRINCIPLES

### Power Flows From Tenants

RSTU Connect is designed around a fundamental principle: **administrators cannot vote on app governance**. This is known as the Bookchin principle, named after social ecologist Murray Bookchin who advocated for direct democracy where power resides with the people, not managers.

In practice, this means:
- **Admins** maintain the platform but have no voting power on decisions affecting the app
- **Organizers** who represent verified tenants earn delegate status and voting power
- **Tenants** participate in building-level and bloc-level decisions directly

### Role Hierarchy

| Role | Capabilities | Voting Rights |
|------|--------------|---------------|
| **Tenant** | View buildings, join chats, vote on bloc proposals | Bloc-level proposals (1 person = 1 vote) |
| **Organizer** | Access tools, canvass, create campaigns, earn delegate status | Bloc + App governance (weighted by representation) |
| **Admin** | Platform maintenance, election administration, user management | **None** (Bookchin principle) |

### Why Admins Can't Vote

If administrators could vote, they could potentially influence the direction of the union to serve their own interests. By removing their voting power:
- Decisions reflect actual tenant needs
- No single person can dominate the app's direction
- Power remains distributed among those doing the organizing work

---

## 2. VOTING SYSTEMS

RSTU Connect has three distinct voting systems for different purposes.

### 2.1 Officer Elections (Ranked Choice)

Officer elections choose the union's leadership: President, Vice President, Secretary, and Treasurer.

**How Ranked Choice Voting Works:**

1. **Rank your candidates** in order of preference (1st choice, 2nd choice, etc.)
2. **First count:** All first-choice votes are counted
3. **If someone has >50%:** They win immediately
4. **If no majority:** The candidate with the fewest votes is eliminated
5. **Votes transfer:** Voters whose first choice was eliminated have their vote transfer to their next ranked choice
6. **Repeat:** Steps 3-5 continue until someone has a majority

**Why Ranked Choice?**
- Eliminates "spoiler" candidates
- Ensures the winner has broad support, not just a plurality
- Encourages candidates to appeal to a wider base
- Voters can express their true preferences without strategic voting

**Election Timeline:**
- Nominations open for 2 weeks
- Any verified tenant can be nominated
- Nominees must accept their nomination
- Voting period lasts 1-2 weeks
- 15% quorum required for valid results

**Officer Positions:**

| Position | Responsibilities | Term |
|----------|-----------------|------|
| President | Leads meetings, represents union publicly, coordinates with organizations | 1 year (2-term limit) |
| Vice President | Assists President, leads in absence, oversees committees | 1 year (2-term limit) |
| Secretary | Meeting minutes, records maintenance, correspondence | 1 year (2-term limit) |
| Treasurer | Finances, budget, financial reports | 1 year (2-term limit) |

### 2.2 Bloc-Level Proposals (Simple Majority)

Blocs are groups of tenants organizing together, either within a single building or across multiple properties with the same landlord. Bloc-level voting uses **simple majority**: one person, one vote.

**Proposal Types and Thresholds:**

| Type | Description | Threshold |
|------|-------------|-----------|
| rename | Change the bloc's name | +3 votes |
| add-property | Add a building to the bloc | +3 votes |
| remove-property | Remove a building from the bloc | +5 votes |
| merge | Merge with another bloc (both must approve) | +3 votes each |
| alliance | Form an alliance with another bloc | +3 votes each |
| split | Split bloc into separate groups | +5 votes |
| mute-tenant | Temporarily mute a disruptive member | +7 votes |
| escalate | Escalate to higher action level | +5 votes |

**Collective Action Thresholds:**

| Type | Description | Threshold |
|------|-------------|-----------|
| form-bloc | Create new bloc from multiple buildings | +3 from each building |
| join-bloc | Join an existing bloc | +3 from both sides |
| rent-strike | Initiate coordinated rent withholding | +10 votes |
| demand-letter | Send formal demand to landlord | +5 votes |
| petition | Start a signature collection | +3 votes |

**How to Create a Proposal:**
1. Navigate to your building or bloc chat
2. Click the governance icon (scales)
3. Select "Create Proposal"
4. Choose the proposal type
5. Provide a reason for the proposal
6. Submit for voting

Proposals expire after **7 days** if they don't reach their threshold.

### 2.3 App-Wide Governance (Weighted Delegates)

App-wide decisions—like which features to enable, content changes, or strategic direction—use **delegate-weighted voting**. This means your voting power is proportional to how many tenants you represent.

**App-Wide Proposal Types:**

| Type | Description | Weight Threshold |
|------|-------------|------------------|
| feature-vote | Enable/disable app features | 15 points |
| content-vote | Vote on text or content blocks | 10 points |
| direction-vote | Strategic direction decisions | 20 points |
| tab-visibility | Which tabs are visible to users | 15 points |
| admin-recall | Remove an admin (requires 2/3 supermajority) | 50 points |

**Admin Recall:**
Removing an admin requires:
- At least 50 weight points of "yes" votes
- 2/3 (66.67%) supermajority
- At least 3 voting delegates participating

This high bar ensures admin removal is deliberate and widely supported.

---

## 3. BECOMING A DELEGATE

Delegates are organizers who have earned voting power through their organizing work. Only qualified delegates can vote on app-wide governance.

### Qualification Requirements

To become a delegate, you must:

| Requirement | Default Threshold | Why It Matters |
|-------------|-------------------|----------------|
| **Verified Tenants** | 10+ tenants | You represent real people |
| **Blocs Organized** | 1+ bloc | You've built collective power |
| **Activity Score** | 50+ points | You're actively engaged |

### How Voting Weight Is Calculated

Your voting weight uses a square root formula to prevent mega-blocs from dominating:

**Base Weight** = square root of verified tenants multiplied by 5

**Activity Bonus** = your activity score divided by 100, capped at 50%

**Final Weight** = base weight times (1 + activity bonus), capped at 100

**The square root formula** prevents mega-blocs from completely dominating:
- 10 tenants = approximately 15.8 base weight
- 100 tenants = approximately 50 base weight
- 400 tenants = approximately 100 base weight (hits cap)

**Why cap at 100?** No single delegate should have more than 100 weight, ensuring no organizer can dominate decisions alone.

### Activity Score Breakdown

Your activity score is calculated from your organizing work:

| Activity | Points |
|----------|--------|
| Create a proposal | +10 |
| Vote on a proposal | +2 |
| Organize a building | +5 |

### Checking Your Status

View your delegate status in **Profile > Voting & Governance > Delegate Status**. You'll see:
- Your current qualification progress
- Activity breakdown
- Voting weight (if qualified)
- Overall delegate network stats

---

## 4. TENANT SELF-GOVERNANCE

RSTU Connect is designed to function even if administrators become inactive. Here's how.

### If Admins Are Inactive

The app uses **local-first architecture**, meaning:
- Profile data is stored on your device
- Building data works without a server
- Chat requires a connection, but organizing tools don't

### Emergency Succession Protocol

If the admin team becomes unresponsive:

1. **Most active delegate becomes interim admin**
   - Based on activity score and delegate weight
   - Requires 2/3 supermajority of delegates to confirm

2. **Emergency election called within 30 days**
   - All existing officer positions become vacant
   - Nominations and voting follow normal procedures

3. **All existing data preserved**
   - Blocs, proposals, and votes remain intact
   - No organizing work is lost

### How Tenants Can Continue Organizing

Even without admin involvement:
- **Canvassing continues:** Unit data is stored locally
- **Blocs function:** Proposals and voting work peer-to-peer
- **Elections are scheduled:** Automated cycles continue
- **Organizers promote tenants:** Role changes don't require admin

### Constitutional Protections

The system enforces several protections:
- **Admin recall exists:** Delegates can remove problematic admins
- **No single point of failure:** Multiple admins recommended
- **Transparent processes:** All votes and proposals are visible
- **Term limits:** Officers limited to 2 terms per position

---

## 5. PROPOSAL TYPE REFERENCE

### Bloc-Level Proposals

| Type | When to Use | Threshold | Execution |
|------|-------------|-----------|-----------|
| **rename** | Bloc needs a better name | +3 | Auto-executes |
| **add-property** | Include another building | +3 | Auto-executes |
| **remove-property** | Building wants to leave | +5 | Auto-executes |
| **merge** | Combine two blocs | +3 (both) | Requires partner approval |
| **alliance** | Coordinate without merging | +3 (both) | Requires partner approval |
| **split** | Divide bloc into groups | +5 | Auto-executes |
| **mute-tenant** | Silence disruptive member | +7 | Requires organizer finalization |
| **escalate** | Increase action level | +5 | Auto-executes |

### Collective Action Proposals

| Type | When to Use | Threshold | Notes |
|------|-------------|-----------|-------|
| **form-bloc** | Create multi-building organization | +3 per building | All must approve |
| **join-bloc** | Add your building to existing bloc | +3 (both) | Both sides approve |
| **rent-strike** | Coordinated rent withholding | +10 | High bar for serious action |
| **demand-letter** | Formal landlord communication | +5 | Can track delivery status |
| **petition** | Gather signatures | +3 | Creates signature collection |

### Internal Collective Proposals

| Type | When to Use | Threshold | Notes |
|------|-------------|-----------|-------|
| **form-collective** | Create non-property organization | +3 co-founders | For tenant unions, working groups |
| **join-collective** | Request to join collective | +1 Point Person | Fast approval |
| **collective-alliance** | Ally with another collective | +3 (both) | Mutual agreement |
| **collective-rename** | Change collective name | +3 | Members vote |
| **add-point-person** | Promote member to leader | +3 | Expands leadership |
| **remove-point-person** | Demote Point Person | +3 | Requires majority |

### App-Wide Proposals

| Type | When to Use | Threshold | Who Votes |
|------|-------------|-----------|-----------|
| **feature-vote** | Enable/disable features | 15 weight | Delegates only |
| **content-vote** | Change app text/content | 10 weight | Delegates only |
| **direction-vote** | Strategic decisions | 20 weight | Delegates only |
| **tab-visibility** | Show/hide navigation tabs | 15 weight | Delegates only |
| **admin-recall** | Remove an administrator | 50 weight + 2/3 majority | Delegates only |

---

## 6. GLOSSARY

**Bloc:** A group of tenants organizing together, either from a single building or multiple properties with the same landlord.

**Bookchin Principle:** The design philosophy that administrators should not have voting power, ensuring decisions reflect tenant needs.

**Delegate:** An organizer who has earned voting power by representing verified tenants.

**Delegate Weight:** The voting power of a delegate, calculated from tenants represented and activity.

**Quorum:** The minimum participation required for a valid vote (typically 15% for elections).

**Ranked Choice Voting (RCV):** A voting method where voters rank candidates by preference, with votes transferring if no one gets a majority.

**Supermajority:** A threshold higher than simple majority, typically 2/3 (66.67%).

**Threshold:** The number of votes (or weight points) required for a proposal to pass.

**Verified Tenant:** A tenant whose identity and residence have been confirmed by an organizer.

---

## 7. CONTACT & SUPPORT

For questions about governance:
- Visit the RSTU Connect chat
- Reach out to your bloc organizer
- Email the union leadership

For technical issues:
- Report bugs at https://github.com/cwcorella-git/rstu-connect/issues

---

*This document reflects the governance systems as implemented in RSTU Connect. The systems themselves are subject to change through the democratic processes described above.*

*Last updated: January 2025*
