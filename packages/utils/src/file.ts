/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const extension = filename.toLowerCase().split('.').pop();
  return extension || '';
}

/**
 * Get filename without extension
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
}

/**
 * Generate safe filename (remove invalid characters)
 */
export function sanitizeFilename(filename: string): string {
  // Remove invalid characters for filenames
  return filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim();
}

/**
 * Check if file is image
 */
export function isImageFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  return imageExtensions.includes(extension);
}

/**
 * Check if file is document
 */
export function isDocumentFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  return documentExtensions.includes(extension);
}

/**
 * Check if file is spreadsheet
 */
export function isSpreadsheetFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  const spreadsheetExtensions = ['xls', 'xlsx', 'csv', 'ods'];
  return spreadsheetExtensions.includes(extension);
}

/**
 * Get MIME type from filename
 */
export function getMimeTypeFromFilename(filename: string): string {
  const extension = getFileExtension(filename);
  
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    rtf: 'application/rtf',
    
    // Spreadsheets
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    
    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    
    // Others
    json: 'application/json',
    xml: 'application/xml',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}

// formatFileSize is exported from format.ts to avoid duplication