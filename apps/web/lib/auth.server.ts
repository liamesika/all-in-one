import 'server-only';
import { NextRequest } from 'next/server';
import { verifyAuthToken } from './apiAuth';

export async function getCurrentUser(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    return decodedToken;
  } catch (error) {
    return null;
  }
}
