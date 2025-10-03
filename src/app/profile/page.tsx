"use client"

import { useEffect, useMemo, useState } from 'react'
import { NavBar } from '../components/NavBar'
import { months as MONTHS } from '@/lib/lists/months'
import { logout } from '@/utils/login-signup/actions'

type User = {
	id: string
	full_name: string | null
	email: string | null
	chapter_id: string | null
	grad_month: string | null
	grad_year: number | null
	dob: string | null
	user_type: string | null
	rank: string | null
	induction_status: string | null
	in_good_standing: boolean | null
	points: number | null
	minutes_film_produced: number | null
}

export default function ProfilePage() {
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [user, setUser] = useState<User | null>(null)

	const [fullName, setFullName] = useState('')
	const [dob, setDob] = useState('') // YYYY-MM-DD
	const [gradMonth, setGradMonth] = useState('')
	const [gradYear, setGradYear] = useState('')
		const [chapterNumber, setChapterNumber] = useState('')
		const [newEmail, setNewEmail] = useState('')
		const [emailMsg, setEmailMsg] = useState<string | null>(null)

		const getPosition = (userType?: string | null) => {
			if (!userType) return '-'
			if (userType === 'Officer' || userType === 'Vice President' || userType === 'President') return userType
			return '-'
		}

	useEffect(() => {
		const load = async () => {
			setLoading(true)
			setError(null)
			try {
				const res = await fetch('/api/getCurrentUser', { cache: 'no-store' })
				if (!res.ok) throw new Error('Failed to load user')
			const u: User = await res.json()
				setUser(u)
				setFullName(u.full_name ?? '')
				setDob(u.dob ? u.dob.slice(0, 10) : '')
				setGradMonth(u.grad_month ?? '')
				setGradYear(u.grad_year ? String(u.grad_year) : '')
			// NOTE: Schema uses chapter_id as UUID – no numeric chapter field exists yet
			setChapterNumber('')
					} catch (e) {
						const msg = e instanceof Error ? e.message : 'Error loading profile'
						setError(msg)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	const canSave = useMemo(() => {
		return !saving && !!user
	}, [saving, user])

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!canSave) return
		setSaving(true)
		setError(null)
		setSuccess(null)
		try {
				// Client-side validation
				const today = new Date()
				const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

				const parseInputDate = (s: string) => {
					// Expect YYYY-MM-DD
					const [y, m, d] = s.split('-').map(Number)
					return new Date(y, (m || 1) - 1, d || 1)
				}

				if (dob) {
					const dobDate = parseInputDate(dob)
					if (dobDate.getTime() > startOfToday.getTime()) {
						throw new Error('Date of birth cannot be in the future.')
					}
				}

				if (gradMonth && gradYear) {
					const monthIndex = MONTHS.indexOf(gradMonth)
					const yearNum = Number(gradYear)
					if (monthIndex === -1 || !Number.isFinite(yearNum)) {
						throw new Error('Please provide a valid graduation month and year.')
					}
					// Define graduation as the first day of that month
					const gradDate = new Date(yearNum, monthIndex, 1)
					if (gradDate.getTime() <= startOfToday.getTime()) {
						throw new Error('Graduation date must be in the future.')
					}
				}

			const payload: Record<string, unknown> = {
				full_name: fullName.trim(),
			}
			if (dob) payload.dob = dob
			if (gradMonth) payload.grad_month = gradMonth
			if (gradYear) payload.grad_year = Number(gradYear)
			// chapterNumber intentionally NOT sent: schema lacks a chapter_number column

					const res = await fetch('/api/updateUserInfo', {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ ...payload, modification: 'profile', grad_year: payload.grad_year ?? undefined }),
					})
			if (!res.ok) {
				const j = await res.json().catch(() => ({}))
				throw new Error(j.error || 'Failed to save profile')
			}
			setSuccess('Profile saved')
			} catch (e) {
				const msg = e instanceof Error ? e.message : 'Failed to save'
				setError(msg)
		} finally {
			setSaving(false)
		}
	}

		if (loading) {
			return (
				<div>
					<NavBar />
					<div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
						<h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
						<p className="text-gray-600">Loading…</p>
					</div>
				</div>
			)
		}

		if (error && !user) {
			return (
				<div>
					<NavBar />
					<div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
						<h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
						<p className="text-red-600">{error}</p>
					</div>
				</div>
			)
		}

	return (
		// <div className="p-6 max-w-2xl">
			<div>
				<NavBar />
				<div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
					<h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>

					<button
						type="button"
						className="rounded bg-purple-600 text-white px-3 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
						onClick={async () => {
							await logout();
						}}
					>
						Logout
					</button>
					{error && <div className="mb-4 text-sm text-red-600">{error}</div>}
					{success && <div className="mb-4 text-sm text-green-700">{success}</div>}

					<form onSubmit={onSubmit} className="space-y-6">
				<div>
					<label className="block text-sm font-medium mb-1">Full name</label>
					<input
						type="text"
						className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						placeholder="Your name"
					/>
				</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">Email address</label>
								<input
									type="email"
									className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
									value={user?.email ?? ''}
									disabled
								/>
										<p className="mt-1 text-xs text-gray-500">Email changes require verification.</p>
										<div className="mt-2 flex items-center gap-2">
											<input
												type="email"
												placeholder="Enter new email"
												className="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
												value={newEmail}
												onChange={(e) => setNewEmail(e.target.value)}
											/>
											<button
												type="button"
												className="rounded bg-purple-600 text-white px-3 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
												onClick={async () => {
													setEmailMsg(null)
													if (!newEmail) {
														setEmailMsg('Please enter a valid email')
														return
													}
													try {
														const resp = await fetch('/api/changeEmail', {
															method: 'POST',
															headers: { 'Content-Type': 'application/json' },
															body: JSON.stringify({ newEmail }),
														})
														const j = await resp.json().catch(() => ({}))
														if (!resp.ok) throw new Error(j.error || 'Failed to request change')
														setEmailMsg('Verification email sent. Please check your inbox.')
													} catch (err) {
														const msg = err instanceof Error ? err.message : 'Failed to request change'
														setEmailMsg(msg)
													}
												}}
											>
												Change email
											</button>
										</div>
										{emailMsg && <p className="mt-1 text-xs text-gray-600">{emailMsg}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Chapter number</label>
								<input
									type="text"
									className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
									value={chapterNumber}
									onChange={(e) => setChapterNumber(e.target.value)}
									disabled
								/>
								<p className="mt-1 text-xs text-gray-500">Not editable yet: the database currently stores a chapter_id UUID, not a chapter number.</p>
							</div>
						</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="md:col-span-1">
						<label className="block text-sm font-medium mb-1">DOB</label>
						<input
							type="date"
							className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
							value={dob}
							onChange={(e) => setDob(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Graduation month</label>
						<select
							className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
							value={gradMonth}
							onChange={(e) => setGradMonth(e.target.value)}
						>
							<option value="">Select month</option>
							{MONTHS.map((m) => (
								<option key={m} value={m}>{m}</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Graduation year</label>
						<input
							type="number"
							inputMode="numeric"
							className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
							value={gradYear}
							onChange={(e) => setGradYear(e.target.value)}
							min={1900}
							max={2100}
						/>
					</div>
				</div>

							<div className="pt-2 flex gap-3">
								<button
									type="submit"
									disabled={!canSave}
									className="inline-flex items-center rounded bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
								>
									{saving ? 'Saving…' : 'Save changes'}
								</button>
							</div>
						</form>

						<div className="mt-10">
							<h3 className="text-xl font-semibold mb-4">Account status</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="rounded border border-gray-200 p-4">
									<div className="text-sm text-gray-500">Induction status</div>
									<div className="text-base">{user?.induction_status ?? '-'}</div>
								</div>
								<div className="rounded border border-gray-200 p-4">
									<div className="text-sm text-gray-500">Rank</div>
									<div className="text-base">{user?.rank ?? '-'}</div>
								</div>
								<div className="rounded border border-gray-200 p-4">
									<div className="text-sm text-gray-500">Position</div>
									<div className="text-base">{getPosition(user?.user_type)}</div>
								</div>
								<div className="rounded border border-gray-200 p-4">
									<div className="text-sm text-gray-500">In good standing</div>
									<div className="text-base">{user?.in_good_standing ? 'Yes' : 'No'}</div>
								</div>
								<div className="rounded border border-gray-200 p-4">
									<div className="text-sm text-gray-500">Points</div>
									<div className="text-base">{user?.points ?? 0}</div>
								</div>
								<div className="rounded border border-gray-200 p-4">
									<div className="text-sm text-gray-500">Minutes of film produced</div>
									<div className="text-base">{user?.minutes_film_produced ?? 0}</div>
								</div>
							</div>
						</div>
					</div>
		</div>
	)
}
