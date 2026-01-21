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
- [x] Write component tests for key UI:
  - [x] `RankedChoiceVoting.tsx` - drag/drop, vote submission (14 tests)
  - [x] `DelegateStatusCard.tsx` - progress display (12 tests)
  - [x] `BuildingList.tsx` - search, filtering (14 tests)
- [x] Document TDD workflow for Claude Code (`TESTING.md`)

**Test Summary:** 311 tests across 10 suites (authService, smoke, canvassStorage, delegateStorage, electionStorage, governanceStorage, profileStorage, RankedChoiceVoting, DelegateStatusCard, BuildingList)

### 2. CI/CD Pipeline
- [x] Create GitHub Actions workflow (`.github/workflows/deploy.yml` runs tests)
- [x] Run Jest tests on every push to main
- [x] Block deploy if tests fail
- [x] Run linting checks (ESLint with next/core-web-vitals)
- [x] Add Playwright for E2E tests
  - [x] Install Playwright (`npm install -D @playwright/test && npx playwright install chromium`)
  - [x] Create E2E tests for critical user flows (9 smoke tests):
    - [x] Homepage loading and building list
    - [x] Building search functionality
    - [x] Tab navigation (Home, Reading, Mutual Aid, Tools, Profile)
    - [x] Profile tab showing login/create options
    - [x] Reading tab document library
    - [x] Mutual aid tab loading
    - [x] Mobile viewport responsiveness
    - [x] Building selection and details
    - [x] Language selector availability
  - [x] Add Playwright to CI workflow (runs after build with static server)
  - [x] Configure for static export (symlink workaround for basePath)

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
- [x] Keep localStorage only as read-only cache - In progress: election components now use server-verified async functions
- [x] ~~Migrate all voting to async (server-verified) functions~~ - Fixed: governance voting uses background sync

**Fixed sync functions (optimistic update + background server verification):**
- `voteOnProposal()` - fires `voteOnProposalAsync()` in background
- `createProposal()` - fires `syncProposalToServer()` in background
- `createAppWideProposal()` - fires `syncProposalToServer()` in background

**Election components updated to use server-verified async functions (2026-01-21):**
- `RankedChoiceVoting.tsx` - uses `castRankedVoteAsync()` instead of sync function
- `NominationForm.tsx` - uses `createNominationAsync()` instead of Socket.io only

**Offline mode integration (2026-01-21):**
- `OfflineBanner` and `OfflineIndicator` added to `ClientLayout.tsx`
- `RankedChoiceVoting.tsx` - uses `useOfflineMode` hook, disables voting when offline
- `NominationForm.tsx` - uses `useOfflineMode` hook, disables nomination submission when offline

**Error handling (vote rollback on failure):**
- `rollbackVote()` removes vote from localStorage if server rejects or network fails
- `removeLocalProposal()` removes proposal from localStorage if server rejects

**Elections migrated to Supabase (2026-01-21):**
- [x] Created tables: `elections`, `election_positions`, `nominations`, `election_votes`, `ranked_votes`
- [x] Added RLS policies for vote integrity (can only vote as yourself, votes immutable)
- [x] Server functions: `cast_ranked_vote()`, `create_nomination()`, `respond_to_nomination()`
- [x] Updated `electionStorage.ts` with async functions and background server sync
- Migration file: `infrastructure/supabase/012_elections_tables.sql`

**Still needs work:**
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
- [x] Governance proposals and votes (background sync)
- [x] Elections, nominations, ranked votes (2026-01-21)

**Need to migrate:**
- [x] Chat messages (2026-01-21) - tables created, can use with Socket.io or Supabase Realtime
- [x] Events and RSVPs (2026-01-21)
- [x] Canvassing records (unit data) (2026-01-21)
- [x] Building organizing status (already in schema.sql)
- [x] Campaigns (2026-01-21)
- [x] Mutual aid requests/offers (2026-01-21)
- [x] Linked property groups (blocs) - already in schema.sql
- [x] Direct messages (2026-01-21)

