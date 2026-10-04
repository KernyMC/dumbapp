import { createPurchase } from "@/lib/nessie";
import { planCharge, round2 } from "@/lib/plans";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	let body: { plan?: string; snoozePrice?: unknown };
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "bad json" }, { status: 400 });
	}
	const lines = planCharge(body.plan ?? "", body.snoozePrice);
	if (!lines) return NextResponse.json({ error: "unknown plan" }, { status: 400 });
	const purchases = [];
	for (const line of lines) purchases.push(await createPurchase(line.amount, line.description));
	const total = round2(purchases.reduce((sum, line) => sum + line.amount, 0));
	return NextResponse.json({
		purchases,
		total,
		mocked: purchases.some((line) => line.mocked),
	});
}
