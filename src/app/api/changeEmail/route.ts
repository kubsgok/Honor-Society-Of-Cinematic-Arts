import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

interface User {
  id: string
  full_name: string
  email: string
  user_type: string
  rank: string
  induction_status: string
  in_good_standing: boolean
  points: number
  minutes_film_produced: number
}

type Body = {
  newEmail?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { newEmail }: Body = await request.json()

    if (!newEmail || typeof newEmail !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Require auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Optional: basic uniqueness check in users table to avoid obvious collisions
    const { data: existing, error: existErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', newEmail)
      .limit(1)

    if (!existErr && existing && existing.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const { error: updateErr } = await supabase.auth.updateUser({ email: newEmail })
    if (updateErr) {
      return NextResponse.json({ error: updateErr.message || 'Failed to request email change' }, { status: 400 })
    }

    const currentUser: User | null = await fetch('/api/getCurrentUser')
      .then(res => res.ok ? res.json() : null)
      .catch(err => {
        console.error('Error fetching current user:', err)
        return null
      })
    if (!currentUser) {
      console.error('Failed to fetch current user')
      return
    }

    const newResponse = await fetch('/api/updateUserInfo', {
      method: 'PUT',
      body: JSON.stringify({
        user_id: currentUser.id,
        modification: 'email',
        email: newEmail 
      })
    })
    if (!newResponse.ok) {
      console.error('Failed to update user info')
      return
    }

    // Do NOT update users.email yet; change completes after user confirms via email
    return NextResponse.json({ ok: true, message: 'Verification email sent. Please check your inbox to confirm the change.' })
  } catch (e) {
    console.error('changeEmail exception:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
