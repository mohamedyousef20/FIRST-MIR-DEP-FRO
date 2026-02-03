import { redirect } from 'next/navigation'

// Redirects old /auth/signin route (expected by NextAuth) to the new /auth/login page
export default function SignInPage() {
  redirect('/auth/login')
  // The component never renders because redirect() throws.
  return null
}
