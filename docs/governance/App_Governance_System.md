---
title: "App Governance System"
author: "RSTU Connect"
date: 2026
category: governance
---

# App Governance System

RSTU Connect uses a democratic governance system where organizers who have built tenant power can vote on app-wide decisions. This document explains how the system works.

## Two Types of Voting

### 1. Bloc-Level Voting (Building/Property Group)
Regular tenants vote on proposals affecting their building or bloc:
- **One person = One vote**
- Anyone verified at the property can vote
- Examples: rename bloc, add/remove property, elect officers

### 2. App-Wide Voting (Delegate Voting)
Qualified organizers vote on proposals affecting the entire app:
- **Votes are weighted** by delegate power
- Only organizers who have earned delegate status can vote
- Examples: enable/disable features, content changes, app direction

---

## Delegate Status: Who Can Vote on App Decisions?

### Earning Delegate Status

Organizers become delegates by building real tenant power. Three requirements must be met:

| Requirement | Threshold | Why It Matters |
|-------------|-----------|----------------|
| **Verified Tenants** | 10+ tenants in your blocs | You represent real people |
| **Bloc Membership** | At least 1 bloc | You've organized a building |
| **Activity Score** | 50+ points | You're actively participating |

### Activity Points
- Create a proposal: **10 points**
- Vote on any proposal: **2 points**
- Organize a building: **5 points**

### Your Delegate Weight

Once qualified, your voting power is calculated:

```
Weight = sqrt(verified_tenants) × 5 × (1 + activity_bonus)
```

- **Square root** prevents large blocs from dominating
- **Activity bonus** rewards consistent participation (up to 50% boost)
- **Maximum weight** is capped at 100

**Example:**
- Organizer with 25 verified tenants: √25 × 5 = 25 base weight
- With 100 activity points (50% bonus): 25 × 1.5 = 37.5 final weight

---

## App-Wide Proposal Types

### Feature Vote
Enable or disable app features through community decision.
- **Threshold:** 15 weighted votes
- **Example:** "Enable dark mode for all users"

### Content Vote
Vote on text changes, terminology, or content blocks.
- **Threshold:** 10 weighted votes
- **Example:** "Change 'landlord' to 'property owner' site-wide"

### Direction Vote
Major strategic decisions about the app's future.
- **Threshold:** 20 weighted votes
- **Example:** "Add Spanish language support as next priority"

### Tab Visibility Vote
Control which tabs appear for users.
- **Threshold:** 15 weighted votes
- **Example:** "Hide the Tools tab from non-organizers"

### Admin Recall
Vote to remove an admin from their position.
- **Threshold:** 50 weighted votes
- **Supermajority:** 2/3 (66.67%) of voting weight must approve
- **Minimum voters:** At least 3 delegates must participate
- **Why so high?** This is a serious action with major consequences

---

## The Bookchin Principle

> "Admins cannot vote on governance proposals"

Named after [Murray Bookchin](https://en.wikipedia.org/wiki/Murray_Bookchin), the political philosopher who inspired democratic confederalism, this principle ensures:

1. **Horizontal democracy** - Power flows from tenants up, not admins down
2. **Admin accountability** - Admins can be recalled but can't block it
3. **Servant leadership** - Admins serve; they don't rule

Admins can:
- Propose changes (though proposals need delegate support)
- Implement passed proposals
- Moderate content for safety

Admins cannot:
- Vote on any proposal
- Override community decisions
- Give themselves voting power

---

## How Voting Works

### Creating a Proposal

1. Must be a qualified delegate
2. Choose proposal type
3. Provide clear description and reason
4. Proposal goes live immediately
5. Your vote is automatically cast (weighted)

### Voting on a Proposal

1. Click upvote or downvote
2. Your delegate weight is recorded
3. You can change your vote anytime before expiration
4. Weight is recalculated if your delegate status changes

### Proposal Outcomes

**Passes** when:
- Net weighted votes (up - down) reaches threshold
- For admin recall: also needs 2/3 supermajority

**Rejected** when:
- Net weighted votes drops to -10 or below
- 7 days expire without reaching threshold

### After Passing

Most proposals execute automatically:
- Feature toggles flip on/off
- Tab visibility changes
- Content updates apply

Some require manual admin action to implement.

---

## Checking Your Delegate Status

Your profile page shows:
- Current delegate weight
- Verified tenants you represent
- Blocs you're part of
- Activity score
- What you need to qualify (if not yet)

---

## Frequently Asked Questions

### Q: Why can't regular tenants vote on app decisions?

App-wide decisions affect thousands of users. We want votes to represent organized tenant power, not just individual opinions. As you organize your building and help verify neighbors, you gain the standing to shape the app.

### Q: Is this fair? Bigger organizers have more power!

The square root formula dampens large blocs. An organizer with 100 tenants doesn't have 10x the power of one with 10 tenants - they have about 3x. Activity and involvement also matter.

### Q: Can delegates vote on their own building's proposals?

Yes! Delegate status is separate from bloc membership. You still get one regular vote in your building's proposals, regardless of delegate weight.

### Q: What stops organizers from creating fake tenants?

Verification requires proof of residence. The system rewards *verified* tenants only. Fraud would be caught during verification.

### Q: Can I lose delegate status?

Yes, if:
- Tenants leave your blocs (below threshold)
- You stop participating (activity decay)
- You're removed from a bloc

Your weight updates in real-time.

---

## Technical Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/delegateStorage.ts` | Delegate weight calculation |
| `src/lib/governanceStorage.ts` | Proposal creation and voting |
| `src/hooks/useDelegateStatus.ts` | React hooks for delegate data |
| `src/lib/adminSettingsStorage.ts` | Admin settings for features |

### Thresholds (Configurable by Admin)

```typescript
// Default delegate thresholds
minVerifiedTenants: 10
minBlocs: 1
minActivityScore: 50

// Vote thresholds (weighted)
'feature-vote': 15
'content-vote': 10
'direction-vote': 20
'admin-recall': 50
'tab-visibility': 15
```

### Data Structures

```typescript
interface WeightedVote {
  profileId: string
  weight: number
  votedAt: number
}

interface DelegateProfile {
  profileId: string
  delegateWeight: number
  verifiedTenantsRepresented: number
  blocsRepresented: number
  activityScore: number
  canVoteOnAppGovernance: boolean
  qualificationStatus: {
    meetsTenantsThreshold: boolean
    meetsBlocsThreshold: boolean
    meetsActivityThreshold: boolean
    tenantsNeeded: number
    blocsNeeded: number
    activityNeeded: number
  }
}
```

---

## Summary

The RSTU Connect governance system:

1. **Empowers organizers** who build real tenant power
2. **Weights votes** by community representation
3. **Prevents admin overreach** through the Bookchin principle
4. **Balances influence** with square root scaling
5. **Requires consensus** through meaningful thresholds

Build power. Earn your voice. Shape the platform.
