/**
 * V3 Root - Redirects to /v3/menu
 */
import { redirect } from 'next/navigation'

export default function V3Root() {
  redirect('/v3/menu')
}
