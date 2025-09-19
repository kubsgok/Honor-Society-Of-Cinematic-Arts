"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/app/components/NavBar'

type Chapter = {
	id: string
	number?: string | null
	name: string
	director_email?: string | null
	users_count?: number | null
}

export default function StaffInterfacePage() {
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [chapters, setChapters] = useState<Chapter[]>([])

	useEffect(() => {
		const load = async () => {
			setLoading(true)
			setError(null)
			try {
				// TODO: replace with /api/chapters when available
				// Temporary mocked data to build UI
				const mock: Chapter[] = [
					{ id: '1', number: '101', name: 'Singapore American School', director_email: 'director@sas.edu.sg', users_count: 142 },
					{ id: '2', number: '102', name: 'International School Bangkok', director_email: 'director@isb.ac.th', users_count: 97 },
					{ id: '3', number: '103', name: 'Taipei American School', director_email: 'director@tas.edu.tw', users_count: 83 },
				]
				setChapters(mock)
			} catch (e) {
				const msg = e instanceof Error ? e.message : 'Failed to load chapters'
				setError(msg)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	return (
		<div>
			<NavBar />
			<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-semibold">Staff Interface</h1>
					<div className="flex gap-3">
						<button className="rounded-md bg-[#520392] text-white px-4 py-2 text-sm font-medium hover:bg-[#5f17a0]">Download CSV</button>
						<button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50" onClick={() => router.push('/chapter_creation')}>Create Chapter</button>
					</div>
				</div>

				{loading && (
					<div className="mt-6 text-gray-600">Loading chapters…</div>
				)}
				{error && (
					<div className="mt-6 text-red-600">{error}</div>
				)}

				{!loading && !error && (
					<div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
						<div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
							<div className="col-span-2">Chapter #</div>
							<div className="col-span-5">Chapter name</div>
							<div className="col-span-3">Chapter director</div>
							<div className="col-span-2 text-right">Members</div>
						</div>
						<ul className="divide-y divide-gray-200">
							{chapters.map((c) => (
								<li key={c.id}>
									<button
										className="grid w-full grid-cols-12 items-center px-4 py-4 text-left hover:bg-gray-50 transition-colors"
										onClick={() => router.push(`/chapters/${c.id}`)}
									>
										<div className="col-span-2 font-medium">{c.number ?? '-'}</div>
										<div className="col-span-5">{c.name}</div>
										<div className="col-span-3 text-sm text-gray-600">{c.director_email ?? '-'}</div>
										<div className="col-span-2 text-right">{c.users_count ?? 0}</div>
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	)
}

