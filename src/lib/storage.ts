
import "server-only";

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { initializeServerSideFirebase } from '@/firebase/server-init';

const { storage } = initializeServerSideFirebase();

export type ImageMetadata = {
  url: string;
  name: string;
  size: number;
  path: string;
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const MAX_FILE_SIZE_IMAGES = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE_GALLERY = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File, path: string): FileValidationResult {
  if (!file.type || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type "${file.type}". Allowed types: JPEG, JPG, PNG, WebP, GIF`
    };
  }

  const maxSize = path.startsWith('gallery/') ? MAX_FILE_SIZE_GALLERY : MAX_FILE_SIZE_IMAGES;
  const maxSizeMB = maxSize / (1024 * 1024);

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty'
    };
  }

  return { valid: true };
}

export function validatePath(path: string): FileValidationResult {
  const allowedPaths = ['images/', 'gallery/', 'blogs/', 'projects/', 'admin/'];
  const isAllowed = allowedPaths.some(prefix => path.startsWith(prefix));

  if (!isAllowed) {
    return {
      valid: false,
      error: `Upload path must start with one of: ${allowedPaths.join(', ')}`
    };
  }

  if (path.includes('..') || path.includes('//')) {
    return {
      valid: false,
      error: 'Invalid path: path traversal detected'
    };
  }

  return { valid: true };
}

export async function uploadFile(file: File, path: string): Promise<ImageMetadata> {
  const pathValidation = validatePath(path);
  if (!pathValidation.valid) {
    throw new Error(pathValidation.error);
  }

  const fileValidation = validateFile(file, path);
  if (!fileValidation.valid) {
    throw new Error(fileValidation.error);
  }

  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  
  return {
    url,
    name: file.name,
    size: file.size,
    path: snapshot.ref.fullPath
  };
}

export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      return;
    }
    throw error;
  }
}
