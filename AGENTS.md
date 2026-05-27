# Agent Guidelines for This Repository

This is a **Taro + React + TypeScript** WeChat mini-program project using TailwindCSS and Zustand.

## Build, Lint, and Test Commands

### Primary Commands

```bash
# Run all linting and validation checks (required before committing)
npm run lint
```

This runs: `biome check --write --unsafe`, `tsgo -p tsconfig.check.json`, `checkAuth.sh`, `checkNavigation.sh`, `checkIconPath.sh`, `testBuild.sh`

### Individual Checks

```bash
# Biome formatting and linting (auto-fix enabled)
npx biome check --write --unsafe --diagnostic-level:error

# TypeScript type checking
tsgo -p tsconfig.check.json

# Auth wrapping validation (ast-grep)
ast-grep scan -r .rules/useAuth.yml && ast-grep scan -r .rules/authProvider.yml

# Navigation validation (navigateTo vs switchTab)
ast-grep scan --rule .rules/navigateTo.yml

# Icon path validation (no leading /)
ast-grep scan --rule .rules/noAbsoluteIconPath.yml

# Build configuration test
./scripts/testBuild.sh
```

**Note**: `npm run dev`, `npm run dev:h5`, `npm run dev:weapp`, `npm run build`, and `npm run build:weapp` are disabled (require Taro CLI runtime). Use `npm run lint` instead.

## Code Style Guidelines

### Formatting (Biome Configuration)

| Setting | Value |
|---------|-------|
| Indentation | 2 spaces (soft tabs) |
| Line width | 120 characters |
| Line endings | LF (Unix-style) |
| Quotes | Single (`'`) in JS/TS, double (`"`) in JSX/CSS |
| Semicolons | As needed |
| Arrow parentheses | Always (`(x) => x`) |
| Trailing commas | None |
| Bracket same line | true |

### Imports and Paths

Use **absolute imports** with `@/` alias. Group imports in order:

1. Framework imports (React, Taro)
2. External library imports
3. Absolute imports from `@/`
4. Relative imports for local components

```typescript
import {Button, Text, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useCallback, useState} from 'react'
import {supabase} from '@/client/supabase'
import BirthInfoForm from '@/components/BirthInfoForm'
import RegionPicker from './RegionPicker'
```

### TypeScript Conventions

- **Strict null checks**: Disabled
- **Implicit any**: Allowed
- **No unused locals/parameters**: Enforced
- Use **interfaces** for object types, **types** for unions/brands
- Export interfaces alongside components when used externally

### Naming Conventions

| Type | Convention | Examples |
|------|------------|----------|
| Components/Files | PascalCase | `BirthInfoForm.tsx`, `KLineChart` |
| Utilities | camelCase | `imageHelper.ts` |
| Variables/functions | camelCase | `generateReport` |
| Constants | SCREAMING_SNAKE_CASE for config | `MAX_RETRY_COUNT` |
| Interfaces | PascalCase | `BirthInfoData`, `KLineDataPoint` |

### Component Structure

- Use **default exports** for pages and components
- Functional components with hooks (no class components)
- Use `useCallback` for event handlers
- Early returns for validation before rendering
- All Taro pages need `.config.ts` files

### Error Handling

```typescript
try {
  const {data, error} = await supabase.functions.invoke('generate-report', {body})
  if (error) throw new Error('AI service failed')
} catch (error) {
  console.error('AI generation failed, using local algorithm:', error)
  reportData = generateLocalReport(birthInfo.name, birthYear, gender)
}
```

- Use **try-catch** for async operations
- Log with `console.error()` for errors (remove `console.log`)
- Show user feedback with `Taro.showToast()`
- Graceful degradation (fallback to local algorithms)

### React Hooks

- `useState` for component state
- `useCallback` for props/dependency arrays
- `useEffect` for side effects
- `useDidShow`/`useDidHide` for Taro page lifecycle
- Custom hooks in `src/hooks/`

### TailwindCSS

- Use utility classes directly on elements
- `className` prop for classes, `style` for dynamic values
- Group related classes together

### State Management (Zustand)

- Store files in `src/store/`
- Use persist middleware for data survival across restarts

### Project Structure

```
src/
├── client/ # Supabase client
├── components/ # Reusable components
├── db/ # Database operations
├── hooks/ # Custom React hooks
├── pages/ # Taro pages (each with .config.ts)
├── store/ # Zustand stores
├── types/ # TypeScript definitions
├── utils/ # Utility functions
├── app.config.ts # Global app config
└── app.tsx # Root component
```

## Validation Rules (ast-grep)

### Auth Validation
- `useAuth` hooks must be wrapped with `AuthProvider`
- Run: `ast-grep scan -r .rules/useAuth.yml && ast-grep scan -r .rules/authProvider.yml`

### Navigation Validation
- Use `switchTab` for tabBar pages, `navigateTo` for others
- Tab pages are defined in `app.config.ts` under `tabBar.list`
- Run: `ast-grep scan --rule .rules/navigateTo.yml`

### Icon Path Validation
- Icon paths in `app.config.ts` should not start with `/`
- Run: `ast-grep scan --rule .rules/noAbsoluteIconPath.yml`

## Testing

No formal test framework. Manual testing via Taro dev tools. Run `npm run lint` before committing.

## Misc

- **No comments** unless explaining complex algorithms
- No secrets in code (use environment variables)
- Validate form inputs before submission