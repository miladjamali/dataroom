# `@dataroom/auth`

> Authentication utilities and JWT handling for the DataRoom MVP application

## 🚀 Overview

This package provides secure authentication utilities, JWT token management, and password hashing functionality for the DataRoom MVP application. It ensures consistent security practices across the entire application.

## 🛠️ Technology Stack

- **JWT (jsonwebtoken)** - Secure token-based authentication
- **bcrypt** - Password hashing with salt
- **TypeScript** - Full type safety
- **Zod** - Runtime validation for auth payloads

## 📦 Features

### JWT Token Management
- **Token Generation** - Create secure JWT tokens
- **Token Verification** - Validate and decode tokens
- **Token Refresh** - Automatic token renewal
- **Expiration Handling** - Secure token lifecycle

### Password Security
- **Password Hashing** - bcrypt with configurable salt rounds
- **Password Verification** - Secure password comparison
- **Password Strength** - Validation utilities

### Client-Side Auth
- **Auth State Management** - React context for auth state
- **Protected Routes** - Route protection utilities
- **Auto-logout** - Automatic session cleanup

## 🚀 Usage

### Server-Side (API)

```typescript
import { generateToken, verifyToken, hashPassword, verifyPassword } from '@dataroom/auth'

// Generate JWT token
const token = generateToken({ 
  userId: user.id, 
  email: user.email 
})

// Verify JWT token
const payload = verifyToken(token)

// Hash password
const hashedPassword = await hashPassword('user-password')

// Verify password
const isValid = await verifyPassword('user-password', hashedPassword)
```

### Client-Side (React)

```typescript
import { useAuth, AuthProvider } from '@dataroom/auth/client'

// Wrap app with AuthProvider
function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  )
}

// Use auth in components
function Dashboard() {
  const { user, login, logout, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }
  
  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## 🔧 API Reference

### JWT Functions

#### `generateToken(payload: TokenPayload): string`
Generates a signed JWT token with the provided payload.

```typescript
const token = generateToken({
  userId: '123',
  email: 'user@example.com',
  role: 'user'
})
```

#### `verifyToken(token: string): TokenPayload | null`
Verifies and decodes a JWT token. Returns payload or null if invalid.

```typescript
const payload = verifyToken(authToken)
if (payload) {
  console.log('User ID:', payload.userId)
}
```

#### `refreshToken(token: string): string | null`
Generates a new token from a valid existing token.

```typescript
const newToken = refreshToken(existingToken)
```

### Password Functions

#### `hashPassword(password: string): Promise<string>`
Hashes a plain text password using bcrypt.

```typescript
const hashedPassword = await hashPassword('user-password')
```

#### `verifyPassword(password: string, hash: string): Promise<boolean>`
Verifies a password against its hash.

```typescript
const isValid = await verifyPassword('user-password', storedHash)
```

### Client Hooks

#### `useAuth(): AuthContext`
Returns the current authentication context.

```typescript
const { 
  user,           // Current user data
  isAuthenticated, // Boolean auth status
  isLoading,      // Loading state
  login,          // Login function
  logout,         // Logout function
  refreshAuth     // Refresh auth state
} = useAuth()
```

## 🔒 Security Features

### JWT Security
- **Secure Signing** - Uses environment-based secret keys
- **Expiration Control** - Configurable token lifetimes
- **Payload Validation** - Type-safe token payloads
- **Automatic Refresh** - Seamless token renewal

### Password Security
- **Salt Rounds** - Configurable bcrypt complexity
- **No Plain Text** - Passwords never stored in plain text
- **Timing Attack Protection** - Constant-time comparisons
- **Password Policies** - Validation utilities

### Client Security
- **Secure Storage** - Tokens stored in httpOnly cookies (when possible)
- **Auto-logout** - Automatic cleanup on token expiration
- **CSRF Protection** - Cross-site request forgery prevention
- **XSS Protection** - Secure token handling

## ⚙️ Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secure-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Password Configuration
BCRYPT_SALT_ROUNDS=12

# Client Configuration
AUTH_COOKIE_NAME=dataroom-auth
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=strict
```

### Default Configuration

```typescript
// Default settings
export const authConfig = {
  jwt: {
    expiresIn: '7d',
    refreshExpiresIn: '30d',
    algorithm: 'HS256'
  },
  password: {
    saltRounds: 12,
    minLength: 8,
    requireSpecialChars: true
  },
  client: {
    autoRefresh: true,
    refreshThreshold: 300000, // 5 minutes
    storageType: 'cookie'
  }
}
```

## 🧪 Testing

```typescript
import { generateToken, verifyToken, hashPassword } from '@dataroom/auth'

describe('Auth Utils', () => {
  test('should generate valid JWT token', () => {
    const payload = { userId: '123', email: 'test@example.com' }
    const token = generateToken(payload)
    const decoded = verifyToken(token)
    
    expect(decoded).toEqual(expect.objectContaining(payload))
  })
  
  test('should hash and verify password', async () => {
    const password = 'test-password'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword(password, hash)
    
    expect(isValid).toBe(true)
  })
})
```

## 🔗 Integration

This package is used by:

- **`apps/api`** - Server-side authentication
- **`apps/web`** - Client-side auth state management
- **`packages/models`** - User model validation

## 📚 Best Practices

1. **Never log tokens** - Keep auth tokens out of logs
2. **Use HTTPS** - Always use secure connections in production
3. **Validate inputs** - Always validate auth payloads
4. **Handle errors gracefully** - Provide helpful error messages
5. **Regular rotation** - Periodically rotate JWT secrets

---

**Part of DataRoom MVP** - Secure authentication foundation