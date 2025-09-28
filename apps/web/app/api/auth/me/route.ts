import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    id: 'demo-user',
    email: 'demo@production.com',
    firstName: 'Demo',
    lastName: 'User',
    emailVerified: true,
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}