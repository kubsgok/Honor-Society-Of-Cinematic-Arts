'use client'

import { useEffect, useState } from 'react'
import { BookOpen, School, Shield, ShieldOff, SquareCheck, Square } from 'lucide-react'
import { CopyPill } from './CopyPill'
import { PointsModificationModal } from './PointsModificationModal'
import { MinutesFilmProducedModal } from './MinutesFilmProducedModal'

interface User {
  id: string
  full_name: string
  email: string
  user_type: string
  rank: string
  induction_status: string
  in_good_standing: boolean
  points: number
  minutes_film_produced: number
}

interface DashboardTableProps {
  users: User[]
  onRefreshUsers: () => void
}

export function DashboardTable({ users, onRefreshUsers }: DashboardTableProps) {
  const [isEditPointsMode, setIsEditPointsMode] = useState(false)
  const [isEditMinutesFilmMode, setIsEditMinutesFilmMode] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isOfficer, setIsOfficer] = useState(false)

  const toggleEditPointsMode = () => {
    setIsEditPointsMode(!isEditPointsMode)
  }

  const toggleEditMinutesFilmMode = () => {
    setIsEditMinutesFilmMode(!isEditMinutesFilmMode)
  }

  const getPosition = (rank: string) => {
    if (rank !== 'Officer' && rank !== 'Vice President' && rank !== 'President') {
      return null
    } else {
      return rank
    }
  }

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const currentUser: User | null = await fetch('/api/getCurrentUser')
        .then(res => res.ok ? res.json() : null)
        .catch(err => {
          console.error('Error fetching current user:', err)
          return null
        })
      if (!currentUser) {
        console.error('Failed to fetch current user')
        return
      }
      setCurrentUser(currentUser)
      if (currentUser.user_type === 'Officer' || currentUser.user_type === 'Vice President' || currentUser.user_type === 'President' || currentUser.user_type === 'Chapter Director') {
        setIsOfficer(true)
      }
    }
    
    fetchCurrentUser()
  }, [])

  const handleSavePointsModification = async (selectedUserIds: string[], modification: number, description: string) => {
    const currentUser: User | null = await fetch('/api/getCurrentUser')
      .then(res => res.ok ? res.json() : null)
      .catch(err => {
        console.error('Error fetching current user:', err)
        return null
      })
    if (!currentUser) {
      console.error('Failed to fetch current user')
      return
    }
    const modifiedBy = currentUser.id
    const response = await fetch('/api/createPointsLog', {
      method: 'POST',
      body: JSON.stringify({
        userIds: selectedUserIds,
        modification,
        description,
        modifiedBy
      })
    })
    if (!response.ok) {
      console.error('Failed to create points log')
      return
    }
    const newResponse = await fetch('/api/updateUserInfo', {
      method: 'PUT',
      body: JSON.stringify({
        user_ids: selectedUserIds,
        points: modification,
        modification: 'points'
      })
    })
    if (!newResponse.ok) {
      console.error('Failed to update user info')
      return
    }
    setIsEditPointsMode(false)
    onRefreshUsers() // Refresh the user data
  }

  const handleSaveMinutesFilmModification = async (selectedUserIds: string[], modification: number, goodEffort: boolean, crewMin: boolean, screened: boolean, description: string) => {
    //get the current user
    const currentUser: User | null = await fetch('/api/getCurrentUser')
      .then(res => res.ok ? res.json() : null)
      .catch(err => {
        console.error('Error fetching current user:', err)
        return null
      })
    if (!currentUser) {
      console.error('Failed to fetch current user')
      return
    }
    const modifiedBy = currentUser.id
    const response = await fetch('/api/createMinutesFilmLog', {
      method: 'POST',
      body: JSON.stringify({
        userIds: selectedUserIds,
        modification,
        description,
        modifiedBy,
        crewMin,
        screened,
        goodEffort
      })
    })
    if (!response.ok) {
      console.error('Failed to create points log')
      return
    }
    const newResponse = await fetch('/api/updateUserInfo', {
      method: 'PUT',
      body: JSON.stringify({
        user_ids: selectedUserIds,
        minutes_film_produced: modification,
        modification: 'minutes_film_produced'
      })
    })
    if (!newResponse.ok) {
      console.error('Failed to update user info')
      return
    }
    setIsEditMinutesFilmMode(false)
    onRefreshUsers() // Refresh the user data

  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center">
        <h2 className="text-2xl font-semibold mb-3">Dashboard</h2>
        <div className="ml-auto flex items-center gap-2">
          <p className="flex items-center text-sm text-gray-800 px-2 py-1">
            <BookOpen className="h-4 w-4 mr-2" />
            Chapter 12
          </p>
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
                <CopyPill className="ml-auto" names={users.map((u) => u.full_name)} />
              </div>
            </th>
            <th className="border border-gray-300 px-2 py-2 text-left">
              <div className="flex items-center w-full">
                <span>Email</span>
                <CopyPill className="ml-auto" names={users.map((u) => u.email)}/>
              </div>
            </th>
            <th className="border border-gray-300 px-2 py-2 text-left">
              Rank
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left">Position</th>
            <th className="border border-gray-300 px-3 py-2 text-left">In Good Standing</th>
            <th className="border border-gray-300 px-3 py-2 text-left">
              <div className="flex items-center w-full">
                <span>Points</span>
                {
                  isOfficer && (
                    <span
                      onClick={toggleEditPointsMode}
                      className="ml-auto text-white text-xs font-medium rounded-full px-2 py-0.5 bg-[#b66cee] cursor-pointer select-none ml-2"
                    >
                      Edit
                    </span>
                  )
                }
              </div>
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left">
              <div className="flex items-center w-full">
                  <span>Minutes of Film Produced</span>
                  {isOfficer && (
                <span
                  onClick={toggleEditMinutesFilmMode}
                  className="ml-auto text-white text-xs font-medium rounded-full px-2 py-0.5 bg-[#b66cee] cursor-pointer select-none ml-2"
                >
                  Edit
                </span>)}
              </div>
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left">Induction Status</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u) => (
            <tr key={u.id ?? u.email} className="odd:bg-white even:bg-gray-50">
              <td className="border border-gray-200 px-3 py-2">{u.full_name ?? '-'}</td>
              <td className="border border-gray-200 px-3 py-2">{u.email ?? '-'}</td>
              <td className="border border-gray-200 px-3 py-2">{u.rank ?? '-'}</td>
              <td className="border border-gray-200 px-3 py-2">{getPosition(u.user_type) ?? '-'}</td>
              <td className="border border-gray-200 px-3 py-2">{u.in_good_standing ? 
                  <SquareCheck className="h-6 w-6 mr-2 text-gray-600" /> : <Square className="h-6 w-6 mr-2 text-gray-600" />}</td>
              <td className="border border-gray-200 px-3 py-2">
                {u.points ?? 0}
              </td>
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
      <PointsModificationModal
        isOpen={isEditPointsMode}
        onClose={() => setIsEditPointsMode(false)}
        onSave={(selectedUserIds: string[], modification: number, description: string) => handleSavePointsModification(selectedUserIds, modification, description)}
        users={users}
      />
      <MinutesFilmProducedModal
        isOpen={isEditMinutesFilmMode}
        onClose={() => setIsEditMinutesFilmMode(false)}
        onSave={(selectedUserIds: string[], modification: number, goodEffort: boolean, crewMin: boolean, screened: boolean, description: string) => handleSaveMinutesFilmModification(selectedUserIds, modification, goodEffort, crewMin, screened, description)}
        users={users}
      />
    </div>
  )
}
