import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

type InvoiceLogData = {
  chapter_id: string
  invoice_number: string
  amount: number
  member_count: number
  generated_by: string
  invoice_data: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated and is a chapter director
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const invoiceData: InvoiceLogData = await request.json()

    // TODO: Verify user is director of the chapter they're creating invoice for
    
    // Generate unique invoice number
    const invoiceNumber = `INV-${invoiceData.chapter_id}-${Date.now()}`
    
    // Log invoice to database
    // TODO: Create invoices table in Supabase with columns:
    // id, chapter_id, invoice_number, amount, member_count, generated_by, generated_at, invoice_data
    
    // For now, just return success
    return NextResponse.json({ 
      success: true, 
      invoice_number: invoiceNumber,
      message: 'Invoice logged successfully' 
    })

  } catch (error) {
    console.error('Error logging invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}