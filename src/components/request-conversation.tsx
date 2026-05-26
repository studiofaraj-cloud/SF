'use client';

import { useEffect, useRef, useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/config';
import { useUser, useRole } from '@/firebase/provider';
import {
  getRequestThreadAction,
  postRequestMessageAction,
  addRequestFileAction,
  deleteRequestFileAction,
} from '@/lib/request-thread-actions';
import type { RequestMessage, RequestFile } from '@/lib/firestore-data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Send,
  Paperclip,
  Download,
  Trash2,
  MessageSquare,
  FileIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function RequestConversation({
  requestId,
  locale = 'it',
}: {
  requestId: string;
  locale?: string;
}) {
  const en = locale === 'en';
  const { user } = useUser();
  const { role } = useRole();

  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [files, setFiles] = useState<RequestFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getRequestThreadAction(requestId)
      .then((t) => {
        setMessages(t.messages);
        setFiles(t.files);
      })
      .catch(() => setError(en ? 'Failed to load the conversation.' : 'Impossibile caricare la conversazione.'))
      .finally(() => setLoading(false));
  }, [requestId, en]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    const res = await postRequestMessageAction(requestId, body.trim());
    if (res.success && res.message) {
      setMessages((m) => [...m, res.message!]);
      setBody('');
    } else {
      setError(res.error ?? (en ? 'Failed to send.' : 'Invio non riuscito.'));
    }
    setSending(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError(en ? 'File exceeds the 20MB limit.' : 'Il file supera il limite di 20MB.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `requests/${requestId}/${Date.now()}-${safeName}`;
      const storageRef = ref(storage, storagePath);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      const res = await addRequestFileAction(requestId, {
        url,
        storagePath: snap.ref.fullPath,
        filename: file.name,
        size: file.size,
        contentType: file.type || undefined,
      });
      if (res.success && res.file) {
        setFiles((f) => [res.file!, ...f]);
      } else {
        setError(res.error ?? (en ? 'Upload failed.' : 'Caricamento non riuscito.'));
      }
    } catch {
      setError(en ? 'Upload failed.' : 'Caricamento non riuscito.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    const prev = files;
    setFiles((f) => f.filter((x) => x.id !== fileId));
    const res = await deleteRequestFileAction(fileId);
    if (!res.success) {
      setFiles(prev);
      setError(res.error ?? (en ? 'Could not delete file.' : 'Impossibile eliminare il file.'));
    }
  };

  const canDeleteFile = (f: RequestFile) => role === 'admin' || f.uploaderId === user?.uid;

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Conversation */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5 text-primary" />
            {en ? 'Conversation' : 'Conversazione'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {en ? 'No messages yet. Start the conversation.' : 'Ancora nessun messaggio. Inizia la conversazione.'}
              </p>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === user?.uid;
                return (
                  <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                        mine ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}
                    >
                      <div className="mb-0.5 flex items-center gap-2">
                        <span className="text-xs font-medium opacity-90">
                          {m.senderName || (m.senderRole === 'admin' ? 'Studio Faraj' : 'Client')}
                        </span>
                        {m.senderRole === 'admin' && (
                          <Badge className="h-4 bg-background/20 px-1 text-[10px] text-current border-0">
                            Studio Faraj
                          </Badge>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className="mt-1 text-[10px] opacity-70">
                        {new Date(m.createdAt as unknown as string).toLocaleString(en ? 'en-GB' : 'it-IT')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && <p className="mb-2 text-sm text-destructive">{error}</p>}

          <div className="flex items-end gap-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              placeholder={en ? 'Write a message…' : 'Scrivi un messaggio…'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
              }}
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={sending || !body.trim()} className="h-10 gap-1">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Paperclip className="h-5 w-5 text-primary" />
            {en ? 'Files' : 'File'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" />
          <Button
            variant="outline"
            className="w-full gap-2"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            {en ? 'Upload file' : 'Carica file'}
          </Button>

          {files.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              {en ? 'No files shared yet.' : 'Nessun file condiviso.'}
            </p>
          ) : (
            <ul className="space-y-2">
              {files.map((f) => (
                <li key={f.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                  <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{f.filename}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatBytes(f.size)} · {f.uploaderRole === 'admin' ? 'Studio Faraj' : f.uploaderName || 'Client'}
                    </p>
                  </div>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded p-1 text-muted-foreground hover:text-primary"
                    title={en ? 'Download' : 'Scarica'}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  {canDeleteFile(f) && (
                    <button
                      onClick={() => handleDeleteFile(f.id!)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      title={en ? 'Delete' : 'Elimina'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
