import { put, del, list } from '@vercel/blob';
import { db } from './db.js';
import { files, users } from '@dataroom/models/database';
import type { SelectFile } from '@dataroom/models/database';
import { eq } from 'drizzle-orm';
import { FILE_UPLOAD } from '@dataroom/constants/files';
import type { FileUploadResult, FileUploadOptions } from '@dataroom/types';

export class FileService {
  private static readonly MAX_FILE_SIZE = FILE_UPLOAD.MAX_FILE_SIZE; // 10MB
  private static readonly ALLOWED_MIME_TYPES = FILE_UPLOAD.ALLOWED_MIME_TYPES;

  static async uploadFile(
    userId: string,
    file: File,
    options: FileUploadOptions = {}
  ): Promise<FileUploadResult> {
    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Validate file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop() || '';
    const filename = `${userId}/${timestamp}-${randomId}.${extension}`;

    try {
      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: 'public', // Always public for now, we'll handle privacy in our API
        contentType: file.type,
      });

      // Save metadata to database
      const fileData = await db.insert(files).values({
        userId,
        folderId: options.folderId || null,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        blobUrl: blob.url,
        blobPathname: blob.pathname,
        isPublic: options.isPublic ? 1 : 0,
        description: options.description || null,
        tags: options.tags ? JSON.stringify(options.tags) : null,
      }).returning({
        id: files.id,
        filename: files.filename,
        originalName: files.originalName,
        mimeType: files.mimeType,
        size: files.size,
        blobUrl: files.blobUrl,
        isPublic: files.isPublic,
        createdAt: files.createdAt,
      });

      return {
        ...fileData[0],
        isPublic: fileData[0].isPublic === 1,
      };

    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  static async getUserFiles(userId: string): Promise<SelectFile[]> {
    return await db.select().from(files).where(eq(files.userId, userId));
  }

  static async getFileById(fileId: string, userId?: string): Promise<SelectFile | null> {
    const fileData = await db.select().from(files).where(eq(files.id, fileId));
    
    if (fileData.length === 0) {
      return null;
    }

    const file = fileData[0];
    
    // Check if user has access to this file
    if (!file.isPublic && userId && file.userId !== userId) {
      return null;
    }

    return file;
  }

  static async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      // Get file data first
      const fileData = await db.select().from(files).where(eq(files.id, fileId));
      
      if (fileData.length === 0) {
        return false;
      }

      const file = fileData[0];
      
      // Check if user owns this file
      if (file.userId !== userId) {
        throw new Error('Unauthorized to delete this file');
      }

      // Delete from Vercel Blob
      await del(file.blobUrl);

      // Delete from database
      await db.delete(files).where(eq(files.id, fileId));

      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error('Failed to delete file');
    }
  }

  static async updateFileMetadata(
    fileId: string,
    userId: string,
    updates: {
      description?: string;
      tags?: string[];
      isPublic?: boolean;
    }
  ): Promise<SelectFile | null> {
    try {
      // Check if user owns this file
      const existingFile = await this.getFileById(fileId, userId);
      if (!existingFile || existingFile.userId !== userId) {
        return null;
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (updates.description !== undefined) {
        updateData.description = updates.description;
      }
      if (updates.tags !== undefined) {
        updateData.tags = JSON.stringify(updates.tags);
      }
      if (updates.isPublic !== undefined) {
        updateData.isPublic = updates.isPublic ? 1 : 0;
      }

      const updatedFile = await db.update(files)
        .set(updateData)
        .where(eq(files.id, fileId))
        .returning();

      return updatedFile[0] || null;
    } catch (error) {
      console.error('File update error:', error);
      throw new Error('Failed to update file');
    }
  }

  static isValidMimeType(mimeType: string): boolean {
    return this.ALLOWED_MIME_TYPES.includes(mimeType);
  }

  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}