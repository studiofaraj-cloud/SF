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

export function logError(
  error: Error & { digest?: string },
  additionalContext?: Record<string, unknown>
): void {
  const context = getErrorContext(additionalContext);
  
  const errorEntry: ErrorLogEntry = {
    message: error.message || 'Unknown error',
    name: error.name || 'Error',
    stack: error.stack,
    digest: error.digest,
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
        message: error.message,
        digest: error.digest,
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
