import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ account: string }> }
) {
  try {
    const { account } = await params;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'https://gold-trading-bot-backend.onrender.com';
    const authHeader = req.headers.get('authorization') || '';
    
    const response = await fetch(`${backendUrl}/api/telemetry/admin/${account}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json({ error: `Erreur HTTP ${response.status} du backend` }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Telemetry admin proxy error:', error.message);
    return NextResponse.json({ error: `Erreur de connexion au serveur de télémétrie. Cause: ${error.message || 'Inconnue'}` }, { status: 500 });
  }
}
