// API endpoint constants
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    LIST: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    
    // Admin endpoints
    ADMIN: {
      LIST: '/users/admin/users',
      DELETE: (id: string) => `/users/admin/delete/${id}`,
      UPDATE_ROLE: (id: string) => `/users/admin/role/${id}`
    },
    
    // Moderation endpoints  
    MODERATION: {
      DASHBOARD: '/users/moderation/dashboard',
      REPORTS: '/users/moderation/reports'
    },
    
    // Management endpoints
    MANAGEMENT: {
      STATS: '/users/management/stats',
      ANALYTICS: '/users/management/analytics'
    }
  },
  
  // Files
  FILES: {
    UPLOAD: '/files/upload',
    MY_FILES: '/files/my-files',
    DELETE: (id: string) => `/files/file/${id}`,
    DOWNLOAD: (id: string) => `/files/download/${id}`,
    PUBLIC: (id: string) => `/files/public/${id}`,
    UPDATE_VISIBILITY: (id: string) => `/files/visibility/${id}`
  },
  
  // Health check
  HEALTH: '/'
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const;

// API response messages
export const API_MESSAGES = {
  // Success messages
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
    PROFILE_UPDATED: 'Profile updated successfully',
    FILE_UPLOADED: 'File uploaded successfully',
    FILE_DELETED: 'File deleted successfully',
    ROLE_UPDATED: 'User role updated successfully'
  },
  
  // Error messages
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User with this email already exists',
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'Authorization header with Bearer token is required',
    INVALID_TOKEN: 'The provided token is invalid or expired',
    FORBIDDEN: 'Access denied. Insufficient permissions',
    FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit',
    INVALID_FILE_TYPE: 'File type is not allowed',
    FILE_NOT_FOUND: 'File not found',
    VALIDATION_ERROR: 'Validation failed',
    INTERNAL_ERROR: 'Internal server error'
  }
} as const;