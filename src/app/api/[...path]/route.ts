import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

export async function PUT(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

function getRealBackendUrl(): string {
  let url = process.env.BACKEND_URL;
  if (!url || url.startsWith('/api') || url.includes('vercel.app')) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '⚠️ [WARNING] process.env.BACKEND_URL is NOT set in Vercel Environment Variables! ' +
        'Using fallback URL. Please set BACKEND_URL in Vercel Settings to your exact Render service URL.'
      );
    }
    url = process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:3001'
      : 'https://goldtradingbot.onrender.com';
  }
  return url.replace(/\/$/, '');
}

async function handleProxy(req: Request, pathArray: string[]) {
  try {
    const cleanBackendUrl = getRealBackendUrl();
    const pathStr = pathArray.join('/');
    let targetUrl = `${cleanBackendUrl}/${pathStr}`;
    
    // Anti-loop protection in case NEXT_PUBLIC_API_URL = '/api'
    if (targetUrl.includes('/api/api/')) {
       console.error("Warning: Possible infinite loop detected in Next.js proxy. Check NEXT_PUBLIC_API_URL.");
    }

    const clientIp =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      '';

    let bodyBuffer;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        bodyBuffer = await req.arrayBuffer();
      } catch (e) {
        // Body may be empty
      }
    }

    const headers: Record<string, string> = {
      'X-Forwarded-For': clientIp,
    };
    
    const contentType = req.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    let response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: bodyBuffer || undefined,
    });

    // If initial attempt returns 404 and pathStr doesn't start with api/, retry with /api/ prefix
    if (response.status === 404 && !pathStr.startsWith('api/')) {
      const fallbackUrl = `${cleanBackendUrl}/api/${pathStr}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: req.method,
        headers,
        body: bodyBuffer || undefined,
      });
      if (fallbackRes.status !== 404) {
        response = fallbackRes;
      }
    }

    const contentType = response.headers.get('content-type');
    let responseData;
    let nextResponse: NextResponse;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      nextResponse = NextResponse.json(responseData, { status: response.status });
    } else {
      responseData = await response.text();
      nextResponse = new NextResponse(responseData, { status: response.status });
    }

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      nextResponse.headers.set('set-cookie', setCookie);
    }

    return nextResponse;
  } catch (error: any) {
    console.error('Error proxying request:', error);
    return NextResponse.json(
      { error: 'API Gateway Error', message: error.message },
      { status: 500 }
    );
  }
}
