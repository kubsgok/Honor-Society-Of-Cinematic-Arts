import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => ({}))
		const newEmail = typeof body?.newEmail === 'string' ? body.newEmail.trim() : ''

		if (!newEmail) {
			return NextResponse.json({ error: 'Missing newEmail' }, { status: 400 })
		}

		const supabase = await createClient()

		// First get the current user to know their ID
		const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
		if (authError || !currentUser) {
			return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
		}

		// Use supabase.auth.updateUser to change the user's email
		const { data, error } = await supabase.auth.updateUser({ email: newEmail })
		
		if (error) {
			return NextResponse.json({ user: null, error })
		}

		// Also update the users table - use current email to find the record
		const { error: dbError } = await supabase
			.from('users')
			.update({ email: newEmail })
			.eq('email', currentUser.email)

		if (dbError) {
			console.error('Failed to update users table:', dbError)
			// Don't fail the request since auth update succeeded
		}

		return NextResponse.json({ user: data.user, error })
	} catch (err) {
		console.error('changeEmail error', err)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
