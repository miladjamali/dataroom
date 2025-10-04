# `@repo/eslint-config`

> Shared ESLint configurations for the DataRoom MVP monorepo

## 📋 Overview

This package provides consistent ESLint configurations across all applications and packages in the DataRoom MVP monorepo. It ensures code quality, consistency, and best practices throughout the codebase.

## 📦 Configurations

### `base.js`
Base ESLint configuration for all TypeScript projects:
- Core ESLint recommended rules
- TypeScript-specific linting
- Import/export validation
- Code style consistency

### `next.js`
Specialized configuration for Next.js applications:
- Next.js specific rules and optimizations
- React hooks linting
- Accessibility (a11y) rules
- Performance best practices

### `react-internal.js`
Configuration for internal React packages and components:
- React component best practices
- Props validation
- JSX accessibility
- Custom hooks guidelines

## 🚀 Usage

### In Applications (web, docs)

```javascript
// eslint.config.js
import baseConfig from '@repo/eslint-config/next.js'

export default [
  ...baseConfig,
  {
    // Application-specific overrides
  }
]
```

### In Packages (ui, utils, types)

```javascript
// eslint.config.js
import baseConfig from '@repo/eslint-config/base.js'

export default [
  ...baseConfig,
  {
    // Package-specific overrides
  }
]
```

### For React Components

```javascript
// eslint.config.js
import reactConfig from '@repo/eslint-config/react-internal.js'

export default [
  ...reactConfig,
  {
    // Component-specific rules
  }
]
```

## 🛠️ Included Rules

### Code Quality
- **No unused variables** - Prevents dead code
- **No console logs** - Enforces proper logging
- **Consistent naming** - camelCase for variables, PascalCase for components
- **Import organization** - Sorted and grouped imports

### TypeScript
- **Strict type checking** - No implicit any, proper return types
- **Interface preferences** - Consistent type definitions
- **Null safety** - Proper null/undefined handling

### React (Next.js/React packages)
- **Hook dependencies** - Proper useEffect dependencies
- **Component patterns** - Functional components preferred
- **Accessibility** - ARIA labels, semantic HTML
- **Performance** - Avoid inline objects, proper memoization

## 🔧 Development

### Adding New Rules

1. **Edit appropriate config file**:
   ```javascript
   // base.js, next.js, or react-internal.js
   export default {
     rules: {
       'new-rule': 'error'
     }
   }
   ```

2. **Test across projects**:
   ```bash
   pnpm run lint
   ```

3. **Update documentation** with rule explanations

### Rule Severity Levels

- **`error`** - Fails build, must be fixed
- **`warn`** - Shows warning, doesn't fail build
- **`off`** - Rule disabled

## 📋 Recommended VS Code Settings

```json
{
  "eslint.workingDirectories": ["apps/*", "packages/*"],
  "eslint.format.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 🚀 Integration

This ESLint configuration is automatically used by:

- **All applications** in `/apps`
- **All packages** in `/packages`
- **Pre-commit hooks** via husky
- **CI/CD pipeline** for automated linting

## 📖 Best Practices

1. **Run linting locally** before committing
2. **Fix errors immediately** - don't disable rules
3. **Use meaningful variable names** for better code readability
4. **Follow React patterns** for component development
5. **Keep dependencies updated** for latest rule improvements

---

**Part of DataRoom MVP** - Ensuring code quality across the monorepo
