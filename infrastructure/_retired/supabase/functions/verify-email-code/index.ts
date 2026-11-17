// Supabase Edge Function: Verify Email Code
// Verifies the 6-digit code and marks the email as verified

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_ATTEMPTS = 5

interface VerifyRequest {
  email: string
  code: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured')
    }

    // Parse request
    const { email, code }: VerifyRequest = await req.json()

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedCode = code.trim()

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get the verification record
    const { data: verification, error: fetchError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .single()

    if (fetchError || !verification) {
      return new Response(
        JSON.stringify({ error: 'No verification code found for this email' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if already verified
    if (verification.verified) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email already verified' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Verification code has expired. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if too many attempts
    if (verification.attempts >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ error: 'Too many failed attempts. Please request a new code.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if code matches
    if (verification.code !== normalizedCode) {
      // Increment attempts
      await supabase
        .from('email_verification_codes')
        .update({ attempts: verification.attempts + 1 })
        .eq('email', normalizedEmail)

      const remainingAttempts = MAX_ATTEMPTS - verification.attempts - 1
      return new Response(
        JSON.stringify({
          error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Code is correct - mark as verified
    const { error: updateError } = await supabase
      .from('email_verification_codes')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('email', normalizedEmail)

    if (updateError) {
      console.error('Update error:', updateError)
      throw new Error('Failed to mark email as verified')
    }

    // Also update the profile's email_verified status if profile exists
    await supabase
      .from('profiles')
      .update({ email_verified: true })
      .eq('email', normalizedEmail)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email verified successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
