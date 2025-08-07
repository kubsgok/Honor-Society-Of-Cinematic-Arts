import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { NavBar } from '../components/NavBar'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div>
      <NavBar />
      <p>Hello {data.user.email}</p>
    </div>
  )
}