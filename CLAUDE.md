# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Alcahexy** — a browser-based puzzle game built with Next.js 15, React 18, Redux Toolkit, and TypeScript. Deployed as a static export to GitHub Pages. No backend.

Live: https://jturnerwhite.github.io/frontendeavor2/

## Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Static export to /out
npm run lint       # ESLint via next lint
npm test           # Jest (all tests)
npm run test:watch # Jest in watch mode
```

Run a single test file:
```bash
npx jest src/__tests__/ingredientFactory.test.ts
```

Run tests matching a name pattern:
```bash
npx jest -t "GenerateSizeRating"
```

## Environment Variables

No `.env` file required locally. The only env var is `NEXT_PUBLIC_BASE_PATH` (e.g. `/frontendeavor2`), set in CI for GitHub Pages deployment. Omit it locally.

## Architecture

All game code lives under `src/app/hex/`. The rest of the Next.js app is routing scaffolding.

### Game Loop

**Map** → **Alchemy Lab** → rewards cycle back to Map.

1. **Map** (`/hex/map/`) — 37-hex world map organized into biomes. Clicking a biome hex calls `GatherIngredientsInBiome()`, which generates `Ingredient` objects and dispatches them to the Player slice. Fishing biomes redirect to `/hex/fishing`. Each hex has a cooldown stored in the Map slice.

2. **Alchemy Lab** (`/hex/play/alchemy/`) — The core puzzle. Players place `AlchComponent` tiles on a hexagonal grid. Components are sourced from `Ingredient.comps`. The board tracks which hexes are occupied and which node-to-node connections ("links") exist between adjacent components. Scoring is driven by `CalculateQuality()` in `alchHelpers.tsx`.

3. **Fishing** (`/hex/fishing/`) — RAF-driven minigame. Fish have AI that moves them toward/away from a goal zone. Catching a fish yields a water-type `Ingredient`. Controlled by `fishBehavior.ts` and `fishingRafTick.ts`.

### Data Model (`src/app/hex/architecture/`)

| File | Purpose |
|---|---|
| `typings.d.ts` | All core types: `Ingredient`, `IngredientBase`, `AlchComponent`, `Item`, `ItemAspect`, `Recipe` |
| `enums.ts` | `ALCH_ELEMENT` (6 elements), `SHAPE_NAME` (16 shapes), `COMPONENT_SHAPE_VALUES` (7-bit bitmasks per shape), `ITEM_TAG`, `TERRAIN_TYPE` |
| `interfaces.ts` | `HexTile`, `HexMap`, `PlacedComponent`, `LinkedComponents` |
| `data/ingredientBases.ts` | All `IngredientBase` definitions (JarbaLeaf, FruguBerry, etc.) |
| `data/growthPaths.ts` | Shape growth sequences (SPIRAL, ZIGZAG, WAVY, SPIN) — index into these with `sizeRating` |
| `data/recipes.ts` | All `Recipe` definitions with element thresholds and rewards |
| `data/itemAspects.ts` | All `ItemAspect` definitions, `ASPECT_CATEGORY` enum, weighting modifiers |

### Hex Grid System (`alchHelpers.tsx`)

The hex grid uses `(x, y)` axial coordinates. Hex IDs are `"x,y"` strings. The component shape system uses 7-bit masks (`COMPONENT_SHAPE_VALUES`) representing 7 node positions (center + 6 edges). Rotation is applied by shifting the edge bits by 60° increments via `GetRotatedMask()`.

Key functions:
- `CreateHexGrid()` — builds the `HexMap` dict with neighbor links
- `GetPlacementHexIds()` — resolves which hexes a shaped component occupies at a given position/rotation
- `CompilePlacedComponent()` — builds a `PlacedComponent` from a shape+position
- `OccupyHexes()` — marks hexes in the `HexMap` as occupied
- `GetLinks()` — finds all `LinkedComponents` pairs on the current board
- `CalculateQuality()` — scores element node/link counts against recipe `softCap`/`hardCap` thresholds (nodes = 2 pts, links = 4 pts, excess = −1 pt)

### Ingredient Generation (`factories/ingredientFactory.ts`)

`CreateIngredient(ingBase, toolUsed?)` is the main entry point. It:
1. Rolls quality via Box–Muller bell curve (`randomBell0to100(mean=20, steepness=14)`)
2. Selects 0–4 aspects from a weighted pool (`GetItemsByWeight`)
3. Applies `QUALITY` aspect adjustments to the quality value
4. Computes `sizeRating` (0–4) — used to index into a `GrowthPath` to pick component shapes
5. Calculates `saleValue` = `floor(baseSaleValue × (ingTier + 1) × (quality/15 + 1))`
6. Applies `SALE_VALUE` aspect multipliers
7. Creates `AlchComponent` objects for each `IngredientCompSpec` in the base

`GrowthPaths` (SPIRAL, ZIGZAG, WAVY, SPIN) are 7-element arrays of `SHAPE_NAME`. `possibleShapes` in a comp spec is sliced from a growth path; `sizeRating` is the index used to pick the shape.

### Redux Store (`src/store/`)

Six slices, all persisted to `localStorage` with debounced 400ms writes (flushed immediately on `beforeunload`/`pagehide`):

| Slice | Storage Key | Owns |
|---|---|---|
| `alchemySlice` | `frontendeavor-alchemy-v1` | HexMap, placed components, undo/redo stacks (max 80), recipe selection, ingredient source list |
| `playerSlice` | `frontendeavor-player-v1` | Raw ingredient inventory, crafted items, equipment slots, XP, gold, quest IDs |
| `historySlice` | `frontendeavor-history-v1` | Completed craft records |
| `mapSlice` | `frontendeavor-map-v1` | Per-hex cooldown timers (stale entries pruned at load) |
| `settingsSlice` | `frontendeavor-settings-v1` | `hasVisited` flag |
| `toastifySlice` | *(not persisted)* | Toast notification queue |

`hydratePersistedSlicesFromStorage()` runs client-side only (post-SSR) to prevent hydration mismatches. `hardResetPersistedGameState()` clears all storage keys (dev utility).

### Path Alias

`@/` maps to `src/`. Used throughout — e.g. `@/app/hex/architecture/enums`.

### Testing

Tests live in `src/__tests__/`. Jest uses `next/jest` for the SWC transform. The `@/` alias is explicitly mapped in `jest.config.js`. When testing code that imports `alchHelpers.tsx` (a TSX file with React deps), mock it at the module level:

```ts
jest.mock('@/app/hex/architecture/helpers/alchHelpers', () => ({
  GenerateTempId: jest.fn(() => 'mock-id'),
}));
```
