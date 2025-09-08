import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('parse')
  async parse(@Body() body: { text: string }) {
    return this.ai.parseDefaults(body?.text ?? '');
  }

  @Post('generate-products')
  async generate(@Body() body: { items: { filename: string }[] }) {
    const items = await this.ai.generatePerItem(body?.items ?? []);
    return { items };
  }
}
