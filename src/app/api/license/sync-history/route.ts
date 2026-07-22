import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BACKEND_URL ||
      'https://gold-trading-bot-backend.onrender.com';

    const clientIp =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      '';

    const response = await fetch(`${backendUrl}/api/license/sync-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': clientIp,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error: any) {
    console.error('Error proxying sync history request:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur de synchronisation.' },
      { status: 500 }
    );
  }
}
