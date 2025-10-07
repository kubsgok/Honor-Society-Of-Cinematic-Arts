import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Updates the currently authenticated user's profile fields
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
        chapter_id,
        official,
    } = await request.json()

    // Require auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!chapter_id || !official) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Build update object with only allowed fields
    type UpdateShape = {
      chapter_id?: string,
      official?: boolean,
    }
    const update: UpdateShape = {}
    if (typeof chapter_id === 'string') update.chapter_id = chapter_id
    if (typeof official === 'boolean') update.official = official

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