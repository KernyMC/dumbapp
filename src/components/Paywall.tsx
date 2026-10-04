"use client";

import Image from "next/image";
import { money, PLANS, doubleSnooze, type PlanId } from "@/lib/plans";

const ORDER: Exclude<PlanId, "cancel">[] = ["basic", "premium", "snooze", "family"];

export function Paywall({
	snoozePrice,
	usesLeft,
	busy,
	buying,
	onBuy,
}: {
	snoozePrice: number;
	usesLeft: number;
	busy: boolean;
	buying: Exclude<PlanId, "cancel"> | null;
	onBuy: (plan: Exclude<PlanId, "cancel">) => void;
}) {
	return (
		<section className="relative z-20 mx-auto w-full max-w-5xl px-4 pb-24">
			<p className="mb-4 text-center text-sm uppercase tracking-[0.2em] text-cream/60">
				Pick a plan. There is no dismiss.
			</p>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{ORDER.map((id) => {
					const plan = PLANS[id];
					const price = id === "snooze" ? snoozePrice : plan.price;
					return (
						<article key={id} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel/90 p-4 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-brand/60">
							<Image
								src={plan.banner}
								alt=""
								width={1024}
								height={559}
								sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
								className="-mx-4 -mt-4 mb-4 aspect-[16/9] w-[calc(100%+2rem)] max-w-none object-cover"
							/>
							<h3 className="font-display text-xl">{plan.name}</h3>
							<p className="clock mt-2 text-3xl text-brand">{money(price)}</p>
							<p className="mt-2 min-h-16 text-sm text-cream/70">{plan.pitch}</p>
							{id === "premium" && (
								<p className="text-xs text-brand">{usesLeft} uses left this month</p>
							)}
							{id === "snooze" && (
								<p className="text-xs text-brand">
									Dynamic demand pricing. Next: {money(doubleSnooze(snoozePrice))}
								</p>
							)}
							<div className="min-h-4 flex-1" />
							<button
								type="button"
								disabled={busy}
								onClick={() => onBuy(id)}
								className="rounded-full bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
							>
								{buying === id ? "Processing your wake-up…" : "Pay to make it stop"}
							</button>
						</article>
					);
				})}
			</div>
		</section>
	);
}
