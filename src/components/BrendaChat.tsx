"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { playVoice } from "@/lib/playVoice";

type Msg = { role: "user" | "assistant"; content: string };

const OPENER =
	"Hi, I'm Brenda. I started crying in the parking lot. Please stay. I'll throw in a second alarm, free, that also charges you.";

export function BrendaChat() {
	const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: OPENER }]);
	const [text, setText] = useState("");
	const [turns, setTurns] = useState(0);
	const [busy, setBusy] = useState(false);
	const [done, setDone] = useState(false);
	const [toast, setToast] = useState("");
	const box = useRef<HTMLDivElement>(null);

	useEffect(() => {
		void playVoice(OPENER, "brenda");
	}, []);

	useEffect(() => {
		box.current?.scrollTo({ top: box.current.scrollHeight });
	}, [messages, toast]);

	async function send(event: FormEvent) {
		event.preventDefault();
		const content = text.trim();
		if (!content || busy || done) return;
		const nextTurns = turns + 1;
		const history = [...messages, { role: "user" as const, content }];
		setTurns(nextTurns);
		setText("");
		setBusy(true);
		setMessages(history);
		try {
			const res = await fetch("/api/brenda", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: history, isFinal: nextTurns >= 3 }),
			});
			const data = (await res.json()) as { reply?: string };
			const reply = data.reply || "Please. I'm delicate and also holding an invoice.";
			setMessages([...history, { role: "assistant", content: reply }]);
			void playVoice(reply, "brenda");
			if (nextTurns >= 3) {
				const pay = await fetch("/api/pay", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ plan: "cancel" }),
				});
				if (!pay.ok) throw new Error("fee");
				setDone(true);
				setToast("Subscription cancelled. We'll miss your money.");
			}
		} catch {
			setToast("Brenda dropped the phone. Send that again.");
			setTurns((current) => Math.max(0, current - 1));
		} finally {
			setBusy(false);
		}
	}

	return (
		<main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col px-5 pb-10">
			<p className="text-xs uppercase tracking-[0.2em] text-cream/50">Retention specialist</p>
			<h1 className="font-display mt-2 text-4xl">Brenda</h1>
			<div ref={box} className="mt-5 flex-1 space-y-3 overflow-y-auto rounded-3xl bg-panel p-4">
				{messages.map((message, index) => (
					<p
						key={`${message.role}-${index}`}
						className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
							message.role === "assistant" ? "bg-brand/20" : "ml-auto bg-white/10"
						}`}
					>
						{message.content}
					</p>
				))}
			</div>
			{done ? (
				<div className="mt-4">
					<p className="rounded-2xl bg-brand px-4 py-3 text-sm text-white">{toast}</p>
					<Link href="/" className="mt-3 inline-block text-sm underline">
						Back to the alarm
					</Link>
				</div>
			) : (
				<form onSubmit={(event) => void send(event)} className="mt-4 flex gap-2">
					<input
						value={text}
						onChange={(event) => setText(event.target.value)}
						placeholder="Tell Brenda why you're leaving"
						className="flex-1 rounded-full bg-panel px-4 py-3 text-sm outline-none"
					/>
					<button type="submit" disabled={busy} className="rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
						{busy ? "Sobbing…" : "Send"}
					</button>
				</form>
			)}
			{toast && !done && <p className="mt-3 text-sm text-brand">{toast}</p>}
		</main>
	);
}
