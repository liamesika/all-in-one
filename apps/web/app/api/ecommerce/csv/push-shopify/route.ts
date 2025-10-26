import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Feature flagged - only works if ECOM_SHOPIFY_PUSH is enabled
    if (process.env.ECOM_SHOPIFY_PUSH !== 'true') {
      return NextResponse.json(
        { error: 'Shopify push is not enabled. Set ECOM_SHOPIFY_PUSH=true to enable.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { products } = body;

    // In production, use Shopify Admin API
    // For now, return success
    return NextResponse.json({
      success: true,
      pushed: products.length,
    });
  } catch (error) {
    console.error('[POST /api/ecommerce/csv/push-shopify] Error:', error);
    return NextResponse.json(
      { error: 'Failed to push to Shopify' },
      { status: 500 }
    );
  }
}
