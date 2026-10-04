const JOKES: Record<number, string> = {
	3: "SnoozeFlix may ring during hours that do not exist, including the hour your mother calls.",
	7: "Silence is sold by the second. Unused silence expires when you open your eyes.",
	14: "Clause 14.3: SnoozeFlix owns your dreams, including the director's cut and any cameo by your dentist.",
	19: "The Dismiss button is ornamental. Chasing it counts as cardio, which we may also bill.",
	22: "Refunds are issued as a longer alarm. This is considered customer care.",
	28: "Family Plan roommates consent by living within earshot. Walls are not a legal defense.",
	33: "Brenda is a person in the emotional sense. Disagreeing with her is a billable event.",
	37: "By reaching article 37 you agree you have no friend willing to wake you for free.",
	40: "These terms auto-renew every time you almost got up and didn't.",
};

const paragraphs = [
	"You agree that pressing anything round is a purchase, that being conscious is a premium feature, and that this sentence restates the previous sentence in case you skimmed.",
	"Continued breathing after the alarm constitutes acceptance, renewal, and a small personal betrayal we will itemize.",
	"If a clause contradicts another clause, both clauses win and you owe the larger number.",
];

function article(n: number) {
	const joke = JOKES[n] ?? `Article ${n} exists so the scroll bar can humble you. It incorporates every earlier article by reference, including the ones you skipped.`;
	return [
		`Article ${n}`,
		joke,
		...paragraphs.map((line) => `${line} This restatement is numbered ${n} so it looks official.`),
		"",
	].join("\n");
}

export const TERMS = [
	"SNOOZEFLIX TERMS OF STAYING ASLEEP",
	"Last updated the moment you tried to dismiss this.",
	"These forty articles are the whole agreement. There is no summary that saves you.",
	"",
	...Array.from({ length: 40 }, (_, i) => article(i + 1)),
	"End of terms. The alarm kept its receipt.",
].join("\n");
