
'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Image as ImageIcon, Upload, X, GripVertical, Trash2, AlertCircle } from 'lucide-react';
import { storage, firebaseConfig } from '@/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { FirebaseError } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Error types for Firebase Storage
type StorageErrorCode = 
  | 'storage/unauthorized'
  | 'storage/quota-exceeded'
  | 'storage/retry-limit-exceeded'
  | 'storage/invalid-format'
  | 'storage/canceled'
  | 'storage/unknown'
  | 'storage/object-not-found'
  | 'storage/bucket-not-found'
  | 'storage/project-not-found'
  | 'storage/unauthenticated'
  | 'storage/invalid-checksum'
  | 'storage/server-file-wrong-size'
  | 'storage/no-default-bucket'
  | 'storage/cannot-slice-blob';

type UploadContext = {
  fileName: string;
  fileSize: number;
  fileType: string;
  userId?: string;
  userEmail?: string;
  timestamp: number;
  attemptNumber: number;
};

// Logger utility for upload errors
function logUploadError(error: FirebaseError | Error, context: UploadContext): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      code: (error as FirebaseError).code || 'unknown',
      name: error.name,
    },
    context: {
      fileName: context.fileName,
      fileSize: `${(context.fileSize / 1024 / 1024).toFixed(2)} MB`,
      fileType: context.fileType,
      userId: context.userId || 'anonymous',
      userEmail: context.userEmail || 'not available',
      timestamp: new Date(context.timestamp).toISOString(),
      attemptNumber: context.attemptNumber,
    },
    firebase: {
      storageBucket: firebaseConfig.storageBucket || 'not configured',
      projectId: firebaseConfig.projectId || 'not configured',
    },
  };

  console.error('[ImageUpload Error]', JSON.stringify(errorLog, null, 2));
}

// Get user-friendly error message based on Firebase error code
function getErrorMessage(error: FirebaseError | Error): string {
  if (!(error as FirebaseError).code) {
    return 'An unexpected error occurred. Please try again.';
  }

  const code = (error as FirebaseError).code as StorageErrorCode;

  switch (code) {
    case 'storage/unauthorized':
    case 'storage/unauthenticated':
      return 'You do not have permission to upload files. Please check your authentication status.';
    
    case 'storage/quota-exceeded':
      return 'Storage quota exceeded. Please contact the administrator or try a smaller file.';
    
    case 'storage/retry-limit-exceeded':
      return 'Upload failed after multiple attempts. Please check your internet connection and try again.';
    
    case 'storage/invalid-format':
      return 'Invalid file format. Please upload a valid image file (PNG, JPG, GIF, WebP).';
    
    case 'storage/canceled':
      return 'Upload was canceled.';
    
    case 'storage/bucket-not-found':
    case 'storage/no-default-bucket':
      return 'Storage configuration error. Please contact the administrator.';
    
    case 'storage/object-not-found':
      return 'The file could not be found. Please try uploading again.';
    
    case 'storage/project-not-found':
      return 'Firebase project configuration error. Please contact the administrator.';
    
    case 'storage/invalid-checksum':
      return 'File integrity check failed. Please try uploading the file again.';
    
    case 'storage/server-file-wrong-size':
      return 'File size mismatch during upload. Please try again.';
    
    case 'storage/cannot-slice-blob':
      return 'Unable to process the file. Please try a different file.';
    
    case 'storage/unknown':
    default:
      return 'An error occurred during upload. Please check your connection and try again.';
  }
}

// Validate Firebase configuration
function validateFirebaseConfig(): { valid: boolean; error?: string } {
  if (!firebaseConfig) {
    return { 
      valid: false, 
      error: 'Firebase configuration is missing. Please contact the administrator.' 
    };
  }

  if (!firebaseConfig.storageBucket) {
    return { 
      valid: false, 
      error: 'Firebase Storage bucket is not configured. Please contact the administrator.' 
    };
  }

  if (!firebaseConfig.projectId) {
    return { 
      valid: false, 
      error: 'Firebase project ID is not configured. Please contact the administrator.' 
    };
  }

  if (!storage) {
    return { 
      valid: false, 
      error: 'Firebase Storage is not initialized. Please contact the administrator.' 
    };
  }

  return { valid: true };
}

// Get current user context for logging
function getUserContext(): { userId?: string; userEmail?: string } {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      return {
        userId: user.uid,
        userEmail: user.email || undefined,
      };
    }
  } catch (error) {
    console.warn('[ImageUpload] Could not get user context:', error);
  }
  
  return {};
}

// Check if error is retryable
function isRetryableError(error: FirebaseError | Error): boolean {
  if (!(error as FirebaseError).code) {
    return false;
  }

  const code = (error as FirebaseError).code;
  const retryableCodes = [
    'storage/retry-limit-exceeded',
    'storage/unknown',
    'storage/server-file-wrong-size',
  ];

  return retryableCodes.includes(code);
}

// Retry mechanism with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1 && isRetryableError(error as FirebaseError)) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[ImageUpload] Retrying upload in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }

  throw lastError!;
}

