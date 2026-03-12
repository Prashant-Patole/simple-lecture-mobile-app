// =============================================================================
// Supabase Edge Function: send-blog-notification
// =============================================================================
//
// Triggered automatically by PostgreSQL triggers (pg_net) when a blog post
// is inserted or updated to 'published' status. See blog-notification-trigger.sql.
//
// Auth: x-webhook-secret header validated against BLOG_WEBHOOK_SECRET env var
// (set as a Supabase Edge Function secret).
//
// Deploy: supabase functions deploy send-blog-notification --no-verify-jwt
//
// Manual test:
// curl -X POST https://oxwhqvsoelqqsblmqkxx.supabase.co/functions/v1/send-blog-notification \
//   -H "x-webhook-secret: <BLOG_WEBHOOK_SECRET>" \
//   -H "Content-Type: application/json" \
//   -d '{"record": {"id": "...", "title": "...", "slug": "...", "meta_description": "...", "featured_image_url": "...", "status": "published"}}'
//
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BLOG_WEBHOOK_SECRET = Deno.env.get('BLOG_WEBHOOK_SECRET')!
const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send'

interface BlogRecord {
  id: string
  title: string
  slug: string
  meta_description?: string
  featured_image_url?: string | null
  status: string
}

interface PushToken {
  token: string
}

