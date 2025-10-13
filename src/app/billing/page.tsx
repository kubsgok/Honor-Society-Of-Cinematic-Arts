"use client"

import { useEffect, useState } from 'react'
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
  chapter_id: string | null
  license_paid: boolean
}

type Chapter = {
  chapter_id: string
  chapter_number: number
  school: string
  director_id: string
  director_name?: string
}

type License = {
  id: string
  created_at: string
  chapter_id: string
  chapter_fee: number
  member_fee: number
  nominee_fee: number
  num_licenses: number
  chapter_fee_paid: boolean
  startup_fee: number
  late_fee: number
  license_paid: boolean
}

type InvoiceData = {
  chapter_fee: number
  member_fee: number
  nominee_fee: number
  late_fee: number
  startup_fee: number
  returning_members: Member[]
  new_inductees: Member[]
  graduating_members: Member[]
  nominees: Member[]
  total_members: number
  total_nominees: number
  total_amount: number
  license: License | null
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [license, setLicense] = useState<License | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [generating, setGenerating] = useState(false)

  const categorizeMembers = (members: Member[]) => {
    console.log('=== CATEGORIZE MEMBERS DEBUG ===')
    console.log('Input members:', members.length)
    
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    
    const returning: Member[] = []
    const newInductees: Member[] = []
    const graduating: Member[] = []
    const nominees: Member[] = []

    // Only process members who haven't paid their license
    const unpaidMembers = members.filter(member => !member.license_paid)
    console.log('Unpaid members after filter:', unpaidMembers.length)
    console.log('Current year:', currentYear, 'Current month:', currentMonth)

    unpaidMembers.forEach((member, index) => {
      console.log(`Processing member ${index + 1}:`, {
        name: member.full_name,
        induction_status: member.induction_status,
        user_type: `"${member.user_type}"`, // Quoted to see exact value
        rank: member.rank,
        grad_year: member.grad_year,
        grad_month: member.grad_month
      })
      
      // Nominees: pending induction or nominee status
      if (member.induction_status === 'pending' || 
          member.user_type === 'nominee' || 
          member.user_type === 'Nominee for Induction') {
        console.log(`-> Categorized as NOMINEE (reason: induction_status="${member.induction_status}", user_type="${member.user_type}")`)
        nominees.push(member)
      }
      // New inductees: recently inducted (induction_status = 'Inducted' and no rank yet)
      else if (member.induction_status === 'Inducted' && !member.rank) {
        console.log(`-> Categorized as NEW INDUCTEE`)
        newInductees.push(member)
      }
      // Graduating: grad_year matches current year and grad_month is current or past
      else if (member.grad_year === currentYear && member.grad_month) {
        const gradMonth = getMonthNumber(member.grad_month)
        console.log(`-> Grad year ${member.grad_year} matches current ${currentYear}, grad month ${gradMonth} vs current ${currentMonth}`)
        if (gradMonth <= currentMonth) {
          console.log(`-> Categorized as GRADUATING`)
          graduating.push(member)
        } else {
          console.log(`-> Categorized as RETURNING (grad later)`)
          returning.push(member)
        }
      }
      // Everyone else is returning
      else {
        console.log(`-> Categorized as RETURNING (default)`)
        returning.push(member)
      }
    })

    console.log('Final categorization:')
    console.log('- Returning:', returning.length)
    console.log('- New inductees:', newInductees.length) 
    console.log('- Graduating:', graduating.length)
    console.log('- Nominees:', nominees.length)

    return { returning, newInductees, graduating, nominees }
  }

  const getMonthNumber = (monthName: string): number => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December']
    return months.indexOf(monthName) + 1
  }

  const calculateInvoice = (): InvoiceData => {
    console.log('=== CALCULATE INVOICE DEBUG ===')
    console.log('License data:', license)
    console.log('Members data:', members)
    
    if (!license) {
      console.log('No license found - returning empty invoice')
      // Return empty invoice if no license data
      return {
        chapter_fee: 0,
        member_fee: 0,
        nominee_fee: 0,
        late_fee: 0,
        startup_fee: 0,
        returning_members: [],
        new_inductees: [],
        graduating_members: [],
        nominees: [],
        total_members: 0,
        total_nominees: 0,
        total_amount: 0,
        license: null
      }
    }

    const { returning, newInductees, graduating, nominees } = categorizeMembers(members)
    const totalMembers = returning.length + newInductees.length + graduating.length
    const totalNominees = nominees.length

    console.log('=== MEMBER CATEGORIZATION ===')
    console.log('Returning members:', returning.length, returning.map(m => ({name: m.full_name, paid: m.license_paid})))
    console.log('New inductees:', newInductees.length, newInductees.map(m => ({name: m.full_name, paid: m.license_paid})))
    console.log('Graduating members:', graduating.length, graduating.map(m => ({name: m.full_name, paid: m.license_paid})))
    console.log('Nominees:', nominees.length, nominees.map(m => ({name: m.full_name, paid: m.license_paid})))
    console.log('Total members:', totalMembers)
    console.log('Total nominees:', totalNominees)

    // Apply fee structure from the image
    let totalAmount = 0
    
    // Chapter fee: if Chapter fee paid? > 0
    const chapterFee = license.chapter_fee_paid ? 0 : license.chapter_fee
    console.log('Chapter fee calculation:', {
      chapter_fee_paid: license.chapter_fee_paid,
      chapter_fee: license.chapter_fee,
      calculated_fee: chapterFee
    })
    totalAmount += chapterFee
    
    // Member fee: if Member fee paid? > 0 (for inducted members)
    const memberFee = license.license_paid ? 0 : license.member_fee
    const memberTotal = totalMembers * memberFee
    console.log('Member fee calculation:', {
      license_paid: license.license_paid,
      member_fee: license.member_fee,
      total_members: totalMembers,
      calculated_fee: memberFee,
      total_member_fees: memberTotal
    })
    totalAmount += memberTotal
    
    // Nominee fee: if # of nominees > 0 (use dedicated nominee_fee)
    const nomineeFee = totalNominees > 0 ? license.nominee_fee : 0
    const nomineeTotal = totalNominees * nomineeFee
    console.log('Nominee fee calculation:', {
      total_nominees: totalNominees,
      nominee_fee: nomineeFee,
      license_nominee_fee: license.nominee_fee,
      total_nominee_fees: nomineeTotal
    })
    totalAmount += nomineeTotal
    
    // Late fee: if late fee > 0
    const lateFee = license.late_fee > 0 ? license.late_fee : 0
    console.log('Late fee:', license.late_fee, '-> calculated:', lateFee)
    totalAmount += lateFee
    
    // Startup fee: if start up fee > 0
    const startupFee = license.startup_fee > 0 ? license.startup_fee : 0
    console.log('Startup fee:', license.startup_fee, '-> calculated:', startupFee)
    totalAmount += startupFee

    console.log('=== TOTAL CALCULATION ===')
    console.log('Total amount:', totalAmount)

    return {
      chapter_fee: chapterFee,
      member_fee: memberFee,
      nominee_fee: nomineeFee,
      late_fee: lateFee,
      startup_fee: startupFee,
      returning_members: returning,
      new_inductees: newInductees,
      graduating_members: graduating,
      nominees: nominees,
      total_members: totalMembers,
      total_nominees: totalNominees,
      total_amount: totalAmount,
      license: license
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
    pdf.text('License Payment Invoice', 20, 45)
    
    // Invoice details
    pdf.setFontSize(12)
    pdf.text(`Invoice Number: ${invoiceNumber}`, 20, 65)
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 75)
    pdf.text(`Chapter: ${chapter?.school || 'N/A'} (#${chapter?.chapter_number || 'N/A'})`, 20, 85)
    pdf.text(`Director: ${chapter?.director_name || chapter?.director_id || 'N/A'}`, 20, 95)
    
    // Billing breakdown
    pdf.setFontSize(14)
    pdf.text('Fee Breakdown (HSCA License Structure)', 20, 115)
    
    pdf.setFontSize(12)
    let yPosition = 130
    
    if (invoice.chapter_fee > 0) {
      pdf.text(`Chapter Fee: $${invoice.chapter_fee.toFixed(2)}`, 30, yPosition)
      yPosition += 10
    }
    
    if (invoice.total_members > 0) {
      pdf.text(`Member Fees (${invoice.total_members} × $${invoice.member_fee.toFixed(2)}): $${(invoice.total_members * invoice.member_fee).toFixed(2)}`, 30, yPosition)
      yPosition += 10
    }
    
    if (invoice.total_nominees > 0) {
      pdf.text(`Nominee Fees (${invoice.total_nominees} × $${invoice.nominee_fee.toFixed(2)}): $${(invoice.total_nominees * invoice.nominee_fee).toFixed(2)}`, 30, yPosition)
      yPosition += 10
    }
    
    if (invoice.startup_fee > 0) {
      pdf.text(`Startup Fee: $${invoice.startup_fee.toFixed(2)}`, 30, yPosition)
      yPosition += 10
    }
    
    if (invoice.late_fee > 0) {
      pdf.text(`Late Fee: $${invoice.late_fee.toFixed(2)}`, 30, yPosition)
      yPosition += 10
    }
    
    yPosition += 5
    
    // Member categories
    pdf.setFontSize(14)
    pdf.text('Unpaid Members Requiring License Payment', 20, yPosition)
    yPosition += 15
    
    pdf.setFontSize(10)
    if (invoice.returning_members.length > 0) {
      pdf.text(`Returning Members - Unpaid (${invoice.returning_members.length}):`, 30, yPosition)
      yPosition += 10
      invoice.returning_members.forEach((member: Member) => {
        pdf.text(`• ${member.full_name} - ${member.email} - License: UNPAID`, 35, yPosition)
        yPosition += 8
      })
      yPosition += 5
    }
    
    if (invoice.nominees.length > 0) {
      pdf.text(`Nominees - Unpaid (${invoice.nominees.length}):`, 30, yPosition)
      yPosition += 10
      invoice.nominees.forEach((member: Member) => {
        pdf.text(`• ${member.full_name} - ${member.email} - Nominee Fee: UNPAID`, 35, yPosition)
        yPosition += 8
      })
      yPosition += 5
    }
    
    // Total
    pdf.setFontSize(14)
    pdf.text(`Total Amount Due: $${invoice.total_amount.toFixed(2)}`, 20, yPosition + 25)
    
    // Payment instructions
    pdf.setFontSize(12)
    pdf.text('Payment Instructions:', 20, yPosition + 45)
    pdf.setFontSize(10)
    pdf.text('Please remit payment to:', 30, yPosition + 55)
    pdf.text('Honor Society of Cinematic Arts', 30, yPosition + 65)
    pdf.text('[Banking Details TBD]', 30, yPosition + 75)
    pdf.text('Payment Due: 30 days from invoice date', 30, yPosition + 85)
    
    // Save PDF
    pdf.save(`HSCA-Invoice-${chapter?.school || 'Chapter'}-${Date.now()}.pdf`)
    
    // Log invoice to database
    try {
      const response = await fetch('/api/logInvoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber,
          chapterName: chapter?.school || 'N/A',
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

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch current user's chapter, all users, and licenses
        const [chapterResponse, usersResponse, licensesResponse] = await Promise.all([
          fetch('/api/fetchChapters'),
          fetch('/api/fetchUsers'),
          fetch('/api/fetchLicenses')
        ])

        const chapterData = await chapterResponse.json()
        const usersData = await usersResponse.json()
        const licensesData = await licensesResponse.json()

        console.log('=== BILLING DEBUG ===')
        console.log('Chapter Response:', chapterResponse.ok, chapterData)
        console.log('Users Response:', usersResponse.ok, usersData)
        console.log('Licenses Response:', licensesResponse.ok, licensesData)
        console.log('Raw Licenses Data Structure:', JSON.stringify(licensesData, null, 2))

        if (!chapterResponse.ok) {
          throw new Error(chapterData.error || 'Failed to fetch chapter data')
        }

        if (!usersResponse.ok) {
          throw new Error(usersData.error || 'Failed to fetch users data')
        }

        if (!licensesResponse.ok) {
          console.warn('License fetch failed, will create default license if needed:', licensesData.error)
          // Don't throw error - we'll create a default license if needed
        }

        // Set chapter data (the API returns { chaptersData: [...] })
        if (chapterData && chapterData.chaptersData && chapterData.chaptersData.length > 0) {
          const currentChapter = chapterData.chaptersData[0]
          console.log('=== CURRENT CHAPTER ===')
          console.log('Current chapter:', currentChapter)
          console.log('Chapter ID:', currentChapter.chapter_id)
          console.log('Chapter school:', currentChapter.school)
          
          // Find director name from users data
          const director = usersData.find((user: Member) => user.id === currentChapter.director_id)
          const chapterWithDirector = {
            ...currentChapter,
            director_name: director?.full_name || 'Director Name Not Found'
          }
          
          console.log('Director found:', director?.full_name || 'Not found')
          setChapter(chapterWithDirector)
          
          // Debug all users first
          console.log('=== ALL USERS DEBUG ===')
          console.log('Total users received:', usersData.length)
          usersData.forEach((user: Member, index: number) => {
            console.log(`User ${index + 1}:`, {
              id: user.id,
              name: user.full_name,
              email: user.email,
              chapter_id: user.chapter_id,
              license_paid: user.license_paid,
              induction_status: user.induction_status,
              user_type: user.user_type,
              rank: user.rank
            })
          })
          
          // Filter by chapter first
          const chapterMembers = usersData.filter((user: Member) => 
            user.chapter_id === currentChapter.chapter_id
          )
          console.log('=== CHAPTER MEMBERS ===')
          console.log(`Members in chapter ${currentChapter.chapter_id}:`, chapterMembers.length)
          chapterMembers.forEach((user: Member, index: number) => {
            console.log(`Chapter Member ${index + 1}:`, {
              id: user.id,
              name: user.full_name,
              email: user.email,
              license_paid: user.license_paid,
              induction_status: user.induction_status
            })
          })
          
          // Then filter for unpaid
          const unpaidMembers = chapterMembers.filter((user: Member) => 
            !user.license_paid
          )
          console.log('=== UNPAID MEMBERS ===')
          console.log('Unpaid members in chapter:', unpaidMembers.length)
          unpaidMembers.forEach((user: Member, index: number) => {
            console.log(`Unpaid Member ${index + 1}:`, {
              id: user.id,
              name: user.full_name,
              email: user.email,
              license_paid: user.license_paid
            })
          })
          
          // Find license for current chapter
          console.log('=== LICENSE DEBUG ===')
          console.log('Looking for license with chapter_id:', currentChapter.chapter_id)
          console.log('Current chapter_id type:', typeof currentChapter.chapter_id)
          console.log('License data exists?', !!licensesData.licensesData)
          console.log('License data length:', licensesData.licensesData?.length || 0)
          console.log('Available licenses:', licensesData.licensesData?.map((lic: License) => ({
            id: lic.id,
            chapter_id: lic.chapter_id,
            chapter_id_type: typeof lic.chapter_id,
            chapter_fee: lic.chapter_fee,
            member_fee: lic.member_fee,
            nominee_fee: lic.nominee_fee,
            chapter_fee_paid: lic.chapter_fee_paid,
            license_paid: lic.license_paid
          })))
          
          // Check if chapter_id exists in any license
          console.log('=== CHAPTER ID MATCHING DEBUG ===')
          if (licensesData.licensesData) {
            licensesData.licensesData.forEach((lic: License, index: number) => {
              const matches = lic.chapter_id === currentChapter.chapter_id
              console.log(`License ${index + 1}: ${lic.chapter_id} === ${currentChapter.chapter_id}? ${matches}`)
              console.log(`Types: ${typeof lic.chapter_id} vs ${typeof currentChapter.chapter_id}`)
            })
          }
          
          let chapterLicense = licensesData.licensesData?.find((lic: License) => 
            lic.chapter_id === currentChapter.chapter_id
          )
          
          console.log('Found chapter license:', chapterLicense)
          
          // If no exact match, try trimming whitespace or case-insensitive
          if (!chapterLicense && licensesData.licensesData) {
            console.log('Trying alternative matching methods...')
            chapterLicense = licensesData.licensesData.find((lic: License) => 
              lic.chapter_id?.toString().trim() === currentChapter.chapter_id?.toString().trim()
            )
            console.log('Found with trim match:', chapterLicense)
            
            if (!chapterLicense) {
              chapterLicense = licensesData.licensesData.find((lic: License) => 
                lic.chapter_id?.toString().toLowerCase() === currentChapter.chapter_id?.toString().toLowerCase()
              )
              console.log('Found with case-insensitive match:', chapterLicense)
            }
          }
          
          // If no license found, create a default one with standard HSCA fees
          if (!chapterLicense && unpaidMembers.length > 0) {
            console.log('No license found for chapter, creating default license')
            chapterLicense = {
              id: `temp-${currentChapter.chapter_id}`,
              created_at: new Date().toISOString(),
              chapter_id: currentChapter.chapter_id,
              chapter_fee: 150, // Default chapter fee
              member_fee: 25,   // Default member fee
              nominee_fee: 15,  // Default nominee fee
              num_licenses: unpaidMembers.length,
              chapter_fee_paid: false,
              startup_fee: 0,
              late_fee: 0,
              license_paid: false
            }
            console.log('Created default license:', chapterLicense)
          }
          
          setLicense(chapterLicense || null)
          setMembers(unpaidMembers)
        } else {
          console.error('Chapter data structure:', chapterData)
          throw new Error('No chapter data found')
        }
        
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load billing data'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
          <div>
            <h1 className="text-2xl font-semibold">HSCA License Billing</h1>
            <p className="text-sm text-gray-600 mt-1">
              {license ? 
                `License fees based on HSCA structure - Only unpaid members/nominees shown` : 
                'Loading license information...'
              }
            </p>
          </div>
          <div className="text-sm text-gray-600">
            Chapter {chapter?.chapter_number} - {chapter?.school}
          </div>
        </div>

        <div className="space-y-6">
          {/* Cost Summary */}
          <div className="rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Invoice Summary - HSCA License Structure</h2>
            <div className="space-y-2">
              {invoiceData.chapter_fee > 0 && (
                <div className="flex justify-between">
                  <span>Chapter Fee</span>
                  <span>${invoiceData.chapter_fee.toFixed(2)}</span>
                </div>
              )}
              {invoiceData.total_members > 0 && (
                <div className="flex justify-between">
                  <span>Member Fees ({invoiceData.total_members} × ${invoiceData.member_fee.toFixed(2)})</span>
                  <span>${(invoiceData.total_members * invoiceData.member_fee).toFixed(2)}</span>
                </div>
              )}
              {invoiceData.total_nominees > 0 && (
                <div className="flex justify-between">
                  <span>Nominee Fees ({invoiceData.total_nominees} × ${invoiceData.nominee_fee.toFixed(2)})</span>
                  <span>${(invoiceData.total_nominees * invoiceData.nominee_fee).toFixed(2)}</span>
                </div>
              )}
              {invoiceData.startup_fee > 0 && (
                <div className="flex justify-between">
                  <span>Startup Fee</span>
                  <span>${invoiceData.startup_fee.toFixed(2)}</span>
                </div>
              )}
              {invoiceData.late_fee > 0 && (
                <div className="flex justify-between">
                  <span>Late Fee</span>
                  <span>${invoiceData.late_fee.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Amount Due</span>
                <span>${invoiceData.total_amount.toFixed(2)}</span>
              </div>
            </div>
            {invoiceData.total_amount === 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 text-sm">✅ All fees have been paid for this chapter!</p>
              </div>
            )}
          </div>

          {/* Member Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Returning Members */}
            <div className="rounded-lg border border-red-200 p-4 bg-red-50">
              <h3 className="font-semibold mb-3 text-red-800">Returning Members - Unpaid ({invoiceData.returning_members.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {invoiceData.returning_members.map(member => (
                  <div key={member.id} className="text-sm">
                    <div className="font-medium">{member.full_name}</div>
                    <div className="text-gray-600">Rank: {member.rank || 'N/A'} • License: UNPAID</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nominees */}
            <div className="rounded-lg border border-orange-200 p-4 bg-orange-50">
              <h3 className="font-semibold mb-3 text-orange-800">Nominees - Unpaid ({invoiceData.nominees.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {invoiceData.nominees.map(member => (
                  <div key={member.id} className="text-sm">
                    <div className="font-medium">{member.full_name}</div>
                    <div className="text-gray-600">Status: {member.induction_status} • Nominee Fee: UNPAID</div>
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
                I confirm that the member lists above are accurate and complete. This includes all returning members 
                and nominees in my chapter with their correct ranks and statuses.
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
                Important: Quote your Chapter Number ({chapter?.chapter_number}) in the transfer reference and 
                pay all bank fees associated with sending the money.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}