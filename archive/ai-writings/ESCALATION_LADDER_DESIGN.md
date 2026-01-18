# Escalation Ladder Workflow
## RSTU Connect Feature Design Document

**Date:** January 9, 2026
**Status:** Proposed
**Complexity:** Medium
**Dependencies:** habitabilityStorage, demandLetterPDF, governanceStorage, strikeStorage, codeEnforcementIntegration

---

## The Problem

RSTU Connect has powerful individual tools:
- Habitability issue tracking
- Demand letter generation
- Strike readiness calculator
- Governance voting
- Code enforcement integration (unused)
- Legal aid referral (unused)

But tenants don't know **when to use which tool** or **what comes next**. It's like having a toolbox with no instruction manual.

A tenant reports a broken heater in January. Then what? The issue sits in a list. Nobody knows:
- Did anyone tell the landlord?
- How long should we wait for a response?
- What if they ignore us?
- When is it time to escalate?

**The Escalation Ladder solves this by turning isolated tools into a guided workflow.**

---

## The Core Concept

Organizing follows a predictable pattern:

```
IDENTIFY → DEMAND → DEADLINE → ESCALATE → WIN (or repeat)
```

The Escalation Ladder codifies this pattern into a state machine that:
1. Tracks where each issue is in the cycle
2. Suggests the next step based on current state
3. Auto-prompts when deadlines pass
4. Connects existing tools at the right moments

---

## The Six Stages

### Stage 1: ISSUE IDENTIFIED
**What happens:** A tenant reports a problem (habitability, lease violation, harassment, etc.)

**Requirements to enter:**
- Issue description
- Issue category (habitability, lease, harassment, retaliation, other)
- Severity (minor, moderate, serious, emergency)
- Evidence (optional but encouraged: photos, dates, witnesses)

**System behavior:**
- Creates issue record in `escalationStorage`
- Links to existing habitability tracker if applicable
- Shows in building's "Active Issues" list
- **Suggests:** "Document this issue and gather support from neighbors"

**Exit condition:** Organizer marks "Ready to demand" OR 3+ tenants affected

---

### Stage 2: DEMAND DRAFTED
**What happens:** Tenants create a formal demand based on the issue

**Requirements to enter:**
- At least one documented issue
- Draft demand text (can use templates)
- Specific ask (repair by X date, rent reduction of $Y, policy change Z)

**System behavior:**
- Links to `demandLetterPDF` generator
- Pulls habitability data into demand automatically
- Shows affected unit count and tenant signatures
- **Suggests:** "Get more tenants to sign before sending" if < 50% building participation

**Integration points:**
- Auto-populates from habitability issues
- Can trigger governance vote if building requires it
- Links to mutual aid if demand involves rent withholding

**Exit condition:** Demand finalized and delivery method chosen

---

### Stage 3: DEMAND DELIVERED
**What happens:** The demand has been sent to the landlord

**Requirements to enter:**
- Finalized demand document
- Delivery method recorded (email, certified mail, hand-delivered, posted on door)
- Delivery date
- Deadline date (default: 14 days for repairs, 30 days for policy changes)

**System behavior:**
- Starts countdown timer
- Records delivery proof (tracking number, photo, email receipt)
- Creates calendar event for deadline
- Sends reminder notifications at 7 days, 3 days, 1 day before deadline
- **Suggests:** "Document any landlord contact or repair attempts"

