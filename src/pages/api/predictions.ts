import type { APIRoute } from 'astro'
import { registerVote, getAllPredictions, getPredictionsByCombat } from '@/lib/predictions'
import { extractUserId, setUserIdCookie, getAnonymousUserId, isValidUserId } from '@/lib/auth'
import { COMBATS } from '@/consts/combats'

export const prerender = false

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const combatId = url.searchParams.get('combat_id') ?? url.searchParams.get('combatId')

    // Get or create anonymous user ID
    let userId = extractUserId(request)
    if (!userId) {
      userId = getAnonymousUserId(request)
    }

    let predictions
    if (combatId) {
      // Get predictions for specific combat
      predictions = await getPredictionsByCombat(combatId)

      if (!predictions) {
        // Return default empty predictions if no votes yet
        const combat = COMBATS.find((c) => c.id === combatId)
        if (combat) {
          predictions = {
            combat_id: combatId,
            predictions: combat.fighters.map((fighterId) => ({
              fighter_id: fighterId,
              votes: 0,
              percentage: 50,
            })),
            total_votes: 0,
          }
        }
      }
    } else {
      // Get all predictions
      predictions = await getAllPredictions()

      if (!predictions || predictions.length === 0) {
        // Return default predictions for all combats
        predictions = COMBATS.map((combat) => ({
          combat_id: combat.id,
          predictions: combat.fighters.map((fighterId, index) => ({
            fighter_id: fighterId,
            votes: 0,
            percentage: combat.fighters.length === 2 ? 50 : 0,
          })),
          total_votes: 0,
        }))
      }
    }

    return new Response(JSON.stringify({ predictions, userId }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
      },
    })
  } catch (error) {
    console.error('GET /api/predictions error:', error)
    return new Response(
      JSON.stringify({ error: 'Error fetching predictions' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get or create anonymous user ID
    let userId = extractUserId(request)
    let isNewUser = false
    if (!userId) {
      userId = getAnonymousUserId(request)
      isNewUser = true
    }

    // Validate userId is a proper UUID to prevent manipulation
    if (!isValidUserId(userId)) {
      userId = getAnonymousUserId(request)
      isNewUser = true
    }

    const body = await request.json()
    const { combatId, fighterId } = body

    // Validate required fields
    if (!combatId || !fighterId) {
      return new Response(
        JSON.stringify({ error: 'Missing combatId or fighterId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Validate combat exists
    const combat = COMBATS.find((c) => c.id === combatId)
    if (!combat) {
      return new Response(
        JSON.stringify({ error: 'Combat not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Validate fighter is part of this combat
    if (!combat.fighters.includes(fighterId)) {
      return new Response(
        JSON.stringify({ error: 'Fighter not in this combat' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Register the vote
    const result = await registerVote(combatId, fighterId, userId)

    // Get updated predictions for the combat to return in the response
    const updatedPredictions = await getPredictionsByCombat(combatId)

    // Build response headers
    const headers = new Headers({
      'Content-Type': 'application/json',
    })

    // Set cookie for new users
    if (isNewUser) {
      headers.append('Set-Cookie', setUserIdCookie(userId))
    }

    return new Response(
      JSON.stringify({
        success: true,
        vote: result,
        predictions: updatedPredictions,
        userId,
      }),
      { status: 200, headers },
    )
  } catch (error) {
    console.error('POST /api/predictions error:', error)
    return new Response(
      JSON.stringify({ error: 'Error registering vote' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
