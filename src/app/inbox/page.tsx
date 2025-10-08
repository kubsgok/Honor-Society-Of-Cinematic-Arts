import ChaptersInbox from './chaptersInbox'
import MembersInbox from './membersInbox'

export default async function InboxPage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  const curr = await fetch(new URL('/api/getCurrentUser', base).toString())
      .then(res => res.ok ? res.json() : null)
      .catch(err => {
        console.error('Error fetching current user:', err)
        return null
      })
  if (!curr) {
    console.error('Failed to fetch current user')
    return
  }

  if (curr.user_type == "Admin") {
    return <ChaptersInbox />
  } 
  if (curr.user_type == "Chapter Director") {
    return <MembersInbox />
  }
}