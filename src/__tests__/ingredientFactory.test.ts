jest.mock('@/app/hex/architecture/helpers/alchHelpers', () => ({
	GenerateTempId: jest.fn(() => `id-${Math.random()}`),
}));

import { randomBell0to100, GenerateSizeRating, CreateIngredient } from '@/app/hex/architecture/factories/ingredientFactory';
import { ALCH_ELEMENT, ITEM_TAG, SHAPE_NAME } from '@/app/hex/architecture/enums';
import type { IngredientBase } from '@/app/hex/architecture/typings';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeBase(overrides: Partial<IngredientBase> = {}): IngredientBase {
	return {
		id: 'TestLeaf',
		name: 'Test Leaf',
		ingTier: 0,
		baseSaleValue: 5,
		image: '',
		types: [ITEM_TAG.PLANT],
		possibleComps: [
			{ element: ALCH_ELEMENT.FIRE, possibleShapes: [SHAPE_NAME.DOT, SHAPE_NAME.LINE, SHAPE_NAME.TRIANGLE] },
			{ element: ALCH_ELEMENT.WATER, possibleShapes: [SHAPE_NAME.DOT], chance: 0.5 },
		],
		...overrides,
	};
}

// ─── randomBell0to100 ────────────────────────────────────────────────────────

describe('randomBell0to100', () => {
	const RUNS = 2000;

	it('always returns a value in [0, 100]', () => {
		for (let i = 0; i < RUNS; i++) {
			const val = randomBell0to100(20, 14);
			expect(val).toBeGreaterThanOrEqual(0);
			expect(val).toBeLessThanOrEqual(100);
		}
	});

	it('returns an integer', () => {
		for (let i = 0; i < 100; i++) {
			expect(Number.isInteger(randomBell0to100(50, 14))).toBe(true);
		}
	});

	it('clusters around the given mean (within ±10 over many runs)', () => {
		const mean = 50;
		const sum = Array.from({ length: RUNS }, () => randomBell0to100(mean, 14)).reduce((a, b) => a + b, 0);
		const avg = sum / RUNS;
		expect(avg).toBeGreaterThan(mean - 10);
		expect(avg).toBeLessThan(mean + 10);
	});

	it('with mean=0 virtually all values are in [0, 10]', () => {
		const results = Array.from({ length: RUNS }, () => randomBell0to100(0, 14));
		const outsideLow = results.filter(v => v > 10).length;
		// Bell at 0 — the vast majority should stay very low
		expect(outsideLow / RUNS).toBeLessThan(0.15);
	});

	it('with mean=100 virtually all values are in [90, 100]', () => {
		const results = Array.from({ length: RUNS }, () => randomBell0to100(100, 14));
		const outsideHigh = results.filter(v => v < 90).length;
		expect(outsideHigh / RUNS).toBeLessThan(0.15);
	});

	it('a steeper bell produces a tighter spread around the mean', () => {
		const mean = 50;
		const wide = Array.from({ length: RUNS }, () => randomBell0to100(mean, 5));
		const tight = Array.from({ length: RUNS }, () => randomBell0to100(mean, 40));

		const stdDev = (arr: number[]) => {
			const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
			return Math.sqrt(arr.reduce((a, b) => a + (b - avg) ** 2, 0) / arr.length);
		};

		expect(stdDev(tight)).toBeLessThan(stdDev(wide));
	});
});

// ─── GenerateSizeRating ───────────────────────────────────────────────────────

