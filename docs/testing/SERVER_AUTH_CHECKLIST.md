# Server-Authoritative Features Manual Testing Checklist

This checklist covers manual browser-based testing of the server-authoritative features from `007_server_authoritative.sql`.

## Prerequisites

1. [ ] Run `supabase/007_server_authoritative.sql` in Supabase SQL Editor
2. [ ] Verify tables exist (run `node scripts/test-supabase-functions.js`)
3. [ ] Site is running locally (`npm run dev`) or deployed
4. [ ] Have access to two different browsers (for multi-user testing)

## Test Environment Setup

- **Browser 1**: Admin user (use Ctrl+Shift+A to toggle admin)
- **Browser 2**: Regular tenant user
- **Supabase Dashboard**: Open to verify database changes

---

## Profile Sync Tests

### Profile Creation
- [ ] Create new profile in browser
- [ ] Check Supabase `profiles` table - profile should appear
- [ ] Verify all fields synced correctly (nickname, role, building, etc.)

### Profile Update
- [ ] Update profile details (e.g., change nickname)
- [ ] Verify changes reflected in Supabase
- [ ] Refresh page - changes should persist

### Role Verification
- [ ] As admin in Supabase Dashboard, change a user's role
- [ ] Refresh that user's browser - role should update
- [ ] Verify localStorage role doesn't override server role

---

## Voting Tests

### Tenant Voting
- [ ] As verified tenant, navigate to a governance proposal
- [ ] Cast an upvote
- [ ] Check `proposal_votes` table - vote should appear
- [ ] Refresh page - vote should persist
- [ ] Change vote to downvote - database should update (not add new row)

### Admin Cannot Vote (Bookchin Principle)
- [ ] As admin (Ctrl+Shift+A), attempt to vote on proposal
- [ ] Should see error message about admins not being able to vote
- [ ] Check database - no vote should be recorded

### Event Voting
- [ ] Create a proposed event
- [ ] As tenant, vote to confirm the event
- [ ] Check `event_votes` table - vote should appear

---

## Ban/Mute Tests

### Global Ban
- [ ] As admin, ban a test user globally
- [ ] Check `ban_records` table - ban should appear
- [ ] As banned user, attempt to:
  - [ ] Vote on proposal - should be denied
  - [ ] Send chat message - should be denied
  - [ ] Create event - should be denied
- [ ] As admin, unban the user
- [ ] Verify user can now perform actions again

### Scoped Ban (Group/Building)
- [ ] As admin, ban a user from specific building
- [ ] User should still be able to use other buildings
- [ ] User should be blocked from banned building's chat/voting

### Mute
- [ ] As organizer, mute a user in a building chat
- [ ] Check `mute_records` table - mute should appear
- [ ] Muted user should see error when sending message
- [ ] Other features (voting, events) should still work

---

## Event Tests

### Event Creation
- [ ] Create event as verified user
- [ ] Check `events` table - event should appear
- [ ] Event status should be 'proposed'

### Event RSVP
- [ ] RSVP to an event
- [ ] Check `event_rsvps` table - RSVP should appear
- [ ] Change RSVP status - should update (not duplicate)

### Event Confirmation
- [ ] Get enough votes to confirm event
- [ ] Event status should change to 'confirmed'

---

## Campaign Tests

### Campaign Creation
- [ ] As organizer, create a new campaign
- [ ] Check `campaigns` table - campaign should appear
- [ ] Verify all fields saved correctly

### Campaign Stage Changes
- [ ] Update campaign stage
- [ ] Verify `stage_changes` JSONB array tracks history

---

## Mutual Aid Tests

### Need/Offer Posts
- [ ] Create a need post
- [ ] Check `mutual_aid_posts` table - post should appear
- [ ] Create an offer post
- [ ] Mark need as fulfilled - status should update

### Resource Library
- [ ] Add a resource (tool/book)
- [ ] Check `mutual_aid_resources` table
- [ ] Check out resource - status should update
- [ ] Return resource - status should reset

### Skill Profiles
- [ ] Add skills to profile
- [ ] Check `skill_profiles` table
- [ ] Update skills - should modify existing row

---

## Offline Behavior Tests

### Offline Detection
- [ ] Disconnect from internet (DevTools > Network > Offline)
- [ ] Attempt to vote - should see offline error message
- [ ] Attempt to send message - should see offline error
- [ ] Reconnect - actions should work again

### Read-Only When Offline
- [ ] Disconnect from internet
- [ ] Should still be able to browse properties
- [ ] Should still be able to read documents
- [ ] Write actions should show clear error messages

---

## Security Tests

### localStorage Manipulation Resistance
- [ ] As tenant, open DevTools > Application > localStorage
- [ ] Edit role to 'admin' directly
- [ ] Refresh page - server role should override local
- [ ] Admin features should NOT be accessible

### Trust Level Verification
- [ ] Create self-registered user
- [ ] Attempt to vote - should be denied (needs verification)
- [ ] In Supabase, update `trust_level` to 'verified'
- [ ] Refresh - user should now be able to vote

---

## Multi-User Sync Tests

### Real-time Updates
- [ ] Open site in two browsers with different users
- [ ] User A creates event
- [ ] User B should see event (may need refresh)

### Vote Consistency
- [ ] User A votes on proposal
- [ ] User B votes on same proposal
- [ ] Both browsers should show accurate vote counts

---

## Notes

**Date Tested:** _____________

**Tester:** _____________

**Environment:**
- [ ] Local dev
- [ ] Staging
- [ ] Production

**Issues Found:**
1.
2.
3.

**Comments:**



---

## Quick Reference Commands

```bash
# Start dev server
npm run dev

# Run integration tests
node scripts/test-supabase-functions.js

# Check Supabase tables via SQL Editor
SELECT * FROM proposal_votes ORDER BY voted_at DESC LIMIT 10;
SELECT * FROM ban_records ORDER BY banned_at DESC LIMIT 10;
SELECT * FROM events ORDER BY created_at DESC LIMIT 10;
```
