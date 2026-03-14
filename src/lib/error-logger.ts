
interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  timestamp: string;
  environment: 'development' | 'production' | 'test';
  url?: string;
  userAgent?: string;
  additionalContext?: Record<string, unknown>;
}

interface ErrorLogEntry {
  message: string;
  name: string;
  stack?: string;
  digest?: string;
  context: ErrorContext;
}

// Firebase-specific context interface
interface FirebaseErrorContext {
  action: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

const SENSITIVE_KEYS = [
  'password',
  'token',
  'apiKey',
  'api_key',
  'secret',
  'authorization',
  'cookie',
  'session',
  'credentials',
  'privateKey',
  'private_key',
];

function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => 
      lowerKey.includes(sensitiveKey.toLowerCase())
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function getErrorContext(additionalContext?: Record<string, unknown>): ErrorContext {
  const environment = process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development';
  
  const context: ErrorContext = {
    timestamp: new Date().toISOString(),
    environment,
  };

  if (typeof window !== 'undefined') {
    context.url = window.location.href;
    context.userAgent = navigator.userAgent;
  }

  if (additionalContext) {
    context.additionalContext = sanitizeObject(additionalContext) as Record<string, unknown>;
  }

  return context;
}

function formatErrorForProduction(entry: ErrorLogEntry): Record<string, unknown> {
  return {
    error: {
      message: entry.message,
      name: entry.name,
      digest: entry.digest,
    },
    context: entry.context,
  };
}

function formatErrorForDevelopment(entry: ErrorLogEntry): Record<string, unknown> {
  return {
    error: {
      message: entry.message,
      name: entry.name,
      stack: entry.stack,
      digest: entry.digest,
    },
    context: entry.context,
  };
}

// Overloaded signatures for logError
export function logError(
  error: Error & { digest?: string },
  additionalContext?: Record<string, unknown>
): void;
export function logError(
  error: unknown,
  context: FirebaseErrorContext
): void;
export function logError(
  error: unknown,
  contextOrAdditional?: Record<string, unknown> | FirebaseErrorContext
): void {
  // Check if this is a Firebase-style call with action property
  if (contextOrAdditional && 'action' in contextOrAdditional) {
    const timestamp = new Date().toISOString();
    const errorDetails = extractErrorDetails(error);
    
    console.error(`[${timestamp}] Error in ${contextOrAdditional.action}:`, {
      errorCode: errorDetails.code,
      errorMessage: errorDetails.message,
      userId: contextOrAdditional.userId,
      additionalData: contextOrAdditional.additionalData,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return;
  }
  
  // Original implementation for standard Error objects
  if (!(error instanceof Error)) {
    const syntheticError = new Error(
      typeof error === 'string' ? error : JSON.stringify(error)
    );
    syntheticError.name = 'CapturedNonError';
    error = syntheticError;
  }
  
  const context = getErrorContext(contextOrAdditional as Record<string, unknown>);
  
  const errorEntry: ErrorLogEntry = {
    message: (error as Error).message || 'Unknown error',
    name: (error as Error).name || 'Error',
    stack: (error as Error).stack,
    digest: (error as Error & { digest?: string }).digest,
    context,
  };

  if (context.environment === 'development') {
    console.error('Error logged:', formatErrorForDevelopment(errorEntry));
  } else {
    const productionLog = formatErrorForProduction(errorEntry);
    console.error(JSON.stringify(productionLog));
    
    if (typeof window !== 'undefined') {
      (window as any).__lastError = {
        timestamp: context.timestamp,
        message: (error as Error).message,
        digest: (error as Error & { digest?: string }).digest,
      };
    }
  }
}

export function logErrorWithUser(
  error: Error & { digest?: string },
  user: { id?: string; email?: string; role?: string },
  additionalContext?: Record<string, unknown>
): void {
  const sanitizedUser = sanitizeObject(user) as { id?: string; email?: string; role?: string };
  
  const context = {
    ...additionalContext,
    user: sanitizedUser,
  };
  
  logError(error, context);
}

export function captureException(
  error: unknown,
  additionalContext?: Record<string, unknown>
): void {
  if (error instanceof Error) {
    logError(error, additionalContext);
  } else {
    const syntheticError = new Error(
      typeof error === 'string' ? error : JSON.stringify(error)
    );
    syntheticError.name = 'CapturedNonError';
    logError(syntheticError, additionalContext);
  }
}

// Firebase-specific error handling
export interface FirebaseErrorDetails {
  code: string;
  message: string;
  originalError: any;
}

function extractErrorDetails(error: unknown): FirebaseErrorDetails {
  if (!error) {
    return {
      code: 'unknown',
      message: 'An unknown error occurred',
      originalError: error,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    
    if (err.code) {
      return {
        code: err.code,
        message: err.message || 'Firebase error occurred',
        originalError: error,
      };
    }
    
    if (error instanceof Error) {
      return {
        code: 'error',
        message: error.message,
        originalError: error,
      };
    }
  }

  return {
    code: 'unknown',
    message: String(error),
    originalError: error,
  };
}

export function getFirebaseErrorMessage(error: unknown): string {
  const details = extractErrorDetails(error);
  
  switch (details.code) {
    case 'permission-denied':
    case 'PERMISSION_DENIED':
      return 'Non hai i permessi necessari per eseguire questa operazione.';
    
    case 'unauthenticated':
    case 'UNAUTHENTICATED':
      return 'Devi effettuare l\'accesso per eseguire questa operazione.';
    
    case 'quota-exceeded':
    case 'resource-exhausted':
    case 'RESOURCE_EXHAUSTED':
      return 'Limite di utilizzo superato. Riprova più tardi.';
    
    case 'unavailable':
    case 'UNAVAILABLE':
      return 'Il servizio non è al momento disponibile. Riprova più tardi.';
    
    case 'deadline-exceeded':
    case 'DEADLINE_EXCEEDED':
      return 'L\'operazione ha impiegato troppo tempo. Riprova.';
    
    case 'not-found':
    case 'NOT_FOUND':
      return 'La risorsa richiesta non è stata trovata.';
    
    case 'already-exists':
    case 'ALREADY_EXISTS':
      return 'Esiste già una risorsa con questi dati.';
    
    case 'invalid-argument':
    case 'INVALID_ARGUMENT':
      return 'I dati forniti non sono validi.';
    
    case 'failed-precondition':
    case 'FAILED_PRECONDITION':
      return 'L\'operazione non può essere eseguita nello stato attuale.';
    
    case 'aborted':
    case 'ABORTED':
      return 'L\'operazione è stata interrotta. Riprova.';
    
    case 'out-of-range':
    case 'OUT_OF_RANGE':
      return 'I valori forniti non sono nell\'intervallo valido.';
    
    case 'unimplemented':
    case 'UNIMPLEMENTED':
      return 'Questa operazione non è supportata.';
    
    case 'internal':
    case 'INTERNAL':
      return 'Si è verificato un errore interno. Riprova più tardi.';
    
    case 'data-loss':
    case 'DATA_LOSS':
      return 'Si è verificata una perdita di dati irrecuperabile.';
    
    default:
      if (details.message.toLowerCase().includes('network')) {
        return 'Errore di connessione. Verifica la tua connessione internet e riprova.';
      }
      
      if (details.message.toLowerCase().includes('timeout')) {
        return 'L\'operazione ha impiegato troppo tempo. Riprova.';
      }
      
      return 'Si è verificato un errore imprevisto. Riprova più tardi.';
  }
}

export function isNetworkError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    const code = err.code?.toLowerCase() || '';
    const message = err.message?.toLowerCase() || '';
    
    return (
      code.includes('unavailable') ||
      code.includes('network') ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection')
    );
  }
  
  return false;
}
