// API configuration and client utilities
import { formatFileSize } from '@dataroom/models'
import type { PublicUser, FileMetadata } from '@dataroom/models'
import { API_ENDPOINTS } from '@dataroom/constants'
import { tokenStorage, userStorage } from '@dataroom/auth/client'
import type { AuthResponse, ApiError } from '@dataroom/types'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:3000';

// Re-export types from shared models for convenience
export type User = PublicUser
export { formatFileSize }
export type { FileMetadata, AuthResponse, ApiError }

// Use shared token storage
export { tokenStorage, userStorage }

// ApiError now imported from @dataroom/types

// Login API call
export const loginUser = async (credentials: {
  email: string
  password: string
}): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || 'Login failed')
  }

  return response.json()
}

// Signup API call
export const signupUser = async (userData: {
  name: string
  email: string
  password: string
  age?: number
}): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || 'Signup failed')
  }

  return response.json()
}

// Token and user storage utilities are now imported from @dataroom/auth/client

// File-related types and interfaces are now imported from shared models

import type { FileUploadResponse, FilesListResponse } from '@dataroom/types';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = tokenStorage.getToken()
  if (!token) {
    throw new Error('No authentication token found. Please log in.')
  }
  
  return {
    'Authorization': `Bearer ${token}`,
  }
}

// Upload file API call
export const uploadFile = async (
  file: File,
  options: {
    description?: string
    tags?: string
    isPublic?: boolean
  } = {},
  folderId?: string | null
): Promise<FileUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  
  if (options.description) {
    formData.append('description', options.description)
  }
  if (options.tags) {
    formData.append('tags', options.tags)
  }
  if (options.isPublic !== undefined) {
    formData.append('isPublic', options.isPublic.toString())
  }
  if (folderId) {
    formData.append('folderId', folderId)
  }

  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || 'File upload failed')
  }

  return response.json()
}

// Get user's files
export const getUserFiles = async (): Promise<FilesListResponse> => {
  const response = await fetch(`${API_BASE_URL}/files/my-files`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || 'Failed to fetch files')
  }

  return response.json()
}

// Get specific file by ID
export const getFileById = async (fileId: string): Promise<{ message: string; file: FileMetadata }> => {
  const response = await fetch(`${API_BASE_URL}/files/file/${fileId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || 'Failed to fetch file')
  }

  return response.json()
}

// Update file metadata
export const updateFileMetadata = async (
  fileId: string,
  metadata: {
    description?: string
    tags?: string[]
    isPublic?: boolean
  }
): Promise<{ message: string; file: FileMetadata }> => {
  const response = await fetch(`${API_BASE_URL}/files/file/${fileId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(metadata),
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || 'Failed to update file')
  }

  return response.json()
}

// Delete file
export const deleteFile = async (fileId: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/files/file/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || 'Failed to delete file')
  }

  return response.json()
}

// Folder Management API calls
import type { FolderCreateRequest, FolderCreateResponse, FolderContents } from '@dataroom/types'

export const createFolder = async (folderData: FolderCreateRequest): Promise<FolderCreateResponse> => {
  const response = await fetch(`${API_BASE_URL}/folders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(folderData),
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || 'Failed to create folder')
  }

  return response.json()
}

export const getFolderContents = async (folderId?: string | null): Promise<FolderContents> => {
  const url = folderId 
    ? `${API_BASE_URL}/folders/${folderId}/contents`
    : `${API_BASE_URL}/folders/root/contents`
    
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || 'Failed to fetch folder contents')
  }

  return response.json()
}

export const deleteFolder = async (folderId: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || 'Failed to delete folder')
  }

  return response.json()
}

export const renameFolder = async (folderId: string, newName: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ name: newName }),
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || 'Failed to rename folder')
  }

  return response.json()
}

export const moveFile = async (fileId: string, folderId?: string | null): Promise<{ message: string; file: any }> => {
  const response = await fetch(`${API_BASE_URL}/files/${fileId}/move`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ folderId }),
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || 'Failed to move file')
  }

  return response.json()
}

export const moveFolder = async (folderId: string, parentId?: string | null): Promise<{ message: string; folder: any }> => {
  const response = await fetch(`${API_BASE_URL}/folders/${folderId}/move`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ parentId }),
  })

  if (!response.ok) {
    let errorMessage = 'Failed to move folder'
    try {
      const errorData: ApiError = await response.json()
      errorMessage = errorData.error || errorMessage
    } catch (jsonError) {
      // If JSON parsing fails, get the text response
      const textResponse = await response.text()
      console.error('API returned non-JSON response:', textResponse)
      errorMessage = `API Error (${response.status}): ${textResponse.substring(0, 100)}...`
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

// Utility functions are now imported from shared models