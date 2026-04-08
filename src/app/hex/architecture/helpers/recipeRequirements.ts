import { ITEM_TAG } from '@/app/hex/architecture/enums';
import type {
	Ingredient,
	IngredientBase,
	Item,
	RecipeRequiredIngredient,
} from '@/app/hex/architecture/typings';

export function isIngredientBaseRef(t: IngredientBase | ITEM_TAG): t is IngredientBase {
	return typeof t === 'object' && t !== null && 'name' in t;
}

export function formatRequiredIngredientEntry(req: RecipeRequiredIngredient): string {
	const t = req.type;
	let label = isIngredientBaseRef(t) ? t.name : String(t);
	if (req.qty != null && req.qty !== 1) {
		label += ` ×${req.qty}`;
	}
	if (req.quality != null) {
		label += ` (min quality ${req.quality})`;
	}
	return label;
}

export function playerMeetsRequirement(
	req: RecipeRequiredIngredient,
	rawIngredients: Ingredient[],
	inventoryItems: Item[],
): boolean {
	const need = req.qty ?? 1;
	if (isIngredientBaseRef(req.type)) {
		const baseName = req.type.name;
		const count = rawIngredients.filter((i) => i.base.name === baseName).length;
		return count >= need;
	}
	const tag = req.type as ITEM_TAG;
	let count = inventoryItems.filter(
		(i) => i.types.includes(tag) && (req.quality == null || i.quality >= req.quality),
	).length;
	count += rawIngredients.filter((i) => i.base.types.includes(tag) && req.quality == null).length;
	return count >= need;
}

export type CraftedWithIndex = { item: Item; index: number };

/**
 * Items the player may use to satisfy a requirement (full inventory; not consumption-filtered).
 */
export function getInventoryForRequirement(
	req: RecipeRequiredIngredient,
	raw: Ingredient[],
	crafted: Item[],
): { ingredients: Ingredient[]; craftedEntries: CraftedWithIndex[] } {
	if (isIngredientBaseRef(req.type)) {
		const base = req.type;
		const ingredients = raw.filter((i) => i.base.name === base.name);
		return { ingredients, craftedEntries: [] };
	}
	const tag = req.type as ITEM_TAG;
	const craftedEntries = crafted
		.map((item, index) => ({ item, index }))
		.filter(
			({ item }) =>
				item.types.includes(tag) && (req.quality == null || item.quality >= req.quality),
		);
	const ingredients =
		req.quality == null ? raw.filter((i) => i.base.types.includes(tag)) : [];
	return { ingredients, craftedEntries };
}

export function filterInventoryAfterConsumption(
	ingredients: Ingredient[],
	craftedEntries: CraftedWithIndex[],
	consumedRawIds: Set<string>,
	consumedCraftedIndices: Set<number>,
): { ingredients: Ingredient[]; craftedEntries: CraftedWithIndex[] } {
	return {
		ingredients: ingredients.filter((i) => !consumedRawIds.has(i.id)),
		craftedEntries: craftedEntries.filter((e) => !consumedCraftedIndices.has(e.index)),
	};
}

/** Count selected rows (each raw id or each crafted slot counts as 1 toward qty). */
export function countSelectionUnits(
	selectedKeys: Set<string>,
	crafted: Item[],
	raw: Ingredient[],
): number {
	let n = 0;
	for (const k of selectedKeys) {
		if (k.startsWith('crafted:')) {
			const idx = Number(k.slice('crafted:'.length));
			if (!Number.isNaN(idx) && idx >= 0 && idx < crafted.length) {
				n += 1;
			}
		} else if (raw.some((i) => i.id === k)) {
			n += 1;
		}
	}
	return n;
}

/**
 * Resolve chosen ingredients for alchemy. `crafted` must be the full crafted inventory array
 * so `crafted:${index}` keys resolve correctly.
 */
export function ingredientsFromInventorySelection(
	selectedKeys: Set<string>,
	crafted: Item[],
	raw: Ingredient[],
): Ingredient[] {
	const out: Ingredient[] = [];
	const seen = new Set<string>();
	for (const k of selectedKeys) {
		if (k.startsWith('crafted:')) {
			const idx = Number(k.slice('crafted:'.length));
			const item = crafted[idx];
			if (item?.ingredients?.length) {
				for (const ing of item.ingredients) {
					if (!seen.has(ing.id)) {
						seen.add(ing.id);
						out.push(ing);
					}
				}
			}
		} else {
			const ing = raw.find((i) => i.id === k);
			if (ing && !seen.has(ing.id)) {
				seen.add(ing.id);
				out.push(ing);
			}
		}
	}
	return out;
}
