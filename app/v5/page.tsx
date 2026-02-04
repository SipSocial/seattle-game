import { redirect } from 'next/navigation'

/**
 * V5 Root - Redirects to splash or home based on auth state
 * 
 * For now, always redirects to splash (onboarding entry point)
 */

export default function V5Root() {
  // TODO: Check auth state and redirect accordingly
  // If authenticated: redirect('/v5/game')
  // If not: redirect('/v5/splash')
  
  redirect('/v5/splash')
}
