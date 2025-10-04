export interface Folder {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  description?: string;
  fileCount: number;
  folderCount: number;
  totalSize: number;
}

export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  createdAt: string;
  path: string;
  folderId: string | null; // Add folder association
  url?: string;
  blobUrl: string;
  isPublic: boolean;
  description?: string;
  tags?: string | string[];
}

export interface FileUploadRequest {
  file: File;
  metadata?: {
    description?: string;
    tags?: string[];
  };
}

export interface FileUploadResponse {
  message: string;
  file: FileUpload;
  uploadUrl?: string;
}

export interface FolderCreateRequest {
  name: string;
  parentId?: string;
  description?: string;
  isPublic?: boolean;
}

export interface FolderCreateResponse {
  message: string;
  folder: Folder;
}

export interface FolderContents {
  folders: Folder[];
  files: FileUpload[];
  currentFolder: Folder | null;
  breadcrumbs: { id: string; name: string; path: string }[];
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  path: string;
  parentId: string | null;
}

export interface FileUploadResult {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  blobUrl: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface FileUploadOptions {
  isPublic?: boolean;
  description?: string;
  tags?: string[];
  folderId?: string;
}

export interface FilesListResponse {
  message: string;
  files: FileUpload[];
  count: number;
}

export interface FileListQuery {
  search?: string;
  mimeType?: string;
  uploadedBy?: string;
  sortBy?: 'filename' | 'size' | 'uploadedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface FileValidationError {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'FILENAME_INVALID';
  message: string;
  maxSize?: number;
  allowedTypes?: string[];
}