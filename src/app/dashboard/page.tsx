import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { NavBar } from '../components/NavBar'
import { BookOpen, School, Shield, ShieldOff, SquareCheck, Square } from 'lucide-react'
import { InteractivePill } from '../components/InteractivePill'

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

  const getPosition = (rank: string) => {
    if (rank !== 'Officer' && rank!== 'Vice President' && rank!== 'President') {
        return null
    } else {
        return rank
    }
  }

  return (
    <div>
      <NavBar />
      <div className="p-6">
        {usersError ? (
          <p className="text-red-600">Failed to load users.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-center">
                <h2 className="text-2xl font-semibold mb-3">Dashboard</h2>
                <div className="ml-auto flex items-center gap-2">
                    <p className="flex items-center text-sm text-gray-800 px-2 py-1">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Chapter 12
                    </p>
                    {/* when not in good standing, use ShieldOff */}
                    <p className="flex items-center text-sm text-gray-800 px-2 py-1">
                      <Shield className="h-4 w-4 mr-2" />
                      In Good Standing 
                    </p>
                    <p className="flex items-center text-sm text-gray-800 px-2 py-1">
                      <School className="h-4 w-4 mr-2" />
                      Singapore American School
                    </p>
                </div>
            </div>
            <table className="min-w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-2 py-2 text-left">
                    <div className="flex items-center w-full">
                      <span>Name</span>
                      <InteractivePill className="ml-auto" names={(users ?? []).map((u: any) => u.full_name)} buttonText="Copy All" />
                    </div>
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left">
                    <div className="flex items-center w-full">
                      <span>Email</span>
                      <InteractivePill className="ml-auto" names={(users ?? []).map((u: any) => u.email)} buttonText="Copy All" />
                    </div>
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left">
                    <div className="flex items-center w-full">
                      <span>Rank</span>
                      <InteractivePill className="ml-auto" names={(users ?? []).map((u: any) => u.email)} buttonText="Edit" />
                    </div>
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Position</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">In Good Standing</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Points</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Minutes of Film Produced</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Induction Status</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u: any) => (
                  <tr key={u.id ?? u.email} className="odd:bg-white even:bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2">{u.full_name ?? '-'}</td>
                    <td className="border border-gray-200 px-3 py-2">{u.email ?? '-'}</td>
                    <td className="border border-gray-200 px-3 py-2">{u.rank ?? '-'}</td>
                    <td className="border border-gray-200 px-3 py-2">{getPosition(u.user_type) ?? '-'}</td>
                    <td className="border border-gray-200 px-3 py-2">{u.in_good_standing ? 
                        <SquareCheck className="h-6 w-6 mr-2 text-gray-600" /> : <Square className="h-6 w-6 mr-2 text-gray-600" />}</td>
                    <td className="border border-gray-200 px-3 py-2">{u.points ?? 0}</td>
                    <td className="border border-gray-200 px-3 py-2">{u.minutes_film_produced ?? 0}</td>
                    <td className="border border-gray-200 px-3 py-2">{u.induction_status ?? '-'}</td>
                  </tr>
                ))}
                {users && users.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-gray-500" colSpan={10}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}