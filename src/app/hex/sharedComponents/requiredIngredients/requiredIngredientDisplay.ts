import { ITEM_TAG } from '@/app/hex/architecture/enums';
import { isIngredientBaseRef } from '@/app/hex/architecture/helpers/recipeRequirements';
import type { RecipeRequiredIngredient } from '@/app/hex/architecture/typings';
import { publicAsset } from '@/lib/publicAsset';

function itemTagToIconFile(tag: ITEM_TAG): string {
	return `${String(tag).toLowerCase().replace(/\s+/g, '_')}.svg`;
}

export function formatRequiredIngredientEntry(req: RecipeRequiredIngredient): string {
	const t = req.type;
	let label = isIngredientBaseRef(t) ? t.name : String(t);
	if (req.qty != null && req.qty !== 1) {
		label += ` x${req.qty}`;
	}
	if (req.quality != null) {
		label += ` (min quality ${req.quality})`;
	}
	return label;
}

/** Icon URL for a recipe requirement row (ingredient base art or item-type SVG). */
export function getRequiredIngredientImageSrc(req: RecipeRequiredIngredient): string {
	if (isIngredientBaseRef(req.type)) {
		if (req.type.image) return req.type.image;
		const primaryTag = req.type.types[0];
		if (primaryTag != null) {
			return publicAsset(`/icons/itemTypes/${itemTagToIconFile(primaryTag)}`);
		}
		return publicAsset('/icons/itemTypes/stone.svg');
	}
	const tag = req.type as ITEM_TAG;
	return publicAsset(`/icons/itemTypes/${itemTagToIconFile(tag)}`);
}
