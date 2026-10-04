"use client";

import { useEffect, useRef } from "react";

const ITEM = 48;

export function WheelPicker({
	count,
	value,
	onChange,
	disabled,
	label,
}: {
	count: number;
	value: number;
	onChange: (value: number) => void;
	disabled?: boolean;
	label: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		ref.current?.scrollTo({ top: value * ITEM });
	}, []);

	return (
		<div
			ref={ref}
			role="listbox"
			aria-label={label}
			onScroll={(event) => {
				const index = Math.min(count - 1, Math.max(0, Math.round(event.currentTarget.scrollTop / ITEM)));
				if (index !== value) onChange(index);
			}}
			className={`wheel relative z-10 h-36 w-24 snap-y snap-mandatory overflow-y-scroll ${disabled ? "pointer-events-none opacity-40" : ""}`}
			style={{ paddingBlock: ITEM }}
		>
			{Array.from({ length: count }, (_, index) => (
				<button
					key={index}
					type="button"
					role="option"
					aria-selected={index === value}
					onClick={() => ref.current?.scrollTo({ top: index * ITEM, behavior: "smooth" })}
					className={`clock flex h-12 w-full snap-center items-center justify-center text-4xl transition ${index === value ? "text-cream" : "text-cream/25"}`}
				>
					{String(index).padStart(2, "0")}
				</button>
			))}
		</div>
	);
}
