# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cross-platform recipe management app built with Expo (React Native) targeting web and mobile. Users organize recipes by categories, manage ingredients, and track calories. Deployed to GitHub Pages as a web app.

## Commands

- `npm start` — Start Expo dev server
- `npm run web` — Run web version
- `npm run android` / `npm run ios` — Run on native platforms
- `npm ci --legacy-peer-deps` — Install dependencies (legacy-peer-deps required due to dependency conflicts)
- `npx expo export --platform web` — Build for web (outputs to `dist/`)

No test framework is configured. No linter is configured.

## Architecture

**Entry flow:** `index.ts` → `App.tsx` → `NavigationContainer` → `RootNavigator` (bottom tabs)

**Navigation (two tab stacks):**
- CategoriesTab: Categories → CategoryDetail → RecipeDetail → AddEditRecipe
- AllRecipesTab: AllRecipes → RecipeDetail → AddEditRecipe

**Data flow:** Screens → Zustand stores (`src/store/`) → Repository functions (`src/db/`) → AsyncStorage

**Key source layout under `src/`:**
- `screens/` — One file per screen (5 screens)
- `components/` — Reusable UI (CategoryCard, RecipeCard, IngredientRow, CalorieSummary, etc.)
- `store/` — Zustand stores: `categoryStore.ts`, `recipeStore.ts`
- `db/` — AsyncStorage-backed repositories: `categoryRepository.ts`, `recipeRepository.ts`, `ingredientRepository.ts`, `database.ts` (init + defaults)
- `types/` — TypeScript interfaces: Category, Recipe, Ingredient, RecipeWithIngredients
- `utils/` — `uuid.ts` (ID generation), `calorieCalculator.ts`
- `constants/` — `colors.ts` (theme), `emojis.ts` (food emoji list)
- `navigation/` — Stack navigator definitions

## Key Conventions

- **IDs** are UUID v4 strings generated via `src/utils/uuid.ts`
- **UI library** is React Native Paper (Material Design)
- **Theme colors** defined in `src/constants/colors.ts` — primary is `#4CAF78`
- **TypeScript strict mode** is enabled
- **Web compatibility:** gesture-handler and reanimated were removed for web support; avoid reintroducing them
- **Deep linking** is configured in `App.tsx` with path-based routing

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys to GitHub Pages on push to `master`. The web build uses `metro` bundler with base URL `/recipe-app` (configured in `app.json`).
