"use client"

import React from 'react'

type CopyAllPillProps = {
	className?: string
	names: Array<string | null | undefined>
}

export function CopyAllPill({ className, names }: CopyAllPillProps) {
	const handleClick = React.useCallback(async () => {
		const joinedNames = (names ?? [])
			.filter((name): name is string => Boolean(name && name.trim().length > 0))
			.join(', ')
		try {
			await navigator.clipboard.writeText(joinedNames)
		} catch (_) {
			// Silently ignore if clipboard API is unavailable
		}
	}, [names])

	return (
		<span
			onClick={handleClick}
			className={`text-white text-xs font-medium rounded-full px-2 py-0.5 bg-[#b66cee] cursor-pointer select-none ${className ?? ''}`}
		>
			Copy All
		</span>
	)
} 