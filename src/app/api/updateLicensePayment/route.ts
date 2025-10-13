import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { licenseId, licensePaid, chapterFeePaid } = body

    if (!licenseId) {
      return NextResponse.json({ 
        success: false, 
        error: 'License ID is required' 
      }, { status: 400 })
    }

    // Update the license payment status
    const updateData: any = {}
    
    if (licensePaid !== undefined) {
      updateData.license_paid = licensePaid
    }
    
    if (chapterFeePaid !== undefined) {
      updateData.chapter_fee_paid = chapterFeePaid
    }

    const { data, error } = await supabase
      .from('licenses')
      .update(updateData)
      .eq('id', licenseId)
      .select()

    if (error) {
      console.error('Error updating license payment:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update license payment status' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'License payment status updated successfully' 
    })

  } catch (error) {
    console.error('Update license payment error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}