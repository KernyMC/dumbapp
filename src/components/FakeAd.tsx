"use client";

import { useEffect, useRef, useState } from "react";

export function FakeAd({ onDone }: { onDone: () => void }) {
	const [left, setLeft] = useState(15);
	const [joke, setJoke] = useState(false);
	const done = useRef(onDone);
	done.current = onDone;

	useEffect(() => {
		let remaining = 15;
		let joking = false;
		const timer = window.setInterval(() => {
			remaining -= 1;
			if (remaining > 0) {
				setLeft(remaining);
				return;
			}
			if (!joking) {
				joking = true;
				remaining = 3;
				setJoke(true);
				setLeft(3);
				return;
			}
			window.clearInterval(timer);
			done.current();
		}, 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6">
			<div className="w-full max-w-lg rounded-3xl border border-brand/40 bg-panel p-8 text-center">
				<p className="text-xs uppercase tracking-[0.25em] text-brand">Sponsored silence</p>
				<h2 className="mt-3 font-display text-4xl leading-none">SnoozeFlix Premium Pillow™</h2>
				<p className="mt-4 text-cream/75">
					It watches you sleep so the alarm doesn&apos;t have to. $79.99. Not actually for sale. You still have to watch.
				</p>
				<button
					type="button"
					disabled
					className="mt-8 rounded-full bg-white/10 px-5 py-2 text-sm text-cream/70"
				>
					{joke ? `Skip in ${left}… just kidding` : `Skip in ${left}`}
				</button>
			</div>
		</div>
	);
}
