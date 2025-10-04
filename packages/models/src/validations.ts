import { z } from 'zod';

// Authentication validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(4, 'Password must be at least 6 characters long'),
});

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters long')
    .max(50, 'Full name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// File upload validation schema
export const fileUploadSchema = z.object({
  description: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 200, {
      message: 'Description must be less than 200 characters',
    }),
  tags: z
    .string()
    .optional()
    .refine((val) => !val || val.split(',').length <= 10, {
      message: 'You can add up to 10 tags',
    }),
  isPublic: z.boolean().default(false),
});

// File validation functions
export const validateFileType = (file: File) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported. Please upload images, PDFs, documents, or zip files.');
  }
};

export const validateFileSize = (file: File, maxSizeMB: number = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }
};

// API validation schemas
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  age: z.number().int().min(1, 'Age must be positive').max(120, 'Invalid age'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'admin', 'moderator', 'super_admin']).default('user'),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const createFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  originalName: z.string().min(1, 'Original name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().int().positive('File size must be positive'),
  blobUrl: z.string().url('Invalid blob URL'),
  blobPathname: z.string().min(1, 'Blob pathname is required'),
  isPublic: z.number().int().min(0).max(1).default(0),
  description: z.string().max(200, 'Description too long').optional(),
  tags: z.string().optional(),
});

export const updateFileSchema = createFileSchema.partial();

// Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type CreateFileData = z.infer<typeof createFileSchema>;
export type UpdateFileData = z.infer<typeof updateFileSchema>;