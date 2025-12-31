import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Allowed file types and their MIME types - Restricted to documents only
export const ALLOWED_FILE_TYPES = {
  // PDF Documents
  pdf: ['application/pdf'],
  
  // Word Documents
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  
  // Excel Spreadsheets
  xls: ['application/vnd.ms-excel', 'application/excel'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  
  // CSV Files
  csv: ['text/csv', 'application/csv', 'text/plain'],
};

// Maximum file size (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Validate file type
 */
export function validateFileType(fileName, mimeType) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_FILE_TYPES[ext]) {
    return { valid: false, error: `File type .${ext} is not allowed` };
  }
  
  if (mimeType && !ALLOWED_FILE_TYPES[ext].includes(mimeType)) {
    return { valid: false, error: `MIME type ${mimeType} does not match file extension` };
  }
  
  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(fileSize) {
  if (fileSize > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
    };
  }
  return { valid: true };
}

/**
 * Generate unique file name
 */
export function generateFileName(originalName) {
  const ext = originalName.split('.').pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${random}.${ext}`;
}

/**
 * Get upload directory path
 */
export function getUploadDir(type) {
  const baseDir = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads');
  return join(baseDir, type);
}

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDir(type) {
  const dir = getUploadDir(type);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

/**
 * Save uploaded file
 */
export async function saveFile(file, type, lessonId) {
  // Validate file
  const typeValidation = validateFileType(file.name, file.type);
  if (!typeValidation.valid) {
    throw new Error(typeValidation.error);
  }
  
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.valid) {
    throw new Error(sizeValidation.error);
  }
  
  // Ensure directory exists
  const uploadDir = await ensureUploadDir(type);
  const fileName = generateFileName(file.name);
  const filePath = join(uploadDir, fileName);
  
  // Convert file to buffer and save
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer);
  
  // Return relative path from public directory
  const relativePath = `/uploads/${type}/${fileName}`;
  
  return {
    fileName,
    originalName: file.name,
    filePath: relativePath,
    fileType: file.name.split('.').pop()?.toLowerCase(),
    fileSize: file.size,
    mimeType: file.type,
  };
}

/**
 * Parse form data from request
 */
export async function parseFormData(request) {
  try {
    const formData = await request.formData();
    return formData;
  } catch (error) {
    throw new Error('Failed to parse form data');
  }
}

