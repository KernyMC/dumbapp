import { tts } from "@/lib/elevenlabs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	let body: { text?: string; voice?: string };
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "bad json" }, { status: 400 });
	}
	if (!body.text || (body.voice !== "alarm" && body.voice !== "brenda")) {
		return NextResponse.json({ error: "bad request" }, { status: 400 });
	}
	try {
		const audio = await tts(body.text, body.voice);
		return new NextResponse(audio, {
			headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
		});
	} catch {
		return NextResponse.json({ error: "voice unavailable" }, { status: 503 });
	}
}
