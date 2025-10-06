'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  full_name: string
  email: string
}

interface MinutesFilmProducedModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (selectedUserIds: string[], minutes: number, seconds: number, goodEffort: boolean, crewMin: boolean, screened: boolean, description: string) => void
  users: User[]
}

export function MinutesFilmProducedModal({ isOpen, onClose, onSave, users }: MinutesFilmProducedModalProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [modType, setModType] = useState<'add' | 'subtract' | ''>('')
  const [goodEffort, setGoodEffort] = useState(false)
  const [crewMin, setCrewMin] = useState(false)
  const [screened, setScreened] = useState(false)
  const [description, setDescription] = useState('')

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

  const handleSave = () => {
    if (!selectedMembers.length) {
      toast.error("Please select at least one member");
      return;
    }

    if (!minutes && !seconds) {
      toast.error("Please enter minutes or seconds");
      return;
    }

    if (!modType) {
      toast.error("Please select add or subtract");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (modType === 'add' && (!goodEffort || !crewMin || !screened)) {
      toast.error("All film requirements must be satisfied when adding film time");
      return;
    }
    // Apply sign based on modType
    const finalMinutes = modType === 'subtract' ? -minutes : minutes
    const finalSeconds = modType === 'subtract' ? -seconds : seconds
    onSave(selectedMembers, finalMinutes, finalSeconds, goodEffort, crewMin, screened, description)
  }

  useEffect(() => {
    if (modType === 'subtract') {
      setGoodEffort(false)
      setCrewMin(false)
      setScreened(false)
    }
  }, [modType])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 border-2 border-gray-400 shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header with X button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Modify Minutes of Film Produced</h2>
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
            <label className="w-32 text-sm font-medium text-gray-700 mt-2">Member(s)</label>
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
            <label className="w-32 text-sm font-medium text-gray-700">Modification</label>
            <div className="flex-1 ml-4 flex gap-2">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
                value={modType}
                onChange={(e) => {
                  const value = e.target.value as 'add' | 'subtract' | ''
                  setModType(value)
                }}>
                <option value="">Type</option>
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Minutes"
                  min="0"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={minutes || ''}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    setMinutes(Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0)
                  }}
                />
                <span className="text-sm text-gray-500">min</span>
                <input
                  type="number"
                  placeholder="Seconds"
                  min="0"
                  max="59"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={seconds || ''}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    setSeconds(Number.isFinite(n) && n >= 0 && n <= 59 ? Math.floor(n) : 0)
                  }}
                />
                <span className="text-sm text-gray-500">sec</span>
              </div>
            </div>
          </div>

          {/* Boolean Modifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">Film Requirements</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="goodEffort"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={goodEffort}
                  disabled={modType === 'subtract'}
                  onChange={() => setGoodEffort(!goodEffort)}
                />
                <label htmlFor="goodEffort" className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-medium">Good Effort:</span> Is the film of reasonably good effort?
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="crewMin"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={crewMin}
                  disabled={modType === 'subtract'}
                  onChange={() => setCrewMin(!crewMin)}
                />
                <label htmlFor="crewMin" className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-medium">Crew & Cast:</span> Was this film produced with a crew of two or more people and, if it is live action, a cast of at least one non-crew member?
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="screened"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={screened}
                  disabled={modType === 'subtract'}
                  onChange={() => setScreened(!screened)}
                />
                <label htmlFor="screened" className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-medium">Chapter Screening:</span> Was this film or will this film be screened by the Chapter?
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="space-y-4 mt-6">
          <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">Description</h3>
          
          <div className="space-y-3">
            <textarea
              placeholder="Enter description..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}