import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Updates the currently authenticated user's profile fields
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      full_name,
      dob, // ISO string (YYYY-MM-DD)
      grad_month, // string enum month
      grad_year, // number
    } = await request.json()

    // Require auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Validate inputs
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    if (typeof dob === 'string' && dob) {
      const [y, m, d] = dob.split('-').map(Number)
      const dobDate = new Date(y, (m || 1) - 1, d || 1)
      if (isNaN(dobDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date of birth format' }, { status: 400 })
      }
      if (dobDate.getTime() > startOfToday.getTime()) {
        return NextResponse.json({ error: 'Date of birth cannot be in the future' }, { status: 400 })
      }
    }

    if (typeof grad_month === 'string' && typeof grad_year === 'number') {
      const MONTHS = [
        'January','February','March','April','May','June','July','August','September','October','November','December'
      ]
      const monthIndex = MONTHS.indexOf(grad_month)
      if (monthIndex === -1) {
        return NextResponse.json({ error: 'Invalid graduation month' }, { status: 400 })
      }
      const gradDate = new Date(grad_year, monthIndex, 1)
      if (gradDate.getTime() <= startOfToday.getTime()) {
        return NextResponse.json({ error: 'Graduation date must be in the future' }, { status: 400 })
      }
    }

    // Build update object with only allowed fields
    type UpdateShape = {
      full_name?: string
      grad_month?: string
      grad_year?: number
      dob?: string
    }
    const update: UpdateShape = {}
    if (typeof full_name === 'string') update.full_name = full_name.trim()
    if (typeof grad_month === 'string') update.grad_month = grad_month
    if (typeof grad_year === 'number') update.grad_year = grad_year
    if (typeof dob === 'string' && dob) update.dob = dob

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(update)
      .eq('email', user.email!)

    if (updateError) {
      console.error('updateProfile error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('updateProfile exception:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
