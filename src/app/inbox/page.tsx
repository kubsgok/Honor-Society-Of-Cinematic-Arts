import ChaptersInbox from './chaptersInbox'
import MembersInbox from './membersInbox'
import { createClient } from '@/utils/supabase/server'

// server component (no "use client")
export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return <div>Please sign in</div>

  const { data: userData } = await supabase
    .from('users')
    .select('user_type')
    .eq('email', user.email)
    .single()

  if (userData?.user_type === 'Admin') return <ChaptersInbox />
  if (userData?.user_type === 'Chapter Director') return <MembersInbox />
  return <div>No access</div>
}
