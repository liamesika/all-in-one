import { NextRequest } from 'next/server';

export interface TenantContext {
  ownerUid: string;
  isDevFallback: boolean;
}

export interface GuardResult {
  success: boolean;
  context?: TenantContext;
  error?: {
    code: string;
    message: string;
    status: number;
  };
}

/**
 * Resolves ownerUid from request headers with dev fallback
 * Used for multi-tenant API endpoints
 */
export function resolveTenantContext(request: NextRequest): GuardResult {
  // Try to get ownerUid from x-org-id header
  const orgId = request.headers.get('x-org-id');

  if (orgId) {
    return {
      success: true,
      context: {
        ownerUid: orgId,
        isDevFallback: false,
      },
    };
  }

  // In development, allow fallback to env variable
  if (process.env.NODE_ENV === 'development') {
    const devOwnerUid = process.env.DEV_OWNER_UID || 'dev-owner-fallback';

    console.warn('[TenantGuard] Using dev fallback ownerUid:', devOwnerUid);

    return {
      success: true,
      context: {
        ownerUid: devOwnerUid,
        isDevFallback: true,
      },
    };
  }

  // Production requires proper authentication
  return {
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Missing or invalid organization context.',
      status: 401,
    },
  };
}

/**
 * Structured logging for tenant operations
 */
export function logTenantOperation(params: {
  module: string;
  action: string;
  ownerUid?: string;
  status: 'success' | 'error';
  id?: string;
  errorCode?: string;
  duration?: number;
  metadata?: Record<string, any>;
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    module: params.module,
    action: params.action,
    ownerUid_present: Boolean(params.ownerUid),
    status: params.status,
    ...(params.id && { id: params.id }),
    ...(params.errorCode && { errorCode: params.errorCode }),
    ...(params.duration && { duration: params.duration }),
    ...(params.metadata && { metadata: params.metadata }),
  };

  if (params.status === 'error') {
    console.error('[TenantOperation]', JSON.stringify(logEntry));
  } else {
    console.log('[TenantOperation]', JSON.stringify(logEntry));
  }
}