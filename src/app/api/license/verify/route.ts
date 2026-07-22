import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const data = {
      account: searchParams.get('account'),
      ea: searchParams.get('ea'),
      broker: searchParams.get('broker'),
      server: searchParams.get('server')
    };
    
    // If account is present, try to proxy it as a POST to backend
    if (data.account) {
      return proxyToBackend(req, data);
    }
    
    return NextResponse.json({ valid: false, message: 'GET request received but no account parameter' });
  } catch (e: any) {
    return NextResponse.json({ valid: false, message: e.message }, { status: 500 });
  }
}

async function proxyToBackend(req: Request, data: any) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BACKEND_URL ||
      'https://gold-trading-bot-backend.onrender.com';

    const clientIp =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      '';

    const response = await fetch(`${backendUrl}/api/license/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': clientIp,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`Backend returned HTTP ${response.status} ${response.statusText}`);
      try {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { valid: false, message: `Erreur HTTP ${response.status} du backend` },
          { status: response.status }
        );
      }
    }

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error: any) {
    console.error('Error proxying license verify request:', error);
    return NextResponse.json(
      { valid: false, message: `Erreur de connexion au serveur de licence. Cause: ${error.message || 'Inconnue'}` },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    let data;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      data = Object.fromEntries(formData);
    } else {
      const text = await req.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch(e) {
        data = {};
      }
    }

    return proxyToBackend(req, data);
  } catch (error: any) {
    console.error('Error in POST parser:', error);
    return NextResponse.json(
      { valid: false, message: `Erreur interne: ${error.message}` },
      { status: 500 }
    );
  }
}
