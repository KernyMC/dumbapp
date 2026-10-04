"use client";

import Link from "next/link";
import { useState } from "react";
import { BrendaChat } from "@/components/BrendaChat";

const STEPS = [
	{
		title: "Are you sure?",
		body: "The alarm hasn't finished emotionally processing this.",
	},
	{
		title: "Your alarm will miss you.",
		body: "It learned your snooze rhythm. That's intimacy, and also a line item.",
	},
	{
		title: "We'll tell your mom.",
		body: "She already thinks you sleep too much. We don't have her number. She knows anyway.",
	},
	{
		title: "Fine. But first, talk to Brenda.",
		body: "She is in the stairwell. She is loud. She is contractually devastated.",
	},
];

export default function CancelPage() {
	const [step, setStep] = useState(0);
	if (step >= STEPS.length) return <BrendaChat />;

	const stay = (
		<Link href="/" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">
			I'll stay
		</Link>
	);
	const go = (
		<button type="button" onClick={() => setStep(step + 1)} className="rounded-full bg-white/10 px-5 py-3 text-sm">
			Cancel anyway
		</button>
	);
	const flipped = step % 2 === 1;

	return (
		<main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col justify-center px-5 pb-16">
			<p className="text-xs uppercase tracking-[0.22em] text-cream/40">Step {step + 1} of 4</p>
			<h1 className="font-display mt-3 text-5xl leading-none">{STEPS[step].title}</h1>
			<p className="mt-4 text-lg text-cream/75">{STEPS[step].body}</p>
			<div className={`mt-8 flex flex-wrap gap-3 ${flipped ? "flex-row-reverse justify-end" : ""}`}>
				{stay}
				{go}
			</div>
		</main>
	);
}
