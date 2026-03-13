import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

function validateFirebaseConfig(): { isValid: boolean; missing: string[] } {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCy-KUAHiPqdAfmjWMZ_8lj7q3A9C52XI4",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-9657887514-d2729.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-9657887514-d2729",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-9657887514-d2729.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1013722830384",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1013722830384:web:0a7eb991ae051f0e053ff5"
  };

  const missing: string[] = [];
  
  if (!config.apiKey || config.apiKey.trim() === '') {
    missing.push('NEXT_PUBLIC_FIREBASE_API_KEY or fallback apiKey');
  }
  if (!config.authDomain || config.authDomain.trim() === '') {
    missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN or fallback authDomain');
  }
  if (!config.projectId || config.projectId.trim() === '') {
    missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID or fallback projectId');
  }
  if (!config.storageBucket || config.storageBucket.trim() === '') {
    missing.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET or fallback storageBucket');
  }
  if (!config.messagingSenderId || config.messagingSenderId.trim() === '') {
    missing.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID or fallback messagingSenderId');
  }
  if (!config.appId || config.appId.trim() === '') {
    missing.push('NEXT_PUBLIC_FIREBASE_APP_ID or fallback appId');
  }
  
  return {
    isValid: missing.length === 0,
    missing,
  };
}

function getConfigErrorResponse(missing: string[]): NextResponse {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Configuration Error - Studio Faraj Admin</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #1a202c;
    }
    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
      max-width: 600px;
      width: 100%;
    }
    .icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 24px;
      background: #fee;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #c53030;
      text-align: center;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
      color: #4a5568;
      text-align: center;
    }
    .missing-vars {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .missing-vars h2 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #2d3748;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .missing-vars ul {
      list-style: none;
      padding: 0;
    }
    .missing-vars li {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      padding: 8px 12px;
      background: white;
      border: 1px solid #cbd5e0;
      border-radius: 4px;
      margin-bottom: 8px;
      color: #c53030;
    }
    .missing-vars li:last-child {
      margin-bottom: 0;
    }
    .instructions {
      background: #fffaf0;
      border-left: 4px solid #ed8936;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 24px;
    }
    .instructions h3 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #7c2d12;
    }
    .instructions ol {
      margin-left: 20px;
      color: #744210;
      font-size: 14px;
      line-height: 1.8;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #718096;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    code {
      background: #edf2f7;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #c53030;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">⚠️</div>
    <h1>Firebase Configuration Missing</h1>
    <p>The admin dashboard cannot start because required Firebase configuration values are missing or invalid.</p>
    
    <div class="missing-vars">
      <h2>Missing Configuration Values</h2>
      <ul>
        ${missing.map(varName => `<li>${varName}</li>`).join('')}
      </ul>
    </div>
    
    <div class="instructions">
      <h3>To fix this issue:</h3>
      <ol>
        <li>Ensure Firebase configuration values are set in <code>src/firebase/config.ts</code></li>
        <li>Or create a <code>.env.local</code> file in the project root with environment variables</li>
        <li>Restart the development server or rebuild the application</li>
        <li>Use the <code>/admin/system-check</code> route to verify the configuration</li>
      </ol>
    </div>
    
    <div class="footer">
      <p>Studio Faraj Admin Dashboard</p>
    </div>
  </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/system-check') {
      return NextResponse.next();
    }

    const validation = validateFirebaseConfig();
    if (!validation.isValid) {
      return getConfigErrorResponse(validation.missing);
    }
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
    '/',
  ],
};
