import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
	const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
	for (const line of raw.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const cut = trimmed.indexOf("=");
		if (cut === -1) continue;
		const key = trimmed.slice(0, cut).trim();
		const value = trimmed.slice(cut + 1).trim();
		if (!process.env[key]) process.env[key] = value;
	}
}

async function post(path: string, body: unknown) {
	const res = await fetch(`http://api.nessieisreal.com${path}?key=${process.env.NESSIE_API_KEY}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const text = await res.text();
	const data = text ? (JSON.parse(text) as { objectCreated?: { _id?: string }; _id?: string }) : {};
	const id = data.objectCreated?._id || data._id;
	if (!res.ok || !id) throw new Error(`${path} ${res.status} ${text}`);
	return id;
}

async function main() {
	loadEnv();
	if (!process.env.NESSIE_API_KEY) {
		console.error("Missing NESSIE_API_KEY in .env.local. Get one at http://api.nessieisreal.com and rerun npm run setup:nessie");
		process.exit(1);
	}
	const customerId = await post("/customers", {
		first_name: "Sleepy",
		last_name: "Kevin",
		address: {
			street_number: "1",
			street_name: "Dream Ave",
			city: "Ann Arbor",
			state: "MI",
			zip: "48104",
		},
	});
	const accountId = await post(`/customers/${customerId}/accounts`, {
		type: "Checking",
		nickname: "Sleep Fund",
		rewards: 0,
		balance: 500,
	});
	const merchantId = await post("/merchants", {
		name: "SnoozeFlix Inc.",
		category: "Subscriptions",
		address: {
			street_number: "1",
			street_name: "Dream Ave",
			city: "Ann Arbor",
			state: "MI",
			zip: "48104",
		},
		geocode: { lat: 42.2808, lng: -83.743 },
	});
	console.log(`NESSIE_ACCOUNT_ID=${accountId}`);
	console.log(`NESSIE_MERCHANT_ID=${merchantId}`);
	console.log("Paste both into .env.local. Also add ELEVENLABS_VOICE_ALARM and ELEVENLABS_VOICE_BRENDA, then set DEMO_MOCK=false.");
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
