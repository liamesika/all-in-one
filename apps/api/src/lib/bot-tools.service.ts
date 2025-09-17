import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { BotDataService, UserDataSnapshot } from './bot-data.service';
import {
  CampaignStatus,
  RealEstateLeadStatus,
  EcommerceLeadStatus,
  TaskStatus,
  Priority,
  MessageStatus,
  MessageChannel
} from '@prisma/client';

export interface BotToolResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface CreateTaskParams {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  category?: string;
}

export interface UpdateLeadParams {
  leadId: string;
  status?: 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'MEETING' | 'OFFER' | 'DEAL' | 'CONVERTED' | 'DISQUALIFIED' | 'QUALIFIED' | 'CLOSED';
  notes?: string;
  nextFollowupDate?: string;
}

export interface CampaignActionParams {
  campaignId: string;
  reason?: string;
}

export interface SendMessageParams {
  recipientType: 'lead' | 'contact';
  recipientId: string;
  message: string;
  channel?: 'email' | 'sms' | 'whatsapp';
}

export interface OpenEntityParams {
  entityType: 'lead' | 'campaign' | 'property' | 'task' | 'connection';
  entityId: string;
}

@Injectable()
export class BotToolsService {
  private readonly logger = new Logger(BotToolsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly botDataService: BotDataService,
  ) {}

