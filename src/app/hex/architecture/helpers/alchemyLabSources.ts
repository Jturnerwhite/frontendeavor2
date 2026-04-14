import type { AlchComponent, AlchemyLabSource, Ingredient, Item } from '@/app/hex/architecture/typings'
import { GenerateTempId } from '@/app/hex/architecture/helpers/alchHelpers'
import { dedupeIngredientsById } from '@/app/hex/architecture/helpers/recipeRequirements'

/** Clone a crafted item for the lab and retag comps so placement tracks `labSlotId`. */
export function normalizeItemForLab(item: Item): { labSlotId: string; item: Item } {
	const labSlotId = GenerateTempId()
	const itemClone = structuredClone(item) as Item
	itemClone.comps = itemClone.comps.map((c: AlchComponent, index: number) => ({
		...c,
		id: c.id ?? GenerateTempId(),
		sourceIngredientId: labSlotId,
		ingredientIndex: index,
	}))
	return { labSlotId, item: itemClone }
}

/**
 * Build lab sources from checkbox keys. Crafted rows add the **item** as a source; raw rows add the ingredient.
 * Keys are `Ingredient.id` or `Item.id`.
 */
export function labSourcesFromInventorySelection(
	selectedKeys: Set<string>,
	crafted: Item[],
	raw: Ingredient[],
): AlchemyLabSource[] {
	const out: AlchemyLabSource[] = []
	const seenRaw = new Set<string>()
	const seenCraftedId = new Set<string>()

	for (const k of selectedKeys) {
		const ing = raw.find((i) => i.id === k)
		if (ing && !seenRaw.has(ing.id)) {
			seenRaw.add(ing.id)
			out.push({ labKind: 'ingredient', ingredient: ing })
			continue
		}
		const sourceItem = crafted.find((i) => i.id === k)
		if (sourceItem?.comps?.length && !seenCraftedId.has(sourceItem.id)) {
			seenCraftedId.add(sourceItem.id)
			const { labSlotId, item: itemForLab } = normalizeItemForLab(sourceItem)
			out.push({
				labKind: 'item',
				labSlotId,
				item: itemForLab,
				playerCraftedItemId: sourceItem.id,
			})
		}
	}
	return out
}

export function dedupeLabSources(rows: AlchemyLabSource[]): AlchemyLabSource[] {
	const seenIng = new Set<string>()
	const seenCrafted = new Set<string>()
	const out: AlchemyLabSource[] = []
	for (const row of rows) {
		if (row.labKind === 'ingredient') {
			if (seenIng.has(row.ingredient.id)) continue
			seenIng.add(row.ingredient.id)
			out.push(row)
		} else {
			const id = row.playerCraftedItemId ?? row.item.id
			if (seenCrafted.has(id)) continue
			seenCrafted.add(id)
			out.push(row)
		}
	}
	return out
}

/** For the crafted `Item.ingredients` lineage field: raw rows plus nested ingredients from any crafted sources. */
export function flattenLabSourcesToIngredients(sources: AlchemyLabSource[]): Ingredient[] {
	const out: Ingredient[] = []
	for (const row of sources) {
		if (row.labKind === 'ingredient') {
			out.push(structuredClone(row.ingredient))
		} else {
			const nested = row.item.ingredients ?? []
			for (const ing of nested) {
				out.push(structuredClone(ing))
			}
		}
	}
	return dedupeIngredientsById(out)
}

/** Raw ids and crafted item ids to remove after a successful craft. */
export function collectConsumptionFromLabSources(sources: AlchemyLabSource[]): {
	rawIds: string[]
	craftedItemIds: string[]
} {
	const rawIds: string[] = []
	const craftedItemIds: string[] = []
	const seenRaw = new Set<string>()
	const seenCrafted = new Set<string>()
	for (const row of sources) {
		if (row.labKind === 'ingredient') {
			if (!seenRaw.has(row.ingredient.id)) {
				seenRaw.add(row.ingredient.id)
				rawIds.push(row.ingredient.id)
			}
		} else if (row.playerCraftedItemId != null) {
			const id = row.playerCraftedItemId
			if (!seenCrafted.has(id)) {
				seenCrafted.add(id)
				craftedItemIds.push(id)
			}
		}
	}
	return { rawIds, craftedItemIds }
}
