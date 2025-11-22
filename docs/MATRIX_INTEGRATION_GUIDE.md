# Matrix/Element Integration Guide

**Status**: Planning (Phase 3)
**Last Updated**: November 13, 2025

---

## Overview

Matrix/Element will provide secure, end-to-end encrypted chat rooms for building-level organizing. Each building organizing campaign will have its own dedicated chat room, enabling tenants to coordinate action while maintaining privacy.

**Why Matrix/Element?**
- End-to-end encrypted by default
- Decentralized (not dependent on single corporate server)
- Open source (community control)
- Supports distributed organizing across buildings
- Federated (can connect to other organizing networks)

---

## Architecture

### High-Level Design

```
RSTU Connect Website
├── Building Pages (Sierra Vista, Redfield Ridge, etc.)
│   ├── Building Info
│   ├── Organizing Status
│   ├── Embedded Element Widget
│   │   └── Room: #sierra-vista:matrix.org
│   └── Organizing Toolkit Links
└── General Organizing Channel
    └── Room: #rstu-general:matrix.org

Matrix Homeserver
├── #sierra-vista:matrix.org (10-15 members)
├── #redfield-ridge:matrix.org (10-15 members)
├── #downtown-lofts:matrix.org (10-15 members)
├── #rstu-general:matrix.org (open to all RSTU members)
└── Private organizer rooms (encrypted, invite-only)
```

### Room Structure

**Public Channels** (Public, anyone can join):
- `#rstu-general` - General RSTU organizing discussion
- `#rstu-announcements` - RSTU updates and news
- `#rstu-resources` - Links to organizing tools and templates

**Building Channels** (Invite-only, moderated):
- `#sierra-vista` - Sierra Vista Apartments organizing
- `#redfield-ridge` - Redfield Ridge organizing
- `#downtown-lofts` - Downtown Lofts organizing
- One channel per active organizing campaign

**Private Organizer Channels** (Encrypted, leadership only):
- `#rstu-leadership` - RSTU leadership coordination
- `#campaign-strategy-[building]` - Campaign strategy discussion
- `#legal-coordination` - Legal strategy and support

---

## Setup Instructions

### Step 1: Choose a Homeserver

**Option A: Use matrix.org (Easiest)**
- Free public homeserver
- No setup required
- Limitations: Rate limiting, user moderation
- Best for: Getting started quickly

**Option B: Self-Hosted (Recommended Long-term)**
- Full control and privacy
- Requires server hosting (~$10-20/month)
- Example platforms: Synapse, Dendrite
- Best for: Long-term, large-scale organizing

**Option C: Use element.io Hosting**
- Matrix.org infrastructure with Element UI
- Free community tier available
- Good balance of ease and control

**Recommendation for RSTU**: Start with matrix.org, migrate to self-hosted when scaling to 10+ buildings.

### Step 2: Create Building Rooms

**Instructions for matrix.org:**

1. Go to https://app.element.io
2. Sign up or login with RSTU organizing account
3. Create new room: `+` button → Create Room
4. Room settings:
   - Name: `Sierra Vista Apartments`
   - Address: `1234 Marina Drive, Reno, NV`
   - Room alias: `#sierra-vista`
   - Privacy: Invite Only
   - Encryption: Enable end-to-end encryption

**Room Configuration Template:**

```
Room Name: Sierra Vista Apartments (Organizing)
Address: 1234 Marina Drive, Reno, NV
Alias: #sierra-vista:matrix.org
Topic: Coordination for Sierra Vista tenant organizing campaign
Privacy: Invite Only
Encryption: Enabled (forced encryption on all messages)
Moderation: 2-3 tenant organizers as moderators
```

### Step 3: Configure Room Access

**For Public Rooms** (`#rstu-general`, `#rstu-announcements`):
- Allow anyone to join
- Moderation to prevent spam
- Monitor for infiltration (landlord spies)

**For Building Rooms** (e.g., `#sierra-vista`):
- Invite-only
- Tenant organizers add approved members
- Verification: RSTU organizers vet tenants in-person before inviting
- Room moderators: 2-3 tenant leaders per building

**For Private Organizer Rooms**:
- Leadership invitation required
- End-to-end encryption (all messages encrypted)
- No message history visible to new members

### Step 4: Embed Element Widget on Website

**Create Embedded Room Viewer:**

**File**: `/home/user/Projects/MAKE-SENSE-OF/apps/web/src/app/properties/[building]/page.tsx`