describe('GenerateSizeRating', () => {
	const base = makeBase();

	it('returns 0 when quality is 0', () => {
		expect(GenerateSizeRating(base, 0)).toBe(0);
	});

	it('returns 0 when quality is 1', () => {
		expect(GenerateSizeRating(base, 1)).toBe(0);
	});

	it('returns 4 when quality is 100', () => {
		expect(GenerateSizeRating(base, 100)).toBe(4);
	});

	it('always returns a value in {0, 1, 2, 3, 4}', () => {
		const valid = new Set([0, 1, 2, 3, 4]);
		for (let q = 0; q <= 100; q++) {
			const rating = GenerateSizeRating(base, q);
			expect(valid.has(rating)).toBe(true);
		}
	});

	it('tier-0 ingredient with mid-range quality never returns 3 or 4', () => {
		// Tier-0 max quality effect is 50: the internal bell (mean 20) can only
		// reach sizeRating 0, 1, or 2 for a tier-0 base.
		const ratings = Array.from({ length: 500 }, () => GenerateSizeRating(base, 50));
		const aboveTwo = ratings.filter(r => r > 2);
		expect(aboveTwo.length).toBe(0);
	});

	it('returns 0 deterministically when Math.random forces minimum sizeNumber', () => {
		// Math.random = 0.5, 0.5 → cos(2π*0.5) = -1 → randn ≈ -1.18
		// randomBell0to100(20, 14) ≈ 20 + (100/14)*(-1.18) ≈ 11.6 → rounds to 12
		// Tier-0 thresholdForMid = 50/3 ≈ 16.67 → 12 < 16.67 → size 0
		const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
		try {
			expect(GenerateSizeRating(base, 50)).toBe(0);
		} finally {
			spy.mockRestore();
		}
	});

	it('returns 1 deterministically when Math.random forces mean sizeNumber', () => {
		// Math.random = 0.25 → cos(2π*0.25) = 0 → randn = 0
		// randomBell0to100(20, 14) = 20 exactly
		// Tier-0: thresholdForMid ≈ 16.67, thresholdForHigh ≈ 33.33 → 20 is in [16.67, 33.33) → size 1
		const spy = jest.spyOn(Math, 'random').mockReturnValue(0.25);
		try {
			expect(GenerateSizeRating(base, 50)).toBe(1);
		} finally {
			spy.mockRestore();
		}
	});

	it('higher-tier bases use higher quality thresholds', () => {
		const tier5Base = makeBase({ ingTier: 5 });
		// Tier-5 thresholdForMid = 50 + (50/3) ≈ 66.67
		// With Math.random=0.25 → sizeNumber=20, which is < 66.67 → returns 0
		const spy = jest.spyOn(Math, 'random').mockReturnValue(0.25);
		try {
			expect(GenerateSizeRating(tier5Base, 50)).toBe(0);
		} finally {
			spy.mockRestore();
		}
	});
});

// ─── CreateIngredient ─────────────────────────────────────────────────────────

