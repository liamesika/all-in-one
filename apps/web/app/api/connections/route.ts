import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';

// Mock connections data for development
const mockConnections = [
  {
    id: 'conn-1',
    platform: 'META' as const,
    status: 'CONNECTED' as const,
    accountName: 'Effinity Real Estate',
    lastChecked: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    lastError: null,
    accessToken: 'mock-token-meta',
    refreshToken: 'mock-refresh-meta',
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'conn-2',
    platform: 'GOOGLE' as const,
    status: 'CONNECTED' as const,
    accountName: 'Google Ads Account',
    lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastError: null,
    accessToken: 'mock-token-google',
    refreshToken: 'mock-refresh-google',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'conn-3',
    platform: 'TIKTOK' as const,
    status: 'EXPIRED' as const,
    accountName: 'TikTok Business Account',
    lastChecked: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    lastError: 'Token expired - please reconnect',
    accessToken: null,
    refreshToken: null,
    expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'conn-4',
    platform: 'LINKEDIN' as const,
    status: 'DISCONNECTED' as const,
    accountName: null,
    lastChecked: null,
    lastError: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const GET = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);

    // In a real app, this would filter by ownerUid
    const connections = mockConnections;

    return NextResponse.json({
      connections,
      total: connections.length
    });
  } catch (error) {
    console.error('Get connections API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();

    // Create new connection (simplified)
    const newConnection = {
      id: `conn-${mockConnections.length + 1}`,
      ...body,
      status: 'DISCONNECTED',
      lastChecked: null,
      lastError: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data
    mockConnections.push(newConnection);

    return NextResponse.json({
      id: newConnection.id,
      createdAt: newConnection.createdAt,
      success: true
    });
  } catch (error: any) {
    console.error('Create connection API error:', error);
    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to create connection'
    }, { status: 500 });
  }
});