"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { InvoiceTable } from "@/components/InvoiceTable";
import { money, round2, type Ledger } from "@/lib/plans";

const GHOSTS = [
	{ name: "alarm_hater_92", spent: 86.4 },
	{ name: "mom_said_get_up", spent: 42.15 },
	{ name: "snooze_scientist", spent: 19.8 },
	{ name: "brenda_fan", spent: 7.47 },
];

export default function AccountPage() {
	const [ledger, setLedger] = useState<Ledger | null>(null);
	const [error, setError] = useState("");
	const [redeem, setRedeem] = useState("");

	useEffect(() => {
		let live = true;
		void (async () => {
			try {
				const res = await fetch("/api/account", { cache: "no-store" });
				if (!res.ok) throw new Error("down");
				const data = (await res.json()) as Ledger;
				if (live) setLedger(data);
			} catch {
				if (live) setError("The bank is also asleep.");
			}
		})();
		return () => {
			live = false;
		};
	}, []);

	const spent = round2((ledger?.purchases ?? []).reduce((sum, purchase) => sum + purchase.amount, 0));
	const points = Math.floor(spent * 10);
	const board = [...GHOSTS, { name: "You", spent }].sort((a, b) => b.spent - a.spent);

	return (
		<main className="mx-auto w-full max-w-3xl px-5 pb-16">
			<p className="text-xs uppercase tracking-[0.22em] text-cream/50">Billing, unfortunately</p>
			<h1 className="font-display mt-2 text-5xl">My Account</h1>
			{error && <p className="mt-6 text-brand">{error}</p>}
			{ledger && (
				<>
					<p className="mt-4 text-xs uppercase tracking-wider text-cream/45">
						{ledger.mocked ? "Demo ledger" : "Live Nessie sandbox"}
					</p>
					<div className="mt-4 grid gap-3 sm:grid-cols-3">
						<article className="rounded-2xl bg-panel p-4">
							<p className="text-xs uppercase text-cream/50">Balance</p>
							<p className="clock mt-2 text-3xl">{money(ledger.displayedBalance)}</p>
							{ledger.displayedBalance !== ledger.balance && (
								<p className="mt-1 text-xs text-cream/45">Posted balance {money(ledger.balance)}, pending held back</p>
							)}
						</article>
						<article className="rounded-2xl bg-panel p-4">
							<p className="text-xs uppercase text-cream/50">Total spent waking up</p>
							<p className="clock mt-2 text-3xl text-brand">{money(spent)}</p>
						</article>
						<article className="rounded-2xl bg-panel p-4">
							<p className="text-xs uppercase text-cream/50">Sleep Points</p>
							<p className="clock mt-2 text-3xl">{points}</p>
							<p className="text-xs text-cream/45">10 per dollar. Redeemable for nothing.</p>
							<button type="button" onClick={() => setRedeem("Coming soon™")} className="mt-3 text-sm underline">
								Redeem
							</button>
							{redeem && <p className="mt-1 text-sm text-brand">{redeem}</p>}
						</article>
					</div>
					<h2 className="mt-10 text-lg">Invoices</h2>
					<div className="mt-3 rounded-2xl bg-panel p-4">
						<InvoiceTable purchases={ledger.purchases} />
					</div>
					<h2 className="mt-10 text-lg">Top Snoozers</h2>
					<ol className="mt-3 space-y-2">
						{board.map((row, index) => (
							<li key={row.name} className={`flex justify-between rounded-xl px-4 py-2 ${row.name === "You" ? "bg-brand/20" : "bg-panel"}`}>
								<span>
									{index + 1}. {row.name}
								</span>
								<span className="clock">{money(row.spent)}</span>
							</li>
						))}
					</ol>
				</>
			)}
			<Link href="/cancel" className="mt-24 block text-center text-xs text-cream/35">
				Cancel subscription
			</Link>
		</main>
	);
}