type ImageUploadProps = {
  label: string;
  name: string;
  initialValue?: string;
  onUploadComplete?: (url: string) => void;
  onDelete?: () => void;
};

export function ImageUpload({ 
  label, 
  name, 
  initialValue = '',
  onUploadComplete,
  onDelete
}: ImageUploadProps) {
  const [preview, setPreview] = useState(initialValue);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedUrl, setUploadedUrl] = useState(initialValue);

  const uploadFile = useCallback(async (file: File) => {
    // Validate Firebase configuration first
    const configValidation = validateFirebaseConfig();
    if (!configValidation.valid) {
      setError(configValidation.error!);
      return;
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setError('Invalid file format. Please upload PNG, JPG, GIF, or WebP images only.');
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    // Check minimum file size (1KB)
    if (file.size < 1024) {
      setError('File is too small. Please upload a valid image file.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const userContext = getUserContext();
    const uploadContext: UploadContext = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      ...userContext,
      timestamp: Date.now(),
      attemptNumber: 1,
    };

    try {
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}-${sanitizedFileName}`;
      const storageRef = ref(storage, `images/${fileName}`);

      // Wrap upload in retry mechanism
      await retryWithBackoff(async () => {
        return new Promise<void>((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              const firebaseError = error as FirebaseError;
              uploadContext.attemptNumber++;
              logUploadError(firebaseError, uploadContext);
              
              const errorMessage = getErrorMessage(firebaseError);
              setError(errorMessage);
              setIsUploading(false);
              setUploadProgress(0);
              
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setPreview(downloadURL);
                setUploadedUrl(downloadURL);
                setIsUploading(false);
                setUploadProgress(100);
                
                if (onUploadComplete) {
                  onUploadComplete(downloadURL);
                }
                
                console.log('[ImageUpload] Upload successful:', {
                  fileName: uploadContext.fileName,
                  fileSize: uploadContext.fileSize,
                  url: downloadURL,
                });
                
                resolve();
              } catch (error) {
                const err = error as Error;
                logUploadError(err, uploadContext);
                setError('Failed to retrieve the uploaded image URL. Please try again.');
                setIsUploading(false);
                setUploadProgress(0);
                reject(error);
              }
            }
          );
        });
      }, 3, 1000);
    } catch (error) {
      const err = error as Error;
      
      if (!isRetryableError(err as FirebaseError)) {
        logUploadError(err, uploadContext);
      }
      
      if (!error) {
        setError('Failed to start upload. Please check your connection and try again.');
      }
      
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadComplete]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }, [uploadFile]);

  const handleDeleteImage = useCallback(async () => {
    if (!uploadedUrl) return;

    const urlToDelete = uploadedUrl;
    setPreview('');
    setUploadedUrl('');
    setUploadProgress(0);
    setError(null);

    if (onDelete) {
      onDelete();
    }

    if (urlToDelete.includes('firebasestorage.googleapis.com')) {
      try {
        const imageRef = ref(storage, urlToDelete);
        await deleteObject(imageRef);
        console.log('[ImageUpload] Image deleted successfully from storage');
      } catch (err) {
        console.warn('[ImageUpload] Could not delete image from storage (non-fatal):', err);
      }
    }
  }, [uploadedUrl, onDelete]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        type="hidden"
        name={`${name}-url`}
        value={uploadedUrl}
      />

      <Card 
        className={`mt-2 transition-colors ${isDragging ? 'border-primary border-2' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-4">
          {preview ? (
            <div className="space-y-2">
              <div className="aspect-video relative">
                <Image
                  src={preview}
                  alt="Image preview"
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Replace Image
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteImage}
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="aspect-video flex items-center justify-center bg-secondary rounded-md cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={triggerFileInput}
            >
              <div className="text-center text-muted-foreground">
                <ImageIcon className="mx-auto h-10 w-10 mb-2" />
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-sm mt-1">PNG, JPG, GIF, WebP up to 10MB</p>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {error && (
            <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type GalleryImage = {
  id: string;
  url: string;
  file?: File;
  uploadProgress: number;
  isUploading: boolean;
  error?: string;
  retryCount?: number;
};

type MultiImageUploadProps = {
  label: string;
  name: string;
  initialValues?: string[];
  storagePath?: string;
};

export function MultiImageUpload({ 
  label, 
  name, 
  initialValues = [],
  storagePath = 'gallery'
}: MultiImageUploadProps) {
  const [images, setImages] = useState<GalleryImage[]>(
    initialValues.map((url, index) => ({
      id: `initial-${index}`,
      url,
      uploadProgress: 100,
      isUploading: false,
      retryCount: 0,
    }))
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `${file.name}: Invalid file format. Only PNG, JPG, GIF, WebP are allowed.` 
      };
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `${file.name}: File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.` 
      };
    }

    if (file.size < 1024) {
      return { 
        valid: false, 
        error: `${file.name}: File too small. Please upload a valid image.` 
      };
    }

    return { valid: true };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setGlobalError(null);

    // Validate Firebase configuration
    const configValidation = validateFirebaseConfig();
    if (!configValidation.valid) {
      setGlobalError(configValidation.error!);
      return;
    }

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate all files first
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(validation.error!);
      }
    }

    // Display validation errors if any
    if (errors.length > 0) {
      setGlobalError(errors.join('\n'));
    }

    // Process valid files
    if (validFiles.length > 0) {
      const newImages: GalleryImage[] = validFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        file,
        uploadProgress: 0,
        isUploading: true,
        retryCount: 0,
      }));

      setImages(prev => [...prev, ...newImages]);

      // Upload all files in parallel
      const uploadPromises = newImages.map((image) => {
        if (image.file) {
          return uploadImage(image.id, image.file);
        }
        return Promise.resolve();
      });

      await Promise.allSettled(uploadPromises);
    }

    e.target.value = '';
  };

  const uploadImage = async (imageId: string, file: File) => {
    const userContext = getUserContext();
    const uploadContext: UploadContext = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      ...userContext,
      timestamp: Date.now(),
      attemptNumber: 1,
    };

    try {
      await retryWithBackoff(async () => {
        return new Promise<void>((resolve, reject) => {
          const timestamp = Date.now();
          const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const storageRef = ref(storage, `${storagePath}/${filename}`);
          
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setImages(prev =>
                prev.map(img =>
                  img.id === imageId
                    ? { ...img, uploadProgress: progress }
                    : img
                )
              );
            },
            (error) => {
              const firebaseError = error as FirebaseError;
              uploadContext.attemptNumber++;
              logUploadError(firebaseError, uploadContext);
              
              const errorMessage = getErrorMessage(firebaseError);
              setImages(prev =>
                prev.map(img =>
                  img.id === imageId
                    ? { 
                        ...img, 
                        isUploading: false, 
                        error: errorMessage,
                        retryCount: (img.retryCount || 0) + 1,
                      }
                    : img
                )
              );
              
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setImages(prev =>
                  prev.map(img =>
                    img.id === imageId
                      ? { 
                          ...img, 
                          url: downloadURL, 
                          isUploading: false, 
                          uploadProgress: 100,
                          file: undefined,
                          error: undefined,
                        }
                      : img
                  )
                );
                
                console.log('[MultiImageUpload] Upload successful:', {
                  fileName: uploadContext.fileName,
                  url: downloadURL,
                });
                
                resolve();
              } catch (error) {
                const err = error as Error;
                logUploadError(err, uploadContext);
                setImages(prev =>
                  prev.map(img =>
                    img.id === imageId
                      ? { 
                          ...img, 
                          isUploading: false, 
                          error: 'Failed to retrieve the uploaded image URL.',
                          retryCount: (img.retryCount || 0) + 1,
                        }
                      : img
                  )
                );
                reject(error);
              }
            }
          );
        });
      }, 3, 1000);
    } catch (error) {
      const err = error as Error;
      
      if (!isRetryableError(err as FirebaseError)) {
        logUploadError(err, uploadContext);
      }
    }
  };

  const retryUpload = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !image.file) return;

    setImages(prev =>
      prev.map(img =>
        img.id === imageId
          ? { ...img, isUploading: true, error: undefined, uploadProgress: 0 }
          : img
      )
    );

    await uploadImage(imageId, image.file);
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));

    if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
      try {
        const fileRef = ref(storage, imageUrl);
        await deleteObject(fileRef);
        console.log('[MultiImageUpload] Image deleted successfully from storage');
      } catch (error) {
        console.warn('[MultiImageUpload] Could not delete image from storage (non-fatal):', error);
      }
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div>
          <input
            type="file"
            id={`${name}-file-input`}
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`${name}-file-input`)?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
        </div>
      </div>

      {globalError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-destructive whitespace-pre-line">{globalError}</div>
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="mx-auto h-12 w-12 mb-2" />
              <p>No images uploaded yet</p>
              <p className="text-sm mt-1">Click &quot;Upload Images&quot; to add gallery images</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card
              key={image.id}
              draggable={!image.isUploading}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative ${draggedIndex === index ? 'opacity-50' : ''} ${
                !image.isUploading ? 'cursor-move' : ''
              }`}
            >
              <CardContent className="p-3">
                <div className="aspect-square relative mb-2">
                  {image.url && !image.error ? (
                    <Image
                      src={image.url}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary rounded-md">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {!image.isUploading && !image.error && (
                    <>
                      <div className="absolute top-2 left-2 bg-background/80 rounded p-1 cursor-move">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => deleteImage(image.id, image.url)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {image.isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploading...</span>
                      <span className="text-muted-foreground">
                        {Math.round(image.uploadProgress)}%
                      </span>
                    </div>
                    <Progress value={image.uploadProgress} />
                  </div>
                )}

                {image.error && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{image.error}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => retryUpload(image.id)}
                        className="flex-1"
                        disabled={!image.file}
                      >
                        Retry
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteImage(image.id, image.url)}
                        className="flex-1"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}

                {!image.isUploading && !image.error && (
                  <input
                    type="hidden"
                    name={`${name}[]`}
                    value={image.url}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

