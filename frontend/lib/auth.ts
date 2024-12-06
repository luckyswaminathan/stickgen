import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function signOut() {
  const supabase = createClientComponentClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
  }
}

