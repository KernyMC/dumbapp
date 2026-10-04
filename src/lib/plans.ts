export type PlanId = "basic" | "premium" | "snooze" | "family" | "cancel";

export type Purchase = {
	_id: string;
	amount: number;
	description: string;
	purchase_date: string;
	status: string;
};

export type Ledger = {
	balance: number;
	displayedBalance: number;
	purchases: Purchase[];
	mocked: boolean;
};

export type PaidLine = Purchase & { mocked: boolean };

export const BASE_SNOOZE = 0.99;
export const CANCEL_FEE = 2.99;
export const SNOOZE_SECONDS = 20;
export const PREMIUM_USES = 3;
export const WAKE_LINE = "Good morning! Your free trial of being awake has ended.";

export const PLANS = {
	basic: {
		name: "Basic",
		price: 4.99,
		pitch: "Alarm stops after an unskippable pillow commercial.",
		banner: "/wordmark.jpg",
	},
	premium: {
		name: "Premium",
		price: 9.99,
		pitch: "Stops instantly. Three uses a month, allegedly.",
		banner: "/mascot.jpg",
	},
	snooze: {
		name: "Snooze Pass",
		price: BASE_SNOOZE,
		pitch: "Twenty seconds of silence. Then it comes back.",
		banner: "/hero.jpg",
	},
	family: {
		name: "Family Plan",
		price: 14.99,
		pitch: "Your alarm stops. Your roommate's starts.",
		banner: "/alarm-scream.jpg",
	},
} as const;

const FEE_POOL = [
	{ description: "Wake-Up Fee", amount: 0.49 },
	{ description: "Timezone Convenience Fee", amount: 0.25 },
];

export function money(amount: number) {
	return `$${amount.toFixed(2)}`;
}

export function round2(amount: number) {
	return Math.round(amount * 100) / 100;
}

export function surpriseFees() {
	const count = 1 + Math.floor(Math.random() * 2);
	return [...FEE_POOL].sort(() => Math.random() - 0.5).slice(0, count);
}

export function doubleSnooze(price: number) {
	return round2(price * 2);
}

export function snoozeCharge(requested: unknown) {
	const n = typeof requested === "number" ? requested : Number(requested);
	let price = BASE_SNOOZE;
	for (let i = 0; i < 16; i++) {
		if (Number.isFinite(n) && Math.abs(n - price) < 0.02) return price;
		price = doubleSnooze(price);
	}
	return BASE_SNOOZE;
}

export function planCharge(plan: string, snoozePrice: unknown) {
	if (plan === "cancel") {
		return [{ description: "Cancellation Fee", amount: CANCEL_FEE }];
	}
	if (plan === "snooze") {
		return [{ description: "Snooze Pass", amount: snoozeCharge(snoozePrice) }, ...surpriseFees()];
	}
	if (plan === "basic" || plan === "premium" || plan === "family") {
		const item = PLANS[plan];
		const description = item.name.endsWith("Plan") ? item.name : `${item.name} Plan`;
		return [{ description, amount: item.price }, ...surpriseFees()];
	}
	return null;
}
