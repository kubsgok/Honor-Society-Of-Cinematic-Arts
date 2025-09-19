'use client'

import { useEffect, useState } from 'react'
import { BookOpen, School, Shield, ShieldOff, SquareCheck, Square, EllipsisVertical } from 'lucide-react'
import { CopyPill } from './CopyPill'
import { PointsModificationModal } from './PointsModificationModal'
import { MinutesFilmProducedModal } from './MinutesFilmProducedModal'
import { InGoodStandingModal } from './InGoodStandingModal'
import { PointsLogTable } from './PointsLogTable'
import { MinutesFilmLogTable } from './MinutesFilmLogTable'

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

interface PointsLog {
  created_at: string
  modified_by: string
  modification: number
  description: string
  role: string
  member: string
}

interface MinutesFilmLog {
  created_at: string
  modified_by: string
  modification: number
  description: string
  role: string
  member: string
}

export function DashboardTable({ users, onRefreshUsers }: DashboardTableProps) {
  const [isEditPointsMode, setIsEditPointsMode] = useState(false)
  const [isEditMinutesFilmMode, setIsEditMinutesFilmMode] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isOfficer, setIsOfficer] = useState(false)
  const [isEditInGoodStandingMode, setIsEditInGoodStandingMode] = useState(false)
  const [isGoodStandingModalOpen, setIsGoodStandingModalOpen] = useState(false)
  const [pendingGoodStandingUserId, setPendingGoodStandingUserId] = useState<string | null>(null)
  const [pendingGoodStandingUserName, setPendingGoodStandingUserName] = useState<string>('')
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null)
  const [pointsLogData, setPointsLogData] = useState<PointsLog[]>([])
  const [showPointsLog, setShowPointsLog] = useState(false)
  const [minutesFilmLogData, setMinutesFilmLogData] = useState<MinutesFilmLog[]>([])
  const [showMinutesFilmLog, setShowMinutesFilmLog] = useState(false)
  const [userInfoClicked, setUserInfoClicked] = useState<string | null>(null)

  const toggleEditPointsMode = () => {
    setIsEditPointsMode(!isEditPointsMode)
  }

  const toggleEditMinutesFilmMode = () => {
    setIsEditMinutesFilmMode(!isEditMinutesFilmMode)
  }

  const toggleEditInGoodStandingMode = () => {
    setIsEditInGoodStandingMode(!isEditInGoodStandingMode)
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

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) {
        setOpenMenuUserId(null)
        return
      }
      const isInside = !!target.closest('[data-ellipsis-menu-container="true"]')
      if (!isInside) setOpenMenuUserId(null)
    }
    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
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

  const handleSaveGoodStandingModification = async (confirmed: boolean) => {
    if (!confirmed) {
      setIsGoodStandingModalOpen(false)
      return
    }
    if (!pendingGoodStandingUserId) {
      setIsGoodStandingModalOpen(false)
      return
    }
    const res = await fetch('/api/updateUserInfo', {
      method: 'PUT',
      body: JSON.stringify({
        user_id: pendingGoodStandingUserId,
        modification: 'in_good_standing',
      })
    })
    setIsGoodStandingModalOpen(false)
    if (!res.ok) {
      console.error('Failed to update standing')
      return
    }
    setIsEditInGoodStandingMode(false)
    onRefreshUsers()
  }

  const fetchPointsLog = async (userId: string, userName: string) => {
    try {
      const response = await fetch(`/api/fetchPointsLog?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setPointsLogData(data.pointsLogData || [])
        setUserInfoClicked(userName)
        setShowPointsLog(true)
      } else {
        console.error('Failed to fetch points log')
      }
    } catch (error) {
      console.error('Error fetching points log:', error)
    }
  }

  const fetchMinutesFilmLog = async (userId: string, userName: string) => {
    try {
      const response = await fetch(`/api/fetchMinutesFilmLog?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMinutesFilmLogData(data.minutesFilmData || [])
        setUserInfoClicked(userName)
        setShowMinutesFilmLog(true)
      } else {
        console.error('Failed to fetch minutes of film log')
      }
    } catch (error) {
      console.error('Error fetching minutes of film log:', error)
    }
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
            <th className="border border-gray-300 px-3 py-2 text-left">
            <div className="flex items-center w-full">
              <span>In Good Standing</span>
              {currentUser?.user_type === 'Chapter Director' && (
                <span
                  onClick={toggleEditInGoodStandingMode}
                  className="ml-auto text-white text-xs font-medium rounded-full px-2 py-0.5 bg-[#b66cee] cursor-pointer select-none ml-2"
                >
                  Edit
                </span>
              )}
            </div>
          </th>
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
              <td className="border border-gray-200 px-3 py-2">
                <div className="relative flex items-center justify-between" data-ellipsis-menu-container="true" onClick={(e) => e.stopPropagation()}>
                  <span>{u.full_name ?? '-'}</span>
                  <div className="relative flex items-center">
                    <EllipsisVertical
                      className={`h-4 w-4 cursor-pointer ${showPointsLog || showMinutesFilmLog ? 'text-gray-300' : 'text-gray-500'}`}
                      onClick={(e) => {
                        if (showPointsLog || showMinutesFilmLog) return
                        e.stopPropagation()
                        setOpenMenuUserId(prev => (prev === u.id ? null : u.id))
                      }}
                    />
                    {openMenuUserId === u.id && (
                      <div
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-20 w-44 rounded-md border border-gray-200 bg-white shadow-md"
                        role="menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {['Points log', 'Minutes of film log'].map((option) => (
                          <div
                            key={option}
                            role="menuitem"
                            className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setOpenMenuUserId(null)
                              if (option === 'Points log') {
                                fetchPointsLog(u.id, u.full_name);
                              } else if (option === 'Minutes of film log') {
                                fetchMinutesFilmLog(u.id, u.full_name);
                              }
                            }}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="border border-gray-200 px-3 py-2">{u.email ?? '-'}</td>
              <td className="border border-gray-200 px-3 py-2">{u.rank ?? '-'}</td>
              <td className="border border-gray-200 px-3 py-2">{getPosition(u.user_type) ?? '-'}</td>
              <td className="border border-gray-200 px-3 py-2">
              {isEditInGoodStandingMode ? (
                <input
                  type="checkbox"
                  checked={u.in_good_standing}
                  onChange={(e) => {
                    setPendingGoodStandingUserId(u.id)
                    setPendingGoodStandingUserName(u.full_name || u.email)
                    setIsGoodStandingModalOpen(true)
                  }}
                  className="h-5 w-5 cursor-pointer"
                />
              ) : (
                u.in_good_standing
                  ? <SquareCheck className="h-6 w-6 mr-2 text-gray-600" />
                  : <Square className="h-6 w-6 mr-2 text-gray-600" />
              )}
            </td>
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
      <InGoodStandingModal
        isOpen={isGoodStandingModalOpen}
        onClose={() => setIsGoodStandingModalOpen(false)}
        onSave={(confirmed: boolean) => {
          handleSaveGoodStandingModification(confirmed)
        }}
        user_name={pendingGoodStandingUserName}
      />
      {showPointsLog && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Points Log for {userInfoClicked}</h3>
            <button
              onClick={() => setShowPointsLog(false)}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <PointsLogTable entries={pointsLogData} />
        </div>
      )}
      {showMinutesFilmLog && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-lg font-semibold">Minutes of Film Log for {userInfoClicked}</h3>
            <button
              onClick={() => setShowMinutesFilmLog(false)}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <MinutesFilmLogTable entries={minutesFilmLogData} />
        </div>
      )}
    </div>
  )
}
