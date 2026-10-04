import { TERMS } from "@/lib/terms";

export default function TermsPage() {
	return (
		<main className="mx-auto w-full max-w-2xl px-5 pb-20">
			<pre className="whitespace-pre-wrap font-serif text-sm leading-7 text-cream/85">{TERMS}</pre>
		</main>
	);
}
