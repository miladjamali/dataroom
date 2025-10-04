// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
  timestamp?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> extends Omit<ApiResponse, 'data'> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Request types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
}

// Hono Context types (for API)
export interface CustomContextVariables {
  userId: string;
  userRole: string;
  user?: any; // Could be more specific user type
}

// Authentication types - API response format (serialized dates)
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  age?: number; // Make optional for compatibility
  role: string;
  createdAt: string; // Use string to match User interface
  updatedAt: string; // Use string to match User interface
}

export interface AuthResponse extends ApiResponse<AuthUser> {
  token: string;
  user: AuthUser;
  tokens?: AuthTokens; // Keep compatibility with models version
}

// Additional types consolidated from models package
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface FileStats {
  totalFiles: number;
  publicFiles: number;
  privateFiles: number;
  totalSize: number;
  averageSize: number;
}

export interface FileUploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface FileFilter {
  search?: string;
  isPublic?: boolean;
  mimeType?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// HTTP types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number>;
  timeout?: number;
}