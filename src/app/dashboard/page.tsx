'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavBar } from '../components/NavBar'
import { DashboardTable } from '../components/DashboardTable'

interface User {
  id: string
  full_name: string
  email: string
  user_type: string
  rank: string
  induction_status: string
  in_good_standing: boolean
  points: number
  minutes: number
  seconds: number
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkingUser, setCheckingUser] = useState(true) // NEW: true until role resolved
  const router = useRouter()

  useEffect(() => {
    // run init flow: check current user first, then fetch users if allowed
    async function init() {
      setCheckingUser(true)
      const fetchedCurrent = await getCurrentUser()
      setCheckingUser(false)

      if (!fetchedCurrent) {
        // no current user -> show nothing / could redirect to login
        setLoading(false)
        return
      }

      if (fetchedCurrent.user_type === "Associate" || fetchedCurrent.user_type === "Nominee for Induction" || fetchedCurrent.user_type === "Alum") {
        // redirect Associates immediately
        router.replace('/restricted')
        return
      }

      // only fetch users for allowed roles
      await getUsers()
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fetchUsers')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch users')
      }
      const userData = await response.json()
      setUsers(userData)
      setError(null)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const res = await fetch('/api/getCurrentUser')
      if (!res.ok) {
        console.error('getCurrentUser returned not ok')
        return null
      }
      const data = await res.json()
      return data as User
    } catch (err) {
      console.error('Error fetching current user:', err)
      return null
    }
  }

  // show nothing (or a minimal loader) until we know the user's role
  if (checkingUser) {
    return (
      <div>
        <NavBar />
        <div className="p-6">
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // after checkingUser: if redirected above, component will unmount; otherwise render
  return (
    <div>
      <NavBar />
      <div className="p-6">
        {loading ? (
          <p className="text-gray-600">Loading users...</p>
        ) : error ? (
          <p className="text-red-600">Failed to load users: {error}</p>
        ) : (
          <DashboardTable users={users || []} onRefreshUsers={getUsers} />
        )}
      </div>
    </div>
  )
}