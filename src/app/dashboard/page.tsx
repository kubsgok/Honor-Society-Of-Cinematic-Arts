'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    getUsers()
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