**Events migrated to Supabase (2026-01-21):**
- [x] Created tables: `events`, `event_rsvps`, `event_votes`, `event_meeting_notes`, `event_action_items`
- [x] Added RLS policies for event security (creator/organizer can modify, users manage own RSVPs/votes)
- [x] Server functions: `create_event_secure()`, `update_event_secure()`, `delete_event_secure()`, `rsvp_to_event()`, `vote_on_event()`, `add_meeting_notes()`
- [x] Updated `eventStorage.ts` with async functions: `rsvpToEventAsync()`, `voteOnEventAsync()`, `fetchEventsFromServer()`
- Migration file: `infrastructure/supabase/013_events_tables.sql`

**Canvassing expanded in Supabase (2026-01-21):**
- [x] Added 30+ missing columns to `canvass_units` table (household, unit details, lease, habitability, etc.)
- [x] Created `building_discrepancies` table for organizer data notes
- [x] Created `issue_snapshots` table for habitability trend tracking
- [x] Added RLS policies (organizers+ only for sensitive contact data)
- [x] Server functions: `update_canvass_unit_secure()`, `link_profile_to_unit_secure()`, `unlink_profile_from_unit_secure()`, `get_building_habitability_score()`, `record_issue_snapshot()`
- [x] Updated `DbCanvassUnit` type and `dbToUnit`/`unitToDb` conversion functions
- Migration file: `infrastructure/supabase/014_canvass_expansion.sql`

**Campaigns migrated to Supabase (2026-01-21):**
- [x] Created tables: `campaigns`, `campaign_buildings`, `campaign_stage_changes`, `campaign_demands`, `campaign_notes`
- [x] Added RLS policies (organizers+ only for all campaign operations)
- [x] Server functions: `create_campaign_secure()`, `update_campaign_stage_secure()`, `update_campaign_outcome_secure()`, `add_campaign_demand_secure()`, `update_campaign_demand_secure()`, `add_campaign_note_secure()`, `link_strike_to_campaign_secure()`, `get_building_campaigns()`
- [x] Updated `campaignStorage.ts` with async functions: `fetchCampaignsFromServer()`, `updateCampaignStageAsync()`, `updateCampaignOutcomeAsync()`, `addCampaignDemandAsync()`, `updateCampaignDemandAsync()`, `addCampaignNoteAsync()`, `linkStrikeToCampaignAsync()`
- [x] Added TypeScript types: `DbCampaign`, `DbCampaignBuilding`, `DbCampaignStageChange`, `DbCampaignDemand`, `DbCampaignNote`
- Migration file: `infrastructure/supabase/015_campaigns_tables.sql`

**Mutual aid migrated to Supabase (2026-01-21):**
- [x] Created tables: `mutual_aid_posts`, `mutual_aid_resources`, `mutual_aid_skill_profiles`, `mutual_aid_skills`
- [x] Added RLS policies (anyone can read, users manage own posts/resources/skills)
- [x] Server functions: `create_mutual_aid_post_secure()`, `update_mutual_aid_post_status_secure()`, `create_resource_item_secure()`, `checkout_resource_secure()`, `return_resource_secure()`, `save_skill_profile_secure()`, `get_building_mutual_aid_stats()`, `expire_mutual_aid_posts()`
- Migration file: `infrastructure/supabase/016_mutual_aid_tables.sql`

**Chat and DMs migrated to Supabase (2026-01-21):**
- [x] Created tables: `chat_messages`, `direct_messages`, `dm_conversations`
- [x] Added RLS policies (room messages public read, DMs only for participants)
- [x] Server functions: `send_chat_message_secure()`, `delete_chat_message_secure()`, `get_chat_messages()`, `send_direct_message_secure()`, `mark_conversation_read_secure()`, `get_my_conversations()`, `get_direct_messages()`, `get_unread_dm_count()`
- [x] Enabled Supabase Realtime for chat_messages and direct_messages tables
- Migration file: `infrastructure/supabase/017_chat_messages_tables.sql`
- Note: Can be used alongside Socket.io or as full replacement with Supabase Realtime