```typescript
'use client'

interface BuildingPageProps {
  params: { building: string }
}

export default function BuildingPage({ params }: BuildingPageProps) {
  // Building data
  const building = getBuildingData(params.building);

  return (
    <div>
      {/* Building Info */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1>{building.name}</h1>
          <p>{building.address}</p>
        </div>
      </section>

      {/* Matrix Widget */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Organizing Chat Room</h2>
          <p className="text-gray-700 mb-6">
            Join your building's chat room to connect with neighbors and coordinate action.
          </p>

          {/* Embedded Element Widget */}
          <iframe
            src={`https://app.element.io/#/room/${building.matrix_room_id}?embed=1`}
            width="100%"
            height="600"
            frameBorder="0"
            allowFullScreen
            className="rounded-lg border"
          />

          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
            <h3 className="font-bold mb-2">How to Use</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>Click "Open in Element" to open the full chat interface</li>
              <li>Create an account or login (5 minutes)</li>
              <li>Request to join the room (tenant organizers will approve)</li>
              <li>Start chatting with neighbors about organizing</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}
```

**Alternative Simple Integration:**

For initial launch (simpler approach):

```jsx
<a
  href="https://app.element.io/#/room/%23sierra-vista%3Amatrix.org"
  target="_blank"
  className="btn btn-primary"
>
  Join Chat Room on Element
</a>
```

---

## Room Configuration Templates

### Building Organizing Room

```
Name: Sierra Vista Apartments Organizing
Description:
  Tenants organizing for repairs, rent fairness, and habitable conditions
  at Sierra Vista Apartments. Building committee coordination happens here.

Address: 1234 Marina Drive, Reno, NV 89501
Category: Local Organizing
Room alias: #sierra-vista
Privacy: Invite Only
Encryption: Enabled (Mandatory)

Moderators:
- [Tenant Organizer 1]
- [Tenant Organizer 2]
- [RSTU Coordinator]

Welcome Message:
"Welcome to Sierra Vista Apartments Organizing! This room is for building tenants
to discuss issues, coordinate action, and build power together. Please introduce
yourself and tell us what issues you're facing in your unit. Remember: this room
is private and encrypted. But don't share very sensitive personal info. Stay safe!"

Rules:
1. Respect each other - everyone has different experiences
2. Stay focused on organizing - this is not a gossip channel
3. Respect privacy - don't share others' information outside the room
4. No spam or off-topic content
5. No landlord or corporate spies (RSTU organizers will manage access)
```

### General RSTU Channel

```
Name: RSTU General Organizing
Description: General discussion for RSTU members across all buildings
Category: General
Room alias: #rstu-general
Privacy: Public (anyone can join)
Encryption: Not available (public rooms)

Moderators:
- [RSTU Leadership 1]
- [RSTU Leadership 2]

Welcome Message:
"Welcome to RSTU General! This is a public channel for general organizing discussion.
For building-specific organizing, join your building's channel. For local news and events,
see #rstu-announcements."

Rules:
1. Be respectful of all organizing approaches
2. Stay on topic - organizing and tenant rights
3. Share experiences but not personal info
4. No spam or harassment
5. Leadership has right to remove disruptive members
```

### Leadership Private Room

```
Name: RSTU Leadership
Description: Private coordination for RSTU leadership
Category: Admin
Room alias: (no public alias)
Privacy: Invite Only (Leadership only)
Encryption: Enabled (Mandatory)

Members:
- [RSTU Steering Committee]
- [Building Committee Chairs]
- [Communications Lead]

Purpose:
- Strategy coordination
- Campaign planning
- Member issue escalation
- Security and moderation decisions

Rules:
1. Confidentiality - nothing shared outside room
2. Leadership consensus on decisions
3. Transparent communication with members
4. Security first - aware of landlord surveillance
```

---

## Verification & Access Control

### Tenant Verification Process

**Goal**: Prevent landlord/corporate infiltration while keeping organizing accessible.

**Two-Tier System:**

**Tier 1: Public Channels**
- `#rstu-general` - No verification needed
- `#rstu-announcements` - No verification needed
- Anyone can join and learn about RSTU

**Tier 2: Building-Specific Channels**
- `#sierra-vista` - RSTU organizer invitation required
- `#redfield-ridge` - RSTU organizer invitation required
- Verification: In-person meeting, proof of tenancy

### Verification Checklist

Before inviting tenant to building room:

```
☐ In-person conversation with RSTU organizer
☐ Confirmed as actual resident (lease, mail, ID)
☐ Discussed organizing goals and risks
☐ Confirmed they're not landlord/management spy
☐ Explained room security and confidentiality
☐ Obtained contact info for emergency communication
☐ Added to secure contact list (outside Matrix)

Optional:
☐ Background check (future - if needed)
☐ Referral from existing tenant in room (trusted intro)
☐ Social media verification
```

