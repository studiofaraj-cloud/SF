
import "server-only";

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const REQUIRED_CONFIG_FIELDS = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
] as const;

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const RETRY_BACKOFF_MULTIPLIER = 2;

interface FirebaseConfigValidation {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
}

interface InitializationResult {
  firebaseApp: FirebaseApp;
  auth: ReturnType<typeof getAuth>;
  firestore: ReturnType<typeof getFirestore>;
  storage: ReturnType<typeof getStorage>;
}

function logError(message: string, error?: unknown, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const env = process.env.NODE_ENV || 'unknown';
  
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error(`[Firebase Server Init Error] ${timestamp}`);
  console.error(`Environment: ${env}`);
  console.error(`Message: ${message}`);
  
  if (context) {
    console.error('Context:', JSON.stringify(context, null, 2));
  }
  
  if (error) {
    if (error instanceof Error) {
      console.error(`Error Name: ${error.name}`);
      console.error(`Error Message: ${error.message}`);
      if (error.stack) {
        console.error('Stack Trace:');
        console.error(error.stack);
      }
      if ('code' in error) {
        console.error(`Error Code: ${(error as any).code}`);
      }
    } else {
      console.error('Error Details:', JSON.stringify(error, null, 2));
    }
  }
  
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

function logInfo(message: string, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const env = process.env.NODE_ENV || 'unknown';
  
  console.log('─────────────────────────────────────────────────────');
  console.log(`[Firebase Server Init] ${timestamp}`);
  console.log(`Environment: ${env}`);
  console.log(`Message: ${message}`);
  
  if (context) {
    console.log('Context:', JSON.stringify(context, null, 2));
  }
  
  console.log('─────────────────────────────────────────────────────');
}

function logWarning(message: string, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const env = process.env.NODE_ENV || 'unknown';
  
  console.warn('⚠️ ───────────────────────────────────────────────────');
  console.warn(`[Firebase Server Init Warning] ${timestamp}`);
  console.warn(`Environment: ${env}`);
  console.warn(`Message: ${message}`);
  
  if (context) {
    console.warn('Context:', JSON.stringify(context, null, 2));
  }
  
  console.warn('⚠️ ───────────────────────────────────────────────────');
}

function validateFirebaseConfig(config: Record<string, unknown>): FirebaseConfigValidation {
  const missingFields: string[] = [];
  const errors: string[] = [];
  
  if (!config || typeof config !== 'object') {
    errors.push('Configuration is not a valid object');
    return { isValid: false, missingFields, errors };
  }
  
  for (const field of REQUIRED_CONFIG_FIELDS) {
    const value = config[field];
    
    if (value === undefined || value === null) {
      missingFields.push(field);
    } else if (typeof value !== 'string') {
      errors.push(`Field '${field}' must be a string, got ${typeof value}`);
    } else if (value.trim() === '') {
      errors.push(`Field '${field}' cannot be an empty string`);
    } else {
      switch (field) {
        case 'apiKey':
          if (value.length < 20) {
            errors.push(`Field 'apiKey' seems too short (${value.length} chars)`);
          }
          break;
        case 'projectId':
          if (!/^[a-z0-9-]+$/.test(value)) {
            errors.push(`Field 'projectId' contains invalid characters`);
          }
          break;
        case 'authDomain':
          if (!value.includes('.')) {
            errors.push(`Field 'authDomain' doesn't appear to be a valid domain`);
          }
          break;
        case 'appId':
          if (!value.includes(':')) {
            errors.push(`Field 'appId' doesn't appear to be a valid Firebase app ID`);
          }
          break;
      }
    }
  }
  
  const isValid = missingFields.length === 0 && errors.length === 0;
  
  return { isValid, missingFields, errors };
}

function parseFirebaseConfigEnvVar(): Record<string, unknown> | null {
  const envVar = process.env.FIREBASE_CONFIG;
  
  if (!envVar) {
    return null;
  }
  
  if (envVar.trim() === '') {
    logWarning('FIREBASE_CONFIG env var is empty string');
    return null;
  }
  
  try {
    const parsed = JSON.parse(envVar);
    
    if (typeof parsed !== 'object' || parsed === null) {
      logError('FIREBASE_CONFIG env var is not a valid JSON object', undefined, {
        parsedType: typeof parsed,
        envVarLength: envVar.length
      });
      return null;
    }
    
    if (Array.isArray(parsed)) {
      logError('FIREBASE_CONFIG env var is an array, expected object', undefined, {
        arrayLength: parsed.length
      });
      return null;
    }
    
    return parsed as Record<string, unknown>;
  } catch (error) {
    logError('Failed to parse FIREBASE_CONFIG env var as JSON', error, {
      envVarPreview: envVar.substring(0, 100) + (envVar.length > 100 ? '...' : ''),
      envVarLength: envVar.length
    });
    return null;
  }
}

function validateEnvironmentConfig(): void {
  const env = process.env.NODE_ENV;
  const hasFirebaseConfigEnv = !!process.env.FIREBASE_CONFIG;
  
  logInfo('Validating Firebase configuration on startup', {
    nodeEnv: env,
    hasFirebaseConfigEnv,
    isProduction: env === 'production',
    isDevelopment: env === 'development'
  });
  
  if (env === 'production') {
    if (!hasFirebaseConfigEnv) {
      logWarning('Production environment does not have FIREBASE_CONFIG env var set. Using hardcoded configuration which may not be secure.');
    }
    
    if (hasFirebaseConfigEnv) {
      const parsedConfig = parseFirebaseConfigEnvVar();
      
      if (!parsedConfig) {
        logError('Production environment has FIREBASE_CONFIG env var but it is invalid or unparseable', undefined, {
          recommendation: 'Ensure FIREBASE_CONFIG is valid JSON string with all required fields'
        });
        return;
      }
      
      const validation = validateFirebaseConfig(parsedConfig);
      
      if (!validation.isValid) {
        logError('Production FIREBASE_CONFIG env var has validation errors', undefined, {
          missingFields: validation.missingFields,
          errors: validation.errors,
          recommendation: 'Fix configuration errors before deploying to production'
        });
      } else {
        logInfo('Production FIREBASE_CONFIG env var validated successfully', {
          projectId: parsedConfig.projectId,
          authDomain: parsedConfig.authDomain
        });
      }
    }
  }
  
  const hardcodedValidation = validateFirebaseConfig(firebaseConfig as Record<string, unknown>);
  
  if (!hardcodedValidation.isValid) {
    logError('Hardcoded firebaseConfig has validation errors', undefined, {
      missingFields: hardcodedValidation.missingFields,
      errors: hardcodedValidation.errors,
      location: 'src/firebase/config.ts',
      recommendation: 'Fix hardcoded configuration in src/firebase/config.ts'
    });
  } else {
    logInfo('Hardcoded firebaseConfig validated successfully', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  
  const transientErrorPatterns = [
    /network/i,
    /timeout/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /ENOTFOUND/i,
    /EAI_AGAIN/i,
    /ECONNRESET/i,
    /fetch failed/i,
    /temporarily unavailable/i,
    /service unavailable/i,
    /too many requests/i,
    /rate limit/i,
    /503/i,
    /502/i,
    /504/i
  ];
  
  const errorString = `${error.name} ${error.message} ${(error as any).code || ''}`;
  
  return transientErrorPatterns.some(pattern => pattern.test(errorString));
}

function isPermanentError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  
  const permanentErrorPatterns = [
    /invalid api key/i,
    /authentication/i,
    /unauthorized/i,
    /forbidden/i,
    /not found.*project/i,
    /invalid.*configuration/i,
    /missing.*required/i,
    /401/i,
    /403/i,
    /404.*project/i
  ];
  
  const errorString = `${error.name} ${error.message} ${(error as any).code || ''}`;
  
  return permanentErrorPatterns.some(pattern => pattern.test(errorString));
}

async function initializeAppWithRetry(
  config?: Record<string, unknown>,
  attempt: number = 1
): Promise<FirebaseApp> {
  try {
    logInfo(`Attempting Firebase app initialization`, {
      attempt,
      maxAttempts: MAX_RETRY_ATTEMPTS,
      usedExplicitConfig: !!config
    });
    
    const app = config ? initializeApp(config) : initializeApp();
    
    if (!app.options.projectId) {
      throw new Error('Initialized app has no projectId in options');
    }
    
    logInfo(`Successfully initialized Firebase app`, {
      attempt,
      projectId: app.options.projectId,
      authDomain: app.options.authDomain,
      usedExplicitConfig: !!config
    });
    
    return app;
  } catch (error) {
    const isTransient = isTransientError(error);
    const isPermanent = isPermanentError(error);
    const shouldRetry = isTransient && attempt < MAX_RETRY_ATTEMPTS;
    
    logError(
      `Firebase app initialization failed (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})`,
      error,
      {
        isTransientError: isTransient,
        isPermanentError: isPermanent,
        willRetry: shouldRetry,
        usedExplicitConfig: !!config,
        nextAttemptNumber: shouldRetry ? attempt + 1 : null
      }
    );
    
    if (isPermanent) {
      logError('Detected permanent error, will not retry', undefined, {
        recommendation: 'Check Firebase configuration and credentials'
      });
      throw error;
    }
    
    if (shouldRetry) {
      const delay = RETRY_DELAY_MS * Math.pow(RETRY_BACKOFF_MULTIPLIER, attempt - 1);
      logInfo(`Retrying initialization in ${delay}ms...`, {
        attempt: attempt + 1,
        delayMs: delay
      });
      await sleep(delay);
      return initializeAppWithRetry(config, attempt + 1);
    }
    
    throw error;
  }
}

export async function initializeServerSideFirebase(): Promise<InitializationResult> {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    const validApp = existingApps.find(app => app.options.projectId) ?? existingApps[0];
    logInfo('Using existing Firebase app', {
      projectId: validApp.options.projectId,
      totalApps: existingApps.length
    });
    return getSdks(validApp);
  }
  
  validateEnvironmentConfig();
  
  let firebaseApp: FirebaseApp;
  
  if (process.env.FIREBASE_CONFIG) {
    const parsedConfig = parseFirebaseConfigEnvVar();
    
    if (parsedConfig) {
      const validation = validateFirebaseConfig(parsedConfig);
      
      if (validation.isValid) {
        try {
          firebaseApp = await initializeAppWithRetry();
          
          if (!firebaseApp.options.projectId) {
            throw new Error('Auto-init produced Firebase app without projectId');
          }
          
          logInfo('Successfully initialized using FIREBASE_CONFIG env var (auto-init)', {
            projectId: firebaseApp.options.projectId
          });
        } catch (error) {
          logError('Auto-init failed despite valid FIREBASE_CONFIG env var, falling back to explicit config', error);
          
          const apps = getApps();
          if (apps.length > 0) {
            firebaseApp = apps.find(app => app.options.projectId) ?? apps[0];
            logWarning('Using partially initialized app from failed auto-init', {
              projectId: firebaseApp.options.projectId
            });
          } else {
            const hardcodedValidation = validateFirebaseConfig(firebaseConfig as Record<string, unknown>);
            
            if (!hardcodedValidation.isValid) {
              const errorMsg = 'Cannot initialize Firebase: both env var auto-init and hardcoded config are invalid';
              logError(errorMsg, undefined, {
                hardcodedConfigErrors: hardcodedValidation.errors,
                hardcodedConfigMissingFields: hardcodedValidation.missingFields
              });
              throw new Error(errorMsg);
            }
            
            logWarning('Falling back to hardcoded config after auto-init failure');
            firebaseApp = await initializeAppWithRetry(firebaseConfig);
          }
        }
      } else {
        logError('FIREBASE_CONFIG env var failed validation, using hardcoded config', undefined, {
          missingFields: validation.missingFields,
          errors: validation.errors
        });
        
        const hardcodedValidation = validateFirebaseConfig(firebaseConfig as Record<string, unknown>);
        
        if (!hardcodedValidation.isValid) {
          const errorMsg = 'Cannot initialize Firebase: both FIREBASE_CONFIG env var and hardcoded config are invalid';
          logError(errorMsg, undefined, {
            envVarErrors: validation.errors,
            envVarMissingFields: validation.missingFields,
            hardcodedConfigErrors: hardcodedValidation.errors,
            hardcodedConfigMissingFields: hardcodedValidation.missingFields
          });
          throw new Error(errorMsg);
        }
        
        firebaseApp = await initializeAppWithRetry(firebaseConfig);
      }
    } else {
      logError('FIREBASE_CONFIG env var exists but could not be parsed, using hardcoded config');
      
      const hardcodedValidation = validateFirebaseConfig(firebaseConfig as Record<string, unknown>);
      
      if (!hardcodedValidation.isValid) {
        const errorMsg = 'Cannot initialize Firebase: FIREBASE_CONFIG env var is unparseable and hardcoded config is invalid';
        logError(errorMsg, undefined, {
          hardcodedConfigErrors: hardcodedValidation.errors,
          hardcodedConfigMissingFields: hardcodedValidation.missingFields
        });
        throw new Error(errorMsg);
      }
      
      firebaseApp = await initializeAppWithRetry(firebaseConfig);
    }
  } else {
    const hardcodedValidation = validateFirebaseConfig(firebaseConfig as Record<string, unknown>);
    
    if (!hardcodedValidation.isValid) {
      const errorMsg = 'Cannot initialize Firebase: No FIREBASE_CONFIG env var and hardcoded config is invalid';
      logError(errorMsg, undefined, {
        missingFields: hardcodedValidation.missingFields,
        errors: hardcodedValidation.errors,
        recommendation: 'Either set FIREBASE_CONFIG env var or fix hardcoded config in src/firebase/config.ts'
      });
      throw new Error(errorMsg);
    }
    
    logInfo('Initializing with hardcoded config (no FIREBASE_CONFIG env var)');
    firebaseApp = await initializeAppWithRetry(firebaseConfig);
  }
  
  return getSdks(firebaseApp);
}

export function initializeServerSideFirebaseSync(): InitializationResult {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    const validApp = existingApps.find(app => app.options.projectId) ?? existingApps[0];
    logInfo('Using existing Firebase app (sync)', {
      projectId: validApp.options.projectId,
      totalApps: existingApps.length
    });
    return getSdks(validApp);
  }
  
  validateEnvironmentConfig();
  
  let firebaseApp: FirebaseApp;
  
  if (process.env.FIREBASE_CONFIG) {
    const parsedConfig = parseFirebaseConfigEnvVar();
    
    if (parsedConfig) {
      const validation = validateFirebaseConfig(parsedConfig);
      
      if (validation.isValid) {
        try {
          logInfo('Attempting synchronous Firebase app initialization with auto-init');
          firebaseApp = initializeApp();
          
          if (!firebaseApp.options.projectId) {
            throw new Error('Auto-init produced Firebase app without projectId');
          }
          
          logInfo('Successfully initialized using FIREBASE_CONFIG env var (auto-init, sync)', {
            projectId: firebaseApp.options.projectId
          });
        } catch (error) {
          logError('Auto-init failed despite valid FIREBASE_CONFIG env var, falling back to explicit config (sync)', error);
          
          const apps = getApps();
          if (apps.length > 0) {
            firebaseApp = apps.find(app => app.options.projectId) ?? apps[0];
            logWarning('Using partially initialized app from failed auto-init (sync)', {
              projectId: firebaseApp.options.projectId
            });
          } else {
            const hardcodedValidation = validateFirebaseConfig(firebaseConfig as Record<string, unknown>);
            
            if (!hardcodedValidation.isValid) {
              const errorMsg = 'Cannot initialize Firebase: both env var auto-init and hardcoded config are invalid (sync)';
              logError(errorMsg, undefined, {
                hardcodedConfigErrors: hardcodedValidation.errors,
                hardcodedConfigMissingFields: hardcodedValidation.missingFields
              });
              throw new Error(errorMsg);
            }
            
            logWarning('Falling back to hardcoded config after auto-init failure (sync)');
            firebaseApp = initializeApp(firebaseConfig);
          }
        }
      } else {
        logError('FIREBASE_CONFIG env var failed validation, using hardcoded config (sync)', undefined, {
          missingFields: validation.missingFields,
          errors: validation.errors
        });
        
        const hardcodedValidation = validateFirebaseConfig(firebaseConfig as Record<string, unknown>);
        
        if (!hardcodedValidation.isValid) {
          const errorMsg = 'Cannot initialize Firebase: both FIREBASE_CONFIG env var and hardcoded config are invalid (sync)';
          logError(errorMsg, undefined, {
            envVarErrors: validation.errors,
            envVarMissingFields: validation.missingFields,
            hardcodedConfigErrors: hardcodedValidation.errors,
            hardcodedConfigMissingFields: hardcodedValidation.missingFields
          });
          throw new Error(errorMsg);
        }
        
        firebaseApp = initializeApp(firebaseConfig);
      }
    } else {
      logError('FIREBASE_CONFIG env var exists but could not be parsed, using hardcoded config (sync)');
      
      const hardcodedValidation = validateFirebaseConfig(firebaseConfig as Record<string, unknown>);
      
      if (!hardcodedValidation.isValid) {
        const errorMsg = 'Cannot initialize Firebase: FIREBASE_CONFIG env var is unparseable and hardcoded config is invalid (sync)';
        logError(errorMsg, undefined, {
          hardcodedConfigErrors: hardcodedValidation.errors,
          hardcodedConfigMissingFields: hardcodedValidation.missingFields
        });
        throw new Error(errorMsg);
      }
      
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    const hardcodedValidation = validateFirebaseConfig(firebaseConfig as Record<string, unknown>);
    
    if (!hardcodedValidation.isValid) {
      const errorMsg = 'Cannot initialize Firebase: No FIREBASE_CONFIG env var and hardcoded config is invalid (sync)';
      logError(errorMsg, undefined, {
        missingFields: hardcodedValidation.missingFields,
        errors: hardcodedValidation.errors,
        recommendation: 'Either set FIREBASE_CONFIG env var or fix hardcoded config in src/firebase/config.ts'
      });
      throw new Error(errorMsg);
    }
    
    logInfo('Initializing with hardcoded config (no FIREBASE_CONFIG env var, sync)');
    firebaseApp = initializeApp(firebaseConfig);
  }
  
  return getSdks(firebaseApp);
}

function getSdks(firebaseApp: FirebaseApp): InitializationResult {
  try {
    const result = {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp),
      storage: getStorage(firebaseApp)
    };
    
    logInfo('Firebase SDKs initialized successfully', {
      projectId: firebaseApp.options.projectId,
      hasAuth: !!result.auth,
      hasFirestore: !!result.firestore,
      hasStorage: !!result.storage
    });
    
    return result;
  } catch (error) {
    logError('Failed to initialize one or more Firebase SDKs', error, {
      projectId: firebaseApp.options.projectId
    });
    throw error;
  }
}