**For each migration:**
1. Create Supabase table schema
2. Add RLS policies
3. Update storage lib to write to Supabase
4. Keep localStorage as offline cache/fallback
5. Add sync mechanism for offline edits

### 5. Frontend ID Generation
- [x] Audit all `generateId()` / `crypto.randomUUID()` usage
- [x] Create centralized ID utilities (`src/lib/idUtils.ts`)
  - `generateUUID()` - Full UUID v4 for entities needing database compatibility
  - `generateShortId()` - 8-char hex ID for sub-entities and display
  - `generateEntityId(forceLocal?)` - Online/offline aware, adds `local-` prefix when offline
  - `generateOfflineId()` - Always local-prefixed for offline-first entities
  - `isLocalId()` - Check if ID was generated offline
  - ID mapping functions for sync reconciliation (`storeIdMapping`, `getServerIdForLocal`, `resolveId`)
- [x] Update 13 storage libs to use centralized ID utilities:
  - `campaignStorage.ts` - Uses `generateEntityId()` for campaigns, `generateShortId()` for demands/notes
  - `eventStorage.ts` - Uses `generateShortId()` for events
  - `governanceStorage.ts` - Uses `generateShortId()` for proposals
  - `electionStorage.ts` - Uses `generateShortId()` for elections/nominations/votes
  - `mutualAidStorage.ts` - Uses `generateShortId()` for posts
  - `circleStorage.ts` - Uses `generateEntityId()` for circles
  - `linkedPropertiesStorage.ts` - Uses `generateShortId()` with `lp-` prefix
  - `escalationStorage.ts` - Uses `generateShortId()` with `esc_`/`evt_` prefixes
  - `taskStorage.ts` - Uses `generateShortId()` with `task-` prefix
  - `buildingOrganizingStorage.ts` - Uses `generateShortId()` for complaints/demands
  - `directMessageStorage.ts` - Uses `generateShortId()` for threads/messages
  - `organizationStorage.ts` - Uses `generateShortId()` for organizations
  - `profileStorage.ts` - Uses `generateUUID()` for profiles (Supabase compatibility)
- [x] Supabase tables already auto-generate UUIDs via `DEFAULT gen_random_uuid()`
- [x] Implemented offline ID generation with `local-` prefix pattern
- [x] ID mapping storage for sync reconciliation (localStorage `rstu_id_mappings`)

---

## Notes

### Priority Order (suggested)
1. **Testing** - Prevents regressions as we refactor ✅
2. **CI/CD** - Automates test enforcement ✅
3. **LocalStorage Security** - Critical vulnerability ✅
4. **Supabase Migration** - Required for real multi-user ✅
5. **ID Generation** - Depends on Supabase migration ✅

### Questions to Resolve
- ~~How to handle offline-first with Supabase?~~ - Solved: `idUtils.ts` with `local-` prefix pattern
- Should chat stay on Socket.io or move to Supabase Realtime? (Both supported in `017_chat_messages_tables.sql`)
- What's the auth model? (currently localStorage passwords)

### Related Files
- `src/lib/supabase.ts` - Existing Supabase client
- `src/lib/safeStorage.ts` - localStorage wrapper
- `src/lib/profileStorage.ts` - User auth/roles
- `src/lib/electionStorage.ts` - Elections, nominations, ranked choice voting
- `src/lib/idUtils.ts` - Centralized ID generation utilities (online/offline aware)
- `scripts/archive/create-admin-state-tables.sql` - Example schema

### Governance Refactoring (from plan mode)
- [x] Remove governance tab from Tools page (`src/components/Tools/ToolsPage.tsx`) - already done
- [x] Consolidate voting under Profile's Elections/Delegate/App Governance tabs
- [x] DelegateStatusCard already has full features (progress bars, activity breakdown, network stats)
- [x] Add AppGovernancePanel for app-wide proposals (`src/components/Profile/AppGovernancePanel.tsx`)
- [x] Updated governance documentation (`docs/organizing/rstu-connect-governance-guide.md`)

---

*Last updated: 2026-01-21 (Frontend ID generation centralized: 13 storage libs updated to use idUtils.ts)*
