import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { NavBar } from '../components/NavBar'
import { BookOpen, School, Shield, ShieldOff, SquareCheck, Square, Pencil } from 'lucide-react'
import { CopyPill } from '../components/CopyPill'
import { DashboardTable } from '../components/DashboardTable'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, full_name, email, user_type, rank, induction_status, in_good_standing, points, minutes_film_produced')
    .order('full_name', { ascending: true })

  return (
    <div>
      <NavBar />
      <div className="p-6">
        {usersError ? (
          <p className="text-red-600">Failed to load users.</p>
        ) : (
          <DashboardTable users={users || []} />
        )}
      </div>
    </div>
  )
}