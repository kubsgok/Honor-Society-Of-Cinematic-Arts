"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/app/components/NavBar'

type Chapter = {
  id: string
  number?: string | null
  name: string
  director_email?: string | null
  users_count?: number | null
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
  grad_year?: number | null
  grad_month?: string | null
  graduating_this_year: boolean
}

export default function StaffInterfacePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
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

  // Helper: build CSV string from chapters
  const toCSV = (rows: Chapter[]) => {
    const headers = ['id', 'chapter_number', 'chapter_name', 'director_email', 'members']
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
          c.director_email ?? '',
          c.users_count ?? 0,
        ].map(escape).join(',')
      ),
    ]
    return lines.join('\r\n')
  }

  // Helper: build CSV string from users
  const usersToCSV = (rows: User[]) => {
    const headers = ['id', 'full_name', 'email', 'chapter_number', 'chapter_name', 'position', 'rank', 'user_type', 'induction_status', 'graduating_this_year']
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

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // TODO: replace with /api/chapters when available
        // Temporary mocked data to build UI
        const mockChapters: Chapter[] = [
          { id: '1', number: '101', name: 'Singapore American School', director_email: 'director@sas.edu', users_count: 142 },
          { id: '2', number: '102', name: 'International School Bangkok', director_email: 'director@isb.ac.th', users_count: 97 },
          { id: '3', number: '103', name: 'Taipei American School', director_email: 'director@tas.edu.tw', users_count: 83 },
        ]
        
        // Mock user data
        const mockUsers: User[] = [
          { id: '1', full_name: 'Alice Johnson', email: 'alice@sas.edu', chapter_id: '1', chapter_name: 'Singapore American School', chapter_number: '101', position: 'President', rank: 'Member', user_type: 'student', induction_status: 'Inducted', grad_year: 2025, grad_month: 'June', graduating_this_year: true },
          { id: '2', full_name: 'Bob Smith', email: 'bob@sas.edu', chapter_id: '1', chapter_name: 'Singapore American School', chapter_number: '101', position: 'Vice President', rank: 'Officer', user_type: 'student', induction_status: 'Inducted', grad_year: 2026, grad_month: 'May', graduating_this_year: false },
          { id: '3', full_name: 'Carol Davis', email: 'carol@isb.ac.th', chapter_id: '2', chapter_name: 'International School Bangkok', chapter_number: '102', position: 'Secretary', rank: 'Member', user_type: 'student', induction_status: 'Pending', grad_year: 2025, grad_month: 'December', graduating_this_year: true },
          { id: '4', full_name: 'David Wilson', email: 'david@tas.edu.tw', chapter_id: '3', chapter_name: 'Taipei American School', chapter_number: '103', position: 'Treasurer', rank: 'Officer', user_type: 'student', induction_status: 'Inducted', grad_year: 2027, grad_month: 'June', graduating_this_year: false },
          { id: '5', full_name: 'Dr. Emily Chen', email: 'director@sas.edu', chapter_id: '1', chapter_name: 'Singapore American School', chapter_number: '101', position: 'Director', rank: null, user_type: 'chapter_director', induction_status: 'N/A', grad_year: null, grad_month: null, graduating_this_year: false },
          { id: '6', full_name: 'Prof. Frank Liu', email: 'director@isb.ac.th', chapter_id: '2', chapter_name: 'International School Bangkok', chapter_number: '102', position: 'Director', rank: null, user_type: 'chapter_director', induction_status: 'N/A', grad_year: null, grad_month: null, graduating_this_year: false },
          { id: '7', full_name: 'Grace Park', email: 'grace@sas.edu', chapter_id: '1', chapter_name: 'Singapore American School', chapter_number: '101', position: 'Member', rank: 'Nominee', user_type: 'student', induction_status: 'Nominated', grad_year: 2026, grad_month: 'May', graduating_this_year: false },
          { id: '8', full_name: 'Henry Kim', email: 'henry@tas.edu.tw', chapter_id: '3', chapter_name: 'Taipei American School', chapter_number: '103', position: 'Member', rank: 'Member', user_type: 'student', induction_status: 'Inducted', grad_year: 2025, grad_month: 'May', graduating_this_year: true }
        ]
        
        setChapters(mockChapters)
        setUsers(mockUsers)
        setFilteredUsers(mockUsers)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load data'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Update filtered users when filters change
  useEffect(() => {
    if (users.length > 0) {
      let filtered = [...users]

      // Apply filters
      if (chapterFilter) {
        filtered = filtered.filter(u => u.chapter_number === chapterFilter)
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
      if (inductionFilter) {
        filtered = filtered.filter(u => u.induction_status === inductionFilter)
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
              aVal = a.rank || ''
              bVal = b.rank || ''
              break
            default:
              return 0
          }

          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const result = aVal.localeCompare(bVal)
            return sortOrder === 'asc' ? result : -result
          }
          return 0
        })
      }

      setFilteredUsers(filtered)
    }
  }, [users, chapterFilter, positionFilter, rankFilter, graduationFilter, inductionFilter, sortBy, sortOrder])

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Chapter</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#520392] focus:ring-[#520392] text-sm"
                  value={chapterFilter}
                  onChange={(e) => setChapterFilter(e.target.value)}
                >
                  <option value="">All Chapters</option>
                  <option value="101">101 - Singapore American School</option>
                  <option value="102">102 - International School Bangkok</option>
                  <option value="103">103 - Taipei American School</option>
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
                  <option value="President">President</option>
                  <option value="Vice President">Vice President</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Member">Member</option>
                  <option value="Director">Director</option>
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
                  <option value="Member">Member</option>
                  <option value="Officer">Officer</option>
                  <option value="Nominee">Nominee</option>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Induction Status</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#520392] focus:ring-[#520392] text-sm"
                  value={inductionFilter}
                  onChange={(e) => setInductionFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Inducted">Inducted</option>
                  <option value="Pending">Pending</option>
                  <option value="Nominated">Nominated</option>
                  <option value="N/A">N/A</option>
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
              <div className="col-span-5">Chapter name</div>
              <div className="col-span-3">Chapter director</div>
              <div className="col-span-2 text-right">Members</div>
            </div>
            <ul className="divide-y divide-gray-200">
              {chapters.map((c) => (
                <li key={c.id}>
                  <button
                    className="grid w-full grid-cols-12 items-center px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`/chapters/${c.id}`)}
                  >
                    <div className="col-span-2 font-medium">{c.number ?? '-'}</div>
                    <div className="col-span-5">{c.name}</div>
                    <div className="col-span-3 text-sm text-gray-600">{c.director_email ?? '-'}</div>
                    <div className="col-span-2 text-right">{c.users_count ?? 0}</div>
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
                          'bg-gray-100 text-gray-800'
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
                        {user.user_type === 'student' ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.graduating_this_year ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.graduating_this_year ? 'Yes' : 'No'}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
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

