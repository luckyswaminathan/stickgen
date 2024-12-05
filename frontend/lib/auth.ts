import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function signOut() {
  const supabase = createClientComponentClient()
  await supabase.auth.signOut()
}

