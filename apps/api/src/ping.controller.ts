import { Controller, Get } from '@nestjs/common';

@Controller('ping')
export class PingController {
  @Get()
  ping() {
    console.log('✅ PingController responding');
    return { ok: true, t: Date.now() };
  }
}
