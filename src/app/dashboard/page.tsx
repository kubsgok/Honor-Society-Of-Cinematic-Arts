'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavBar } from '../components/NavBar'
import { DashboardTable } from '../components/DashboardTable'

interface User {
  id: string
  full_name: string
  email: string
  chapter_id: string
  user_type: string
  rank: string
  induction_status: string
  in_good_standing: boolean
  points: number
  minutes: number
  seconds: number
}

interface CurrentUser {
  id: string
  chapter_id: string
  email: string
  full_name: string
  user_type: string
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
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
      await loadDashboardData()
    }

    init()
  }, [router])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch current user and all users in parallel
      const [currentUserResponse, allUsersResponse] = await Promise.all([
        fetch('/api/getCurrentUser'),
        fetch('/api/fetchUsers')
      ])
      
      if (!currentUserResponse.ok) {
        const errorData = await currentUserResponse.json()
        throw new Error(errorData.error || 'Failed to fetch current user')
      }
      
      if (!allUsersResponse.ok) {
        const errorData = await allUsersResponse.json()
        throw new Error(errorData.error || 'Failed to fetch users')
      }
      
      const currentUserData = await currentUserResponse.json()
      const allUsersData = await allUsersResponse.json()
      
      setCurrentUser(currentUserData)
      
      // Filter users by same chapter_id and allowed user types
      const allowedUserTypes = [
        'member', 'officer', 'president', 'vice-president', 'chapter director',
        'Member', 'Officer', 'President', 'Vice-President', 'Vice President', 'Chapter Director'
      ]
      const filteredUsers = allUsersData.filter((user: User) => {
        const sameChapter = user.chapter_id === currentUserData.chapter_id
        const allowedType = allowedUserTypes.includes(user.user_type || '')
        const notRevoked = user.induction_status?.toLowerCase() !== 'revoked'
        const inGoodStanding = user.in_good_standing === true
        
        return sameChapter && allowedType && notRevoked && inGoodStanding
      })
      
      console.log('Current user chapter:', currentUserData.chapter_id)
      console.log('Total users before filtering:', allUsersData.length)
      console.log('Users in same chapter:', allUsersData.filter((u: User) => u.chapter_id === currentUserData.chapter_id).length)
      console.log('Users after filtering by type:', allUsersData.filter((u: User) => u.chapter_id === currentUserData.chapter_id && allowedUserTypes.includes(u.user_type || '')).length)
      console.log('Users after excluding revoked:', allUsersData.filter((u: User) => u.chapter_id === currentUserData.chapter_id && allowedUserTypes.includes(u.user_type || '') && u.induction_status?.toLowerCase() !== 'revoked').length)
      console.log('Users after good standing filter (final):', filteredUsers.length)
      
      setUsers(filteredUsers)
      setError(null)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
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
          <div>
            <p className="text-gray-600">Loading chapter members...</p>
          </div>
        ) : error ? (
          <div>
            <p className="text-red-600">Failed to load chapter members: {error}</p>
          </div>
        ) : (
          <div>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No qualifying chapter members found.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Showing members with roles: Member, Officer, President, Vice-President, or Chapter Director<br/>
                  who are in good standing and not revoked.
                </p>
              </div>
            ) : (
              <DashboardTable users={users || []} onRefreshUsers={loadDashboardData} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}