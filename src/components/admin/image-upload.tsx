
'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Image as ImageIcon, Upload, X, GripVertical, Trash2 } from 'lucide-react';
import { storage } from '@/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { compressAndConvertImage } from '@/lib/utils';

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
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedUrl, setUploadedUrl] = useState(initialValue);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setIsCompressing(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Compress and convert image to WebP before uploading
      let fileToUpload = file;
      try {
        fileToUpload = await compressAndConvertImage(file);
        setIsCompressing(false);
      } catch (compressionError) {
        console.warn('Image compression failed, uploading original:', compressionError);
        setIsCompressing(false);
      }

      const timestamp = Date.now();
      const sanitizedFileName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}-${sanitizedFileName}`;
      const storageRef = ref(storage, `images/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          let errorMessage = 'Failed to upload image. Please try again.';
          
          if (error.code === 'storage/unauthorized') {
            errorMessage = 'Unauthorized: Check Firebase Storage rules.';
          } else if (error.code === 'storage/canceled') {
            errorMessage = 'Upload canceled.';
          } else if (error.code === 'storage/unknown') {
            errorMessage = 'Unknown error occurred. Please check your connection.';
          }
          
          setError(errorMessage);
          setIsUploading(false);
          setUploadProgress(0);
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
          } catch (error) {
            console.error('Error getting download URL:', error);
            setError('Failed to get image URL. Please try again.');
            setIsUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (error) {
      console.error('Error starting upload:', error);
      setError('Failed to start upload. Please check your Firebase configuration.');
      setIsUploading(false);
      setIsCompressing(false);
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

    // Always clear the UI immediately so the form submits without an image
    const urlToDelete = uploadedUrl;
    setPreview('');
    setUploadedUrl('');
    setUploadProgress(0);
    setError(null);

    if (onDelete) {
      onDelete();
    }

    // Attempt to delete from Firebase Storage — best-effort, won't block UI
    if (urlToDelete.includes('firebasestorage.googleapis.com')) {
      try {
        // Firebase Storage URLs contain the path encoded in the URL
        // We can create a ref directly from the download URL
        const imageRef = ref(storage, urlToDelete);
        await deleteObject(imageRef);
      } catch (err) {
        // Silently ignore — the image reference may no longer be valid or
        // the URL may be a download URL that doesn't map directly to a storage path.
        console.warn('Could not delete image from storage (non-fatal):', err);
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
                <p className="text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">
                {isCompressing ? 'Compressing and converting to WebP...' : `Uploading... ${Math.round(uploadProgress)}%`}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
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
  isCompressing?: boolean;
  error?: string;
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
    }))
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newImages: GalleryImage[] = fileArray.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
      uploadProgress: 0,
      isUploading: true,
    }));

    setImages(prev => [...prev, ...newImages]);

    for (let i = 0; i < newImages.length; i++) {
      const image = newImages[i];
      if (image.file) {
        await uploadImage(image.id, image.file);
      }
    }

    e.target.value = '';
  };

  const uploadImage = async (imageId: string, file: File) => {
    try {
      setImages(prev =>
        prev.map(img =>
          img.id === imageId
            ? { ...img, isCompressing: true }
            : img
        )
      );

      let fileToUpload = file;
      try {
        fileToUpload = await compressAndConvertImage(file);
      } catch (compressionError) {
        console.warn('Image compression failed, uploading original:', compressionError);
      }

      setImages(prev =>
        prev.map(img =>
          img.id === imageId
            ? { ...img, isCompressing: false }
            : img
        )
      );

      const timestamp = Date.now();
      const filename = `${timestamp}-${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, `${storagePath}/${filename}`);
      
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

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
          console.error('Upload error:', error);
          setImages(prev =>
            prev.map(img =>
              img.id === imageId
                ? { ...img, isUploading: false, error: error.message }
                : img
            )
          );
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
                      file: undefined 
                    }
                  : img
              )
            );
          } catch (error) {
            console.error('Error getting download URL:', error);
            setImages(prev =>
              prev.map(img =>
                img.id === imageId
                  ? { ...img, isUploading: false, error: 'Failed to get download URL' }
                  : img
              )
            );
          }
        }
      );
    } catch (error) {
      console.error('Error starting upload:', error);
      setImages(prev =>
        prev.map(img =>
          img.id === imageId
            ? { ...img, isUploading: false, error: 'Failed to start upload' }
            : img
        )
      );
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    // Always remove from local state immediately so the form submits without this image
    setImages(prev => prev.filter(img => img.id !== imageId));

    // Best-effort: attempt to delete from Firebase Storage
    if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
      try {
        const fileRef = ref(storage, imageUrl);
        await deleteObject(fileRef);
      } catch (error) {
        // Non-fatal — the image is removed from the form regardless
        console.warn('Could not delete image from storage (non-fatal):', error);
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
                      <span className="text-muted-foreground">
                        {image.isCompressing ? 'Compressing...' : 'Uploading...'}
                      </span>
                      <span className="text-muted-foreground">
                        {image.isCompressing ? '' : `${Math.round(image.uploadProgress)}%`}
                      </span>
                    </div>
                    <Progress value={image.isCompressing ? 0 : image.uploadProgress} />
                  </div>
                )}

                {image.error && (
                  <div className="space-y-2">
                    <p className="text-sm text-destructive">{image.error}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => deleteImage(image.id, image.url)}
                      className="w-full"
                    >
                      Remove
                    </Button>
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
