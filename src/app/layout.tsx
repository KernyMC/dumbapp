import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
	title: "SnoozeFlix — the subscription alarm clock",
	description: "The alarm clock you can only turn off by subscribing.",
	icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen antialiased">
				<header className="sticky top-0 z-50 border-b border-white/5 bg-ink/70 backdrop-blur-md">
					<nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-3">
						<Link href="/" className="relative h-9 w-[200px] overflow-hidden" aria-label="SnoozeFlix home">
							<Image src="/wordmark.jpg" alt="SnoozeFlix" fill sizes="290px" priority className="scale-[1.45] object-cover mix-blend-lighten" />
						</Link>
						<Link href="/account" className="rounded-full border border-white/10 px-4 py-2 text-sm text-cream/80 transition hover:border-brand hover:text-cream">
							My Account
						</Link>
					</nav>
				</header>
				{children}
			</body>
		</html>
	);
}
