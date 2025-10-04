// Models package now focuses on database schema and domain-specific utilities
// API and common types moved to @dataroom/types for better separation

// Re-export commonly used types from shared types package
export type {
  ApiResponse,
  PaginatedResponse,
  AuthTokens,
  AuthUser,
  AuthResponse,
  FileStats,
  FileUploadProgress,
  FileFilter,
  ValidationError,
  ApiError,
  DeepPartial,
  Prettify
} from '@dataroom/types';

// Common constants
export const FILE_UPLOAD_MAX_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
] as const;

export const USER_ROLES = ['user', 'admin', 'moderator', 'super_admin'] as const;

// Type guards
export const isValidUserRole = (role: string): role is typeof USER_ROLES[number] => {
  return USER_ROLES.includes(role as any);
};

export const isValidFileType = (mimeType: string): mimeType is typeof ALLOWED_FILE_TYPES[number] => {
  return ALLOWED_FILE_TYPES.includes(mimeType as any);
};

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('zip')) return '🗜️';
  return '📎';
};