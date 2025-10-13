'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    loadDashboardData()
  }, [])

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
        return sameChapter && allowedType
      })
      
      console.log('Current user chapter:', currentUserData.chapter_id)
      console.log('Total users before filtering:', allUsersData.length)
      console.log('Users in same chapter:', allUsersData.filter((u: User) => u.chapter_id === currentUserData.chapter_id).length)
      console.log('Users after filtering by type:', filteredUsers.length)
      
      setUsers(filteredUsers)
      setError(null)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

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
                <p className="text-gray-600">No chapter members found with the required roles.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Only members with roles: Member, Officer, President, Vice-President, or Chapter Director are shown.
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