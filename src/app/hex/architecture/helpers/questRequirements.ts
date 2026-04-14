import { ITEM_TAG } from '@/app/hex/architecture/enums'
import type {
	Ingredient,
	IngredientBase,
	Item,
	QuestRequirement,
	Recipe,
} from '@/app/hex/architecture/typings'
import { IngredientBases } from '@/app/hex/architecture/data/ingredientBases'
import type { CraftedInventoryEntry } from '@/app/hex/architecture/helpers/recipeRequirements'
import { filterInventoryAfterConsumption } from '@/app/hex/architecture/helpers/recipeRequirements'

/** Slots that can satisfy a quest requirement (full inventory; not consumption-filtered). */
export function getInventoryForQuestRequirement(
	qr: QuestRequirement,
	raw: Ingredient[],
	crafted: Item[],
): { ingredients: Ingredient[]; craftedEntries: CraftedInventoryEntry[] } {
	const minQ = qr.quality ?? null

	if (qr.requirementKind === 'ingredient') {
		const base = qr.itemType as IngredientBase
		const ingredients = raw.filter(
			(i) => i.baseIngId === base.id && (minQ == null || i.quality >= minQ),
		)
		return { ingredients, craftedEntries: [] }
	}

	if (qr.requirementKind === 'tag') {
		const tag = qr.itemType as ITEM_TAG
		const craftedEntries = crafted
			.map((item) => ({ item, id: item.id }))
			.filter(
				({ item }) =>
					item.types.includes(tag) && (minQ == null || item.quality >= minQ),
			)
		const ingredients =
			minQ == null
				? raw.filter((i) => IngredientBases[i.baseIngId]?.types.includes(tag))
				: []
		return { ingredients, craftedEntries }
	}

	if (qr.requirementKind === 'recipe') {
		const recipe = qr.itemType as Recipe
		const craftedEntries = crafted
			.map((item) => ({ item, id: item.id }))
			.filter(
				({ item }) =>
					item.baseRecipeId === recipe.id &&
					(minQ == null || item.quality >= minQ),
			)
		return { ingredients: [], craftedEntries }
	}

	return { ingredients: [], craftedEntries: [] }
}

export function formatQuestRequirement(qr: QuestRequirement): string {
	const n = qr.qty ?? 1
	const q = qr.quality != null ? ` (min quality ${qr.quality})` : ''
	if (qr.requirementKind === 'ingredient') {
		return `${(qr.itemType as IngredientBase).name} ×${n}${q}`
	}
	if (qr.requirementKind === 'recipe') {
		return `${(qr.itemType as Recipe).description} ×${n}${q}`
	}
	return `${String(qr.itemType)} ×${n}${q}`
}

/**
 * Whether the player can complete every requirement in order (each stage consumes matching slots).
 */
export function playerCanCompleteQuestInOrder(
	requirements: QuestRequirement[],
	raw: Ingredient[],
	crafted: Item[],
): boolean {
	const rawPool = [...raw]
	const craftedAvailable = new Set(crafted.map((item) => item.id))

	for (const qr of requirements) {
		const need = qr.qty ?? 1
		const { ingredients, craftedEntries } = getInventoryForQuestRequirement(
			qr,
			rawPool,
			crafted,
		)
		const ce = craftedEntries.filter((e) => craftedAvailable.has(e.id))
		if (ingredients.length + ce.length < need) return false

		let take = 0
		for (const ing of ingredients) {
			if (take >= need) break
			const ix = rawPool.findIndex((r) => r.id === ing.id)
			if (ix >= 0) {
				rawPool.splice(ix, 1)
				take++
			}
		}
		const sortedCe = [...ce].sort((a, b) => a.id.localeCompare(b.id))
		for (const e of sortedCe) {
			if (take >= need) break
			if (craftedAvailable.has(e.id)) {
				craftedAvailable.delete(e.id)
				take++
			}
		}
		if (take < need) return false
	}

	return true
}

export function buildQuestStageInventory(
	qr: QuestRequirement,
	raw: Ingredient[],
	crafted: Item[],
	consumedRawIds: Set<string>,
	consumedCraftedItemIds: Set<string>,
): {
	ingredients: Ingredient[]
	craftedItems: Item[]
	craftedEntries: CraftedInventoryEntry[]
} {
	const base = getInventoryForQuestRequirement(qr, raw, crafted)
	const after = filterInventoryAfterConsumption(
		base.ingredients,
		base.craftedEntries,
		consumedRawIds,
		consumedCraftedItemIds,
	)
	return {
		ingredients: after.ingredients,
		craftedItems: after.craftedEntries.map((e) => e.item),
		craftedEntries: after.craftedEntries,
	}
}
