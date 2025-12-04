# RSTU Connect Admin Guide

## Admin Access

### How to Open Admin Panel
Press **`Ctrl+Shift+A`** anywhere on the site to open the admin login.

### Default Password
```
rstu-organize-2024
```

### Session Duration
- 24 hours after successful login
- Auto-expires after 24 hours
- Logout button available in admin panel header

### Change Password
To change the admin password:

1. Generate a new SHA-256 hash:
   ```bash
   echo -n "your-new-password" | sha256sum
   ```

2. Copy the hash output (first part before the space)

3. Edit `src/lib/adminStorage.ts`:
   ```typescript
   const PASSWORD_HASH = 'your-new-hash-here';
   ```

4. Rebuild and deploy:
   ```bash
   npm run build
   git add -A && git commit -m "Update admin password"
   git push origin main
   ```

## Document Management Features

### Delete Documents
- **Action**: Permanently removes documents from the public library
- **Effect**: Document hidden from all users (not physically deleted from files)
- **Reversible**: Yes, use "Restore" button in deleted documents view
- **How to use**:
  1. Open admin panel (Ctrl+Shift+A)
  2. Find document in list
  3. Click "Delete" button
  4. Confirm deletion

### Edit Documents
- **Action**: Edit document title and markdown content
- **Storage**: Changes saved to browser localStorage
- **Effect**: Edited version shows for all users on this device
- **Indicator**: "Edited" badge appears on modified documents
- **How to use**:
  1. Open admin panel
  2. Click "Edit" button on any document
  3. Modify title and/or content in the editor
  4. Click "Save Changes"
  5. To revert: Click "Revert to Original" in editor

### Hide/Show Documents
- **Action**: Temporarily hide documents from library
- **Effect**: Less permanent than delete, easier to toggle
- **How to use**:
  1. Click "Hide" button to hide document
  2. Click "Show" button to make visible again

## Admin Panel Features

### Document List View
- **Search**: Filter documents by title or category
- **Category Filter**: View documents by category
- **View Deleted**: Toggle to see deleted documents
- **Status Colors**:
  - White background: Visible document
  - Gray background: Hidden document
  - Red background: Deleted document

### Document Counts
Header shows:
- **Visible**: Documents users can see
- **Hidden**: Temporarily hidden documents
- **Deleted**: Permanently deleted documents

### Export/Import

#### Export Configuration
Saves current admin state (hidden/deleted documents) as JSON file:
- Filename: `rstu-admin-config-[timestamp].json`
- Contains: Hidden document IDs, deleted document IDs
- Use for: Backup, sharing admin settings

#### Export Edits
Saves all document edits as JSON file:
- Filename: `rstu-document-edits-[timestamp].json`
- Contains: All edited documents with titles and content
- Use for: Backup, creating patches for source files

#### Import Configuration
Restore admin settings from exported JSON file:
- Overwrites current hidden/deleted status
- Does NOT affect edits

## Data Storage

All admin data stored in browser localStorage:

| Storage Key | Contains | Max Size |
|-------------|----------|----------|
| `rstu_admin_auth` | Authentication session | ~100 bytes |
| `rstu_admin_state` | Hidden/deleted document IDs | ~5-10 KB |
| `rstu_document_edits` | Edited document content | 5-10 MB |

### Important Notes
- **Per-device**: Each browser/device has separate admin state
- **No sync**: Changes don't sync across devices
- **Backup recommended**: Export configs and edits regularly
- **Clear data**: Admin state cleared if localStorage wiped

## Workflow Examples

### Example 1: Remove Outdated Document
```
1. Ctrl+Shift+A → Enter password
2. Search for document name
3. Click "Delete" → Confirm
4. Document now hidden from all users
```

### Example 2: Fix Typo in Document
```
1. Ctrl+Shift+A → Login
2. Find document → Click "Edit"
3. Fix typo in content
4. Click "Save Changes"
5. Close editor
6. Document now shows edited version
```

### Example 3: Backup Admin Config
```
1. Ctrl+Shift+A → Login
2. Click "Export Config"
3. Save JSON file somewhere safe
4. Click "Export Edits"
5. Save edits JSON file
```

### Example 4: Restore Deleted Document
```
1. Ctrl+Shift+A → Login
2. Click "View Deleted" toggle
3. Find document in deleted list
4. Click "Restore"
5. Document visible again
```

## Security Considerations

### Password Security
- Password hashed with SHA-256 (client-side)
- Hash stored in source code (visible to anyone who can read the code)
- **Not suitable for highly sensitive data**
- Good for: Preventing casual unauthorized changes

### Access Control
- No server-side authentication
- Anyone with password can access admin
- Changes saved locally per device
- Share password only with trusted organizers

### Data Persistence
- Admin state survives page refresh
- Edits persist until localStorage cleared
- Export backups to prevent data loss

## Troubleshooting

### "Invalid password" Error
- Check spelling of password
- Default: `rstu-organize-2024`
- Case-sensitive
- No spaces before/after

### Changes Not Showing
- Check if logged in (Ctrl+Shift+A)
- Verify document not deleted
- Check if another device made changes
- Try exporting config to see current state

### Lost Edits
- Check localStorage not cleared
- Export edits regularly as backup
- Edits are device-specific

### Session Expired
- Login again with password
- Session lasts 24 hours
- Click logout to end session early

## Support

For password resets or technical issues:
- Contact RSTU organizers
- GitHub: https://github.com/cwcorella-git/rstu-connect
- Source code: `src/lib/adminStorage.ts`
