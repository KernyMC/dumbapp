import { wili } from "@/lib/freewili";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	const body = (await req.json().catch(() => ({}))) as { action?: string };
	if (body.action !== "ring" && body.action !== "stop") {
		return NextResponse.json({ error: "bad request" }, { status: 400 });
	}
	return NextResponse.json({ queued: wili(body.action) });
}
