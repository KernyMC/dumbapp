"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FakeAd } from "@/components/FakeAd";
import { Paywall } from "@/components/Paywall";
import { RunawayButton } from "@/components/RunawayButton";
import { WheelPicker } from "@/components/WheelPicker";
import { playVoice } from "@/lib/playVoice";
import {
	BASE_SNOOZE,
	PREMIUM_USES,
	SNOOZE_SECONDS,
	WAKE_LINE,
	doubleSnooze,
	money,
	type PlanId,
} from "@/lib/plans";

type Mode = "idle" | "ringing" | "ad" | "snooze" | "roommate";
type Buyable = Exclude<PlanId, "cancel">;
type Receipt = {
	purchases: { description: string; amount: number }[];
	total: number;
	mocked: boolean;
};

const SNOOZE_KEY = "snoozeflix-snooze-price";
const USES_KEY = "snoozeflix-premium-uses";
const TERMS_KEY = "snoozeflix-terms";

function useAlarm() {
	const ctxRef = useRef<AudioContext | null>(null);
	const stopRef = useRef<(() => void) | null>(null);

	const unlock = useCallback(() => {
		const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		if (!ctxRef.current) ctxRef.current = new Ctx();
		void ctxRef.current.resume();
	}, []);

	const stop = useCallback(() => {
		stopRef.current?.();
		stopRef.current = null;
	}, []);

	const start = useCallback(() => {
		unlock();
		stop();
		const ctx = ctxRef.current;
		if (!ctx) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "square";
		osc.frequency.value = 740;
		gain.gain.value = 0.0001;
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		let high = false;
		const timer = window.setInterval(() => {
			high = !high;
			const at = ctx.currentTime;
			gain.gain.setTargetAtTime(high ? 0.14 : 0.0001, at, 0.015);
			osc.frequency.setTargetAtTime(high ? 880 : 494, at, 0.015);
		}, 170);
		stopRef.current = () => {
			window.clearInterval(timer);
			try {
				osc.stop();
			} catch {
				/* already stopped */
			}
			osc.disconnect();
			gain.disconnect();
		};
	}, [stop, unlock]);

	return { unlock, start, stop };
}

