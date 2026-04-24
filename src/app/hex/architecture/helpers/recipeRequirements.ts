import { ITEM_TAG } from '@/app/hex/architecture/enums';
import type {
	Ingredient,
	IngredientBase,
	Item,
	RecipeRequiredIngredient,
} from '@/app/hex/architecture/typings';
import { IngredientBases } from '@/app/hex/architecture/data/ingredientBases';

export function isIngredientBaseRef(t: IngredientBase | ITEM_TAG): t is IngredientBase {
	return typeof t === 'object' && t !== null && 'name' in t;
}

export function playerMeetsRequirement(
	req: RecipeRequiredIngredient,
	rawIngredients: Ingredient[],
	inventoryItems: Item[],
): boolean {
	const need = req.qty ?? 1;
	if (isIngredientBaseRef(req.type)) {
		const baseName = req.type.id;
		const count = rawIngredients.filter((i) => i.baseIngId === baseName).length;
		return count >= need;
	}
	const tag = req.type as ITEM_TAG;
	let count = inventoryItems.filter(
		(i) => i.types.includes(tag) && (req.quality == null || i.quality >= req.quality),
	).length;
	count += rawIngredients.filter((i) => IngredientBases[i.baseIngId].types.includes(tag) && req.quality == null).length;
	return count >= need;
}

/** Crafted stack eligible for a requirement; `id` is `item.id` (inventory key). */
export type CraftedInventoryEntry = { item: Item; id: string };

/** @deprecated use CraftedInventoryEntry */
export type CraftedWithIndex = CraftedInventoryEntry;

/**
 * Items the player may use to satisfy a requirement (full inventory; not consumption-filtered).
 */
export function getInventoryForRequirement(
	req: RecipeRequiredIngredient,
	raw: Ingredient[],
	crafted: Item[],
): { ingredients: Ingredient[]; craftedEntries: CraftedInventoryEntry[] } {
	if (isIngredientBaseRef(req.type)) {
		const base = req.type;
		const ingredients = raw.filter((i) => i.baseIngId === base.id);
		return { ingredients, craftedEntries: [] };
	}
	const tag = req.type as ITEM_TAG;
	const craftedEntries = crafted
		.map((item) => ({ item, id: item.id }))
		.filter(
			({ item }) =>
				item.types.includes(tag) && (req.quality == null || item.quality >= req.quality),
		);
	const ingredients =
		req.quality == null ? raw.filter((i) => IngredientBases[i.baseIngId].types.includes(tag)) : [];
	return { ingredients, craftedEntries };
}

export function filterInventoryAfterConsumption(
	ingredients: Ingredient[],
	craftedEntries: CraftedInventoryEntry[],
	consumedRawIds: Set<string>,
	consumedCraftedItemIds: Set<string>,
): { ingredients: Ingredient[]; craftedEntries: CraftedInventoryEntry[] } {
	return {
		ingredients: ingredients.filter((i) => !consumedRawIds.has(i.id)),
		craftedEntries: craftedEntries.filter((e) => !consumedCraftedItemIds.has(e.id)),
	};
}

/** Classify checkbox keys into raw ingredient ids and crafted item ids (matches `Ingredient.id` / `Item.id`). */
export function partitionInventorySelectionKeys(
	selectedKeys: Set<string>,
	raw: Ingredient[],
	crafted: Item[],
): { rawIds: string[]; craftedItemIds: string[] } {
	const rawIds: string[] = [];
	const craftedItemIds: string[] = [];
	const seenR = new Set<string>();
	const seenC = new Set<string>();
	for (const k of selectedKeys) {
		if (raw.some((i) => i.id === k)) {
			if (!seenR.has(k)) {
				seenR.add(k);
				rawIds.push(k);
			}
		} else if (crafted.some((i) => i.id === k)) {
			if (!seenC.has(k)) {
				seenC.add(k);
				craftedItemIds.push(k);
			}
		}
	}
	return { rawIds, craftedItemIds };
}

/** Count selected rows (each raw id or each crafted item id counts as 1 toward qty). */
export function countSelectionUnits(
	selectedKeys: Set<string>,
	crafted: Item[],
	raw: Ingredient[],
): number {
	let n = 0;
	for (const k of selectedKeys) {
		if (raw.some((i) => i.id === k)) {
			n += 1;
		} else if (crafted.some((i) => i.id === k)) {
			n += 1;
		}
	}
	return n;
}

/** First occurrence wins — use after merging staged selections so the same physical ingredient is not listed twice in the lab. */
export function dedupeIngredientsById(ingredients: Ingredient[]): Ingredient[] {
	const seen = new Set<string>()
	const out: Ingredient[] = []
	for (const ing of ingredients) {
		if (!seen.has(ing.id)) {
			seen.add(ing.id)
			out.push(ing)
		}
	}
	return out
}

/**
 * Resolve chosen ingredients for alchemy (legacy: expands crafted items into nested ingredients).
 * Selection keys are `Ingredient.id` or `Item.id` into the passed `raw` / `crafted` arrays.
 */
export function ingredientsFromInventorySelection(
	selectedKeys: Set<string>,
	crafted: Item[],
	raw: Ingredient[],
): Ingredient[] {
	const out: Ingredient[] = [];
	const seen = new Set<string>();
	for (const k of selectedKeys) {
		const ingDirect = raw.find((i) => i.id === k);
		if (ingDirect && !seen.has(ingDirect.id)) {
			seen.add(ingDirect.id);
			out.push(ingDirect);
			continue;
		}
		const item = crafted.find((i) => i.id === k);
		if (item?.ingredients?.length) {
			for (const ing of item.ingredients) {
				if (!seen.has(ing.id)) {
					seen.add(ing.id);
					out.push(ing);
				}
			}
		}
	}
	return out;
}
