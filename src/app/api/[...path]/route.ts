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

export async function DELETE(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

async function handleProxy(req: Request, pathArray: string[]) {
  try {
    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://gold-trading-bot-backend.onrender.com';
      
    // Strip trailing slash if present
    const cleanBackendUrl = backendUrl.replace(/\/$/, '');
    const pathStr = pathArray.join('/');
    
    // Si c'est déjà une route api/..., on la respecte (les routes gérées via fichiers route.ts le feront avant d'arriver ici)
    // Mais pour ce catch-all, on redirige tout vers le backend tel quel, sauf si process.env.NEXT_PUBLIC_API_URL pointait déjà vers /api
    const targetUrl = `${cleanBackendUrl}/${pathStr}`;
    
    // Anti-loop protection in case NEXT_PUBLIC_API_URL = '/api'
    if (targetUrl.includes('/api/api/')) {
       console.error("Warning: Possible infinite loop detected in Next.js proxy. Check NEXT_PUBLIC_API_URL.");
    }

    const clientIp =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      '';

    let bodyData;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        bodyData = await req.json();
      } catch (e) {
        // Body may be empty
      }
    }

    const headers: Record<string, string> = {
      'X-Forwarded-For': clientIp,
    };
    
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    if (bodyData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: bodyData ? JSON.stringify(bodyData) : undefined,
    });

    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      return NextResponse.json(responseData, { status: response.status });
    } else {
      responseData = await response.text();
      return new NextResponse(responseData, { status: response.status });
    }
  } catch (error: any) {
    console.error('Error proxying request:', error);
    return NextResponse.json(
      { error: 'API Gateway Error', message: error.message },
      { status: 500 }
    );
  }
}
