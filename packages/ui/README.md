# `@dataroom/ui`

> Shared React component library for the DataRoom MVP application

## 🚀 Overview

This package provides a comprehensive set of reusable React components built with modern design principles and accessibility in mind. It serves as the foundation for consistent UI across the DataRoom MVP application.

## 🛠️ Technology Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and IntelliSense
- **Radix UI** - Accessible, unstyled UI primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Class Variance Authority (CVA)** - Type-safe component variants
- **Lucide React** - Beautiful, customizable icons

## 📦 Components

### Core Components
- **`Button`** - Multiple variants (primary, secondary, outline, ghost, danger)
- **`Input`** - Form input with validation states
- **`Card`** - Content containers with consistent styling
- **`Modal`** - Accessible dialog components
- **`Toast`** - Notification system
- **`Spinner`** - Loading indicators

### Layout Components
- **`Container`** - Responsive content containers
- **`Grid`** - CSS Grid layout utilities
- **`Stack`** - Flexible layout components

### Form Components
- **`Label`** - Accessible form labels
- **`TextArea`** - Multi-line text input
- **`Select`** - Dropdown selection components
- **`Checkbox`** - Boolean input controls

## 🎨 Design System

The component library follows a consistent design system:

### Colors
- **Primary**: Blue-based palette for main actions
- **Secondary**: Gray-based palette for secondary actions
- **Success**: Green for positive feedback
- **Warning**: Yellow for cautionary states
- **Danger**: Red for destructive actions

### Typography
- **Font Family**: Inter (system fallback)
- **Font Sizes**: Responsive scale from xs to 4xl
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- **Scale**: 4px base unit (0.25rem increments)
- **Consistent**: Uniform spacing across all components

## 🚀 Usage

### Installation
This package is part of the DataRoom MVP monorepo and doesn't require separate installation.

### Import Components
```tsx
import { Button, Card, Input, Modal } from '@dataroom/ui'

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter your name" />
      <Button variant="primary">
        Submit
      </Button>
    </Card>
  )
}
```

### Component Variants
```tsx
// Button variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="danger">Delete</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

## 🔧 Development

### Adding New Components

1. **Create component file**:
   ```tsx
   // src/new-component.tsx
   import { cva } from 'class-variance-authority'
   import { cn } from './utils'
   
   const newComponentVariants = cva(
     'base-classes',
     {
       variants: {
         variant: {
           default: 'default-classes',
           special: 'special-classes'
         }
       }
     }
   )
   
   export interface NewComponentProps {
     variant?: 'default' | 'special'
     className?: string
   }
   
   export function NewComponent({ 
     variant = 'default', 
     className,
     ...props 
   }: NewComponentProps) {
     return (
       <div 
         className={cn(newComponentVariants({ variant }), className)}
         {...props}
       />
     )
   }
   ```

2. **Export from index**:
   ```tsx
   // src/index.ts
   export { NewComponent } from './new-component'
   export type { NewComponentProps } from './new-component'
   ```

3. **Add to package exports**:
   ```json
   // package.json
   {
     "exports": {
       "./new-component": "./src/new-component.tsx"
     }
   }
   ```

### Styling Guidelines

- **Use Tailwind classes** for consistent styling
- **Leverage CVA** for component variants
- **Include hover/focus states** for interactive elements
- **Ensure accessibility** with proper ARIA labels
- **Support dark mode** where applicable

## 📱 Responsive Design

All components are built with mobile-first responsive design:

```tsx
<Button className="w-full md:w-auto">
  Responsive Button
</Button>
```

## ♿ Accessibility

Components follow WCAG 2.1 AA guidelines:

- **Keyboard Navigation** - All interactive elements
- **Screen Reader Support** - Proper ARIA labels
- **Color Contrast** - Minimum 4.5:1 ratio
- **Focus Management** - Visible focus indicators

## 🔗 Integration

This package is consumed by:

- **`apps/web`** - Main DataRoom application
- **`apps/docs`** - Documentation site
- Any future applications in the monorepo

## 📚 Storybook (Future)

Component documentation and interactive examples will be available through Storybook integration.

---

**Part of DataRoom MVP** - Consistent, accessible UI components