// Supabase Edge Function: expire-featured-bikes
// Schedule: 0 2 * * * (daily at 2 AM UTC)
//
// Resets is_featured on bikes whose featured_until has passed.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data, error } = await supabase
    .from('bikes')
    .update({ is_featured: false, featured_until: null })
    .eq('is_featured', true)
    .lt('featured_until', new Date().toISOString())
    .select('id')

  if (error) {
    console.error('[expire-featured-bikes] Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const count = data?.length ?? 0
  console.log(`[expire-featured-bikes] Expired ${count} bike(s)`)

  return new Response(JSON.stringify({ expired: count }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
