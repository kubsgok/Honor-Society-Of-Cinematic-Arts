"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/app/components/NavBar'
import { Shield, ShieldOff, AlertTriangle } from 'lucide-react'

type Chapter = {
  id: string
  number?: string | null
  name: string
  director_id: string
  director_name?: string | null
  director_email?: string | null
  users_count?: number | null
  status?: string
  in_good_standing?: boolean
}

type User = {
  id: string
  full_name: string
  email: string
  chapter_id: string
  chapter_name: string
  chapter_number: string
  position: string
  rank?: string | null
  user_type: 'student' | 'chapter_director'
  induction_status: string
  grad_year: number | null
  grad_month: string | null
  graduating_this_year: boolean
}

interface CurrentUser {
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

export default function StaffInterfacePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false) // only true while fetching data after auth check
  const [error, setError] = useState<string | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [currentView, setCurrentView] = useState<'chapters' | 'users'>('chapters')
  
  // Filter states
  const [chapterFilter, setChapterFilter] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [rankFilter, setRankFilter] = useState('')
  const [graduationFilter, setGraduationFilter] = useState('')
  const [gradYearFilter, setGradYearFilter] = useState('')
  const [inductionFilter, setInductionFilter] = useState('')
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Create chapter modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newChapter, setNewChapter] = useState({
    number: '',
    name: '',
    director_email: ''
  })

  const [checkingUser, setCheckingUser] = useState(true)

  // Helper: build CSV string from chapters
  const toCSV = (rows: Chapter[]) => {
    const headers = ['id', 'chapter_number', 'chapter_name', 'director_name', 'director_email', 'members']
    const escape = (v: unknown) => {
      const s = String(v ?? '')
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [
      headers.join(','), // header
      ...rows.map((c) =>
        [
          c.id,
          c.number ?? '',
          c.name ?? '',
          c.director_name ?? '',
          c.director_email ?? '',
          c.users_count ?? 0,
        ].map(escape).join(',')
      ),
    ]
    return lines.join('\r\n')
  }

  // Helper: build CSV string from users
  const usersToCSV = (rows: User[]) => {
    const headers = ['id', 'full_name', 'email', 'chapter_number', 'chapter_name', 'position', 'rank', 'user_type', 'induction_status', 'graduating_this_year', 'grad_year', 'grad_month']
    const escape = (v: unknown) => {
      const s = String(v ?? '')
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [
      headers.join(','), // header
      ...rows.map((u) =>
        [
          u.id,
          u.full_name,
          u.email,
          u.chapter_number,
          u.chapter_name,
          u.position,
          u.rank ?? '',
          u.user_type,
          u.induction_status,
          u.graduating_this_year,
          u.grad_year ?? '',
          u.grad_month ?? '',
        ].map(escape).join(',')
      ),
    ]
    return lines.join('\r\n')
  }

  const handleDownloadCSV = () => {
    if (currentView === 'chapters') {
      if (!chapters.length) return
      const csv = toCSV(chapters)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `chapters_${date}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } else {
      if (!filteredUsers.length) return
      const csv = usersToCSV(filteredUsers)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `users_${date}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }
  }

  const handleCreateChapter = () => {
    // TODO: Replace with actual API call when backend is ready
    const newId = (chapters.length + 1).toString()
    const chapterToAdd: Chapter = {
      id: newId,
      number: newChapter.number || null,
      name: newChapter.name,
      director_id: 'temp-director-id',
      director_name: null,
      director_email: newChapter.director_email || null,
      users_count: 0
    }
    
    setChapters(prev => [...prev, chapterToAdd])
    setShowCreateModal(false)
    setNewChapter({ number: '', name: '', director_email: '' })
  }

  const resetCreateForm = () => {
    setNewChapter({ number: '', name: '', director_email: '' })
    setShowCreateModal(false)
  }

  const getCurrentUser = async (): Promise<CurrentUser | null> => {
    try {
      const res = await fetch('/api/getCurrentUser')
      if (!res.ok) return null
      const data = await res.json()
      return data as CurrentUser
    } catch (e) {
      console.error('Error fetching current user:', e)
      return null
    }
  }

  // load data (chapters + users) — run only after permission check passes
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔥 STAFF: Fetching chapters from API...')
      const chaptersResponse = await fetch('/api/fetchChapters')
      console.log('🔥 STAFF: Chapters response status:', chaptersResponse.status)
      if (!chaptersResponse.ok) {
        const errorData = await chaptersResponse.json()
        throw new Error(errorData.error || 'Failed to fetch chapters')
      }
      const chaptersData = await chaptersResponse.json()
      console.log('🔥 STAFF: Raw chapters data:', chaptersData)

      interface ApiChapter {
        chapter_id: string
        chapter_number: number
        school: string
        director_id: string
      }
      const transformedChapters: Chapter[] = (chaptersData.chaptersData || []).map((chapter: ApiChapter) => ({
        id: chapter.chapter_id,
        number: chapter.chapter_number?.toString() || null,
        name: chapter.school || 'Unknown School',
        director_email: null,
        users_count: null
      }))
      console.log('🔥 STAFF: Transformed chapters:', transformedChapters)
      setChapters(transformedChapters)

      console.log('🔥 STAFF: Fetching users from API...')
      const usersResponse = await fetch('/api/fetchUsers')
      console.log('🔥 STAFF: Users response status:', usersResponse.status)
      if (!usersResponse.ok) {
        const errorData = await usersResponse.json()
        console.error('🔥 STAFF: Failed to fetch users:', errorData)
        setUsers([])
        setFilteredUsers([])
      } else {
        const usersData = await usersResponse.json()
        console.log('🔥 STAFF: Raw users data:', usersData)
        interface ApiUser {
          id: string
          full_name: string
          chapter_id: string
          chapter_number: number
          school: string
          director_id: string
          director_name?: string | null
          director_email?: string | null
          official: boolean
          rejected: boolean
          member_count?: number
        }
        
        // Filter and transform chapters - exclude non-official and rejected chapters
        const rawChapters = chaptersData.chaptersData || []
        const validChapters = rawChapters.filter((chapter: ApiChapter) => 
          chapter.official === true && chapter.rejected === false
        )
        
        const transformedChapters: Chapter[] = validChapters.map((chapter: ApiChapter) => ({
          id: chapter.chapter_id, // ✅ Use actual chapter_id
          number: chapter.chapter_number?.toString() || null,
          name: chapter.school || 'Unknown School',
          director_id: chapter.director_id,
          director_name: chapter.director_name || null,
          director_email: chapter.director_email || null,
          users_count: chapter.member_count || 0
        }))
        
        console.log('🔥 STAFF: Total chapters from API:', rawChapters.length)
        console.log('🔥 STAFF: Valid chapters (official & not rejected):', validChapters.length)
        console.log('🔥 STAFF: Transformed chapters:', transformedChapters)
        
        setChapters(transformedChapters)
        
        // Fetch users from the API
        console.log('🔥 STAFF: Fetching users from API...')
        const usersResponse = await fetch('/api/fetchUsers')
        console.log('🔥 STAFF: Users response status:', usersResponse.status)
        
        if (!usersResponse.ok) {
          const errorData = await usersResponse.json()
          console.error('🔥 STAFF: Failed to fetch users:', errorData)
          // Set empty users array if fetch fails
          setUsers([])
          setFilteredUsers([])
        } else {
          const usersData = await usersResponse.json()
          console.log('🔥 STAFF: Raw users data:', usersData)
          
          // Transform users data to match our User interface
          interface ApiUser {
            id: string
            full_name: string
            chapter_id: string
            email: string
            user_type: string
            rank?: string
            induction_status?: string
            in_good_standing: boolean
            points: number
            minutes: number
            seconds: number
            grad_year?: number
            grad_month?: string
          }
        })
        
        console.log('🔥 STAFF: Transformed users:', transformedUsers)
        setUsers(transformedUsers)
        setFilteredUsers(transformedUsers)
      }
    } catch (e) {
      console.error('🔥 STAFF: Error loading data:', e)
      const msg = e instanceof Error ? e.message : 'Failed to load data'
      setError(msg)
    } finally {
      setLoading(false)
      console.log('🔥 STAFF: Loading finished')
    }
  }

  useEffect(() => {
    // init: check current user first, redirect if Associate, otherwise load data
    async function init() {
      setCheckingUser(true)
      const current = await getCurrentUser()
      setCheckingUser(false)

      if (!current) {
        // not signed in -> send to login
        router.replace('/login')
        return
      }

      const userType = current.user_type;
      if (userType === 'Associate' || userType === "Nominee for Induction" || userType === "Alum" || userType === "Officer" || userType === "Vice President" || userType === "Member" || userType === "President" || userType === "Chapter Director") {
        router.replace('/restricted')
        return
      }

      // allowed -> load data
      await loadData()
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update filtered users when filters change
  useEffect(() => {
    if (users.length > 0) {
      let filtered = [...users]

      // Apply filters
      if (chapterFilter) {
        filtered = filtered.filter(u => 
          u.chapter_number === chapterFilter || 
          u.chapter_id === chapterFilter ||
          u.chapter_name.toLowerCase().includes(chapterFilter.toLowerCase())
        )
      }
      if (positionFilter) {
        filtered = filtered.filter(u => u.position === positionFilter)
      }
      if (rankFilter) {
        filtered = filtered.filter(u => u.rank === rankFilter)
      }
      if (graduationFilter) {
        if (graduationFilter === 'graduating') {
          filtered = filtered.filter(u => u.graduating_this_year)
        } else if (graduationFilter === 'not_graduating') {
          filtered = filtered.filter(u => !u.graduating_this_year)
        }
      }
      if (gradYearFilter) {
        if (gradYearFilter === 'alum') {
          const currentYear = new Date().getFullYear()
          filtered = filtered.filter(u => u.grad_year && u.grad_year < currentYear)
        } else {
          filtered = filtered.filter(u => u.grad_year === parseInt(gradYearFilter))
        }
      }
      if (inductionFilter) {
        filtered = filtered.filter(u => {
          const userStatus = (u.induction_status || '').toLowerCase().trim()
          const filterStatus = inductionFilter.toLowerCase().trim()
          if (filterStatus === 'not met') {
            return userStatus === 'not met' || userStatus === 'not_met' || userStatus === 'notmet'
          }
          if (filterStatus === 'overridden') {
            return userStatus === 'overridden' || userStatus === 'overriden' || userStatus === 'override'
          }
          return userStatus === filterStatus
        })
      }

      // Apply sorting
      if (sortBy) {
        filtered.sort((a, b) => {
          let aVal: string | number = ''
          let bVal: string | number = ''

          switch (sortBy) {
            case 'name':
              aVal = a.full_name
              bVal = b.full_name
              break
            case 'chapter':
              aVal = a.chapter_name
              bVal = b.chapter_name
              break
            case 'position':
              aVal = a.position
              bVal = b.position
              break
            case 'rank':
              const rankOrder = {
                'Laureate of the Society': 1,
                'Member Summa Honore': 2,
                'Member Magna Honore': 3,
                'Member Cum Honore': 4,
                'Member First Class': 5,
                'Member': 6,
                '': 999
              }
              aVal = rankOrder[a.rank as keyof typeof rankOrder] || 999
              bVal = rankOrder[b.rank as keyof typeof rankOrder] || 999
              break
            case 'grad_year':
              aVal = a.grad_year || 0
              bVal = b.grad_year || 0
              break
            default:
              return 0
          }

          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const result = aVal.localeCompare(bVal)
            return sortOrder === 'asc' ? result : -result
          }
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
          }
          return 0
        })
      }

      setFilteredUsers(filtered)
    }
  }, [users, chapterFilter, positionFilter, rankFilter, graduationFilter, gradYearFilter, inductionFilter, sortBy, sortOrder])

  if (checkingUser) {
    return (
      <div>
        <NavBar />
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-gray-600">Checking permissions…</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <NavBar />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Staff Interface</h1>
          <div className="flex gap-3">
            <button
              className="rounded-md bg-[#520392] text-white px-4 py-2 text-sm font-medium hover:bg-[#5f17a0] disabled:opacity-50"
              onClick={handleDownloadCSV}
              disabled={loading || (currentView === 'chapters' ? chapters.length === 0 : filteredUsers.length === 0)}
              title={currentView === 'chapters' ? (chapters.length ? 'Download chapters as CSV' : 'No data to download') : (filteredUsers.length ? 'Download users as CSV' : 'No data to download')}
            >
              Download CSV
            </button>
            <button
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              onClick={() => setShowCreateModal(true)}
            >
              Create Chapter
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'chapters'
                  ? 'border-[#520392] text-[#520392]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setCurrentView('chapters')}
            >
              Chapters ({chapters.length})
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'users'
                  ? 'border-[#520392] text-[#520392]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setCurrentView('users')}
            >
              All Users ({users.length})
            </button>
          </nav>
        </div>

        {/* Filters for Users View */}
        {currentView === 'users' && !loading && !error && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Filters</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Chapter</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#520392] focus:ring-[#520392] text-sm"
                  value={chapterFilter}
                  onChange={(e) => setChapterFilter(e.target.value)}
                >
                  <option value="">All Chapters</option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.number || chapter.id}>
                      {chapter.number ? `${chapter.number} - ${chapter.name}` : chapter.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#520392] focus:ring-[#520392] text-sm"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option value="">All Positions</option>
                  {Array.from(new Set(users.map(u => u.position))).sort().map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rank</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#520392] focus:ring-[#520392] text-sm"
                  value={rankFilter}
                  onChange={(e) => setRankFilter(e.target.value)}
                >
                  <option value="">All Ranks</option>
                  <option value="Laureate of the Society">Laureate of the Society</option>
                  <option value="Member Summa Honore">Member Summa Honore</option>
                  <option value="Member Magna Honore">Member Magna Honore</option>
                  <option value="Member Cum Honore">Member Cum Honore</option>
                  <option value="Member First Class">Member First Class</option>
                  <option value="Member">Member</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Graduation</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#520392] focus:ring-[#520392] text-sm"
                  value={graduationFilter}
                  onChange={(e) => setGraduationFilter(e.target.value)}
                >
                  <option value="">All Students</option>
                  <option value="graduating">Graduating This Year</option>
                  <option value="not_graduating">Not Graduating</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Grad Year</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#520392] focus:ring-[#520392] text-sm"
                  value={gradYearFilter}
                  onChange={(e) => setGradYearFilter(e.target.value)}
                >
                  <option value="">All Years</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="alum">Alumni (Pre-2025)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Induction Status</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#520392] focus:ring-[#520392] text-sm"
                  value={inductionFilter}
                  onChange={(e) => setInductionFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Met">Met</option>
                  <option value="not met">Not Met</option>
                  <option value="overriden">Overridden</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">Sort by:</label>
                <select
                  className="rounded-md border-gray-300 shadow-sm focus:border-[#520392] focus:ring-[#520392] text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="name">Name</option>
                  <option value="chapter">Chapter</option>
                  <option value="position">Position</option>
                  <option value="rank">Rank</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">Order:</label>
                <select
                  className="rounded-md border-gray-300 shadow-sm focus:border-[#520392] focus:ring-[#520392] text-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                >
                  <option value="asc">A-Z</option>
                  <option value="desc">Z-A</option>
                </select>
              </div>
              
              <button
                className="text-sm text-[#520392] hover:text-[#5f17a0] font-medium"
                onClick={() => {
                  setChapterFilter('')
                  setPositionFilter('')
                  setRankFilter('')
                  setGraduationFilter('')
                  setGradYearFilter('')
                  setInductionFilter('')
                  setSortBy('')
                  setSortOrder('asc')
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-6 text-gray-600">Loading data…</div>
        )}
        {error && (
          <div className="mt-6 text-red-600">{error}</div>
        )}

        {!loading && !error && currentView === 'chapters' && (
          <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
              <div className="col-span-2">Chapter #</div>
              <div className="col-span-4">Chapter name</div>
              <div className="col-span-3">Chapter director</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Members</div>
            </div>
            <ul className="divide-y divide-gray-200">
              {chapters.map((c) => (
                <li key={c.id}>
                  <button
                    className="grid w-full grid-cols-12 items-center px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`/chapters/${c.id}`)}
                  >
                    <div className="col-span-2 font-medium">{c.number ?? '-'}</div>
                    <div className="col-span-4">{c.name}</div>
                    <div className="col-span-3 text-sm text-gray-600">{c.director_name ?? c.director_email ?? '-'}</div>
                    <div className="col-span-2 flex items-center gap-2 text-sm">
                      {c.status === 'In Good Standing' && (
                        <>
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-green-700">In Good Standing</span>
                        </>
                      )}
                      {c.status === 'On Probation' && (
                        <>
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-700">On Probation</span>
                        </>
                      )}
                      {c.status === 'Status Revoked' && (
                        <>
                          <ShieldOff className="h-4 w-4 text-red-600" />
                          <span className="text-red-700">Status Revoked</span>
                        </>
                      )}
                      {!c.status && (
                        <span className="text-gray-500">Unknown</span>
                      )}
                    </div>
                    <div className="col-span-1 text-right">{c.users_count ?? 0}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && !error && currentView === 'users' && (
          <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
            <div className="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2">Name</div>
                <div className="col-span-2">Chapter</div>
                <div className="col-span-2">Position</div>
                <div className="col-span-1">Rank</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-2">Induction Status</div>
                <div className="col-span-1">Graduating</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No users found matching the current filters.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2 font-medium text-sm">{user.full_name}</div>
                      <div className="col-span-2 text-sm text-gray-600">{user.chapter_number} - {user.chapter_name}</div>
                      <div className="col-span-2 text-sm">{user.position}</div>
                      <div className="col-span-1 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.rank === 'Officer' ? 'bg-purple-100 text-purple-800' :
                          user.rank === 'Member' ? 'bg-green-100 text-green-800' :
                          user.rank === 'Nominee' ? 'bg-yellow-100 text-yellow-800' :
                          'bg_gray-100 text-gray-800'
                        }`}>
                          {user.rank || 'N/A'}
                        </span>
                      </div>
                      <div className="col-span-1 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.user_type === 'chapter_director' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.user_type === 'chapter_director' ? 'Director' : 'Student'}
                        </span>
                      </div>
                      <div className="col-span-2 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.induction_status === 'Inducted' ? 'bg-green-100 text-green-800' :
                          user.induction_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          user.induction_status === 'Nominated' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.induction_status}
                        </span>
                      </div>
                      <div className="col-span-1 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.graduating_this_year ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.graduating_this_year ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="col-span-1 text-sm">
                        <button
                          className="text-[#520392] hover:text-[#5f17a0] font-medium"
                          onClick={() => router.push(`/users/${user.id}`)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {user.email}
                    </div>
                  </div>
                ))
              )}
            </div>
            {filteredUsers.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Chapter Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Chapter</h2>
              <p className="text-sm text-gray-600 mt-1">Add a new chapter to the Honor Society</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Number
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#520392] focus:border-[#520392]"
                  placeholder="e.g., 104"
                  value={newChapter.number}
                  onChange={(e) => setNewChapter(prev => ({ ...prev, number: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#520392] focus:border-[#520392]"
                  placeholder="e.g., American School of Dubai"
                  value={newChapter.name}
                  onChange={(e) => setNewChapter(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Director Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#520392] focus:border-[#520392]"
                  placeholder="director@school.edu"
                  value={newChapter.director_email}
                  onChange={(e) => setNewChapter(prev => ({ ...prev, director_email: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={resetCreateForm}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChapter}
                disabled={!newChapter.name.trim()}
                className="px-4 py-2 text-sm bg-[#520392] text-white rounded-md hover:bg-[#5f17a0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Chapter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

