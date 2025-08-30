'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'

interface User {
  id: string
  full_name: string
  email: string
}

interface PointsModificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (selectedUserIds: string[], modification: number, description: string) => void
  users: User[]
}

export function PointsModificationModal({ isOpen, onClose, onSave, users }: PointsModificationModalProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [modification, setModification] = useState(0)
  const [modType, setModType] = useState<'add' | 'subtract' | ''>('')
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 border-2 border-gray-400 shadow-lg">
        {/* Header with X button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Modify Points</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Member(s) row */}
          <div className="flex items-start">
            <label className="w-24 text-sm font-medium text-gray-700 mt-2">Member(s)</label>
            <div className="flex-1 ml-4 relative">
              <button
                type="button"
                onClick={toggleDropdown}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white"
              >
                {selectedMembers.length === 0 ? (
                  <span className="text-gray-500">Select member(s)</span>
                ) : selectedMembers.length === users.length ? (
                  <span>All Members ({users.length})</span>
                ) : (
                  <span>{selectedMembers.length} member(s) selected</span>
                )}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.length === users.length}
                        onChange={() => {
                          if (selectedMembers.length === users.length) {
                            setSelectedMembers([])
                          } else {
                            setSelectedMembers(users.map(u => u.id))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="font-medium">All Members</span>
                    </label>
                    <div className="border-t border-gray-200 my-1"></div>
                    {users.map((user) => (
                      <label key={user.id} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(user.id)}
                          onChange={() => toggleMember(user.id)}
                          className="mr-2"
                        />
                        <span>{user.full_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modification row */}
          <div className="flex items-center">
            <label className="w-24 text-sm font-medium text-gray-700">Modification</label>
            <div className="flex-1 ml-4 flex gap-2">
              <select 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
              onChange={(e) => {
                const value = e.target.value as 'add' | 'subtract' | ''
                setModType(value)
                // Flip the sign of the current non-zero modification when type changes
                if (modification !== 0) {
                  const absVal = Math.abs(modification)
                  setModification(value === 'subtract' ? -absVal : absVal)
                }
              }}>
                <option value="">Type</option>
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
              </select>
              <input
                type="number"
                placeholder="Number of points"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  const n = Number(e.target.value)
                  if (!Number.isFinite(n)) {
                    setModification(0)
                    return
                  }
                  const absVal = Math.abs(n)
                  const signed = modType === 'subtract' ? -absVal : absVal
                  setModification(signed)
                }}
              />
            </div>
          </div>

          {/* Description row */}
          <div className="flex items-start">
            <label className="w-24 text-sm font-medium text-gray-700 mt-2">Description</label>
            <textarea
              placeholder="Enter description..."
              rows={3}
              className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => onSave(selectedMembers, modification, description)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