  async listUserData(ownerUid: string, organizationId?: string): Promise<BotToolResult> {
    try {
      this.logger.log(`Fetching user data for ${ownerUid}`);

      const snapshot = await this.botDataService.getUserDataSnapshot(ownerUid, organizationId);

      return {
        success: true,
        message: 'User data retrieved successfully',
        data: snapshot,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch user data for ${ownerUid}:`, error);
      return {
        success: false,
        message: 'Failed to retrieve user data',
        error: error.message,
      };
    }
  }

  async createTask(
    ownerUid: string,
    params: CreateTaskParams,
    organizationId?: string
  ): Promise<BotToolResult> {
    try {
      this.logger.log(`Creating task for ${ownerUid}:`, params.title);

      const dueDate = params.dueDate ? new Date(params.dueDate) : undefined;
      const priority = params.priority || 'MEDIUM';

      const task = await this.prisma.task.create({
        data: {
          title: params.title,
          description: params.description,
          priority,
          dueDate,
          category: params.category,
          status: 'PENDING',
          ownerUid,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Task created successfully: ${task.id}`);

      return {
        success: true,
        message: `Task "${params.title}" created successfully`,
        data: {
          taskId: task.id,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
          status: task.status,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create task for ${ownerUid}:`, error);
      return {
        success: false,
        message: 'Failed to create task',
        error: error.message,
      };
    }
  }

  async updateLeadStatus(
    ownerUid: string,
    params: UpdateLeadParams,
    organizationId?: string
  ): Promise<BotToolResult> {
    try {
      this.logger.log(`Updating lead ${params.leadId} for ${ownerUid}`);

      const lead = await this.prisma.realEstateLead.findFirst({
        where: {
          id: params.leadId,
          ownerUid,
          ...(organizationId && { organizationId }),
        },
      });

      if (!lead) {
        const ecommerceLead = await this.prisma.ecommerceLead.findFirst({
          where: {
            id: params.leadId,
            ownerUid,
            ...(organizationId && { organizationId }),
          },
        });

        if (!ecommerceLead) {
          return {
            success: false,
            message: 'Lead not found or access denied',
          };
        }

        const ecommerceStatus = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED'].includes(params.status || '')
          ? params.status
          : undefined;

        const updatedLead = await this.prisma.ecommerceLead.update({
          where: { id: params.leadId },
          data: {
            ...(ecommerceStatus && { status: ecommerceStatus }),
            ...(params.notes && { notes: params.notes }),
            ...(params.nextFollowupDate && {
              nextFollowupDate: new Date(params.nextFollowupDate)
            }),
            lastContactDate: new Date(),
            updatedAt: new Date(),
          },
        });

        return {
          success: true,
          message: `E-commerce lead updated successfully`,
          data: {
            leadId: updatedLead.id,
            status: updatedLead.status,
            lastContact: updatedLead.lastContactDate,
          },
        };
      }

      const realEstateStatuses = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'MEETING', 'OFFER', 'DEAL', 'CONVERTED', 'DISQUALIFIED'];
      const realEstateStatus = realEstateStatuses.includes(params.status || '')
        ? params.status
        : undefined;

      const updatedLead = await this.prisma.realEstateLead.update({
        where: { id: params.leadId },
        data: {
          ...(realEstateStatus && { status: realEstateStatus }),
          ...(params.notes && { notes: params.notes }),
          ...(params.nextFollowupDate && {
            nextFollowupDate: new Date(params.nextFollowupDate)
          }),
          lastContactDate: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Lead ${params.leadId} updated successfully`);

      return {
        success: true,
        message: `Real estate lead updated successfully`,
        data: {
          leadId: updatedLead.id,
          status: updatedLead.status,
          lastContact: updatedLead.lastContactDate,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update lead ${params.leadId}:`, error);
      return {
        success: false,
        message: 'Failed to update lead',
        error: error.message,
      };
    }
  }

  async pauseCampaign(
    ownerUid: string,
    params: CampaignActionParams,
    organizationId?: string
  ): Promise<BotToolResult> {
    try {
      this.logger.log(`Pausing campaign ${params.campaignId} for ${ownerUid}`);

      const campaign = await this.prisma.campaign.findFirst({
        where: {
          id: params.campaignId,
          ownerUid,
          ...(organizationId && { organizationId }),
        },
      });

      if (!campaign) {
        return {
          success: false,
          message: 'Campaign not found or access denied',
        };
      }

      const updatedCampaign = await this.prisma.campaign.update({
        where: { id: params.campaignId },
        data: {
          status: 'PAUSED',
          updatedAt: new Date(),
        },
      });

      if (params.reason) {
        await this.prisma.campaignEvent.create({
          data: {
            campaignId: params.campaignId,
            eventType: 'STATUS_CHANGE',
            eventData: {
              action: 'paused',
              reason: params.reason,
              previousStatus: campaign.status,
              newStatus: 'PAUSED',
            },
            ownerUid,
            organizationId,
            createdAt: new Date(),
          },
        });
      }

      this.logger.log(`Campaign ${params.campaignId} paused successfully`);

      return {
        success: true,
        message: `Campaign "${campaign.name}" has been paused`,
        data: {
          campaignId: updatedCampaign.id,
          status: updatedCampaign.status,
          previousStatus: campaign.status,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to pause campaign ${params.campaignId}:`, error);
      return {
        success: false,
        message: 'Failed to pause campaign',
        error: error.message,
      };
    }
  }

  async resumeCampaign(
    ownerUid: string,
    params: CampaignActionParams,
    organizationId?: string
  ): Promise<BotToolResult> {
    try {
      this.logger.log(`Resuming campaign ${params.campaignId} for ${ownerUid}`);

      const campaign = await this.prisma.campaign.findFirst({
        where: {
          id: params.campaignId,
          ownerUid,
          ...(organizationId && { organizationId }),
        },
      });

      if (!campaign) {
        return {
          success: false,
          message: 'Campaign not found or access denied',
        };
      }

      const updatedCampaign = await this.prisma.campaign.update({
        where: { id: params.campaignId },
        data: {
          status: 'ACTIVE',
          updatedAt: new Date(),
        },
      });

      if (params.reason) {
        await this.prisma.campaignEvent.create({
          data: {
            campaignId: params.campaignId,
            eventType: 'STATUS_CHANGE',
            eventData: {
              action: 'resumed',
              reason: params.reason,
              previousStatus: campaign.status,
              newStatus: 'ACTIVE',
            },
            ownerUid,
            organizationId,
            createdAt: new Date(),
          },
        });
      }

      this.logger.log(`Campaign ${params.campaignId} resumed successfully`);

      return {
        success: true,
        message: `Campaign "${campaign.name}" has been resumed`,
        data: {
          campaignId: updatedCampaign.id,
          status: updatedCampaign.status,
          previousStatus: campaign.status,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to resume campaign ${params.campaignId}:`, error);
      return {
        success: false,
        message: 'Failed to resume campaign',
        error: error.message,
      };
    }
  }

  async sendMessage(
    ownerUid: string,
    params: SendMessageParams,
    organizationId?: string
  ): Promise<BotToolResult> {
    try {
      this.logger.log(`Sending message to ${params.recipientType} ${params.recipientId} for ${ownerUid}`);

      if (params.recipientType === 'lead') {
        const realEstateLead = await this.prisma.realEstateLead.findFirst({
          where: {
            id: params.recipientId,
            ownerUid,
            ...(organizationId && { organizationId }),
          },
        });

        const ecommerceLead = realEstateLead ? null : await this.prisma.ecommerceLead.findFirst({
          where: {
            id: params.recipientId,
            ownerUid,
            ...(organizationId && { organizationId }),
          },
        });

        const lead = realEstateLead || ecommerceLead;
        if (!lead) {
          return {
            success: false,
            message: 'Lead not found or access denied',
          };
        }

        const messageRecord = await this.prisma.message.create({
          data: {
            recipientType: params.recipientType.toUpperCase(),
            recipientId: params.recipientId,
            message: params.message,
            channel: params.channel || 'email',
            status: 'QUEUED',
            ownerUid,
            organizationId,
            createdAt: new Date(),
          },
        });

        if (realEstateLead) {
          await this.prisma.realEstateLead.update({
            where: { id: params.recipientId },
            data: {
              lastContactDate: new Date(),
              updatedAt: new Date(),
            },
          });
        } else {
          await this.prisma.ecommerceLead.update({
            where: { id: params.recipientId },
            data: {
              lastContactDate: new Date(),
              updatedAt: new Date(),
            },
          });
        }

        this.logger.log(`Message queued successfully: ${messageRecord.id}`);

        return {
          success: true,
          message: `Message sent to ${lead.name || lead.email}`,
          data: {
            messageId: messageRecord.id,
            recipientName: lead.name,
            recipientEmail: lead.email,
            channel: messageRecord.channel,
          },
        };
      }

      return {
        success: false,
        message: 'Unsupported recipient type',
      };
    } catch (error) {
      this.logger.error(`Failed to send message:`, error);
      return {
        success: false,
        message: 'Failed to send message',
        error: error.message,
      };
    }
  }

  async openEntity(
    ownerUid: string,
    params: OpenEntityParams,
    organizationId?: string
  ): Promise<BotToolResult> {
    try {
      this.logger.log(`Generating link for ${params.entityType} ${params.entityId}`);

      let entityData = null;
      let url = '';

      switch (params.entityType) {
        case 'lead':
          const realEstateLead = await this.prisma.realEstateLead.findFirst({
            where: {
              id: params.entityId,
              ownerUid,
              ...(organizationId && { organizationId }),
            },
          });

          if (realEstateLead) {
            entityData = realEstateLead;
            url = `/real-estate/leads/${params.entityId}`;
            break;
          }

          const ecommerceLead = await this.prisma.ecommerceLead.findFirst({
            where: {
              id: params.entityId,
              ownerUid,
              ...(organizationId && { organizationId }),
            },
          });

          if (ecommerceLead) {
            entityData = ecommerceLead;
            url = `/e-commerce/leads/${params.entityId}`;
          }
          break;

        case 'campaign':
          const campaign = await this.prisma.campaign.findFirst({
            where: {
              id: params.entityId,
              ownerUid,
              ...(organizationId && { organizationId }),
            },
          });
          if (campaign) {
            entityData = campaign;
            url = `/e-commerce/campaigns?id=${params.entityId}`;
          }
          break;

        case 'property':
          const property = await this.prisma.property.findFirst({
            where: {
              id: params.entityId,
              ownerUid,
              ...(organizationId && { organizationId }),
            },
          });
          if (property) {
            entityData = property;
            url = `/real-estate/properties/${property.slug || params.entityId}`;
          }
          break;

        case 'task':
          const task = await this.prisma.task.findFirst({
            where: {
              id: params.entityId,
              ownerUid,
              ...(organizationId && { organizationId }),
            },
          });
          if (task) {
            entityData = task;
            url = `/dashboard/tasks?id=${params.entityId}`;
          }
          break;

        case 'connection':
          const connection = await this.prisma.connection.findFirst({
            where: {
              id: params.entityId,
              ownerUid,
            },
          });
          if (connection) {
            entityData = connection;
            url = `/connections?id=${params.entityId}`;
          }
          break;
      }

      if (!entityData) {
        return {
          success: false,
          message: `${params.entityType} not found or access denied`,
        };
      }

      this.logger.log(`Generated link for ${params.entityType}: ${url}`);

      return {
        success: true,
        message: `Opening ${params.entityType}`,
        data: {
          entityType: params.entityType,
          entityId: params.entityId,
          url,
          entity: entityData,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to open entity ${params.entityType}:`, error);
      return {
        success: false,
        message: 'Failed to open entity',
        error: error.message,
      };
    }
  }

  async executeToolCall(
    ownerUid: string,
    toolName: string,
    parameters: any,
    organizationId?: string
  ): Promise<BotToolResult> {
    try {
      this.logger.log(`Executing tool ${toolName} for ${ownerUid}`);

      switch (toolName) {
        case 'list_user_data':
          return await this.listUserData(ownerUid, organizationId);

        case 'create_task':
          return await this.createTask(ownerUid, parameters, organizationId);

        case 'update_lead_status':
          return await this.updateLeadStatus(ownerUid, parameters, organizationId);

        case 'pause_campaign':
          return await this.pauseCampaign(ownerUid, parameters, organizationId);

        case 'resume_campaign':
          return await this.resumeCampaign(ownerUid, parameters, organizationId);

        case 'send_message':
          return await this.sendMessage(ownerUid, parameters, organizationId);

        case 'open_entity':
          return await this.openEntity(ownerUid, parameters, organizationId);

        default:
          return {
            success: false,
            message: `Unknown tool: ${toolName}`,
          };
      }
    } catch (error) {
      this.logger.error(`Tool execution failed for ${toolName}:`, error);
      return {
        success: false,
        message: `Failed to execute ${toolName}`,
        error: error.message,
      };
    }
  }
}