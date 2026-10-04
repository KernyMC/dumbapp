import { round2, type Ledger, type PaidLine, type Purchase } from "@/lib/plans";

const BASE = "http://api.nessieisreal.com";
const START_BALANCE = 500;

type Store = { balance: number; purchases: Purchase[]; forceMock: boolean };

const g = globalThis as typeof globalThis & { __snoozeStore?: Store };

function store(): Store {
	if (!g.__snoozeStore) {
		g.__snoozeStore = { balance: START_BALANCE, purchases: [], forceMock: false };
	}
	return g.__snoozeStore;
}

function mockForced() {
	return process.env.DEMO_MOCK === "true" || store().forceMock;
}

function keysReady() {
	return Boolean(process.env.NESSIE_API_KEY && process.env.NESSIE_ACCOUNT_ID && process.env.NESSIE_MERCHANT_ID);
}

function today() {
	return new Date().toISOString().slice(0, 10);
}

function displayed(balance: number, purchases: Purchase[]) {
	const pending = purchases
		.filter((p) => p.status.toLowerCase() === "pending")
		.reduce((sum, p) => sum + p.amount, 0);
	return round2(balance - pending);
}

function snapshot(balance: number, purchases: Purchase[], mocked: boolean): Ledger {
	return {
		balance,
		displayedBalance: displayed(balance, purchases),
		purchases,
		mocked,
	};
}

function mockSnapshot(): Ledger {
	const s = store();
	return snapshot(s.balance, s.purchases, true);
}

function mockPurchase(amount: number, description: string): PaidLine {
	const purchase: Purchase = {
		_id: crypto.randomUUID(),
		amount,
		description,
		purchase_date: today(),
		status: "pending",
	};
	store().purchases.push(purchase);
	return { ...purchase, mocked: true };
}

async function nessie(path: string, init?: RequestInit) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 8000);
	try {
		return await fetch(`${BASE}${path}${path.includes("?") ? "&" : "?"}key=${process.env.NESSIE_API_KEY}`, {
			...init,
			signal: ctrl.signal,
			headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
		});
	} finally {
		clearTimeout(timer);
	}
}

function asPurchases(data: unknown): Purchase[] {
	if (!Array.isArray(data)) throw new Error("Nessie purchases were not a list");
	return data.map((raw) => {
		const row = raw as Record<string, unknown>;
		return {
			_id: String(row._id ?? ""),
			amount: Number(row.amount ?? 0),
			description: String(row.description ?? "Purchase"),
			purchase_date: String(row.purchase_date ?? ""),
			status: String(row.status ?? "pending"),
		};
	});
}

export async function createPurchase(amount: number, description: string): Promise<PaidLine> {
	if (mockForced() || !keysReady()) return mockPurchase(amount, description);
	try {
		const res = await nessie(`/accounts/${process.env.NESSIE_ACCOUNT_ID}/purchases`, {
			method: "POST",
			body: JSON.stringify({
				merchant_id: process.env.NESSIE_MERCHANT_ID,
				medium: "balance",
				purchase_date: today(),
				amount,
				description,
			}),
		});
		const data = (await res.json()) as { objectCreated?: { _id?: string } };
		if (!res.ok || !data.objectCreated?._id) throw new Error(`purchase ${res.status}`);
		return {
			_id: data.objectCreated._id,
			amount,
			description,
			purchase_date: today(),
			status: "pending",
			mocked: false,
		};
	} catch (error) {
		console.error("Nessie purchase fell back to mock", error);
		store().forceMock = true;
		return mockPurchase(amount, description);
	}
}

export async function getLedger(): Promise<Ledger> {
	if (mockForced() || !keysReady()) return mockSnapshot();
	try {
		const accountId = process.env.NESSIE_ACCOUNT_ID;
		const [accountRes, purchaseRes] = await Promise.all([
			nessie(`/accounts/${accountId}`),
			nessie(`/accounts/${accountId}/purchases`),
		]);
		const account = (await accountRes.json()) as { balance?: number };
		const purchases = asPurchases(await purchaseRes.json());
		if (!accountRes.ok || !purchaseRes.ok) throw new Error("ledger read failed");
		return snapshot(Number(account.balance ?? 0), purchases, false);
	} catch (error) {
		console.error("Nessie ledger fell back to mock", error);
		store().forceMock = true;
		return mockSnapshot();
	}
}
