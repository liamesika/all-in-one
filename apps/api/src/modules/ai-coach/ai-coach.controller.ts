import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { AiCoachService, BotResponse } from '../../lib/ai-coach.service';
import { BotDataService } from '../../lib/bot-data.service';
import { BotToolsService } from '../../lib/bot-tools.service';
import { OrgGuard } from '../../auth/org.guard';

interface ChatMessageRequest {
  message: string;
  sessionId?: string;
  language?: 'he' | 'en';
}

interface WelcomeMessageRequest {
  language?: 'he' | 'en';
}

interface ToolExecutionRequest {
  toolName: string;
  parameters: Record<string, any>;
}

@Controller('api/ai-coach')
@UseGuards(OrgGuard)
export class AiCoachController {
  private readonly logger = new Logger(AiCoachController.name);

  constructor(
    private readonly aiCoachService: AiCoachService,
    private readonly botDataService: BotDataService,
    private readonly botToolsService: BotToolsService,
  ) {}

  @Post('welcome')
  async generateWelcomeMessage(
    @Request() req: any,
    @Body() body: WelcomeMessageRequest,
  ): Promise<BotResponse> {
    const ownerUid = req.ownerUid;
    const organizationId = req.ownerUid; // Using ownerUid as organizationId for multi-tenant
    const { language = 'en' } = body;

    this.logger.log(`Generating welcome message for ${ownerUid} in ${language}`);

    try {
      return await this.aiCoachService.generateWelcomeMessage(
        ownerUid,
        organizationId,
        language,
      );
    } catch (error) {
      this.logger.error(`Failed to generate welcome message for ${ownerUid}:`, error);
      throw new BadRequestException('Failed to generate welcome message');
    }
  }

  @Post('chat')
  async processChatMessage(
    @Request() req: any,
    @Body() body: ChatMessageRequest,
  ): Promise<BotResponse> {
    const ownerUid = req.ownerUid;
    const organizationId = req.ownerUid; // Using ownerUid as organizationId for multi-tenant
    const { message, sessionId, language = 'en' } = body;

    if (!message?.trim()) {
      throw new BadRequestException('Message cannot be empty');
    }

    this.logger.log(`Processing chat message for ${ownerUid}`);

    try {
      return await this.aiCoachService.processChatMessage(
        ownerUid,
        message,
        sessionId,
        language,
        organizationId,
      );
    } catch (error) {
      this.logger.error(`Failed to process chat message for ${ownerUid}:`, error);
      throw new BadRequestException('Failed to process chat message');
    }
  }

  @Get('data-snapshot')
  async getUserDataSnapshot(@Request() req: any) {
    const ownerUid = req.ownerUid;
    const organizationId = req.ownerUid; // Using ownerUid as organizationId for multi-tenant

    this.logger.log(`Fetching data snapshot for ${ownerUid}`);

    try {
      return await this.botDataService.getUserDataSnapshot(ownerUid, organizationId);
    } catch (error) {
      this.logger.error(`Failed to fetch data snapshot for ${ownerUid}:`, error);
      throw new BadRequestException('Failed to fetch user data');
    }
  }

  @Post('tools/:toolName/execute')
  async executetool(
    @Request() req: any,
    @Param('toolName') toolName: string,
    @Body() body: ToolExecutionRequest,
  ) {
    const ownerUid = req.ownerUid;
    const organizationId = req.ownerUid; // Using ownerUid as organizationId for multi-tenant
    const { parameters } = body;

    this.logger.log(`Executing tool ${toolName} for ${ownerUid}`);

    try {
      return await this.botToolsService.executeToolCall(
        ownerUid,
        toolName,
        parameters,
        organizationId,
      );
    } catch (error) {
      this.logger.error(`Failed to execute tool ${toolName} for ${ownerUid}:`, error);
      throw new BadRequestException(`Failed to execute tool ${toolName}`);
    }
  }

  @Get('sessions/:sessionId')
  async getChatSession(
    @Request() req: any,
    @Param('sessionId') sessionId: string,
  ) {
    const ownerUid = req.ownerUid;

    this.logger.log(`Fetching chat session ${sessionId} for ${ownerUid}`);

    try {
      // This would require implementing session storage in AiCoachService
      // For now, return a placeholder
      return {
        id: sessionId,
        ownerUid,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch chat session ${sessionId}:`, error);
      throw new BadRequestException('Failed to fetch chat session');
    }
  }

  @Get('health')
  async getHealthStatus() {
    this.logger.log('Checking AI Coach health status');

    try {
      // Check if services are properly initialized
      const isHealthy = true; // Add actual health checks here

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          aiCoach: isHealthy,
          botData: isHealthy,
          botTools: isHealthy,
        },
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}