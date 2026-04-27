export function GetItemsByWeight<T>(items: Array<T>, weightingKey: keyof T, idKey: keyof T, count: number, allowDuplicates: boolean = false):Array<T> {
	if (items.length === 0 || count <= 0) return [];
	const totalWeighting = items.reduce((acc, curr) => acc + (curr[weightingKey] as number), 0);
	if (totalWeighting <= 0) return [];
	const output: T[] = [];
	const uniqueIdCount = new Set(items.map((x) => x[idKey])).size;
	const seen = new Set<unknown>();

	for (let i = 0; i < count; i++) {
		if (!allowDuplicates && seen.size >= uniqueIdCount) break;

		let added = false;
		do {
			const roll = Math.random() * totalWeighting; // 0 to total of all weights
			let scalingUpperBound = 0;
			let choice: T | null = null;
			for (let j = 0; j < items.length; j++) {
				const item = items[j]!;
				scalingUpperBound += item[weightingKey] as number;
				if (roll < scalingUpperBound) {
					choice = item;
					break;
				}
			}
			if (choice == null) break;

			if (allowDuplicates) {
				output.push(choice);
				added = true;
			} else if (!seen.has(choice[idKey])) {
				// Re-roll on duplicate: each draw is a proper weighted sample from the full list
				output.push(choice);
				seen.add(choice[idKey]);
				added = true;
			}
		} while (!allowDuplicates && !added);
	}
	return output;
}
