import Anthropic from "@anthropic-ai/sdk";

const SYSTEM = `You are Brenda, the retention specialist at SnoozeFlix, an alarm clock that charges a subscription to turn it off. The user wants to cancel. You are dramatic, desperate and theatrical, on the verge of tears, but always polite. Every reply must: react emotionally to what the user said, then offer one absurd retention deal (e.g. "3 months at 50% off, but only on Tuesdays", "we'll throw in a second alarm, free"). Max 2 short sentences. Never mention you are an AI. Keep it PG and funny.`;

const FINAL = `This is your final reply. Give up dramatically and accept the cancellation, but mention the $2.99 cancellation fee.`;

const MOCK = [
	"I already cried in the stairwell. Three months at 50% off, but only on Tuesdays, and only if you sigh first.",
	"Please stay. We'll throw in a second alarm, free, and it will bill your houseplant.",
	"I rehearsed this sob. Stay and I'll rename the snooze button after you. It still costs money.",
	"Fine. Go be awake for free like a wild animal. Cancellation fee is $2.99, and I will think of you during it.",
];

type ChatMessage = { role: "user" | "assistant"; content: string };

function mockLine(isFinal: boolean, userTurns: number) {
	if (isFinal) return MOCK[3];
	return MOCK[userTurns % 3];
}

export async function brendaReply(messages: ChatMessage[], isFinal: boolean) {
	const turns = messages.filter((m) => m.role === "user").length;
	const usable = messages.filter((m) => m.content.trim());
	while (usable[0]?.role === "assistant") usable.shift();
	if (process.env.DEMO_MOCK === "true" || !process.env.ANTHROPIC_API_KEY || usable[0]?.role !== "user") {
		return mockLine(isFinal, turns);
	}
	try {
		const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
		const res = await client.messages.create({
			model: "claude-haiku-4-5-20251001",
			max_tokens: 150,
			system: isFinal ? `${SYSTEM}\n\n${FINAL}` : SYSTEM,
			messages: usable,
		});
		const block = res.content.find((part) => part.type === "text");
		return block && block.type === "text" && block.text.trim() ? block.text.trim() : mockLine(isFinal, turns);
	} catch (error) {
		console.error("Brenda fell back to mock", error);
		return mockLine(isFinal, turns);
	}
}