export function AlarmClock() {
	const audio = useAlarm();
	const [now, setNow] = useState<Date | null>(null);
	const [alarmAt, setAlarmAt] = useState("08:00");
	const [armed, setArmed] = useState(false);
	const [mode, setMode] = useState<Mode>("idle");
	const [snoozePrice, setSnoozePrice] = useState(BASE_SNOOZE);
	const [usesLeft, setUsesLeft] = useState(PREMIUM_USES);
	const [needTerms, setNeedTerms] = useState(false);
	const [acceptedBox, setAcceptedBox] = useState(false);
	const [pending, setPending] = useState<Buyable | null>(null);
	const [buying, setBuying] = useState<Buyable | null>(null);
	const [toast, setToast] = useState("");
	const [snoozeLeft, setSnoozeLeft] = useState(SNOOZE_SECONDS);
	const fired = useRef("");
	const wiliRang = useRef(false);
	const screaming = mode === "ringing" || mode === "roommate";

	useEffect(() => () => audio.stop(), [audio.stop]);

	useEffect(() => {
		if (!screaming && !wiliRang.current) return;
		wiliRang.current = true;
		void fetch("/api/wili", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ action: screaming ? "ring" : "stop" }),
		}).catch(() => {});
	}, [screaming]);

	useEffect(() => {
		const tick = () => setNow(new Date());
		tick();
		const timer = window.setInterval(tick, 250);
		const storedPrice = Number(localStorage.getItem(SNOOZE_KEY));
		if (storedPrice >= BASE_SNOOZE) setSnoozePrice(storedPrice);
		const storedUses = localStorage.getItem(USES_KEY);
		if (storedUses !== null) setUsesLeft(Number(storedUses));
		return () => window.clearInterval(timer);
	}, []);

	useEffect(() => {
		if (!toast) return;
		const timer = window.setTimeout(() => setToast(""), 8000);
		return () => window.clearTimeout(timer);
	}, [toast]);

	useEffect(() => {
		if (!armed || mode !== "idle" || !now) return;
		const key = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
		if (key === alarmAt && fired.current !== key) {
			fired.current = key;
			setMode("ringing");
			audio.start();
		}
	}, [alarmAt, armed, audio.start, mode, now]);

	useEffect(() => {
		if (mode !== "ringing") return;
		void playVoice(WAKE_LINE, "alarm");
	}, [mode]);

	useEffect(() => {
		if (mode !== "snooze") return;
		let left = SNOOZE_SECONDS;
		setSnoozeLeft(left);
		const timer = window.setInterval(() => {
			left -= 1;
			setSnoozeLeft(left);
			if (left <= 0) {
				window.clearInterval(timer);
				setMode("ringing");
				audio.start();
			}
		}, 1000);
		return () => window.clearInterval(timer);
	}, [audio.start, mode]);

	useEffect(() => {
		if (mode !== "roommate") return;
		audio.start();
		const timer = window.setTimeout(() => {
			audio.stop();
			setMode("idle");
		}, 4000);
		return () => window.clearTimeout(timer);
	}, [audio.start, audio.stop, mode]);

	const finishAd = useCallback(() => {
		audio.stop();
		setArmed(false);
		setMode("idle");
	}, [audio.stop]);

	async function purchase(plan: Buyable) {
		if (localStorage.getItem(TERMS_KEY) !== "1") {
			setPending(plan);
			setNeedTerms(true);
			return;
		}
		setBuying(plan);
		try {
			const res = await fetch("/api/pay", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ plan, snoozePrice }),
			});
			const data = (await res.json()) as Receipt & { error?: string };
			if (!res.ok) throw new Error(data.error || "pay failed");
			const lines = data.purchases.map((line) => `${line.description}  ${money(line.amount)}`);
			setToast(
				`${lines.join("\n")}\nTotal ${money(data.total)}\n${data.mocked ? "Posted to the demo ledger." : "Posted to the Nessie sandbox."}`,
			);
			if (plan === "basic") {
				setMode("ad");
				return;
			}
			if (plan === "premium") {
				audio.stop();
				const next = Math.max(0, usesLeft - 1);
				setUsesLeft(next);
				localStorage.setItem(USES_KEY, String(next));
				setArmed(false);
				setMode("idle");
				return;
			}
			if (plan === "snooze") {
				audio.stop();
				const paid = data.purchases.find((line) => line.description === "Snooze Pass");
				const next = doubleSnooze(paid?.amount ?? snoozePrice);
				setSnoozePrice(next);
				localStorage.setItem(SNOOZE_KEY, String(next));
				setMode("snooze");
				return;
			}
			audio.stop();
			setArmed(false);
			setMode("roommate");
		} catch {
			setToast("The charge sneezed. Try that plan again.");
		} finally {
			setBuying(null);
		}
	}

	function acceptTerms() {
		localStorage.setItem(TERMS_KEY, "1");
		setNeedTerms(false);
		if (pending) void purchase(pending);
	}

	const clock = now ? now.toLocaleTimeString("en-GB", { hour12: false }) : "--:--:--";
	const flashing = screaming || mode === "ad";
	const [alarmH, alarmM] = alarmAt.split(":").map(Number);
	const minutesLeft = now ? (alarmH * 60 + alarmM - now.getHours() * 60 - now.getMinutes() + 1440) % 1440 || 1440 : 0;
	const untilAlarm = `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m`;

	return (
		<main>
			{flashing && <div className="alarm-flash pointer-events-none fixed inset-0 z-10 bg-brand" />}
			<section className="relative z-20 mx-auto max-w-3xl px-5 pt-6 pb-6 text-center">
				<Image
					src={screaming ? "/alarm-scream.jpg" : "/hero.jpg"}
					alt={screaming ? "The SnoozeFlix alarm screaming" : "A sleeper staring at a ringing alarm clock"}
					width={1024}
					height={559}
					priority
					className={`mx-auto mb-6 w-full rounded-3xl border border-white/10 shadow-2xl shadow-brand/10 transition-all ${screaming ? "max-w-xl" : "max-w-md"}`}
				/>
				<p className="text-xs uppercase tracking-[0.28em] text-cream/50">A subscription for being awake</p>
				<h1 className="font-display mt-3 text-4xl leading-none sm:text-6xl">
					{mode === "ringing" ? "Your free trial of sleep is over." : "The alarm you cannot dismiss."}
				</h1>
				<p className="clock mt-6 text-6xl text-cream sm:text-8xl">{clock}</p>
				{mode === "idle" && (
					<div className="mx-auto mt-8 flex max-w-md flex-col gap-5 rounded-3xl border border-white/10 bg-panel/80 p-6 text-left shadow-2xl shadow-black/40">
						<span className="text-center text-xs uppercase tracking-[0.2em] text-cream/50">Set alarm</span>
						<div className="relative flex items-center justify-center gap-2">
							<div className="pointer-events-none absolute inset-x-6 top-1/2 h-12 -translate-y-1/2 rounded-2xl bg-white/5 ring-1 ring-brand/40" />
							{(["Hour", "Minute"] as const).map((label, index) => (
								<Fragment key={label}>
									{index > 0 && <span className="clock relative z-10 text-4xl text-cream/60">:</span>}
									<WheelPicker
										label={label}
										count={index ? 60 : 24}
										value={Number(alarmAt.split(":")[index])}
										disabled={armed}
										onChange={(next) => {
											setAlarmAt((prev) => {
												const parts = prev.split(":");
												parts[index] = String(next).padStart(2, "0");
												return parts.join(":");
											});
											fired.current = "";
										}}
									/>
								</Fragment>
							))}
						</div>
						<div className="grid grid-cols-2 gap-3">
							<button
								type="button"
								onClick={() => {
									audio.unlock();
									setArmed(!armed);
								}}
								className={`rounded-full border px-5 py-3 transition ${armed ? "border-brand text-brand" : "border-cream/30 hover:border-cream"}`}
							>
								{armed ? "Disarm" : "Arm alarm"}
							</button>
							<button
								type="button"
								onClick={() => {
									audio.unlock();
									setArmed(true);
									setMode("ringing");
									audio.start();
								}}
								className="rounded-full bg-brand px-5 py-3 font-semibold text-white transition hover:brightness-110"
							>
								Ring now (demo)
							</button>
						</div>
						<p className="text-center text-sm text-cream/60">
							{armed ? `Rings in ${untilAlarm}. Keep this tab open. Dismissal is sold separately.` : "Arm once so the browser allows the noise."}
						</p>
					</div>
				)}
				{mode === "ringing" && (
					<div className="mt-6 flex justify-center">
						<RunawayButton />
					</div>
				)}
				{mode === "snooze" && (
					<p className="mt-6 text-2xl">Silence you paid for. It returns in {snoozeLeft}s.</p>
				)}
				{mode === "roommate" && <p className="mt-6 text-3xl">Ringing your roommate…</p>}
			</section>
			{mode === "ringing" && (
				<Paywall snoozePrice={snoozePrice} usesLeft={usesLeft} busy={buying !== null} buying={buying} onBuy={(plan) => void purchase(plan)} />
			)}
			{mode === "ad" && <FakeAd onDone={finishAd} />}
			{needTerms && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-5">
					<div className="w-full max-w-md rounded-3xl bg-panel p-6">
						<h2 className="font-display text-2xl">Accept the terms</h2>
						<p className="mt-2 text-sm text-cream/70">First purchase only. The scroll is long on purpose.</p>
						<Link href="/terms" target="_blank" className="mt-3 inline-block text-sm text-brand underline">
							Read all 40 articles
						</Link>
						<label className="mt-4 flex items-start gap-2 text-sm">
							<input type="checkbox" checked={acceptedBox} onChange={(event) => setAcceptedBox(event.target.checked)} />
							I have read all 40 articles and I am lying.
						</label>
						<button
							type="button"
							disabled={!acceptedBox}
							onClick={acceptTerms}
							className="mt-5 w-full rounded-full bg-brand py-3 font-semibold text-white disabled:opacity-40"
						>
							Accept and pay
						</button>
					</div>
				</div>
			)}
			{toast && (
				<div className="fixed bottom-6 right-5 z-[70] max-w-sm whitespace-pre-line rounded-2xl border border-white/10 bg-panel px-4 py-3 text-sm shadow-xl">
					{toast}
				</div>
			)}
		</main>
	);
}
