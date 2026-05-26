'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/firebase/config';
import { useUser } from '@/firebase/provider';
import {
  getMyFilesAction,
  getMyFilesUsageAction,
  addClientFileAction,
  deleteClientFileAction,
  CLIENT_FILE_QUOTA,
  type FilesUsage,
} from '@/lib/client-file-actions';
import type { ClientFile } from '@/lib/firestore-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, FolderOpen, Paperclip, Download, Trash2, FileIcon } from 'lucide-react';

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function HubFilesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const en = locale === 'en';
  const { user } = useUser();

  const [files, setFiles] = useState<ClientFile[]>([]);
  const [usage, setUsage] = useState<FilesUsage>({ used: 0, limit: CLIENT_FILE_QUOTA, available: CLIENT_FILE_QUOTA });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [list, u] = await Promise.all([getMyFilesAction(), getMyFilesUsageAction()]);
    setFiles(list);
    setUsage(u);
  };

  useEffect(() => {
    load()
      .catch(() => setError(en ? 'Failed to load files.' : 'Impossibile caricare i file.'))
      .finally(() => setLoading(false));
  }, [en]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user?.uid) return;
    setError(null);

    if (file.size > usage.available) {
      setError(
        en
          ? `Not enough space — ${formatBytes(usage.available)} available.`
          : `Spazio insufficiente — disponibili ${formatBytes(usage.available)}.`
      );
      return;
    }

    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `clients/${user.uid}/${Date.now()}-${safeName}`;
    const ref = storageRef(storage, path);

    try {
      const snap = await uploadBytes(ref, file);
      const url = await getDownloadURL(snap.ref);
      const res = await addClientFileAction({
        url,
        storagePath: snap.ref.fullPath,
        filename: file.name,
        size: file.size,
        contentType: file.type || undefined,
      });
      if (res.success && res.file) {
        setFiles((f) => [res.file!, ...f]);
        if (res.usage) setUsage(res.usage);
      } else {
        // Server rejected (e.g. quota race) — clean up the just-uploaded object.
        try { await deleteObject(ref); } catch {}
        setError(res.error ?? (en ? 'Upload failed.' : 'Caricamento non riuscito.'));
        if (res.usage) setUsage(res.usage);
      }
    } catch {
      setError(en ? 'Upload failed.' : 'Caricamento non riuscito.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, size: number) => {
    if (!confirm(en ? 'Delete this file?' : 'Eliminare questo file?')) return;
    const prev = files;
    setFiles((fs) => fs.filter((f) => f.id !== id));
    setUsage((u) => ({ used: Math.max(0, u.used - size), limit: u.limit, available: u.limit - Math.max(0, u.used - size) }));
    const res = await deleteClientFileAction(id);
    if (!res.success) {
      setFiles(prev);
      setError(res.error ?? (en ? 'Could not delete file.' : 'Impossibile eliminare il file.'));
      // Refresh usage from server to recover.
      try { setUsage(await getMyFilesUsageAction()); } catch {}
    }
  };

  const pct = usage.limit > 0 ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;
  const isFull = usage.available <= 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link href={`/${locale}/hub`} className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Dashboard
      </Link>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <FolderOpen className="h-6 w-6 text-primary" />
        {en ? 'Files' : 'File'}
      </h1>

      {/* Storage usage */}
      <Card className="mb-6">
        <CardContent className="space-y-2 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {en ? 'Storage used' : 'Spazio utilizzato'}
              </p>
              <p className="text-lg font-semibold">
                {formatBytes(usage.used)} <span className="text-sm font-normal text-muted-foreground">/ {formatBytes(usage.limit)}</span>
              </p>
            </div>
            <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isFull}
              className="gap-2"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              {en ? 'Upload file' : 'Carica file'}
            </Button>
          </div>
          <Progress value={pct} />
          <p className="text-xs text-muted-foreground">
            {isFull
              ? en ? 'Storage full — delete a file to upload more.' : 'Spazio pieno — elimina un file per caricarne altri.'
              : (en ? 'Available: ' : 'Disponibile: ') + formatBytes(usage.available)}
          </p>
        </CardContent>
      </Card>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : files.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              {en ? 'No files yet. Upload up to 25 MB.' : 'Nessun file ancora. Puoi caricare fino a 25 MB.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{en ? 'Your files' : 'I tuoi file'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                  <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{f.filename}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatBytes(f.size)}
                      {' · '}
                      {f.uploaderRole === 'admin' ? 'Studio Faraj' : (en ? 'You' : 'Tu')}
                      {' · '}
                      {new Date(f.createdAt as unknown as string).toLocaleDateString(en ? 'en-GB' : 'it-IT')}
                    </p>
                  </div>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-muted-foreground hover:text-primary" title={en ? 'Download' : 'Scarica'}>
                    <Download className="h-4 w-4" />
                  </a>
                  <button onClick={() => handleDelete(f.id!, f.size)} className="rounded p-1 text-muted-foreground hover:text-destructive" title={en ? 'Delete' : 'Elimina'}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
