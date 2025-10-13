'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface User {
  id: string
  full_name: string
  email: string
}

interface PositionModificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (position: string, memberId?: string | null) => void
  users: User[]
}

export function PositionModificationModal({
  isOpen,
  onClose,
  onSave,
  users,
}: PositionModificationModalProps) {
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<string>('')
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // reset selection when modal opens
      setSelectedMember(users?.[0]?.id ?? '')
      setSelectedPosition('')
      setIsMemberDropdownOpen(false)
      setIsPositionDropdownOpen(false)
    }
  }, [isOpen, users])

  if (!isOpen) return null

  const toggleMember = (userId: string) => {
    // single-select: select that member, or clear if clicking same
    setSelectedMember(prev => (prev === userId ? '' : userId))
  }

  const toggleDropdown = () => setIsMemberDropdownOpen(s => !s)

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 border-2 border-gray-400 shadow-lg">
        {/* Header with X button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Change Position</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Member row */}
          <div className="flex items-start">
            <label className="w-24 text-sm font-medium text-gray-700 mt-2">Member</label>
            <div className="flex-1 ml-4 relative">
              <button
                type="button"
                onClick={toggleDropdown}
                aria-expanded={isMemberDropdownOpen}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex items-center justify-between"
              >
                <span className={selectedMember ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedMember ? users.find(u => u.id === selectedMember)?.full_name : 'Select a member'}
                </span>
                {/* small triangle / caret that flips when open */}
                <svg
                  className={`h-3 w-3 ml-2 text-gray-500 transform transition-transform ${isMemberDropdownOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </button>

              {isMemberDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    {users.length === 0 ? (
                      <div className="text-sm text-gray-500 p-2">No members available</div>
                    ) : (
                      users.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            toggleMember(user.id)
                            setIsMemberDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${selectedMember === user.id ? 'bg-gray-100' : ''}`}
                        >
                          {user.full_name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Position row (single-select dropdown) */}
          <div className="flex items-start mt-2">
            <label className="w-24 text-sm font-medium text-gray-700 mt-2">Position</label>
            <div className="flex-1 ml-4 relative">
              <button
                type="button"
                onClick={() => setIsPositionDropdownOpen(s => !s)}
                aria-expanded={isPositionDropdownOpen}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex items-center justify-between"
              >
                <span className={selectedPosition ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedPosition || 'Select a position'}
                </span>
                <svg
                  className={`h-3 w-3 ml-2 text-gray-500 transform transition-transform ${isPositionDropdownOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </button>

              {isPositionDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  <div className="p-2">
                    {['Member','Officer','Vice President','President'].map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => {
                          setSelectedPosition(pos)
                          setIsPositionDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${selectedPosition === pos ? 'bg-gray-100' : ''}`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => onSave(selectedPosition, selectedMember)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}