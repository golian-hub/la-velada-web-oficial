import type { APIRoute } from 'astro'
import { getUserVotes } from '@/lib/predictions'
import { extractUserId } from '@/lib/auth'

export const GET: APIRoute = async ({ request }) => {
  try {
    const userId = extractUserId(request)
    
    // Si no hay cookie de usuario, devolvemos array vacío (no ha votado)
    if (!userId) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      })
    }

    const votes = await getUserVotes(userId)
    
    // Convertimos la respuesta para facilitar su iteración en el cliente: { combat_id: fighter_id }
    const userVotesMap = Object.fromEntries(votes.map((v) => [v.combat_id, v.fighter_id]))

    return new Response(JSON.stringify(userVotesMap), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cachear a nivel de navegador pero NUNCA en CDN Edge público (privacidad)
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Error fetching user votes state:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