**New data captured:**
- `deliveryMethod`: enum
- `deliveryDate`: timestamp
- `deliveryProof`: string (tracking #, photo URL, etc.)
- `deadlineDate`: timestamp
- `landlordContacts`: array of contact records

**Exit condition:** Deadline reached OR landlord responds

---

### Stage 4: AWAITING RESPONSE
**What happens:** Deadline has passed or landlord has responded

**Requirements to enter:**
- Deadline date reached, OR
- Landlord contact logged

**System behavior:**
- If landlord responded: prompt to record response details
- If deadline passed with no response: flag as "No Response"
- Calculate days overdue
- **Suggests escalation options based on situation:**

| Situation | Suggested Next Step |
|-----------|---------------------|
| No response, habitability issue | "File code enforcement complaint" |
| No response, lease violation | "Consult legal aid" |
| Partial response, not fixed | "Set new deadline with consequences" |
| Landlord refused | "Consider collective action (strike vote)" |
| Landlord retaliated | "Document retaliation, contact legal aid immediately" |

**Landlord Response Recording:**
```typescript
interface LandlordResponse {
  date: timestamp
  method: 'phone' | 'email' | 'letter' | 'in-person' | 'none'
  summary: string
  responseType: 'agreed' | 'partial' | 'refused' | 'ignored' | 'retaliated'
  promisedAction?: string
  promisedDeadline?: timestamp
}
```

**Exit condition:** User selects escalation path

---

### Stage 5: ESCALATION ACTIVE
**What happens:** Tenants have chosen to escalate beyond negotiation

**Escalation paths available:**

#### Path A: Code Enforcement
- Auto-generates complaint using habitability data
- Links to `codeEnforcementIntegration.ts` (currently unused)
- Tracks complaint filing date and case number
- Monitors for inspection scheduling

#### Path B: Legal Action
- Triggers `legalAidReferral.ts` (currently unused)
- Generates case summary for attorney
- Tracks legal consultation dates
- Links to eviction defense if applicable

#### Path C: Collective Action (Strike)
- Checks strike readiness gauge
- If ready: suggests governance vote for rent strike
- If not ready: shows what's needed (more participation, legal fund, etc.)
- Links to `strikeStorage` for coordination

#### Path D: Public Pressure
- Generate press release template
- Track media outreach
- Coordinate public action (picket, rally)
- Link to campaign system

**System behavior:**
- Tracks which escalation path(s) are active
- Shows progress within each path
- Allows multiple paths simultaneously
- **Suggests:** next micro-step within chosen path

**Exit condition:** Issue resolved OR escalation exhausted

---

### Stage 6: RESOLUTION
**What happens:** The issue has reached an outcome

**Resolution types:**
- **Victory:** Demand met (full or partial)
- **Compromise:** Negotiated settlement
- **Loss:** Eviction, forced move, demand denied
- **Ongoing:** Issue persists, cycling back to earlier stage

**Requirements to enter:**
- Outcome recorded
- Victory details (if applicable): what was won, when, how

**System behavior:**
- Creates Victory record (links to `victoryStorage.ts`)
- Archives issue with full timeline
- Updates landlord accountability profile
- **Suggests:** "Share this win with other tenants" / "Document lessons learned"

**Victory data captured:**
```typescript
interface Resolution {
  type: 'victory' | 'compromise' | 'loss' | 'ongoing'
  date: timestamp
  summary: string
  // If victory:
  demandsMet: string[]
  tacticsUsed: string[]  // for learning
  mediaAttention: boolean
  // Links:
  linkedIssueId: string
  linkedCampaignId?: string
  linkedLandlordId: string
}
```

---

## The User Experience

### Building View: "Escalation Tracker" Panel

```
┌─────────────────────────────────────────────────────┐
│  ACTIVE ESCALATIONS                            [+]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔴 Broken Heating (12 units affected)              │
│     Stage: AWAITING RESPONSE                        │
│     ⚠️  Deadline passed 5 days ago - NO RESPONSE    │
│     → Suggested: File code enforcement complaint    │
│     [View Details] [Escalate Now]                   │
│                                                     │
│  🟡 Rent Increase Notice (Building-wide)            │
│     Stage: DEMAND DELIVERED                         │
│     ⏱️  Deadline in 8 days                          │
│     → On track, waiting for response                │
│     [View Details] [Log Contact]                    │
│                                                     │
│  🟢 Lobby Security (Resolved!)                      │
│     Stage: VICTORY                                  │
│     ✓ New locks installed after 3-week campaign    │
│     [View Timeline] [Share Win]                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Issue Detail View: Timeline + Next Steps

```
┌─────────────────────────────────────────────────────┐
│  BROKEN HEATING - Unit 4A, 4B, 4C, 5A, 5B...        │
│  Severity: SERIOUS    Affected: 12 units            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TIMELINE                                           │
│  ─────────                                          │
│  Jan 2   Issue reported by Maria (4A)               │
│  Jan 3   5 more tenants confirm same issue          │
│  Jan 5   Demand letter drafted                      │
│  Jan 6   ✓ Demand sent via certified mail           │
│          Tracking: 9400111899223100012345           │
│  Jan 7   Delivery confirmed                         │
│  Jan 20  ⚠️ DEADLINE PASSED - No response           │
│  Jan 25  Today                                      │
│                                                     │
│  ──────────────────────────────────────────────     │
│                                                     │
│  SUGGESTED NEXT STEP                                │
│  ──────────────────                                 │
│  Landlord has not responded in 5 days past          │
│  deadline. For habitability issues, Nevada law      │
│  allows tenants to:                                 │
│                                                     │
│  1. File complaint with Code Enforcement            │
│     [File Complaint →]                              │
│                                                     │
│  2. Request rent reduction for uninhabitable unit   │
│     [Calculate Reduction →]                         │
│                                                     │
│  3. Organize rent strike if issue persists          │
│     Strike Readiness: 67% (need legal fund)         │
│     [View Strike Prep →]                            │
│                                                     │
│  [Log Landlord Contact]  [Mark Resolved]            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Notification System

The ladder generates notifications at key moments:

| Trigger | Notification |
|---------|--------------|
| New issue reported | "New issue at [building]: [title]. 1 tenant affected." |
| 3+ tenants on same issue | "3 tenants now reporting [issue]. Ready to draft demand?" |
| Demand deadline approaching | "Deadline for [issue] in 3 days. Any landlord contact?" |
| Deadline passed, no response | "⚠️ [Issue] deadline passed. Landlord hasn't responded. Time to escalate?" |
| Escalation filed | "[Building] filed code enforcement complaint for [issue]" |
| Victory recorded | "🎉 [Building] won! [Summary of victory]" |

---

## Technical Implementation

### New Storage Module: `escalationStorage.ts`

```typescript
interface EscalationCase {
  id: string
  buildingId: string
  title: string
  description: string

  // Issue details
  category: 'habitability' | 'lease' | 'harassment' | 'retaliation' | 'other'
  severity: 'minor' | 'moderate' | 'serious' | 'emergency'
  affectedUnits: string[]
  reportedBy: string  // odellId
  reportedAt: timestamp

  // Current state
  stage: 'identified' | 'drafted' | 'delivered' | 'awaiting' | 'escalating' | 'resolved'

  // Demand tracking
  demandText?: string
  demandDeadline?: timestamp
  deliveryMethod?: 'email' | 'certified_mail' | 'hand_delivered' | 'posted'
  deliveryDate?: timestamp
  deliveryProof?: string

  // Response tracking
  landlordResponses: LandlordResponse[]

  // Escalation tracking
  escalationPaths: {
    codeEnforcement?: { filedDate: timestamp, caseNumber: string, status: string }
    legal?: { consultDate: timestamp, attorneyName: string, status: string }
    strike?: { voteProposalId: string, status: string }
    publicPressure?: { campaignId: string, status: string }
  }

  // Resolution
  resolution?: Resolution

  // Metadata
  createdAt: timestamp
  updatedAt: timestamp
  timeline: TimelineEvent[]  // Full history
}

interface TimelineEvent {
  date: timestamp
  type: string
  description: string
  actorId?: string
  metadata?: Record<string, any>
}
```

### State Machine Logic

```typescript
// Determines suggested next action based on current state
function getSuggestedAction(case: EscalationCase): SuggestedAction {
  switch (case.stage) {
    case 'identified':
      if (case.affectedUnits.length >= 3) {
        return { action: 'draft_demand', reason: 'Multiple tenants affected' }
      }
      return { action: 'gather_support', reason: 'Document issue and find affected neighbors' }

    case 'drafted':
      const participation = case.affectedUnits.length / buildingUnitCount
      if (participation < 0.5) {
        return { action: 'get_signatures', reason: `Only ${participation}% participating` }
      }
      return { action: 'send_demand', reason: 'Ready to deliver' }

    case 'delivered':
      const daysUntilDeadline = daysBetween(now, case.demandDeadline)
      if (daysUntilDeadline > 0) {
        return { action: 'wait', reason: `${daysUntilDeadline} days until deadline` }
      }
      return { action: 'check_response', reason: 'Deadline reached' }

    case 'awaiting':
      const lastResponse = case.landlordResponses.at(-1)
      if (!lastResponse || lastResponse.responseType === 'ignored') {
        return suggestEscalationByCategory(case.category)
      }
      if (lastResponse.responseType === 'retaliated') {
        return { action: 'legal_aid', reason: 'Retaliation detected - legal help needed', urgent: true }
      }
      if (lastResponse.responseType === 'partial') {
        return { action: 'new_deadline', reason: 'Partial response - set follow-up deadline' }
      }
      return { action: 'evaluate', reason: 'Review landlord response' }

    case 'escalating':
      return getEscalationProgress(case.escalationPaths)

    case 'resolved':
      if (case.resolution?.type === 'victory') {
        return { action: 'share_win', reason: 'Document and celebrate!' }
      }
      return { action: 'lessons_learned', reason: 'Record what happened for future campaigns' }
  }
}

function suggestEscalationByCategory(category: string): SuggestedAction {
  const suggestions = {
    habitability: { action: 'code_enforcement', reason: 'File complaint for inspection' },
    lease: { action: 'legal_aid', reason: 'Consult attorney about lease violation' },
    harassment: { action: 'legal_aid', reason: 'Document harassment, seek legal protection', urgent: true },
    retaliation: { action: 'legal_aid', reason: 'Retaliation is illegal - contact attorney', urgent: true },
    other: { action: 'collective_action', reason: 'Consider organizing collective response' }
  }
  return suggestions[category] || suggestions.other
}
```

### Integration Points

| Existing System | How Ladder Connects |
|-----------------|---------------------|
| `habitabilityStorage` | Import issues as escalation cases |
| `demandLetterPDF` | Generate demand at Stage 2 |
| `governanceStorage` | Create vote proposals for strike/action |
| `strikeStorage` | Check readiness, coordinate strike path |
| `codeEnforcementIntegration` | File complaints at escalation |
| `legalAidReferral` | Connect to attorneys at escalation |
| `victoryStorage` | Record wins at resolution |
| `eventStorage` | Create deadline reminders |

---

## What This Enables

### For Individual Tenants
- "I reported my broken heater. Now what?" → System tells them
- Clear progress visibility ("we're at stage 3 of 6")
- Confidence that nothing falls through cracks

### For Organizers
- Dashboard of all active escalations across buildings
- Automated reminders ("Maria's case deadline is tomorrow")
- Data on which tactics work ("code enforcement resolved 70% of habitability cases")

### For the Movement
- Victory documentation builds over time
- Landlord accountability profiles emerge from escalation history
- Cross-building patterns visible ("this landlord ignores all demands until strike threat")

---

## Implementation Phases

### Phase 1: Core State Machine
- Create `escalationStorage.ts`
- Basic stage tracking (no integrations yet)
- Simple UI: list view + detail view
- Manual stage transitions

### Phase 2: Suggestion Engine
- Implement `getSuggestedAction()` logic
- Add notification triggers
- Deadline tracking with reminders

### Phase 3: Tool Integration
- Connect habitability → auto-create cases
- Connect demand generator → Stage 2
- Connect governance voting → strike path

### Phase 4: Advanced Escalation
- Wire up code enforcement filing
- Wire up legal aid referral
- Connect to campaign system

### Phase 5: Analytics
- Victory tracking integration
- Landlord response patterns
- Tactic effectiveness reports

---

## Open Questions

1. **Should escalation cases be building-scoped or bloc-scoped?**
   - Building-scoped is simpler
   - Bloc-scoped enables coordinated pressure on portfolio landlords

2. **Who can advance stages?**
   - Any affected tenant? Only organizers? Voted decision?
   - Suggestion: Anyone can report, organizers advance stages, strikes require vote

3. **How aggressive should auto-suggestions be?**
   - Passive: "Here are your options"
   - Active: "We recommend filing code enforcement NOW"
   - Suggestion: Start passive, add urgency indicators

4. **Privacy of escalation data?**
   - Visible to all building tenants?
   - Only organizers + affected tenants?
   - Suggestion: Summary visible to all, details to participants

---

## Success Metrics

- **Adoption:** % of reported issues that enter the escalation ladder
- **Completion:** % of cases that reach resolution (vs. abandoned)
- **Velocity:** Average days from issue → resolution
- **Win Rate:** % of cases ending in victory/compromise
- **Escalation Rate:** % of cases requiring escalation beyond negotiation

---

## Summary

The Escalation Ladder transforms RSTU Connect from a collection of tools into a guided organizing system. It answers the question every tenant asks: **"What do I do next?"**

By codifying the organize → demand → escalate → win cycle, we ensure:
- No issue gets forgotten
- No deadline passes unnoticed
- No tenant faces their landlord alone
- Every victory gets documented

The pieces already exist. The Escalation Ladder connects them.
