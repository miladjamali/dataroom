# `@dataroom/types`

> TypeScript type definitions and API contracts for the DataRoom MVP application

## 🚀 Overview

This package provides comprehensive TypeScript type definitions, API contracts, and shared interfaces used throughout the DataRoom MVP application. It ensures type safety and consistency across the entire monorepo.

## 🛠️ Technology Stack

- **TypeScript** - Strict type definitions
- **Zod** - Runtime type validation and schema inference
- **Type-only imports/exports** - Optimized for tree-shaking

## 📦 Type Categories

### API Types (`api.ts`)
Request/response interfaces for all API endpoints:

```typescript
// Authentication
export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  expiresAt: string
}

// File Operations
export interface FileUploadRequest {
  file: File
  folderId?: string
  dataroomId: string
}

export interface FileResponse {
  id: string
  name: string
  size: number
  mimeType: string
  uploadedAt: string
  url: string
}
```

### Authentication Types (`auth.ts`)
User authentication and authorization:

```typescript
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type UserRole = 'admin' | 'user' | 'viewer'

export interface AuthContext {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}
```

### Data Room Types (`dataroom.ts`)
Core business logic types:

```typescript
export interface DataRoom {
  id: string
  name: string
  description: string
  ownerId: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  files: DataRoomFile[]
  folders: DataRoomFolder[]
}

export interface DataRoomFile {
  id: string
  name: string
  size: number
  mimeType: string
  folderId?: string
  dataroomId: string
  uploadedAt: string
  downloadUrl: string
}

export interface DataRoomFolder {
  id: string
  name: string
  parentId?: string
  dataroomId: string
  createdAt: string
  files: DataRoomFile[]
  subfolders: DataRoomFolder[]
}
```

### File Types (`files.ts`)
File management and storage:

```typescript
export interface FileMetadata {
  id: string
  originalName: string
  storedName: string
  size: number
  mimeType: string
  checksum: string
  uploadedBy: string
  uploadedAt: string
}

export interface FileUploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

export type SupportedMimeTypes = 
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'text/plain'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
```

## 🔧 Utility Types

### Generic Response Types
```typescript
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
  details?: Record<string, any>
}
```

### Form Types
```typescript
export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isDirty: boolean
}

export type ValidationResult<T> = {
  success: true
  data: T
} | {
  success: false
  errors: Partial<Record<keyof T, string>>
}
```

## 🎯 Zod Schemas

Runtime validation schemas that match TypeScript types:

```typescript
// User validation
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin', 'user', 'viewer'])
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  folderId: z.string().uuid().optional(),
  dataroomId: z.string().uuid()
})

// DataRoom validation
export const dataroomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false)
})
```

## 🚀 Usage

### Type-Only Imports
```typescript
import type { User, DataRoom, ApiResponse } from '@dataroom/types'

// Use types for component props
interface UserProfileProps {
  user: User
  onUpdate: (user: User) => void
}

// Use types for API responses
const response: ApiResponse<DataRoom[]> = await fetchDataRooms()
```

### Runtime Validation
```typescript
import { userSchema, fileUploadSchema } from '@dataroom/types'

// Validate API request
function createUser(userData: unknown) {
  const result = userSchema.safeParse(userData)
  
  if (!result.success) {
    throw new ValidationError(result.error.issues)
  }
  
  return result.data // Fully typed User object
}
```

### Type Guards
```typescript
import { isUser, isDataRoom } from '@dataroom/types'

// Runtime type checking
function processUserData(data: unknown) {
  if (isUser(data)) {
    // data is now typed as User
    console.log(data.email)
  }
}
```

## 🔄 Type Inference

Leverage TypeScript's type inference with Zod:

```typescript
// Infer types from schemas
export type User = z.infer<typeof userSchema>
export type FileUpload = z.infer<typeof fileUploadSchema>
export type DataRoomCreate = z.infer<typeof dataroomSchema>

// Infer partial types for updates
export type UserUpdate = Partial<Pick<User, 'firstName' | 'lastName'>>
export type DataRoomUpdate = Partial<Pick<DataRoom, 'name' | 'description' | 'isPublic'>>
```

## 🧪 Testing Types

```typescript
// Mock data for testing
export const mockUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

export const mockDataRoom: DataRoom = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Test Data Room',
  description: 'A test data room',
  ownerId: mockUser.id,
  isPublic: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  files: [],
  folders: []
}
```

## 📚 Best Practices

### Type Definition Guidelines
1. **Use descriptive names** - Clear, self-documenting interfaces
2. **Leverage union types** - For constrained string values
3. **Optional vs required** - Be explicit about optional properties
4. **Consistent naming** - Follow camelCase conventions
5. **Generic types** - Reuse common patterns

### Schema Validation
1. **Match TypeScript types** - Keep schemas in sync with types
2. **Meaningful error messages** - Provide clear validation feedback
3. **Strict validation** - Don't allow unknown properties
4. **Transform data** - Use Zod transforms for data cleaning
5. **Composable schemas** - Build complex schemas from simple ones

## 🔗 Integration

This package is consumed by:

- **`apps/web`** - Frontend type safety
- **`apps/api`** - Backend validation and typing
- **`apps/docs`** - API documentation
- **All packages** - Shared interfaces and contracts

## 📖 Documentation

Types are automatically documented through:
- **TSDoc comments** - Inline documentation
- **Generated docs** - API reference generation
- **IDE IntelliSense** - Rich editing experience

---

**Part of DataRoom MVP** - Type-safe development foundation