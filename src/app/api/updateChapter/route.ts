import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Updates the currently authenticated user's profile fields
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
        chapter_id,
        official,
        rejected,
    } = await request.json()

    // Require auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!chapter_id) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Build update object with only allowed fields
    type UpdateShape = {
      official?: boolean,
      rejected?: boolean,
    }
    const update: UpdateShape = {}
    if (typeof official === 'boolean') update.official = official
    if (typeof rejected === 'boolean') update.rejected = rejected

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('chapters')
      .update(update)
      .eq('chapter_id', chapter_id)

    if (updateError) {
      console.error('updateChapter error:', updateError)
      return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('updateChapter exception:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}