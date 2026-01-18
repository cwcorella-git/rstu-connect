---
title: "RSTU Connect Governance Guide"
author: "RSTU Technical Committee"
date: 2025
---

# RSTU Connect Governance Guide

A comprehensive guide to the democratic systems powering RSTU Connect, the Reno-Sparks Tenants Union's organizing platform.

## 1. Democratic Principles

### Power Flows from Tenants

RSTU Connect is built on a fundamental principle: **power flows from tenants, not from administrators**. This is inspired by Murray Bookchin's concept of libertarian municipalism, where legitimate authority comes from those most affected by decisions.

In practice, this means:

- **Administrators cannot vote** on app-wide governance decisions (the "Bookchin principle")
- Voting weight is determined by how many verified tenants you represent
- The system is designed so tenants can continue operating even without administrator involvement
- All critical decisions are made through democratic processes, not admin fiat

### Role Hierarchy

RSTU Connect has four roles with different capabilities:

| Role | Capabilities |
|------|-------------|
| **Guest** | View public content, browse buildings |
| **Tenant** | Full access to organizing tools, participate in building-level votes |
| **Organizer** | Create proposals, access advanced tools, promote tenants |
| **Admin** | Technical administration, **cannot vote** on governance |

The key insight: **admins have fewer governance rights than organizers**. This prevents technical control from translating into political power.

### Administrator Limitations

Administrators:
- Cannot vote on any app-wide proposals
- Cannot override democratic decisions
- Can be recalled by 2/3 supermajority of delegates
- Exist to maintain infrastructure, not make policy

If you see a purple "Admin Account" badge in the governance section, it means you cannot vote because of this principle.

---

## 2. Voting Systems

RSTU Connect uses three distinct voting systems, each designed for different types of decisions.

### 2.1 Officer Elections (Ranked Choice Voting)

Officer elections use **Ranked Choice Voting (RCV)**, also known as Instant-Runoff Voting. This ensures winners have broad support, not just plurality support.

#### How Ranked Choice Works

1. **Rank candidates** in order of preference (1st, 2nd, 3rd, etc.)
2. **First choices counted** - if someone has >50%, they win immediately
3. **No majority?** The candidate with the fewest votes is eliminated
4. **Votes transfer** - eliminated candidate's votes go to voters' next choices
5. **Repeat** until someone has a majority

#### Why Ranked Choice Matters

- **No spoiler effect**: You can vote for your true favorite without worrying about "wasting" your vote
- **Majority winners**: Winners always have support from over half of voters (after transfers)
- **Reduces strategic voting**: Vote your conscience, not against someone
- **Encourages coalition building**: Candidates need to appeal beyond their base

#### Example

Imagine an election with Alice, Bob, and Carol:

| Round 1 | Votes |
|---------|-------|
| Alice | 40 |
| Bob | 35 |
| Carol | 25 |

Carol is eliminated. Her votes transfer:
- 15 voters ranked Bob 2nd
- 10 voters ranked Alice 2nd

| Round 2 | Votes |
|---------|-------|
| Alice | 50 |
| Bob | 50 |

Tie in this example - but normally, one would emerge with >50%.

#### Officer Positions

- **President**: Leads general meetings, represents the union publicly
- **Vice President**: Assists President, leads in their absence
- **Secretary**: Takes minutes, maintains records
- **Treasurer**: Manages finances, provides reports

Each position has:
- 12-month terms
- 2-term limits
- 15% quorum requirement

### 2.2 Bloc-Level Proposals (Simple Majority)

Blocs are groups of linked properties that organize together. Within a bloc, decisions use simple majority voting with one person, one vote.

#### Bloc Proposal Types

| Type | Description | Threshold |
|------|-------------|-----------|
| `rename` | Change bloc name | 3 votes |
| `merge` | Combine with another bloc | 5 votes |
| `alliance` | Create formal alliance | 5 votes |
| `add-property` | Add building to bloc | 3 votes |
| `form-bloc` | Create new bloc | 5 votes |
| `rent-strike` | Coordinate rent withholding | 10 votes |
| `demands` | Approve building demands | 5 votes |
| `expense` | Approve bloc expense | 5 votes |

#### Rent Strike Threshold

Rent strikes require the highest threshold (10 votes) because:
- They carry legal and financial risks for participants
- They require sustained collective action
- They should reflect genuine consensus, not slim majorities