### Handling Bad Actors

**Suspected landlord spy or troll:**
1. Moderator removes from room
2. Document the incident
3. Alert other building organizers
4. Review access controls

**Process for removal:**
- Right-click user → Remove from room
- Optionally ban from room (prevents re-entry)
- Document reason in private organizer channel

---

## Security Considerations

### End-to-End Encryption

**What it means:**
- Messages encrypted on your device
- Matrix server cannot read messages
- Only you and room members can read
- Even Element/Matrix admins can't see content

**How to verify:**
- Green checkmarks next to user names = verified
- Shield icon on room = encryption enabled

### Operational Security (OpSec)

**Best Practices for Organizers:**

1. **Device Security**
   - Use password-protected devices
   - Don't leave devices unattended during organizing
   - Use VPN if accessing on public WiFi

2. **Account Security**
   - Use strong, unique password for Matrix account
   - Enable 2-factor authentication (when available)
   - Don't use personal information in username

3. **Message Discipline**
   - Assume messages could be subpoenaed in court
   - Don't share legal strategy details in non-lawyer room
   - Be careful with personal information
   - Keep organizing information separate from personal life

4. **Infiltration Prevention**
   - Get to know members before inviting them
   - Watch for suspiciously detailed questions about tactics
   - New members have probation period (observe before full trust)
   - Leadership monitors for suspicious activity

5. **RSTU Coordination**
   - Private organizer channel for strategy discussion
   - Sensitive topics in encrypted rooms only
   - Weekly leadership call (outside Matrix, by phone)
   - Secure backup communications (Signal, WhatsApp, phone)

### Legal Considerations

**What to assume:**
- Matrix servers are subject to law enforcement requests
- Your messages could be subpoenaed in eviction cases
- Don't put anything in writing you wouldn't say in court

**What's protected:**
- End-to-end encryption makes content legally stronger
- Private room = expectation of privacy (better legal standing)
- Organizer names may be less vulnerable than strategy details

**Best practice:**
- Assume everything could be used as evidence
- Coordinate sensitive strategy off-platform (in-person meetings)
- Use Matrix for logistical coordination, not sensitive strategy

---

## Integration with RSTU Connect

### Building Pages

Each building organizing campaign has a dedicated page on RSTU Connect:

```
/properties/sierra-vista

├── Building Name & Address
├── Organizing Status
├── Known Issues (maintenance, rent increases, etc.)
├── Organizing Timeline (key dates)
├── Embedded Element Widget
│   └── Join #sierra-vista chat
├── Organizing Committee Members (if public)
├── Next Meeting Date/Time
├── Contact: [Organizing Lead]
└── Toolkit Links (templates, checklists, legal help)
```

### Cross-Platform Messaging

**Coordination Flow:**
1. Tenant finds building on RSTU Connect website
2. Clicks "Join Chat Room"
3. Redirected to Element.io
4. Creates account (first time) or logs in
5. Requests to join room
6. RSTU organizer approves
7. Tenant can now chat with building committee

### Data Sync (Future)

**Phase 4 enhancement:**
- RSTU Connect member dashboard shows rooms
- Auto-suggestions for buildings near user's address
- List of joined rooms with unread counts
- Quick links to building organizing tools

---

## Implementation Timeline

### Week 1: Setup
- Create Matrix account for RSTU
- Create 3-5 building rooms
- Create general and announcements channels
- Configure moderation and encryption

### Week 2: Testing
- Invite test group of organizers
- Test Element widget embedding
- Verify encryption working
- Test mobile access

### Week 3: Launch
- Announce to organizers
- Begin inviting building members
- Monitor for issues
- Gather feedback

### Month 2: Scale
- Create rooms for additional buildings
- Automate room creation script
- Implement verification system
- Train more moderators

### Month 3+: Advanced
- Build dashboard showing member's rooms
- Implement read receipts and notifications
- Integrate with campaign tracker
- Connect to legal team coordination

---

## Room Management

### Creating New Building Room

**Script to automate:**

```python
# create_building_room.py
import requests

MATRIX_API = "https://matrix.org/_matrix/client/r0"
ACCESS_TOKEN = "syt_rstu_..."

def create_room(building_name, address, organizers):
    """Create a new building organizing room"""

    payload = {
        "room_alias_name": slugify(building_name),
        "name": f"{building_name} Organizing",
        "topic": f"Tenant organizing for {address}",
        "preset": "private_chat",
        "initial_state": [
            {
                "type": "m.room.encryption",
                "state_key": "",
                "content": {"algorithm": "m.megolm.v1.aes-sha2"}
            },
            {
                "type": "m.room.join_rules",
                "state_key": "",
                "content": {"join_rule": "invite"}
            }
        ]
    }

    response = requests.post(
        f"{MATRIX_API}/createRoom",
        json=payload,
        params={"access_token": ACCESS_TOKEN}
    )

    room_id = response.json()['room_id']

    # Invite organizers
    for organizer in organizers:
        requests.post(
            f"{MATRIX_API}/rooms/{room_id}/invite",
            json={"user_id": organizer},
            params={"access_token": ACCESS_TOKEN}
        )

    return room_id
```

