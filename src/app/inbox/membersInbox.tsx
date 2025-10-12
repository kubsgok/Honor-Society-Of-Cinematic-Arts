'use client'

import { useState, useEffect } from 'react'
import { NavBar } from '../components/NavBar'
import { Mail, Calendar, CheckCircle, X } from 'lucide-react'

interface PendingMember {
  id: string
  full_name?: string
  email?: string
  chapter_id?: string
  school?: string
  grad_month?: string
  grad_year?: number
  submitted_at?: Date
  status?: 'pending' | 'approved'
}

export default function MembersInbox() {
  const [members, setMembers] = useState<PendingMember[]>([])
  const [selectedMember, setSelectedMember] = useState<PendingMember | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  async function fetchMembers(): Promise<PendingMember[]> {
    const res = await fetch('/api/fetchUsers')
    const data = await res.json()
    if (!res.ok) throw new Error('Failed to fetch users')
    const list: any[] = Array.isArray(data) ? data : data.users ?? []
    // keep Associate users and map fields
    return list
      .filter(u => u.user_type === 'Associate')
      .map((u: any) => ({
        id: u.id,
        full_name: u.full_name ?? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(),
        email: u.email ?? '',
        chapter_id: u.chapter_id ?? undefined,
        school: u.school ?? u.school_name ?? undefined,
        grad_month: u.grad_month ?? 'N/A',
        grad_year: u.grad_year ?? undefined,
        submitted_at: u.created_at ? new Date(u.created_at) : undefined,
        status: u.approved ? 'approved' : 'pending',
      }))
  }

  async function loadMembers() {
    try {
      setLoading(true)
      const membersRaw = await fetchMembers()
      setMembers(membersRaw)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  const openMemberModal = (m: PendingMember) => {
    setSelectedMember(m)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedMember(null)
    setShowModal(false)
  }

  const approveMember = async (userId: string) => {
    const res = await fetch('/api/updateUser', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, approved: true })
    })
    if (!res.ok) {
      console.error('Failed to approve member')
      return
    }
    closeModal()
    await loadMembers()
  }

  const rejectMember = async (userId: string) => {
    const res = await fetch('/api/updateUser', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, rejected: true })
    })
    if (!res.ok) {
      console.error('Failed to reject member')
      return
    }
    closeModal()
    await loadMembers()
  }

  const formatDate = (dateLike: Date | string | undefined) => {
    if (!dateLike) return 'Submission date not available'
    const d = typeof dateLike === 'string' ? new Date(dateLike) : dateLike
    if (Number.isNaN(d.getTime())) return 'Invalid date'
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const pendingApplications = members.filter(m => m.status === 'pending')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Member Applications</h1>
            <p className="text-gray-600">Review and approve new member (Associate) applications</p>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-semibold text-lg">Pending Applications</h2>
                <p className="text-gray-600 text-sm">
                  {pendingApplications.length} application{pendingApplications.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {pendingApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No pending applications</h3>
                <p>All member applications have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApplications.map((m) => (
                  <div key={m.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{m.full_name}</h3>
                          <span className="text-sm text-gray-600">{m.school ?? ''}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="font-medium">{m.email}</span>
                          {m.chapter_id ? <span className="text-sm text-gray-500">Chapter {m.chapter_id}</span> : null}
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {m.submitted_at ? (
                            <>Applied {formatDate(m.submitted_at)}</>
                          ) : (
                            <>Submission date not available</>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openMemberModal(m)}
                          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                          Review Application
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Review Member Application</h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedMember.full_name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedMember.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">School / Chapter</label>
                  <p className="text-gray-900">{selectedMember.school ?? selectedMember.chapter_id ?? 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Graduation</label>
                  <p className="text-gray-900">{selectedMember.grad_month ?? 'N/A'} {selectedMember.grad_year ?? ''}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Applied On</label>
                  <p className="text-gray-900">{selectedMember.submitted_at ? formatDate(selectedMember.submitted_at) : 'Submission date not available'}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMember(selectedMember.id)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
              >
                <X size={16} />
                Reject
              </button>
              <button
                onClick={() => approveMember(selectedMember.id)}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
              >
                <CheckCircle size={16} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}