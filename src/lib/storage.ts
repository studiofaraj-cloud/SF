
import "server-only";

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { initializeServerSideFirebaseSync } from '@/firebase/server-init';

const { storage } = initializeServerSideFirebaseSync();

export type ImageMetadata = {
  url: string;
  name: string;
  size: number;
  path: string;
};

export async function uploadFile(file: File, path: string): Promise<ImageMetadata> {
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
