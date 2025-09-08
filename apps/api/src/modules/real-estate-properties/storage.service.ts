// storage.service.ts
import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private baseDiskPath = path.join(process.cwd(), 'tmp', 'uploads', 'properties'); // dev/local
  private publicBaseUrl = process.env.PUBLIC_UPLOADS_BASE_URL || '/uploads/properties';

  async savePropertyFiles(propertyId: string, files: { buffer: Buffer; originalname: string; mimetype: string }[]) {
    const dir = path.join(this.baseDiskPath, propertyId);
    await fs.mkdir(dir, { recursive: true });

    const saved = [];
    for (const file of files) {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
      const filename = `${Date.now()}-${randomUUID()}${ext}`;
      const fullPath = path.join(dir, filename);
      await fs.writeFile(fullPath, file.buffer);
      const url = `${this.publicBaseUrl}/${encodeURIComponent(propertyId)}/${encodeURIComponent(filename)}`;
      saved.push({ filename, url, mime: file.mimetype });
    }
    return saved;
  }
}
