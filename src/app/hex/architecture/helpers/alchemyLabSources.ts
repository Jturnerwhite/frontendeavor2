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
 */
export function labSourcesFromInventorySelection(
	selectedKeys: Set<string>,
	crafted: Item[],
	raw: Ingredient[],
): AlchemyLabSource[] {
	const out: AlchemyLabSource[] = []
	const seenRaw = new Set<string>()
	const seenCraftedIdx = new Set<number>()

	for (const k of selectedKeys) {
		if (k.startsWith('crafted:')) {
			const idx = Number(k.slice('crafted:'.length))
			if (Number.isNaN(idx) || idx < 0 || idx >= crafted.length) continue
			if (seenCraftedIdx.has(idx)) continue
			seenCraftedIdx.add(idx)
			const item = crafted[idx]
			if (item?.comps?.length) {
				const { labSlotId, item: itemForLab } = normalizeItemForLab(item)
				out.push({
					labKind: 'item',
					labSlotId,
					item: itemForLab,
					playerCraftedInventoryIndex: idx,
				})
			}
		} else {
			const ing = raw.find((i) => i.id === k)
			if (ing && !seenRaw.has(ing.id)) {
				seenRaw.add(ing.id)
				out.push({ labKind: 'ingredient', ingredient: ing })
			}
		}
	}
	return out
}

export function dedupeLabSources(rows: AlchemyLabSource[]): AlchemyLabSource[] {
	const seenIng = new Set<string>()
	const out: AlchemyLabSource[] = []
	for (const row of rows) {
		if (row.labKind === 'ingredient') {
			if (seenIng.has(row.ingredient.id)) continue
			seenIng.add(row.ingredient.id)
			out.push(row)
		} else {
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

/** Raw ids and crafted inventory indices to remove after a successful craft (indices are for the stash *before* removal). */
export function collectConsumptionFromLabSources(sources: AlchemyLabSource[]): {
	rawIds: string[]
	craftedIndices: number[]
} {
	const rawIds: string[] = []
	const craftedIndices: number[] = []
	const seenRaw = new Set<string>()
	const seenCrafted = new Set<number>()
	for (const row of sources) {
		if (row.labKind === 'ingredient') {
			if (!seenRaw.has(row.ingredient.id)) {
				seenRaw.add(row.ingredient.id)
				rawIds.push(row.ingredient.id)
			}
		} else if (row.playerCraftedInventoryIndex != null) {
			const idx = row.playerCraftedInventoryIndex
			if (!seenCrafted.has(idx)) {
				seenCrafted.add(idx)
				craftedIndices.push(idx)
			}
		}
	}
	return { rawIds, craftedIndices }
}
