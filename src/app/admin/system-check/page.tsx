'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, Database, HardDrive, Shield } from 'lucide-react';
import { initializeFirebase } from '@/firebase';
import { firebaseConfig } from '@/firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getStorage } from 'firebase/storage';

type CheckStatus = 'pending' | 'running' | 'success' | 'error';

interface CheckResult {
  name: string;
  status: CheckStatus;
  message: string;
  details?: string;
}

const initialChecks: CheckResult[] = [
  { name: 'Firebase Configuration', status: 'pending', message: 'Not started' },
  { name: 'Firebase Initialization', status: 'pending', message: 'Not started' },
  { name: 'Firestore Connection', status: 'pending', message: 'Not started' },
  { name: 'Firestore Write Access', status: 'pending', message: 'Not started' },
  { name: 'Firestore Read Access', status: 'pending', message: 'Not started' },
  { name: 'Storage Connection', status: 'pending', message: 'Not started' },
  { name: 'Storage Upload Access', status: 'pending', message: 'Not started' },
  { name: 'Storage Download Access', status: 'pending', message: 'Not started' },
];

export default function SystemCheckPage() {
  const [checks, setChecks] = useState<CheckResult[]>(initialChecks);
  const [isRunning, setIsRunning] = useState(false);

  const updateCheck = (index: number, updates: Partial<CheckResult>) => {
    setChecks(prev => prev.map((check, i) => i === index ? { ...check, ...updates } : check));
  };

  const runSystemCheck = async () => {
    setIsRunning(true);
    setChecks(initialChecks.map(c => ({ ...c, status: 'pending' })));

    let firebaseServices: any = null;
    let testDocId: string | null = null;
    let testFileRef: any = null;

    try {
      updateCheck(0, { status: 'running', message: 'Validating Firebase configuration...' });
      
      const configChecks = [
        { key: 'apiKey', value: firebaseConfig.apiKey },
        { key: 'authDomain', value: firebaseConfig.authDomain },
        { key: 'projectId', value: firebaseConfig.projectId },
        { key: 'storageBucket', value: firebaseConfig.storageBucket },
        { key: 'messagingSenderId', value: firebaseConfig.messagingSenderId },
        { key: 'appId', value: firebaseConfig.appId },
      ];

      const missingKeys = configChecks.filter(check => !check.value || check.value.trim() === '');

      if (missingKeys.length > 0) {
        updateCheck(0, {
          status: 'error',
          message: `Missing ${missingKeys.length} configuration value(s)`,
          details: `Missing: ${missingKeys.map(k => k.key).join(', ')}`,
        });
      } else {
        updateCheck(0, {
          status: 'success',
          message: 'All Firebase configuration values are present',
          details: `Project ID: ${firebaseConfig.projectId}`,
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      updateCheck(1, { status: 'running', message: 'Initializing Firebase...' });
      try {
        firebaseServices = initializeFirebase();
        
        if (!firebaseServices.firebaseApp || !firebaseServices.auth || !firebaseServices.firestore) {
          throw new Error('Firebase services not properly initialized');
        }

        const projectId = firebaseServices.firebaseApp.options.projectId;
        updateCheck(1, {
          status: 'success',
          message: 'Firebase initialized successfully',
          details: `Project: ${projectId}`,
        });
      } catch (error: any) {
        updateCheck(1, {
          status: 'error',
          message: 'Failed to initialize Firebase',
          details: error.message,
        });
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      updateCheck(2, { status: 'running', message: 'Testing Firestore connection...' });
      try {
        const testCollection = collection(firebaseServices.firestore, 'system-check-test');
        updateCheck(2, {
          status: 'success',
          message: 'Firestore connection established',
        });
      } catch (error: any) {
        updateCheck(2, {
          status: 'error',
          message: 'Failed to connect to Firestore',
          details: error.message,
        });
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      updateCheck(3, { status: 'running', message: 'Testing Firestore write access...' });
      try {
        const testCollection = collection(firebaseServices.firestore, 'system-check-test');
        const docRef = await addDoc(testCollection, {
          timestamp: Timestamp.now(),
          test: true,
          message: 'System check test document',
        });
        testDocId = docRef.id;
        updateCheck(3, {
          status: 'success',
          message: 'Successfully wrote to Firestore',
          details: `Test document ID: ${testDocId}`,
        });
      } catch (error: any) {
        updateCheck(3, {
          status: 'error',
          message: 'Failed to write to Firestore',
          details: error.message,
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      updateCheck(4, { status: 'running', message: 'Testing Firestore read access...' });
      try {
        const testCollection = collection(firebaseServices.firestore, 'system-check-test');
        const querySnapshot = await getDocs(testCollection);
        updateCheck(4, {
          status: 'success',
          message: 'Successfully read from Firestore',
          details: `Found ${querySnapshot.size} document(s)`,
        });

        if (testDocId) {
          const docRef = doc(firebaseServices.firestore, 'system-check-test', testDocId);
          await deleteDoc(docRef);
        }
      } catch (error: any) {
        updateCheck(4, {
          status: 'error',
          message: 'Failed to read from Firestore',
          details: error.message,
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      updateCheck(5, { status: 'running', message: 'Testing Storage connection...' });
      try {
        const storage = getStorage(firebaseServices.firebaseApp);
        updateCheck(5, {
          status: 'success',
          message: 'Storage connection established',
          details: `Bucket: ${storage.app.options.storageBucket}`,
        });
      } catch (error: any) {
        updateCheck(5, {
          status: 'error',
          message: 'Failed to connect to Storage',
          details: error.message,
        });
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      updateCheck(6, { status: 'running', message: 'Testing Storage upload access...' });
      try {
        const storage = getStorage(firebaseServices.firebaseApp);
        const testFileName = `system-check-test-${Date.now()}.txt`;
        testFileRef = ref(storage, `system-checks/${testFileName}`);
        const testContent = new Blob(['System check test file'], { type: 'text/plain' });
        await uploadBytes(testFileRef, testContent);
        updateCheck(6, {
          status: 'success',
          message: 'Successfully uploaded to Storage',
          details: `Test file: ${testFileName}`,
        });
      } catch (error: any) {
        updateCheck(6, {
          status: 'error',
          message: 'Failed to upload to Storage',
          details: error.message,
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      updateCheck(7, { status: 'running', message: 'Testing Storage download access...' });
      try {
        if (testFileRef) {
          const downloadURL = await getDownloadURL(testFileRef);
          updateCheck(7, {
            status: 'success',
            message: 'Successfully retrieved download URL from Storage',
          });

          await deleteObject(testFileRef);
        } else {
          throw new Error('No test file to download');
        }
      } catch (error: any) {
        updateCheck(7, {
          status: 'error',
          message: 'Failed to download from Storage',
          details: error.message,
        });
      }

    } catch (error: any) {
      console.error('System check failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runSystemCheck();
  }, []);

  const allPassed = checks.every(check => check.status === 'success');
  const anyFailed = checks.some(check => check.status === 'error');

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: CheckStatus) => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      case 'running':
        return 'border-blue-500/30 bg-blue-500/5';
      default:
        return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const getCategoryIcon = (name: string) => {
    if (name.includes('Firestore')) return <Database className="h-4 w-4" />;
    if (name.includes('Storage')) return <HardDrive className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/6 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="rounded-2xl border border-primary/30 bg-card/80 p-8 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">System Check</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Firebase configuration and connectivity validation
              </p>
            </div>
            <Button
              onClick={runSystemCheck}
              disabled={isRunning}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Re-run
                </>
              )}
            </Button>
          </div>

          {allPassed && !isRunning && (
            <Alert className="mb-6 border-green-500/30 bg-green-500/5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                All system checks passed successfully! Your Firebase configuration is working correctly.
              </AlertDescription>
            </Alert>
          )}

          {anyFailed && !isRunning && (
            <Alert variant="destructive" className="mb-6">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Some system checks failed. Please review the details below and ensure your Firebase
                configuration and security rules are correct.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {checks.map((check, index) => (
              <div
                key={check.name}
                className={`rounded-lg border p-4 transition-all duration-300 ${getStatusColor(check.status)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getStatusIcon(check.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-muted-foreground">{getCategoryIcon(check.name)}</div>
                      <h3 className="font-semibold">{check.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                    {check.details && (
                      <p className="mt-2 text-xs font-mono text-muted-foreground/80 bg-background/50 rounded p-2 border border-border/50">
                        {check.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Studio Faraj Admin System Check
              </div>
              <a
                href="/admin"
                className="text-primary hover:underline"
              >
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
