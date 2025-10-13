import ChaptersInbox from './chaptersInbox'
import MembersInbox from './membersInbox'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation' // NEW

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

  // redirect Associates explicitly to restricted page
  const userType = userData?.user_type;
  if (userType === 'Associate'  || userType === "Nominee for Induction") {
    redirect('/restricted')
  }

  if (userData?.user_type === 'Admin') return <ChaptersInbox />
  if (userData?.user_type === 'Chapter Director') return <MembersInbox />
  return <div>No access</div>
}
