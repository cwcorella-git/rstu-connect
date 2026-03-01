/**
 * INVITE SYSTEM DIAGNOSTIC
 *
 * Run this in the browser console on the live site to diagnose invite issues.
 * Copy and paste the entire script into DevTools console.
 *
 * Usage: Just paste and press Enter. Or call: window.testInvite('AWL2PT')
 */

const SUPABASE_URL = 'https://dxkwzvweaqlhmpwgpzsa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4a3d6dndlYXFsaG1wd2dwenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyODQ0NDQsImV4cCI6MjA4MTg2MDQ0NH0.qbiCRiDGRYZZhL93QHh75Bpx5dek_SuvubfjfA6eln0';

// Test a specific invite code
window.testInvite = async function(code) {
  console.log(`\n%cTesting invite code: ${code}`, 'font-weight: bold; color: #cc0000;');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/invite_codes?code=eq.${code.toUpperCase()}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const data = await response.json();

    if (data.length === 0) {
      console.log('%c✗ NOT FOUND in Supabase', 'color: red;');
      return;
    }

    const invite = data[0];
    console.log('%c✓ FOUND in Supabase:', 'color: green;');
    console.log('  Role:', invite.grant_role);
    console.log('  Revoked:', invite.revoked);
    console.log('  Max uses:', invite.max_uses === 0 ? 'Unlimited' : invite.max_uses);
    console.log('  Used:', invite.used_count);
    console.log('  Expires:', invite.expires_at || 'Never');

    // Check validity
    const isRevoked = invite.revoked;
    const isMaxedOut = invite.max_uses > 0 && invite.used_count >= invite.max_uses;
    const isExpired = invite.expires_at && new Date(invite.expires_at) < new Date();

    if (isRevoked) console.log('%c  ✗ INVALID: Code is revoked', 'color: red;');
    else if (isMaxedOut) console.log('%c  ✗ INVALID: Max uses reached', 'color: red;');
    else if (isExpired) console.log('%c  ✗ INVALID: Code expired', 'color: red;');
    else console.log('%c  ✓ VALID: Ready to use', 'color: green; font-weight: bold;');

  } catch (e) {
    console.log('%c✗ Query failed:', 'color: red;', e.message);
  }
};

(async function diagnoseInviteSystem() {
  console.log('%c=== RSTU INVITE SYSTEM DIAGNOSTIC ===', 'font-size: 16px; font-weight: bold; color: #cc0000;');

  // 1. Check localStorage state
  console.log('\n%c1. LOCAL STATE', 'font-weight: bold;');
  const profileData = localStorage.getItem('rstu_profile_data');
  if (profileData) {
    try {
      const data = JSON.parse(profileData);
      console.log('Current profile:', data.currentProfile?.nickname || 'NONE');
      console.log('Profile role:', data.currentProfile?.role || 'N/A');
      console.log('Local invite codes:', Object.keys(data.inviteCodes || {}).length);
    } catch (e) {
      console.error('Failed to parse profile data:', e);
    }
  } else {
    console.log('No profile data in localStorage (new user)');
  }

  // 2. Test Supabase API directly
  console.log('\n%c2. SUPABASE CONNECTIVITY', 'font-weight: bold;');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/invite_codes?select=code&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (response.ok) {
      console.log('%c✓ Supabase API reachable', 'color: green;');
    } else {
      console.log('%c✗ Supabase returned error:', 'color: red;', response.status);
    }
  } catch (e) {
    console.log('%c✗ Cannot reach Supabase:', 'color: red;', e.message);
  }

  // 3. List all active codes
  console.log('\n%c3. ACTIVE INVITE CODES IN DATABASE', 'font-weight: bold;');
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/invite_codes?revoked=eq.false&select=code,grant_role,max_uses,used_count,expires_at`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    const codes = await response.json();

    const validCodes = codes.filter(c => {
      const isMaxedOut = c.max_uses > 0 && c.used_count >= c.max_uses;
      const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
      return !isMaxedOut && !isExpired;
    });

    console.log(`Found ${validCodes.length} active codes:`);
    validCodes.forEach(c => {
      console.log(`  ${c.code} -> ${c.grant_role} (${c.max_uses === 0 ? 'unlimited' : c.max_uses - c.used_count + ' remaining'})`);
    });
  } catch (e) {
    console.log('Failed to list codes:', e.message);
  }

  // 4. Check URL for invite code
  console.log('\n%c4. URL PARAMETERS', 'font-weight: bold;');
  const urlParams = new URLSearchParams(window.location.search);
  const inviteCode = urlParams.get('invite');
  if (inviteCode) {
    console.log('Invite code in URL:', inviteCode);
    await window.testInvite(inviteCode);
  } else {
    console.log('No invite code in URL');
  }

  // 5. Usage tip
  console.log('\n%c5. USAGE', 'font-weight: bold;');
  console.log('To test a specific code, run: testInvite("CODE")');
  console.log('Example: testInvite("AWL2PT")');

  console.log('\n%c=== END DIAGNOSTIC ===', 'font-size: 14px; font-weight: bold; color: #cc0000;');
})();
