import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    id: 'demo-user',
    email: 'demo@production.com',
    firstName: 'Demo',
    lastName: 'User',
    emailVerified: true,
    mustChangePassword: false,
    defaultVertical: 'E_COMMERCE', // Set default vertical for demo
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}