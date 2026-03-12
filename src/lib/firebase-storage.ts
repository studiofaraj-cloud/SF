import { 
  ref, 
  uploadBytesResumable, 
  deleteObject, 
  getDownloadURL,
  UploadTask,
  StorageReference 
} from 'firebase/storage';
import { storage } from '@/firebase/config';

export type UploadFolder = 'blogs' | 'projects';

export interface UploadOptions {
  folder: UploadFolder;
  id: string;
  onProgress?: (progress: number) => void;
}

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

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function validateFile(file: File): FileValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  return { valid: true };
}

function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
}

function getStoragePath(folder: UploadFolder, id: string, filename: string): string {
  return `${folder}/${id}/${filename}`;
}

export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<{ downloadURL: string; filename: string; path: string }> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const uniqueFilename = generateUniqueFilename(file.name);
  const storagePath = getStoragePath(options.folder, options.id, uniqueFilename);
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (options.onProgress) {
          options.onProgress(progress);
        }
      },
      (error) => {
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadURL,
            filename: uniqueFilename,
            path: storagePath
          });
        } catch (error) {
          reject(new Error('Failed to get download URL'));
        }
      }
    );
  });
}

export async function deleteImage(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn(`File not found: ${path}`);
      return;
    }
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

export async function getImageURL(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      throw new Error('Image not found');
    }
    throw new Error(`Failed to get image URL: ${error.message}`);
  }
}

export function uploadImageWithProgress(
  file: File,
  options: UploadOptions
): { uploadTask: UploadTask; storageRef: StorageReference } {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const uniqueFilename = generateUniqueFilename(file.name);
  const storagePath = getStoragePath(options.folder, options.id, uniqueFilename);
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return { uploadTask, storageRef };
}
