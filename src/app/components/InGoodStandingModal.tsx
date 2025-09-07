'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'

interface User {
  id: string
  full_name: string
  email: string
}

interface InGoodStandingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (confirmed: boolean) => void
  user_name: string
}

export function InGoodStandingModal({ isOpen, onClose, onSave, user_name }: InGoodStandingModalProps) {
  const [confirmed, setConfirmed] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 border-2 border-gray-400 shadow-lg">
        {/* Header with X button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Remove a member</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Are you sure you want to remove {user_name} from the chapter?</p>
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
