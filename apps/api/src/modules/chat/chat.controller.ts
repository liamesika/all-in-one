// apps/api/src/modules/chat/chat.controller.ts
import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { rtdb, getUidFromRequest, msInDays } from '../../lib/firebaseAdmin';

@Controller('chat')
export class ChatController {
  @Post('log')
  async logMessage(@Req() req: Request, @Body() body: any) {
    const uid = await getUidFromRequest(req);
    if (!uid) throw new BadRequestException('No auth');

    const text = (body?.text ?? '').toString().trim();
    if (!text) throw new BadRequestException('text is required');

    const ttlDays = Number(process.env.CHAT_TTL_DAYS ?? 180);
    const now = Date.now();
    const expiresAt = now + msInDays(ttlDays);

    const ref = rtdb().ref(`chatMessages/${uid}`).push();

    await ref.set({
      text,
      createdAt: now,
      expiresAt,
      // אפשר להוסיף שדות כמו context/jobId וכו'
    });

    return { ok: true, id: ref.key };
  }
}
