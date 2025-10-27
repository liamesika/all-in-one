import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { uploadToS3 } from '@/lib/s3.server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const images = formData.getAll('images') as File[];

    if (images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // Upload to S3
    const uploadedUrls = await Promise.all(
      images.map(async (image, index) => {
        const buffer = Buffer.from(await image.arrayBuffer());
        const timestamp = Date.now();
        const key = `ecommerce/${currentUser.uid}/csv/${timestamp}-${index}-${image.name}`;

        try {
          const url = await uploadToS3(buffer, key, image.type);
          return url;
        } catch (s3Error) {
          console.warn('[S3] Upload failed, using data URL fallback:', s3Error);
          // Fallback to data URL if S3 not configured
          const base64 = buffer.toString('base64');
          return `data:${image.type};base64,${base64}`;
        }
      })
    );

    console.log('[CSV Upload] Uploaded', uploadedUrls.length, 'images');

    return NextResponse.json({
      uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error) {
    console.error('[POST /api/ecommerce/csv/upload] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}