serve(async (req) => {
  const startTime = Date.now()
  console.log('========================================')
  console.log('[BlogNotif] FUNCTION INVOKED at', new Date().toISOString())
  console.log('[BlogNotif] Method:', req.method)
  console.log('========================================')

  try {
    // [STEP 1] Auth validation
    console.log('[STEP 1] Validating authorization...')
    const webhookSecret = req.headers.get('x-webhook-secret')
    if (!webhookSecret || webhookSecret !== BLOG_WEBHOOK_SECRET) {
      console.log('[STEP 1] FAILED - Invalid or missing x-webhook-secret header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.log('[STEP 1] OK - Webhook secret validated')

    // [STEP 2] Parse payload
    console.log('[STEP 2] Parsing request body...')
    const body = await req.json()
    console.log('[STEP 2] Raw body keys:', Object.keys(body).join(', '))
    console.log('[STEP 2] Webhook type:', body.type || '(not a webhook)')
    console.log('[STEP 2] Webhook table:', body.table || '(not a webhook)')

    const record: BlogRecord = body.record || body
    console.log('[STEP 2] Record extracted:', JSON.stringify({
      id: record?.id,
      title: record?.title,
      slug: record?.slug,
      status: record?.status,
      meta_description: record?.meta_description?.substring(0, 50) + '...',
      featured_image_url: record?.featured_image_url ? 'present' : 'null',
    }))

    if (!record || !record.title) {
      console.log('[STEP 2] FAILED - No valid blog record found in payload')
      return new Response(
        JSON.stringify({ error: 'No blog record provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.log('[STEP 2] OK - Blog record parsed: "' + record.title + '"')

    // [STEP 3] Check publish status
    console.log('[STEP 3] Checking publish status...')
    console.log('[STEP 3] Record status:', record.status)
    if (record.status !== 'published') {
      console.log('[STEP 3] SKIPPED - Post status is "' + record.status + '", not "published"')
      return new Response(
        JSON.stringify({ message: 'Post not published, skipping notification', status: record.status }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.log('[STEP 3] OK - Post is published, proceeding')

    // [STEP 4] Fetch push tokens
    console.log('[STEP 4] Fetching push tokens from push_notification_tokens...')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: tokens, error: tokenError } = await supabase
      .from('push_notification_tokens')
      .select('token')

    if (tokenError) {
      console.error('[STEP 4] FAILED - Database error:', JSON.stringify(tokenError))
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens', details: tokenError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('[STEP 4] Total tokens in DB:', tokens?.length || 0)
    if (tokens && tokens.length > 0) {
      console.log('[STEP 4] Sample tokens:', tokens.slice(0, 3).map((t: PushToken) => t.token.substring(0, 25) + '...').join(', '))
    }

    if (!tokens || tokens.length === 0) {
      console.log('[STEP 4] STOPPED - No push tokens registered in database')
      return new Response(
        JSON.stringify({ message: 'No devices to notify', tokensInDB: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.log('[STEP 4] OK - Found', tokens.length, 'tokens')

    // [STEP 5] Build notification messages
    console.log('[STEP 5] Building notification messages...')
    const description = record.meta_description || ''
    const previewText = description.length > 0
      ? description
      : 'A new article has been published on SimpleLecture. Tap to read and expand your knowledge with the latest insights, tips, and study strategies from our experts.'

    const bodyText = previewText.length > 300
      ? previewText.substring(0, 297) + '...'
      : previewText

    console.log('[STEP 5] Notification title: "New Blog: ' + record.title + '"')
    console.log('[STEP 5] Notification body length:', bodyText.length, 'chars')
    console.log('[STEP 5] Body preview:', bodyText.substring(0, 80) + '...')

    const messages = tokens
      .filter((t: PushToken) => t.token && (t.token.startsWith('ExponentPushToken') || t.token.startsWith('ExpoPushToken')))
      .map((t: PushToken) => ({
        to: t.token,
        title: `New Blog: ${record.title}`,
        body: bodyText,
        sound: 'default',
        data: {
          type: 'new_blog',
          screen: 'BlogDetail',
          blogSlug: record.slug,
          params: { slug: record.slug },
          imageUrl: record.featured_image_url || null,
        },
      }))

    const filteredOut = tokens.length - messages.length
    console.log('[STEP 5] Valid Expo tokens:', messages.length, '| Filtered out (invalid format):', filteredOut)

    if (messages.length === 0) {
      console.log('[STEP 5] STOPPED - No valid Expo push tokens after filtering')
      console.log('[STEP 5] All', tokens.length, 'tokens were invalid format')
      return new Response(
        JSON.stringify({ message: 'No valid tokens to notify', totalTokens: tokens.length, validTokens: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.log('[STEP 5] OK - Built', messages.length, 'notification messages')

    // [STEP 6] Send push notifications in batches
    console.log('[STEP 6] Sending push notifications via Expo Push API...')
    const totalBatches = Math.ceil(messages.length / 100)
    console.log('[STEP 6] Total batches needed:', totalBatches)

    let totalSent = 0
    let totalFailed = 0

    for (let i = 0; i < messages.length; i += 100) {
      const batchNum = Math.floor(i / 100) + 1
      const batch = messages.slice(i, i + 100)
      console.log(`[STEP 6] Batch ${batchNum}/${totalBatches} - Sending ${batch.length} notifications...`)

      const pushResponse = await fetch(EXPO_PUSH_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(batch),
      })

      console.log(`[STEP 6] Batch ${batchNum} - Expo API response status: ${pushResponse.status}`)

      if (pushResponse.ok) {
        const result = await pushResponse.json()
        const data = result.data || []
        const succeeded = data.filter((r: any) => r.status === 'ok').length
        const failed = data.filter((r: any) => r.status === 'error').length
        totalSent += succeeded
        totalFailed += failed

        console.log(`[STEP 6] Batch ${batchNum} - OK: ${succeeded}, FAILED: ${failed}`)

        data.forEach((r: any, idx: number) => {
          if (r.status === 'error') {
            console.error(`[STEP 6] Batch ${batchNum} - Push error for token ${batch[idx]?.to?.substring(0, 25)}...: ${r.message} (details: ${JSON.stringify(r.details)})`)
          }
        })
      } else {
        const errorBody = await pushResponse.text().catch(() => 'could not read body')
        console.error(`[STEP 6] Batch ${batchNum} - Expo API FAILED with status ${pushResponse.status}: ${errorBody}`)
        totalFailed += batch.length
      }
    }

    // [STEP 7] Final summary
    const elapsed = Date.now() - startTime
    console.log('========================================')
    console.log('[STEP 7] FINAL SUMMARY')
    console.log('[STEP 7] Blog: "' + record.title + '" (ID: ' + record.id + ')')
    console.log('[STEP 7] Total devices:', messages.length)
    console.log('[STEP 7] Sent successfully:', totalSent)
    console.log('[STEP 7] Failed:', totalFailed)
    console.log('[STEP 7] Time elapsed:', elapsed + 'ms')
    console.log('[STEP 7] Status:', totalFailed === 0 ? 'ALL SUCCESS' : 'PARTIAL FAILURE')
    console.log('========================================')

    return new Response(
      JSON.stringify({
        success: true,
        blog: record.title,
        blogId: record.id,
        sent: totalSent,
        failed: totalFailed,
        totalDevices: messages.length,
        filteredOutTokens: filteredOut,
        elapsedMs: elapsed,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error('========================================')
    console.error('[FATAL] Unexpected error after', elapsed + 'ms:', error)
    console.error('[FATAL] Error name:', (error as Error)?.name)
    console.error('[FATAL] Error message:', (error as Error)?.message)
    console.error('[FATAL] Error stack:', (error as Error)?.stack)
    console.error('========================================')
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: (error as Error)?.message, elapsedMs: elapsed }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
