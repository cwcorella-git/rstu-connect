# RSTU Connect: Next Steps

## Chosen Direction: Complete the Power Map → Campaign Flow

The Pressure Points Map in Tools has working backend logic to detect:
- **Multi-property campaign opportunities** (3+ buildings with poor habitability)
- **Coordinated strike readiness** (2+ buildings at 65%+ participation)

But the buttons just show `window.confirm()` dialogs. The `CampaignCreationModal` already exists but isn't wired up.

**This is the highest-impact quick win** because it connects the intelligence layer (detecting opportunities) to the action layer (creating campaigns).

---

## Implementation Tasks

### Phase 1: Wire Up Campaign Creation (COMPLETE)

**File:** `src/components/Tools/PowerMap/PressurePointsMap.tsx`

1. ~~Import `CampaignCreationModal` and add modal state~~ DONE
2. ~~Replace `handleCreateCampaign` confirm dialog with modal open~~ DONE
3. ~~Replace `handleCoordinatedStrike` confirm dialog with modal open (strike type)~~ DONE
4. ~~Pass affected properties to modal for pre-population~~ DONE

**File:** `src/components/Tools/PowerMap/CampaignCreationModal.tsx`

5. ~~Modal already accepts pre-selected properties~~ (was already done)
6. ~~Modal already supports campaign type selection~~ (was already done)

---

### Phase 2: Delegate Dashboard (COMPLETE)

**Problem:** `delegateStorage.ts` calculates organizer voting power but there's no UI.

**Created:** `src/components/Governance/DelegateStatus.tsx`

Shows organizers:
- ~~Current delegate weight~~ DONE
- ~~Blocs they represent~~ DONE
- ~~Verified tenants count~~ DONE
- ~~What they need to qualify for app governance voting~~ DONE
- ~~Progress bars toward thresholds~~ DONE

**Integrated:** Added "Governance" tab to Tools page with:
- DelegateStatus component showing qualification progress
- AppGovernancePanel for voting on app-wide proposals

---

### Phase 3: Governance Integration

**File:** `src/components/Profile/RentComparison.tsx:120`

TODO says: "Integrate with governance system using building.apn"

Connect rent comparison data to building-level proposals so tenants can propose rent-related actions based on comparable data.

---

## Other Ideas Found

### From Desktop (`~/Desktop/rstu-ideas/`)
- Platform roadmap document (Phase 2: code enforcement/eviction tracking)
- Theoretical foundation and operational strategy

### From Gmail PDFs
- Faith community organizing partnerships
- Mutual aid network expansion
- Strike fund coordination
- Local resource directories

### From `~/Desktop/RSTU_Writings/`
- Administrative templates
- Meeting notes archive
- Theory documents

---

## Backend Features Status

| Feature | Backend | UI | Status |
|---------|---------|-----|--------|
| Escalation Ladder | Complete | Complete | Done |
| Elections | Complete | Complete | Done |
| Strike Prep | Complete | Complete | Done |
| Eviction Defense | Complete | Integrated | Done |
| Legal Aid Referrals | Complete | Integrated | Done |
| **Campaign from PowerMap** | Complete | Complete | **Done** |
| **Delegate System** | Complete | Complete | **Done** |
| Governance Integration | Partial | Partial | Phase 3 |

---

## Quick Reference

```bash
# Files to modify for Phase 1
src/components/Tools/PowerMap/PressurePointsMap.tsx  # Wire up buttons
src/components/Tools/PowerMap/CampaignCreationModal.tsx  # Accept properties

# Files to create for Phase 2
src/components/Governance/DelegateStatus.tsx  # New component
src/components/Governance/DelegateProgress.tsx  # Progress toward thresholds
```
