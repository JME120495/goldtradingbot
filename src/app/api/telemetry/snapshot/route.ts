import { NextResponse } from 'next/server';

function getRealBackendUrl(): string {
  let url = process.env.BACKEND_URL;
  if (!url || url.startsWith('/api') || url.includes('vercel.app')) {
    url = process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:3001'
      : 'https://gold-trading-bot-backend.onrender.com';
  }
  return url.replace(/\/$/, '');
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const backendUrl = getRealBackendUrl();
    
    const response = await fetch(`${backendUrl}/api/telemetry/snapshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json({ error: `Erreur HTTP ${response.status} du backend` }, { status: response.status });
      }
    }

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur de connexion au serveur de télémétrie.' }, { status: 500 });
  }
}
