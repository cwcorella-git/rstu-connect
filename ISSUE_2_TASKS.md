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
- [ ] Set up Jest for unit/integration tests
- [ ] Set up React Testing Library for component tests
- [ ] Write tests for critical lib functions:
  - [ ] `profileStorage.ts` - auth, roles, permissions
  - [ ] `governanceStorage.ts` - voting logic, thresholds
  - [ ] `electionStorage.ts` - ranked choice calculation
  - [ ] `delegateStorage.ts` - weight calculation
  - [ ] `canvassStorage.ts` - habitability scoring
- [ ] Write component tests for key UI:
  - [ ] `RankedChoiceVoting.tsx` - drag/drop, vote submission
  - [ ] `DelegateStatusCard.tsx` - progress display
  - [ ] `BuildingList.tsx` - search, filtering
- [ ] Document TDD workflow for Claude Code

### 2. CI/CD Pipeline
- [ ] Create GitHub Actions workflow (`.github/workflows/test.yml`)
- [ ] Run Jest tests on every PR
- [ ] Block merge if tests fail
- [ ] Run linting checks
- [ ] Consider adding Playwright for E2E tests

### 3. LocalStorage Security Issues
- [ ] Audit all localStorage usage for sensitive data
- [ ] Identify data that users could maliciously modify:
  - [ ] `profileStorage.ts` - role, trustLevel, isAdmin
  - [ ] `governanceStorage.ts` - vote counts, proposals
  - [ ] `adminStorage.ts` - admin state
- [ ] Implement server-side role verification in Supabase
- [ ] Add Row Level Security (RLS) policies
- [ ] Keep localStorage only as read-only cache

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

*Last updated: 2025-01-20*
