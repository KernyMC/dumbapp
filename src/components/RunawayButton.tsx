"use client";

import { useState } from "react";

export function RunawayButton() {
	const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

	function flee(event: { preventDefault: () => void }) {
		event.preventDefault();
		const width = Math.max(160, window.innerWidth - 150);
		const height = Math.max(80, window.innerHeight - 70);
		setPos({
			x: 12 + Math.random() * (width - 12),
			y: 12 + Math.random() * (height - 12),
		});
	}

	return (
		<button
			type="button"
			onMouseEnter={flee}
			onTouchStart={flee}
			onClick={flee}
			className="z-[80] rounded-full border border-cream/30 bg-ink px-5 py-2 text-sm text-cream/80"
			style={pos ? { position: "fixed", left: pos.x, top: pos.y } : undefined}
		>
			Dismiss
		</button>
	);
}
