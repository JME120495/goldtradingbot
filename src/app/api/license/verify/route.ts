import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

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
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error proxying license verify request:', error);
    return NextResponse.json(
      { valid: false, message: 'Erreur de connexion au serveur de licence.' },
      { status: 500 }
    );
  }
}
