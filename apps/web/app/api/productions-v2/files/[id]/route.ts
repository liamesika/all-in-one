/**
 * Productions Vertical - File Detail API (v2)
 * DELETE: Delete a file
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { getStorage } from 'firebase-admin/storage';

/**
 * DELETE /api/productions-v2/files/[id]
 * Delete a file asset
 */
export const DELETE = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params;

    // Verify file exists and belongs to org
    const existingFile = await prisma.productionFileAsset.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!existingFile) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Extract file path from URL
    const bucket = getStorage().bucket();
    const bucketName = bucket.name;
    const urlPrefix = `https://storage.googleapis.com/${bucketName}/`;

    if (existingFile.url.startsWith(urlPrefix)) {
      const filePath = existingFile.url.substring(urlPrefix.length);

      try {
        // Delete from Firebase Storage
        await bucket.file(filePath).delete();
      } catch (storageError: any) {
        console.warn('[Productions V2 API] Failed to delete file from storage:', storageError.message);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete file record from database
    await prisma.productionFileAsset.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Productions V2 API] Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file', details: error.message },
      { status: 500 }
    );
  }
});