### Moderator Tools

**Key moderation capabilities:**
- Remove/ban users
- Delete messages (if violated rules)
- Restrict who can post
- Change room settings
- Pin important messages

**Moderation workflow:**
1. Receive complaint about member behavior
2. Review message history
3. Issue warning (DM to user)
4. If repeated, remove from room
5. Document in private organizer channel

### Monitoring & Analytics

**What to track (monthly):**
- Number of active members per room
- Message frequency (indicator of engagement)
- New members added
- Removed/banned members
- Operational issues

**No surveillance:**
- Don't monitor message content
- Don't track who talks to whom
- Privacy-first approach
- Trust organizers and members

---

## Communication Guidelines

### Message Templates

**Welcome to New Member:**
```
Welcome to Sierra Vista Apartments Organizing! 👋

We're building collective power to win repairs, fair rent, and better living conditions
in our building. In this room, we:
- Share experiences and document issues
- Coordinate action (meetings, letters, demands)
- Support each other through the process
- Celebrate wins together

Feel free to introduce yourself and what issues you're facing in your unit.
Don't worry about grammar - just be honest!

Questions? Ask a moderator: [names]
```

**Meeting Announcement:**
```
🗓️ Sierra Vista Organizing Meeting - TOMORROW!

**When**: Saturday 2pm
**Where**: Lobby of building
**What**: Discuss maintenance issues and plan next steps
**Who**: All tenants welcome

Not sure if you can make it? React with 👍 or let us know in chat!
```

**Campaign Update:**
```
📢 Campaign Update

We submitted our demand letter to management on [date]. They have 10 business days to respond.
In the meantime:
- Document all maintenance issues in your units
- If management hasn't responded to you, keep records
- Next meeting: [date] to plan next steps

Thanks for your patience and solidarity! 💪
```

---

## Troubleshooting

### Common Issues

**Issue**: User can't find room
- Solution: Share direct link: `https://app.element.io/#/room/%23sierra-vista%3Amatrix.org`
- Verify room alias is correct
- Check if user is already in room (just hidden)

**Issue**: Encryption not working
- Solution: Refresh page, clear cache
- Verify encryption is enabled in room settings
- For older rooms, may need to upgrade
- Contact Matrix support if persistent

**Issue**: Embedded widget not showing
- Solution: Check iframe URL is correct
- Verify CORS (cross-origin) headers allow embedding
- Try direct Element link as fallback
- Alternative: Use "Open in Element" button instead

**Issue**: Someone accessing room who shouldn't be
- Solution: Remove user immediately
- Ban from room (prevent re-entry)
- Document incident
- Alert other moderators
- Review access control process

**Issue**: Room seems to have lagged/offline
- Solution: Refresh page
- Check matrix.org status
- Restart Element app
- Switch devices (phone to laptop)
- Message another organizer to confirm

---

## Long-Term Evolution

### Phase 4: Advanced Chat Features
- Threaded conversations (replies within messages)
- Pinned important messages (laws, contacts, dates)
- Searchable message history
- File sharing (documents, photos of violations)
- Voice messages (for illiterate accessibility)

### Phase 5: Integration with Broader Network
- Federation with other tenant union Matrix servers
- Connect San Francisco Bay Area tenants with Reno
- Share organizing tactics and resources
- Coordinated campaigns across regions
- Shared legal coordination

### Phase 6: Full Platform Integration
- Dashboard showing all building rooms
- Push notifications for new messages
- Integration with campaign tracker
- Automatic room creation for new campaigns
- Integration with legal team communication

---

## Resources

### Matrix/Element Documentation
- Matrix.org: https://matrix.org/
- Element Client: https://element.io/
- Room Management: https://element.io/help
- End-to-End Encryption: https://matrix.org/docs/guides/end-to-end-encryption

### Security Resources
- Electronic Frontier Foundation (EFF) Chat Guide: https://ssd.eff.org/
- Organizing and Digital Security: https://leveluptraining.tacticaltech.org/

### Related Docs
- RSTU_THEORETICAL_FOUNDATION_AND_OPERATIONAL_STRATEGY.md
- NEOCITIES_SITE_STRATEGY.md

