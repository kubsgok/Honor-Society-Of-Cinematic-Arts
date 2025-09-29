'use client'

import { useState, useEffect } from 'react'
import { NavBar } from '../components/NavBar'
import { Mail, Calendar, CheckCircle, X } from 'lucide-react'

interface PendingUser {
  id: string
  full_name: string
  email: string
  requested_chapter: string
  chapter_id: string
  user_type: 'student' | 'staff'
  grad_year: number
  grad_month: string
  submitted_at: Date
  status: 'pending' | 'approved' | 'rejected'
}

export default function InboxPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for pending user approvals
    const mockPendingUsers: PendingUser[] = [
      {
        id: '1',
        full_name: 'Sarah Mitchell',
        email: 'sarah.mitchell@sas.edu',
        requested_chapter: 'Singapore American School',
        chapter_id: '1',
        user_type: 'student',
        grad_year: 2026,
        grad_month: 'June',
        submitted_at: new Date('2025-09-28T14:30:00'),
        status: 'pending'
      },
      {
        id: '2',
        full_name: 'Marcus Thompson',
        email: 'marcus.t@isb.ac.th',
        requested_chapter: 'International School Bangkok',
        chapter_id: '2',
        user_type: 'student',
        grad_year: 2025,
        grad_month: 'May',
        submitted_at: new Date('2025-09-27T09:15:00'),
        status: 'pending'
      },
      {
        id: '3',
        full_name: 'Emma Rodriguez',
        email: 'emma.rodriguez@tas.edu.tw',
        requested_chapter: 'Taipei American School',
        chapter_id: '3',
        user_type: 'student',
        grad_year: 2026,
        grad_month: 'June',
        submitted_at: new Date('2025-09-26T16:45:00'),
        status: 'pending'
      },
      {
        id: '4',
        full_name: 'Alex Chen',
        email: 'alex.chen@sas.edu',
        requested_chapter: 'Singapore American School',
        chapter_id: '1',
        user_type: 'student',
        grad_year: 2025,
        grad_month: 'December',
        submitted_at: new Date('2025-09-25T11:20:00'),
        status: 'pending'
      },
      {
        id: '5',
        full_name: 'Jessica Park',
        email: 'j.park@isb.ac.th',
        requested_chapter: 'International School Bangkok',
        chapter_id: '2',
        user_type: 'student',
        grad_year: 2027,
        grad_month: 'May',
        submitted_at: new Date('2025-09-24T13:10:00'),
        status: 'pending'
      }
    ]

    setPendingUsers(mockPendingUsers)
    setLoading(false)
  }, [])

  const openUserModal = (user: PendingUser) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedUser(null)
    setShowModal(false)
  }

  const approveUser = (userId: string) => {
    setPendingUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'approved' }
          : user
      )
    )
    closeModal()
  }

  const rejectUser = (userId: string) => {
    setPendingUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'rejected' }
          : user
      )
    )
    closeModal()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const pendingApplications = pendingUsers.filter(user => user.status === 'pending')

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Applications</h1>
            <p className="text-gray-600">Review and approve new member applications</p>
          </div>

          {/* Applications List */}
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
                <p>All applications have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApplications.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                          <span className="text-sm text-gray-500">{user.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="font-medium">{user.requested_chapter}</span>
                          <span>{user.grad_month} {user.grad_year}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Applied {formatDate(user.submitted_at)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openUserModal(user)}
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

      {/* Approval Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Review Application</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedUser.full_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Chapter</label>
                  <p className="text-gray-900">{selectedUser.requested_chapter}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Graduation</label>
                  <p className="text-gray-900">{selectedUser.grad_month} {selectedUser.grad_year}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">User Type</label>
                  <p className="text-gray-900 capitalize">{selectedUser.user_type}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Applied On</label>
                  <p className="text-gray-900">{formatDate(selectedUser.submitted_at)}</p>
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
                onClick={() => rejectUser(selectedUser.id)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
              >
                <X size={16} />
                Reject
              </button>
              <button
                onClick={() => approveUser(selectedUser.id)}
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
