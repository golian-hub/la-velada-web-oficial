/**
 * Auth configuration for La Velada VI
 * Uses cookies for anonymous user identification
 * Auth-astro is installed but can work with anonymous sessions too
 */

export interface SessionUser {
  id: string
  name?: string
  email?: string
  image?: string
}

/**
 * Gets or creates an anonymous user ID from cookies
 * This allows anonymous voting while enabling vote tracking per user
 */
export function getAnonymousUserId(request: Request): string {
  const cookies = request.headers.get('cookie') || ''
  const match = cookies.match(/lavelada_user_id=([^;]+)/)
  return match ? match[1] : crypto.randomUUID()
}

/**
 * Sets the user ID cookie header for response
 */
export function setUserIdCookie(userId: string): string {
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  return `lavelada_user_id=${userId}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly`
}

/**
 * Extracts user ID from request cookies
 */
export function extractUserId(request: Request): string {
  const cookies = request.headers.get('cookie') || ''
  const match = cookies.match(/lavelada_user_id=([^;]+)/)
  return match ? match[1] : ''
}

/**
 * Validates if a user ID is a valid UUID format
 */
export function isValidUserId(userId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(userId)
}

/**
 * Gets session info from request
 * Returns anonymous session if not authenticated
 */
export async function getSession(request: Request): Promise<{
  user: SessionUser | null
  userId: string
  isAnonymous: boolean
}> {
  // Try to get authenticated user from auth-astro session
  // For now, fall back to anonymous ID
  const userId = extractUserId(request) || crypto.randomUUID()
  const isAnonymous = !request.headers.get('cookie')?.includes('lavelada_user_id=')

  return {
    user: null,
    userId,
    isAnonymous,
  }
}
