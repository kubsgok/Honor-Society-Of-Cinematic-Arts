"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavBar } from '../components/NavBar'
import jsPDF from 'jspdf'

type Member = {
  id: string
  full_name: string | null
  email: string | null
  rank: string | null
  induction_status: string | null
  user_type: string | null
  grad_month: string | null
  grad_year: number | null
}

type Chapter = {
  id: string
  number: string
  name: string
  director_email: string
}

type InvoiceData = {
  chapter_fee: number
  member_fee: number
  returning_members: Member[]
  new_inductees: Member[]
  graduating_members: Member[]
  total_members: number
  total_amount: number
}

export default function BillingPage() {
  const router = useRouter() // added
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [checkingUser, setCheckingUser] = useState(true) // NEW

  const CHAPTER_FEE = 150
  const MEMBER_FEE = 25

  const categorizeMembers = (members: Member[]) => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    
    const returning: Member[] = []
    const newInductees: Member[] = []
    const graduating: Member[] = []

    members.forEach(member => {
      // New inductees: recently inducted (induction_status = 'Inducted' and no rank yet)
      if (member.induction_status === 'Inducted' && !member.rank) {
        newInductees.push(member)
      }
      // Graduating: grad_year matches current year and grad_month is current or past
      else if (member.grad_year === currentYear && member.grad_month) {
        const gradMonth = getMonthNumber(member.grad_month)
        if (gradMonth <= currentMonth) {
          graduating.push(member)
        } else {
          returning.push(member)
        }
      }
      // Everyone else is returning
      else {
        returning.push(member)
      }
    })

    return { returning, newInductees, graduating }
  }

  const getMonthNumber = (monthName: string): number => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December']
    return months.indexOf(monthName) + 1
  }

  const calculateInvoice = (): InvoiceData => {
    const { returning, newInductees, graduating } = categorizeMembers(members)
    const totalMembers = returning.length + newInductees.length + graduating.length
    const totalAmount = CHAPTER_FEE + (totalMembers * MEMBER_FEE)

    return {
      chapter_fee: CHAPTER_FEE,
      member_fee: MEMBER_FEE,
      returning_members: returning,
      new_inductees: newInductees,
      graduating_members: graduating,
      total_members: totalMembers,
      total_amount: totalAmount
    }
  }

  const generatePDFInvoice = async () => {
    const invoice = calculateInvoice()
    const invoiceNumber = `HSCA-${Date.now()}`
    
    // Create new PDF document
    const pdf = new jsPDF()
    
    // Header
    pdf.setFontSize(20)
    pdf.text('Honor Society of Cinematic Arts', 20, 30)
    pdf.setFontSize(14)
    pdf.text('Invoice', 20, 45)
    
    // Invoice details
    pdf.setFontSize(12)
    pdf.text(`Invoice Number: ${invoiceNumber}`, 20, 65)
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 75)
    pdf.text(`Chapter: ${chapter?.name || 'N/A'}`, 20, 85)
    
    // Billing breakdown
    pdf.setFontSize(14)
    pdf.text('Billing Breakdown', 20, 105)
    
    pdf.setFontSize(12)
    pdf.text(`Chapter Base Fee: $${invoice.chapter_fee.toFixed(2)}`, 30, 120)
    pdf.text(`Total Members: ${invoice.total_members}`, 30, 130)
    pdf.text(`Per Member Fee ($${invoice.member_fee.toFixed(2)}): $${(invoice.total_members * invoice.member_fee).toFixed(2)}`, 30, 140)
    
    // Member categories
    let yPos = 160
    pdf.setFontSize(14)
    pdf.text('Member Details', 20, yPos)
    yPos += 15
    
    pdf.setFontSize(10)
    if (invoice.returning_members.length > 0) {
      pdf.text(`Returning Members (${invoice.returning_members.length}):`, 30, yPos)
      yPos += 10
      invoice.returning_members.forEach((member: Member) => {
        pdf.text(`• ${member.full_name} - ${member.email}`, 35, yPos)
        yPos += 8
      })
      yPos += 5
    }
    
    if (invoice.new_inductees.length > 0) {
      pdf.text(`New Inductees (${invoice.new_inductees.length}):`, 30, yPos)
      yPos += 10
      invoice.new_inductees.forEach((member: Member) => {
        pdf.text(`• ${member.full_name} - ${member.email}`, 35, yPos)
        yPos += 8
      })
      yPos += 5
    }
    
    if (invoice.graduating_members.length > 0) {
      pdf.text(`Graduating Members (${invoice.graduating_members.length}):`, 30, yPos)
      yPos += 10
      invoice.graduating_members.forEach((member: Member) => {
        pdf.text(`• ${member.full_name} - ${member.email}`, 35, yPos)
        yPos += 8
      })
    }
    
    // Total
    pdf.setFontSize(14)
    pdf.text(`Total Amount Due: $${invoice.total_amount.toFixed(2)}`, 20, yPos + 25)
    
    // Payment instructions
    pdf.setFontSize(12)
    pdf.text('Payment Instructions:', 20, yPos + 45)
    pdf.setFontSize(10)
    pdf.text('Please remit payment to:', 30, yPos + 55)
    pdf.text('Honor Society of Cinematic Arts', 30, yPos + 65)
    pdf.text('[Banking Details TBD]', 30, yPos + 75)
    pdf.text('Payment Due: 30 days from invoice date', 30, yPos + 85)
    
    // Save PDF
    pdf.save(`HSCA-Invoice-${chapter?.name || 'Chapter'}-${Date.now()}.pdf`)
    
    // Log invoice to database
    try {
      const response = await fetch('/api/logInvoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber,
          chapterName: chapter?.name || 'N/A',
          amount: invoice.total_amount,
          memberCount: invoice.total_members,
          members: members.map(m => ({ id: m.id, name: m.full_name, email: m.email }))
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to log invoice')
      }
      
      console.log('Invoice logged successfully')
    } catch (error) {
      console.error('Error logging invoice:', error)
    }
  }

  const getCurrentUser = async (): Promise<{ user_type?: string } | null> => {
    try {
      const res = await fetch('/api/getCurrentUser')
      if (!res.ok) return null
      const data = await res.json()
      return data
    } catch (e) {
      console.error('Error fetching current user:', e)
      return null
    }
  }

  useEffect(() => {
    // init: check role first, then load billing data only if allowed
    async function init() {
      setCheckingUser(true)
      const current = await getCurrentUser()
      setCheckingUser(false)

      if (!current) {
        // Not signed in -> redirect to login
        router.replace('/login')
        return
      }
      const userType = current.user_type;
      if (userType === 'Associate' || userType === "Nominee for Induction" || userType === "Alum" || userType === "Officer" || userType === "Vice President" || userType === "Member" || userType === "President") {
        router.replace('/restricted')
        return
      }

      // allowed -> load billing data
      setLoading(true)
      try {
        // TODO: Replace with actual API calls to get current user's chapter and members
        // Mock data for now
        setChapter({
          id: '1',
          number: '101',
          name: 'Singapore American School',
          director_email: 'director@sas.edu'
        })

        setMembers([
          { id: '1', full_name: 'John Smith', email: 'john@sas.edu', rank: 'Member', induction_status: 'Inducted', user_type: 'Student', grad_month: 'June', grad_year: 2025 },
          { id: '2', full_name: 'Jane Doe', email: 'jane@sas.edu', rank: null, induction_status: 'Inducted', user_type: 'Student', grad_month: 'May', grad_year: 2026 },
          { id: '3', full_name: 'Bob Wilson', email: 'bob@sas.edu', rank: 'Officer', induction_status: 'Inducted', user_type: 'Officer', grad_month: 'December', grad_year: 2025 },
        ])
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load billing data'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (checkingUser) {
    return (
      <div>
        <NavBar />
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold mb-6">Billing</h1>
          <p className="text-gray-600">Checking permissions…</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <NavBar />
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold mb-6">Billing</h1>
          <p className="text-gray-600">Loading billing information…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <NavBar />
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold mb-6">Billing</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  const invoiceData = calculateInvoice()

  return (
    <div>
      <NavBar />
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Billing</h1>
          <div className="text-sm text-gray-600">
            Chapter {chapter?.number} - {chapter?.name}
          </div>
        </div>

        <div className="space-y-6">
          {/* Cost Summary */}
          <div className="rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Invoice Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Chapter Fee</span>
                <span>${invoiceData.chapter_fee}</span>
              </div>
              <div className="flex justify-between">
                <span>Member Fees ({invoiceData.total_members} × ${invoiceData.member_fee})</span>
                <span>${invoiceData.total_members * invoiceData.member_fee}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>${invoiceData.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Member Lists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Returning Members */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-3">Returning Members ({invoiceData.returning_members.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {invoiceData.returning_members.map(member => (
                  <div key={member.id} className="text-sm">
                    <div className="font-medium">{member.full_name}</div>
                    <div className="text-gray-600">Rank: {member.rank || 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Inductees */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-3">New Inductees ({invoiceData.new_inductees.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {invoiceData.new_inductees.map(member => (
                  <div key={member.id} className="text-sm">
                    <div className="font-medium">{member.full_name}</div>
                    <div className="text-gray-600">Status: {member.induction_status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Graduating Members */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-3">Graduating Members ({invoiceData.graduating_members.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {invoiceData.graduating_members.map(member => (
                  <div key={member.id} className="text-sm">
                    <div className="font-medium">{member.full_name}</div>
                    <div className="text-gray-600">{member.grad_month} {member.grad_year}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="confirm" className="text-sm">
                I confirm that the member lists above are accurate and complete. This includes all returning members, 
                new inductees, and graduating members in my chapter with their correct ranks and statuses.
              </label>
            </div>
          </div>

          {/* Generate Invoice Button */}
                    {/* Generate Invoice Button */}
          <button
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            onClick={async () => {
              setGenerating(true)
              try {
                await generatePDFInvoice()
              } catch (error) {
                console.error('Error generating invoice:', error)
              } finally {
                setGenerating(false)
              }
            }}
            disabled={generating}
          >
            {generating ? 'Generating Invoice...' : 'Generate Invoice'}
          </button>

          {/* Payment Instructions */}
          <div className="rounded-lg border border-gray-200 p-6 bg-gray-50">
            <h3 className="font-semibold mb-3">Payment Instructions</h3>
            <div className="text-sm space-y-2">
              <p>After generating your invoice, please make payment via bank transfer to:</p>
              <div className="bg-white p-3 rounded border">
                <p><strong>Bank:</strong> [BANK NAME - TBD]</p>
                <p><strong>Account Name:</strong> [ACCOUNT NAME - TBD]</p>
                <p><strong>Account Number:</strong> [ACCOUNT NUMBER - TBD]</p>
                <p><strong>Routing/SWIFT:</strong> [ROUTING CODE - TBD]</p>
              </div>
              <p className="text-red-600 font-medium">
                Important: Quote your Chapter Number ({chapter?.number}) in the transfer reference and 
                pay all bank fees associated with sending the money.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}