### 2.3 App-Wide Governance (Weighted Delegate Voting)

Decisions affecting the entire app use **weighted voting** where delegates vote with weight proportional to the tenants they represent.

#### App-Wide Proposal Types

| Type | Description | Weight Threshold | Special Rules |
|------|-------------|------------------|---------------|
| `feature-vote` | Add/change app features | 50 | - |
| `content-vote` | Modify content policies | 30 | - |
| `direction-vote` | Strategic direction | 50 | - |
| `tab-visibility` | Show/hide main tabs | 30 | - |
| `admin-recall` | Remove an administrator | 100 | Requires 2/3 supermajority + 3 delegates |

#### Admin Recall Process

Recalling an administrator requires:
1. **100 weight threshold** (higher than other proposals)
2. **2/3 supermajority** (not just simple majority)
3. **Minimum 3 voting delegates** (prevents gaming by few people)

This high bar prevents frivolous recalls while keeping administrators accountable.

---

## 3. Becoming a Delegate

Delegates are verified organizers who can vote on app-wide decisions. Their voting weight reflects the tenant power they've built.

### Qualification Requirements

To become a delegate, you must meet **all three** thresholds:

| Requirement | Threshold | How to Earn |
|-------------|-----------|-------------|
| Verified Tenants | 10+ | Have tenants you've organized verify their addresses |
| Blocs Organized | 1+ | Form or join a property bloc |
| Activity Score | 50+ | Participate in platform activities |

### Activity Scoring

Activities that contribute to your score:

| Activity | Points |
|----------|--------|
| Create a proposal | +10 |
| Vote on a proposal | +2 |
| Represent a building | +5 |
| Complete canvassing | +3 |
| Add unit data | +1 |

### How Voting Weight Works

Once qualified, your voting weight is calculated as:

```
Base Weight = sqrt(verified tenants) × 5
Activity Bonus = up to +50% based on activity score
Final Weight = min(Base Weight × (1 + Activity Bonus), 100)
```

#### Why Square Root?

Using square root (√) prevents large blocs from dominating:

| Tenants | Linear Weight | Square Root Weight |
|---------|---------------|-------------------|
| 10 | 50 | 15.8 |
| 100 | 500 | 50 |
| 400 | 2000 | 100 (max) |

This ensures:
- Small organizers have meaningful voice
- Large organizers are rewarded but not dominant
- Maximum weight of 100 ensures no single person controls outcomes

### Building Your Representation

To increase your delegate weight:

1. **Verify more tenants**: Have tenants in your buildings confirm their addresses
2. **Organize more blocs**: Link properties together under common cause
3. **Stay active**: Participate in votes, create proposals, use organizing tools

---

## 4. Tenant Self-Governance

RSTU Connect is designed to function even without administrator involvement. Here's how tenants can take control if needed.

### What Happens If Admins Leave

If administrators become inactive or unavailable:

1. **Platform continues working**: All local data persists, organizing tools function
2. **Proposals continue**: Voting and bloc decisions don't require admin
3. **Elections proceed**: Scheduled election cycles run automatically
4. **New admins can be elected**: Delegates can nominate and elect new technical administrators

### Emergency Succession

If administrative access is needed:

1. **Most active delegate** becomes interim administrator
2. **Emergency election** called within 30 days
3. **All existing votes and blocs preserved**
4. **Technical access transferred** through documented process

### Constitutional Protections

The following cannot be changed by any single person or small group:

- Bookchin principle (admins can't vote)
- Minimum delegate requirements
- Admin recall requiring 2/3 supermajority
- Rent strike threshold of 10 votes

These are "constitutional" rules that require system-wide consensus to modify.

---

## 5. Proposal Reference

### Bloc-Level Proposals

| Type | Purpose | Threshold | Duration |
|------|---------|-----------|----------|
| `rename` | Change bloc name | 3 votes | 7 days |
| `merge` | Merge two blocs | 5 votes | 14 days |
| `split` | Split bloc apart | 5 votes | 14 days |
| `alliance` | Form alliance | 5 votes | 14 days |
| `dissolve-alliance` | End alliance | 5 votes | 14 days |
| `add-property` | Add building | 3 votes | 7 days |
| `remove-property` | Remove building | 3 votes | 7 days |
| `form-bloc` | Create new bloc | 5 votes | 14 days |
| `rent-strike` | Coordinate strike | 10 votes | 21 days |
| `end-strike` | End strike | 5 votes | 7 days |
| `demands` | Approve demands | 5 votes | 14 days |
| `expense` | Approve expense | 5 votes | 7 days |
| `officer-elect` | Elect bloc officer | 5 votes | 14 days |
| `officer-recall` | Remove bloc officer | 7 votes | 14 days |
| `bylaws` | Change bloc bylaws | 7 votes | 21 days |
| `membership` | Membership decisions | 5 votes | 7 days |

### App-Wide Proposals

| Type | Purpose | Weight | Special Rules |
|------|---------|--------|---------------|
| `feature-vote` | Request new features | 50 | None |
| `content-vote` | Content policy changes | 30 | None |
| `direction-vote` | Strategic direction | 50 | None |
| `tab-visibility` | Hide/show app tabs | 30 | None |
| `admin-recall` | Remove administrator | 100 | 2/3 supermajority, 3+ delegates |

---

## 6. Ranked Choice Voting Deep Dive

### Teaching RCV to Your Community

When explaining ranked choice voting to fellow tenants:

**The Restaurant Analogy**

Imagine your bloc is choosing where to get dinner. Everyone ranks their choices:
- If pizza gets over half the votes, you get pizza
- If not, the least popular option is eliminated
- Anyone who voted for the eliminated option has their vote go to their second choice
- Repeat until one option has majority support

**Key Points to Emphasize**

1. **You can't waste your vote**: Voting for a less popular candidate doesn't hurt your influence
2. **Your backup choices matter**: If your first choice loses, your vote transfers
3. **It finds consensus**: Winners need broad support to prevail
4. **Less negative campaigning**: Candidates need to appeal to opponents' supporters as second choices

### RCV vs. Simple Majority

| Aspect | Simple Majority | Ranked Choice |
|--------|-----------------|---------------|
| Ballot | Choose one | Rank all |
| Winner threshold | Most votes | >50% after transfers |
| Spoiler effect | Yes | No |
| Strategic voting | Common | Minimal |
| Represents consensus | Weak | Strong |

### When RCV is Used

- **Officer elections**: President, VP, Secretary, Treasurer
- **Multi-candidate races**: Any vote with 3+ candidates

### When Simple Voting is Used

- **Bloc proposals**: One person, one vote, yes/no
- **App-wide proposals**: Weighted delegate voting, up/down

---

## 7. FAQ

### Can I vote if I'm an admin?

No. The Bookchin principle prevents administrators from voting on governance to ensure power flows from tenants.

### How do I become a delegate?

Represent 10+ verified tenants, organize 1+ bloc, and earn 50+ activity points. Check your progress in Profile > App Governance.

### What if I disagree with a proposal outcome?

You can create a new proposal to reverse or modify the decision. Democratic decisions can be democratically changed.

### Can admins override votes?

No. Administrators cannot override democratic decisions. They can be recalled by 2/3 supermajority if they violate this trust.

### How are votes counted?

- **Bloc votes**: Simple majority (one person = one vote)
- **App-wide votes**: Weighted by delegate representation
- **Elections**: Ranked choice with instant runoff

### What's the difference between an organizer and a delegate?

- **Organizer**: A role with access to advanced tools
- **Delegate**: Someone who has met thresholds to vote on app-wide governance

You can be both - they're not mutually exclusive.

### How long do proposals last?

Most proposals expire after 14 days if they don't reach their threshold. Critical decisions like rent strikes have longer windows (21 days).

---

## 8. Summary

RSTU Connect's governance is designed around one core principle: **tenant power**. Every system - from weighted voting to admin restrictions to ranked choice elections - exists to ensure that the people most affected by decisions are the ones making them.

Key takeaways:

1. **Administrators serve, they don't rule**: The Bookchin principle ensures technical control doesn't become political control
2. **Three voting systems for three contexts**: Elections (RCV), blocs (simple majority), app-wide (weighted delegates)
3. **Delegate weight reflects tenant power**: The more tenants you organize, the more voice you have
4. **The system is resilient**: Tenants can continue governing even without administrator involvement
5. **Democratic decisions can be democratically changed**: Nothing is permanent except the constitutional protections

This is tenant democracy in action. Use it well.

---

*This document is part of the RSTU Connect organizing library. For questions, contact the Technical Committee or file an issue at the project repository.*
