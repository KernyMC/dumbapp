import { money, type Purchase } from "@/lib/plans";

export function InvoiceTable({ purchases }: { purchases: Purchase[] }) {
	const rows = purchases
		.map((purchase, index) => ({ purchase, index }))
		.sort((a, b) => {
			const byDate = b.purchase.purchase_date.localeCompare(a.purchase.purchase_date);
			return byDate || b.index - a.index;
		});

	if (!rows.length) {
		return <p className="text-cream/60">No wake-ups purchased yet. The alarm is undefeated.</p>;
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left text-sm">
				<thead className="text-xs uppercase tracking-wider text-cream/45">
					<tr>
						<th className="py-2 pr-3">Invoice</th>
						<th className="py-2 pr-3">Description</th>
						<th className="py-2 pr-3">Date</th>
						<th className="py-2 pr-3">Status</th>
						<th className="py-2 text-right">Amount</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, displayIndex) => (
						<tr key={row.purchase._id || displayIndex} className="border-t border-white/10">
							<td className="py-3 pr-3 font-mono text-xs">
								SF-{10001 + (rows.length - 1 - displayIndex)}
							</td>
							<td className="py-3 pr-3">{row.purchase.description}</td>
							<td className="py-3 pr-3">{row.purchase.purchase_date}</td>
							<td className="py-3 pr-3 capitalize">{row.purchase.status}</td>
							<td className="py-3 text-right">{money(row.purchase.amount)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