describe('CreateIngredient', () => {
	it('returns an object with all required Ingredient fields', () => {
		const ing = CreateIngredient(makeBase());
		expect(ing).toHaveProperty('id');
		expect(ing).toHaveProperty('baseIngId');
		expect(ing).toHaveProperty('quality');
		expect(ing).toHaveProperty('saleValue');
		expect(ing).toHaveProperty('comps');
		expect(ing).toHaveProperty('sizeRating');
		expect(ing).toHaveProperty('aspects');
	});

	it('baseIngId matches the provided ingBase id', () => {
		const base = makeBase({ id: 'MySpecialLeaf' });
		expect(CreateIngredient(base).baseIngId).toBe('MySpecialLeaf');
	});

	it('quality is always in [0, 100]', () => {
		for (let i = 0; i < 100; i++) {
			const { quality } = CreateIngredient(makeBase());
			expect(quality).toBeGreaterThanOrEqual(0);
			expect(quality).toBeLessThanOrEqual(100);
		}
	});

	it('saleValue is always a positive integer', () => {
		for (let i = 0; i < 100; i++) {
			const { saleValue } = CreateIngredient(makeBase());
			expect(Number.isInteger(saleValue)).toBe(true);
			expect(saleValue).toBeGreaterThan(0);
		}
	});

	it('sizeRating is always in {0, 1, 2, 3, 4}', () => {
		const valid = new Set([0, 1, 2, 3, 4]);
		for (let i = 0; i < 100; i++) {
			expect(valid.has(CreateIngredient(makeBase()).sizeRating)).toBe(true);
		}
	});

	it('comps is an array', () => {
		expect(Array.isArray(CreateIngredient(makeBase()).comps)).toBe(true);
	});

	it('required comp (no chance field) is always present', () => {
		const base = makeBase({
			possibleComps: [
				{ element: ALCH_ELEMENT.FIRE, possibleShapes: [SHAPE_NAME.DOT] },
			],
		});
		for (let i = 0; i < 50; i++) {
			const { comps } = CreateIngredient(base);
			expect(comps.length).toBeGreaterThanOrEqual(1);
			expect(comps[0].element).toBe(ALCH_ELEMENT.FIRE);
		}
	});

	it('optional comp with chance=0 is never included', () => {
		const base = makeBase({
			possibleComps: [
				{ element: ALCH_ELEMENT.FIRE, possibleShapes: [SHAPE_NAME.DOT] },
				{ element: ALCH_ELEMENT.CHAOS, possibleShapes: [SHAPE_NAME.DOT], chance: 0 },
			],
		});
		for (let i = 0; i < 50; i++) {
			const { comps } = CreateIngredient(base);
			expect(comps.every(c => c.element !== ALCH_ELEMENT.CHAOS)).toBe(true);
		}
	});

	it('optional comp with chance=1 is always included', () => {
		const base = makeBase({
			possibleComps: [
				{ element: ALCH_ELEMENT.FIRE, possibleShapes: [SHAPE_NAME.DOT] },
				{ element: ALCH_ELEMENT.WATER, possibleShapes: [SHAPE_NAME.DOT], chance: 1 },
			],
		});
		for (let i = 0; i < 50; i++) {
			const { comps } = CreateIngredient(base);
			expect(comps.some(c => c.element === ALCH_ELEMENT.WATER)).toBe(true);
		}
	});

	it('comp elements match the spec elements', () => {
		const base = makeBase({
			possibleComps: [
				{ element: ALCH_ELEMENT.EARTH, possibleShapes: [SHAPE_NAME.DOT] },
				{ element: ALCH_ELEMENT.WIND, possibleShapes: [SHAPE_NAME.DOT], chance: 1 },
			],
		});
		const { comps } = CreateIngredient(base);
		const elements = comps.map(c => c.element);
		expect(elements).toContain(ALCH_ELEMENT.EARTH);
		expect(elements).toContain(ALCH_ELEMENT.WIND);
		expect(elements.every(e => [ALCH_ELEMENT.EARTH, ALCH_ELEMENT.WIND].includes(e))).toBe(true);
	});

	it('each comp shape is selected from its possibleShapes list', () => {
		const allowed = [SHAPE_NAME.DOT, SHAPE_NAME.LINE];
		const base = makeBase({
			possibleComps: [
				{ element: ALCH_ELEMENT.FIRE, possibleShapes: allowed },
			],
		});
		for (let i = 0; i < 50; i++) {
			const { comps } = CreateIngredient(base);
			comps.forEach(comp => {
				expect(allowed).toContain(comp.shape);
			});
		}
	});

	it('linkSpots on a comp are an array of 0s and 1s when present', () => {
		const base = makeBase({
			possibleComps: [{ element: ALCH_ELEMENT.FIRE, possibleShapes: [SHAPE_NAME.DOT] }],
		});
		for (let i = 0; i < 50; i++) {
			const { comps } = CreateIngredient(base);
			comps.forEach(comp => {
				if (comp.linkSpots !== undefined) {
					expect(Array.isArray(comp.linkSpots)).toBe(true);
					comp.linkSpots.forEach(spot => {
						expect([0, 1]).toContain(spot);
					});
				}
			});
		}
	});

	it('saleValue scales with baseSaleValue', () => {
		const cheap = makeBase({ baseSaleValue: 1, possibleComps: [{ element: ALCH_ELEMENT.FIRE, possibleShapes: [SHAPE_NAME.DOT] }] });
		const pricey = makeBase({ baseSaleValue: 100, possibleComps: [{ element: ALCH_ELEMENT.FIRE, possibleShapes: [SHAPE_NAME.DOT] }] });

		const cheapAvg = Array.from({ length: 100 }, () => CreateIngredient(cheap).saleValue).reduce((a, b) => a + b, 0) / 100;
		const priceyAvg = Array.from({ length: 100 }, () => CreateIngredient(pricey).saleValue).reduce((a, b) => a + b, 0) / 100;

		expect(priceyAvg).toBeGreaterThan(cheapAvg);
	});

	it('aspects is an array', () => {
		expect(Array.isArray(CreateIngredient(makeBase()).aspects)).toBe(true);
	});

	it('aspect count is between 0 and 4', () => {
		for (let i = 0; i < 100; i++) {
			const { aspects } = CreateIngredient(makeBase());
			expect(aspects.length).toBeGreaterThanOrEqual(0);
			expect(aspects.length).toBeLessThanOrEqual(4);
		}
	});

	it('each aspect has id, category, name, type, and value fields', () => {
		// Run enough times to be likely to get at least one aspect
		let found = false;
		for (let i = 0; i < 200; i++) {
			const { aspects } = CreateIngredient(makeBase());
			if (aspects.length > 0) {
				aspects.forEach(a => {
					expect(a).toHaveProperty('id');
					expect(a).toHaveProperty('category');
					expect(a).toHaveProperty('name');
					expect(a).toHaveProperty('type');
					expect(a).toHaveProperty('value');
				});
				found = true;
				break;
			}
		}
		expect(found).toBe(true);
	});
});
