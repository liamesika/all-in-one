/**
 * Productions Vertical - File Upload API (v2)
 * POST: Upload a file to a project
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { FileFolder } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { getStorage } from 'firebase-admin/storage';
import { z } from 'zod';

const uploadFileSchema = z.object({
  projectId: z.string().cuid('Invalid project ID'),
  folder: z.nativeEnum(FileFolder).default('OTHER'),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
});

/**
 * POST /api/productions-v2/files/upload
 * Generate signed upload URL and create file asset record
 */
export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();
    const validated = uploadFileSchema.parse(body);

    // Verify project exists and belongs to org
    const project = await prisma.productionProject.findFirst({
      where: { id: validated.projectId, organizationId: orgId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Generate unique file path
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const sanitizedFileName = validated.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `productions/${orgId}/${validated.projectId}/${timestamp}-${randomStr}-${sanitizedFileName}`;

    // Get Firebase Storage bucket
    const bucket = getStorage().bucket();

    // Generate signed upload URL (valid for 30 minutes)
    const file = bucket.file(filePath);
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 30 * 60 * 1000, // 30 minutes
      contentType: validated.fileType,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // Create file asset record in database
    const fileAsset = await prisma.productionFileAsset.create({
      data: {
        name: validated.fileName,
        folder: validated.folder,
        url: publicUrl,
        mimeType: validated.fileType,
        projectId: validated.projectId,
        organizationId: orgId,
        ownerUid: user.uid,
        createdBy: user.uid,
      },
    });

    return NextResponse.json({
      uploadUrl: signedUrl,
      filePath,
      publicUrl,
      fileAsset,
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions V2 API] Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL', details: error.message },
      { status: 500 }
    );
  }
});
