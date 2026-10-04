import { getLedger } from "@/lib/nessie";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
	return NextResponse.json(await getLedger());
}
