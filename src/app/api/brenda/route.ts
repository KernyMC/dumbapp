import { brendaReply } from "@/lib/brenda";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
	let body: { messages?: ChatMessage[]; isFinal?: boolean };
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "bad json" }, { status: 400 });
	}
	if (!Array.isArray(body.messages)) {
		return NextResponse.json({ error: "bad request" }, { status: 400 });
	}
	const messages = body.messages.filter(
		(message) =>
			message &&
			(message.role === "user" || message.role === "assistant") &&
			typeof message.content === "string",
	);
	const reply = await brendaReply(messages, Boolean(body.isFinal));
	return NextResponse.json({ reply });
}
