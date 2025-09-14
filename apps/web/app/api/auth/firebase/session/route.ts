import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Proxy to the NestJS API server
    const response = await fetch('http://localhost:4001/api/auth/firebase/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // Get the session cookie from the API response headers
    const setCookieHeader = response.headers.get('set-cookie');
    const apiResponse = NextResponse.json(result);
    
    // Forward the session cookie to the client
    if (setCookieHeader) {
      apiResponse.headers.set('set-cookie', setCookieHeader);
    }
    
    return apiResponse;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}