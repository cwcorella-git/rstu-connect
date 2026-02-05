// Supabase Edge Function: Send Verification Email via Resend
// Sends a 6-digit verification code to the user's email

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerificationRequest {
  email: string
  nickname?: string
}

function generateVerificationCode(): string {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate environment
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured')
    }

    // Parse request
    const { email, nickname }: VerificationRequest = await req.json()

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Generate verification code
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store verification code in database
    const { error: dbError } = await supabase
      .from('email_verification_codes')
      .upsert({
        email: normalizedEmail,
        code: code,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        verified: false,
      }, {
        onConflict: 'email',
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to store verification code')
    }

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RSTU Connect <onboarding@resend.dev>',
        to: normalizedEmail,
        subject: 'Verify your email - RSTU Connect',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #cc0000; margin: 0; font-size: 24px;">RSTU Connect</h1>
                <p style="color: #6b7280; margin: 8px 0 0 0;">Reno-Sparks Tenants Union</p>
              </div>

              <p style="color: #374151; font-size: 16px; line-height: 1.5;">
                ${nickname ? `Hi ${nickname},` : 'Hi there,'}
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.5;">
                Your verification code is:
              </p>

              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Reno-Sparks Tenants Union - Nevada's First Tenants Union<br>
                Building tenant power, one building at a time.
              </p>
            </div>
          </body>
          </html>
        `,
        text: `Your RSTU Connect verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      console.error('Resend error:', errorData)
      throw new Error(`Email send failed: ${JSON.stringify(errorData)}`)
    }

    const emailResult = await emailResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification code sent',
        // Don't expose the code in production - this is just for debugging
        // code: code,
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
