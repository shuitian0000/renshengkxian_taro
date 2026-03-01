# AGENTS.md

This document provides guidelines for agentic coding agents operating in this repository.

## Project Overview

**秒哒应用代码包 (miaoda-taro-react-starter)** - A Taro + React + TypeScript multi-platform framework for WeChat Mini-Programs and H5.

**Tech Stack:**
- Taro 4.1.5 (WeChat Mini-Programs & H5)
- React 18.3.1, TypeScript 5.9.3
- Zustand 5.0.8 (state management)
- TailwindCSS 3.4.17 (styling)
- Supabase 2.89.0 (database)
- Biome (formatting/linting)

## Build & Test Commands

**Primary command:**
```bash
pnpm run lint
```

This runs:
1. Biome code formatting and linting (`biome check --write`)
2. TypeScript type checking (`tsgo -p tsconfig.check.json`)
3. Custom auth/navigation/icon validation scripts

**Note:** `pnpm dev` and `pnpm build` scripts are disabled in this environment.

### Running a Single Test
To run a single test, you can use the following command:
```bash
pnpm test --findRelatedTests <path-to-test-file>
```

## Code Style Guidelines

### Formatting (Biome)
- Indent: 2 spaces
- Line width: 120 characters
- Line endings: LF (Unix)
- Quotes: Single quotes for JS/TS
- Semicolons: As needed
- Arrow function parentheses: Always
- JSX: Double quotes
- No trailing commas

### Imports
Order imports by category:
```typescript
import {React libs} from 'react'
import {Taro libs} from '@tarojs/taro'
import {Components} from '@tarojs/components'
import {Third-party libs} from 'package'
import {Project imports} from '@/path'
import {Local imports} from './relative-path'
```

Use path alias `@/` for imports from `src/` (e.g., `@/utils/kline`, `@/client/supabase`).

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `BirthInfoForm.tsx` |
| Files/Functions/Variables | camelCase | `handleImageRemove`, `compressImage` |
| Types/Interfaces | PascalCase | `BirthInfoData`, `UploadFileInput` |
| Constants | camelCase or UPPER_SNAKE_CASE | `TIME_PERIODS` |
| CSS Classes | kebab-case (Tailwind) | `flex items-center` |

### TypeScript
- Use TypeScript interfaces for all props and data types
- Path aliases: `@/*` → `src/*` (configured in tsconfig.json)
- Enable strict mode in `tsconfig.check.json`
- Export types from `src/types/` when shared across modules

### Components
- Use functional components with React.FC or direct function
- Use `useCallback` for event handlers
- Use `useState` for local state, `useEffect` for side effects
- Components use **default export**
- Component files use PascalCase naming
- Props interface uses PascalCase (e.g., `BirthInfoFormProps`)

### Error Handling
```typescript
try {
  // Async operation
} catch (error) {
  console.error('Descriptive error message:', error)
  // Return null/false or throw for critical failures
}
```

For Supabase operations:
```typescript
const {data, error} = await supabase.from('table').select('*')
if (error) {
  console.error('Operation failed:', error)
  return null
}
return data
```

### File Structure
```
src/
├── app.config.ts         # App routes, tabBar config
├── app.tsx               # Root component with Providers
├── client/               # Supabase client
├── components/           # Reusable components (PascalCase)
├── db/                   # Database operations
├── hooks/                # Custom React hooks (camelCase)
├── pages/{name}/         # Route pages (index.tsx + index.config.ts)
├── store/                # Zustand stores (global state)
├── types/                # TypeScript type definitions
└── utils/                # Utility functions (camelCase)
```

### Routing & Navigation
- Pages defined in `src/pages/{name}/index.tsx` with config in `index.config.ts`
- Routes registered in `src/app.config.ts`
- **Use `Taro.switchTab()` for tab bar pages** (defined in app.config.ts)
- **Use `Taro.navigateTo()` for non-tab pages**
- Validation script enforces this rule in `scripts/checkNavigation.sh`

### State Management
- Use Zustand for cross-page/global state
- Stores placed in `src/store/`
- Follow patterns in existing store files

### Styling
- Use TailwindCSS utility classes exclusively
- Follow color scheme in `tailwind.config.js`
- Use CSS variables: `hsl(var(--primary))` syntax
- Icons from `@iconify-json/mdi` and `@iconify-json/lucide`

### Database (Supabase)
- All Supabase operations in `src/db/`
- Use client from `src/client/supabase.ts`
- Follow patterns in existing db files

### Documentation
- Use Chinese comments for user-facing text
- Write JSDoc/TSDoc comments for exported functions
- Document component props via TypeScript interfaces

### Additional Rules
- **Auth:** Use `useAuth()` hook only within components wrapped by `AuthProvider`
- **Icons:** Use relative paths (e.g., `../../assets/icons/foo.svg`), never absolute paths
- **Scripts:** Run `scripts/checkAuth.sh`, `checkNavigation.sh`, `checkIconPath.sh` during lint

## Environment Setup

```bash
# Install dependencies
pnpm install

# Run lint checks (required before committing)
pnpm run lint
```

## Important Notes

1. This is a WeChat Mini-Program and H5 project - avoid browser-only APIs
2. Always run `pnpm run lint` after making changes
3. Follow Chinese language conventions for user-facing text
4. Use `time.period` format from `src/utils/time.ts` for date/time handling
5. When adding new pages, create both `index.tsx` and `index.config.ts`