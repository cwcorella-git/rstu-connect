# Issue #2: Architecture Feedback Tasks

Tracking progress on [Issue #2](https://github.com/cwcorella-git/rstu-connect/issues/2) by @jackrwoods.

---

## Completed

### Logging Framework
- [x] Implement lightweight logging utility (`src/lib/logger.ts`)
- [x] Configure to be verbose in dev, silent in production
- [x] Migrate all `console.log/warn/error` statements to logger
- [x] Remove category prefixes from messages (logger adds them)

**Commits:** `a11116c5`, `75ef8354`

---

## In Progress

*None currently*

---

## TODO

### 1. Testing Infrastructure
- [x] Set up Jest for unit/integration tests
- [x] Set up React Testing Library for component tests
- [x] Write tests for critical lib functions:
  - [x] `profileStorage.ts` - auth, roles, permissions, invites (53 tests)
  - [x] `governanceStorage.ts` - voting logic, thresholds, Bookchin principle (67 tests)
  - [x] `electionStorage.ts` - ranked choice calculation (22 tests)
  - [x] `delegateStorage.ts` - weight calculation (15 tests)
  - [x] `canvassStorage.ts` - habitability scoring, unit CRUD, profile linking (80 tests)
- [ ] Write component tests for key UI:
  - [ ] `RankedChoiceVoting.tsx` - drag/drop, vote submission
  - [ ] `DelegateStatusCard.tsx` - progress display
  - [ ] `BuildingList.tsx` - search, filtering
- [ ] Document TDD workflow for Claude Code

**Test Summary:** 271 tests across 7 suites (authService, smoke, canvassStorage, delegateStorage, electionStorage, governanceStorage, profileStorage)

### 2. CI/CD Pipeline
- [x] Create GitHub Actions workflow (`.github/workflows/deploy.yml` runs tests)
- [x] Run Jest tests on every push to main
- [x] Block deploy if tests fail
- [x] Run linting checks (ESLint with next/core-web-vitals)
- [ ] Consider adding Playwright for E2E tests

### 3. LocalStorage Security Issues

**Audit completed 2025-01-20**

#### Sensitive localStorage Keys (25 keys identified)

| Key | Risk | Data |
|-----|------|------|
| `rstu-profiles` | **CRITICAL** | `role`, `trustLevel`, `banned` |
| `rstu-governance` | **HIGH** | Vote arrays, proposal status |
| `rstu-ranked-votes` | **HIGH** | Election vote rankings |
| `rstu-elections` | **HIGH** | Election status, results |
| `rstu-nominations` | MEDIUM | Candidate nominations |
| `rstu_admin_auth` | **CRITICAL** | Admin authentication state |
| `rstu_admin_state` | HIGH | Document visibility |
| `rstu_admin_hash` | MEDIUM | Password hash (for recovery) |
| `rstu_admin_settings` | MEDIUM | Delegate thresholds |
| `rstu-linked-groups` | MEDIUM | Bloc membership |
| `rstu-events` | LOW | Event RSVPs |
| `rstu_canvass_data` | LOW | Unit contact info |
| `rstu_campaigns` | LOW | Campaign progress |

#### Attack Vectors

1. **Privilege Escalation** (CRITICAL)
   - Edit `rstu-profiles` → set `role: 'admin'` → full admin access
   - Edit `trustLevel: 'verified'` → bypass verification requirements
   - Set `banned: false` → circumvent bans

2. **Vote Manipulation** (HIGH)
   - Edit `rstu-governance` → add profileId to `upvotes[]`
   - Inflate vote counts for any proposal
   - Pass proposals without legitimate votes

3. **Election Fraud** (HIGH)
   - Edit `rstu-ranked-votes` → inject fake ballots
   - Manipulate ranked choice outcomes
   - Create votes for non-existent voters

4. **Admin State Tampering** (MEDIUM)
   - Edit `rstu_admin_auth` → bypass login
   - Edit `rstu_admin_state` → unhide documents

#### Existing Mitigations (Partial)

- `authService.ts:getAuthoritativeProfile()` - Fetches from Supabase when available
- `authService.ts:checkPermission()` - Uses authoritative profile for actions
- Falls back to `role: 'tenant'` if profile not in Supabase

#### Remaining Vulnerabilities

- [x] Audit all localStorage usage for sensitive data
- [x] Identify data that users could maliciously modify
- [x] ~~**Sync functions bypass server**~~ - Fixed: sync functions now fire async server verification in background
- [x] **UI uses sync functions** - Resolved: optimistic updates with background server sync
- [x] ~~**Network error fallback**~~ - Fixed: votes are rolled back on network error/server rejection
- [x] ~~**No RLS policies**~~ - Fixed in `011_identity_based_rls.sql`
- [x] Implement server-side role verification in Supabase
- [x] Add Row Level Security (RLS) policies
- [ ] Keep localStorage only as read-only cache
- [x] ~~Migrate all voting to async (server-verified) functions~~ - Fixed: governance voting uses background sync

**Fixed sync functions (optimistic update + background server verification):**
- `voteOnProposal()` - fires `voteOnProposalAsync()` in background
- `createProposal()` - fires `syncProposalToServer()` in background
- `createAppWideProposal()` - fires `syncProposalToServer()` in background

**Error handling (vote rollback on failure):**
- `rollbackVote()` removes vote from localStorage if server rejects or network fails
- `removeLocalProposal()` removes proposal from localStorage if server rejects

**Still needs work (no Supabase tables yet):**
- `electionStorage.castVote()` - elections not migrated to Supabase
- `electionStorage.castRankedVote()` - elections not migrated to Supabase
- `finalizeProposal()` - no server-side finalize RPC

#### RLS Policy Implementation

**Implemented in `011_identity_based_rls.sql`:**

- User context functions (`set_user_context`, `clear_user_context`)
- Helper functions (`get_current_user_id`, `is_current_user_admin`, `is_current_user_organizer_or_higher`)
- Profile update trigger (prevents non-admin role/trust_level changes)
- Identity-based policies for all 18+ tables

**Usage from application:**
```typescript
import { setUserContext, withUserContext } from '@/lib/supabase'

// Option 1: Set context before operations
await setUserContext(profile.id)
await supabase.from('events').insert(...)

// Option 2: Use wrapper
await withUserContext(profile.id, async () => {
  await supabase.from('events').insert(...)
})
```

**Original recommendations (now implemented):**

**profiles table:**
```sql
-- Users can only update their own profile (except role/trustLevel)
CREATE POLICY profiles_update_own ON profiles FOR UPDATE
USING (id = current_setting('app.current_user_id')::uuid)
WITH CHECK (
  id = current_setting('app.current_user_id')::uuid
  AND role = (SELECT role FROM profiles WHERE id = current_setting('app.current_user_id')::uuid)
  AND trust_level = (SELECT trust_level FROM profiles WHERE id = current_setting('app.current_user_id')::uuid)
);

-- Admins can update any profile
CREATE POLICY profiles_update_admin ON profiles FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = current_setting('app.current_user_id')::uuid AND role = 'admin')
);
```

**proposal_votes table:**
```sql
-- Users can only insert votes with their own profile ID
CREATE POLICY proposal_votes_insert_own ON proposal_votes FOR INSERT
WITH CHECK (voter_id = current_setting('app.current_user_id')::uuid);

-- Prevent duplicate votes
CREATE POLICY proposal_votes_unique ON proposal_votes FOR INSERT
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM proposal_votes
    WHERE proposal_id = NEW.proposal_id AND voter_id = NEW.voter_id
  )
);
```

**ban_records table:**
```sql
-- Only admins can ban users
CREATE POLICY ban_records_admin_only ON ban_records FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = current_setting('app.current_user_id')::uuid AND role = 'admin')
);
```

**Implementation Steps:**
1. Set `app.current_user_id` in Supabase context from authenticated session
2. Update RLS policies to use identity-based checks
3. Create server functions for role changes (no direct UPDATE)
4. Add audit logging for sensitive operations

### 4. Multi-User Data Migration to Supabase
Current state: Some features use Supabase, many still localStorage-only.

**Already in Supabase:**
- [x] Property data (read-only, for FTS)
- [x] User profiles (partial - syncs from localStorage)
- [x] Admin state (document edits)

**Need to migrate:**
- [ ] Chat messages (currently Socket.io server only)
- [ ] Governance proposals and votes
- [ ] Elections, nominations, ranked votes
- [ ] Events and RSVPs
- [ ] Canvassing records (unit data)
- [ ] Building organizing status
- [ ] Campaigns
- [ ] Mutual aid requests/offers
- [ ] Linked property groups (blocs)
- [ ] Direct messages

**For each migration:**
1. Create Supabase table schema
2. Add RLS policies
3. Update storage lib to write to Supabase
4. Keep localStorage as offline cache/fallback
5. Add sync mechanism for offline edits

### 5. Frontend ID Generation
- [ ] Audit all `generateId()` / `crypto.randomUUID()` usage
- [ ] List all entities that need database-generated IDs:
  - [ ] Profiles
  - [ ] Proposals
  - [ ] Votes
  - [ ] Elections
  - [ ] Nominations
  - [ ] Events
  - [ ] Messages
  - [ ] Campaigns
- [ ] Update Supabase tables to auto-generate UUIDs
- [ ] Update storage libs to let database assign IDs on insert
- [ ] Handle offline ID generation with conflict resolution

---

## Notes

### Priority Order (suggested)
1. **Testing** - Prevents regressions as we refactor
2. **CI/CD** - Automates test enforcement
3. **LocalStorage Security** - Critical vulnerability
4. **Supabase Migration** - Required for real multi-user
5. **ID Generation** - Depends on Supabase migration

### Questions to Resolve
- How to handle offline-first with Supabase? (conflict resolution)
- Should chat stay on Socket.io or move to Supabase Realtime?
- What's the auth model? (currently localStorage passwords)

### Related Files
- `src/lib/supabase.ts` - Existing Supabase client
- `src/lib/safeStorage.ts` - localStorage wrapper
- `src/lib/profileStorage.ts` - User auth/roles
- `scripts/archive/create-admin-state-tables.sql` - Example schema

---

*Last updated: 2026-01-21*
