import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Automation trigger types
export type TriggerType =
  | 'LEAD_CREATED'
  | 'LEAD_UPDATED'
  | 'LEAD_STATUS_CHANGED'
  | 'LEAD_NOT_CONTACTED'
  | 'PROPERTY_ADDED'
  | 'PROPERTY_UPDATED'
  | 'PROPERTY_PRICE_CHANGED'
  | 'PROPERTY_PHOTO_ADDED'
  | 'CAMPAIGN_LEAD_RECEIVED'
  | 'CAMPAIGN_BUDGET_THRESHOLD'
  | 'CAMPAIGN_STATUS_CHANGED'
  | 'TIME_BASED';

// Automation action types
export type ActionType =
  | 'SEND_WHATSAPP'
  | 'SEND_EMAIL'
  | 'SEND_SMS'
  | 'CREATE_LEAD'
  | 'CREATE_PROPERTY'
  | 'CREATE_DEAL'
  | 'CREATE_TASK'
  | 'UPDATE_FIELD'
  | 'ADD_NOTE'
  | 'ASSIGN_AGENT'
  | 'SEND_NOTIFICATION'
  | 'CALL_WEBHOOK'
  | 'RUN_AI_ANALYSIS';

export interface Trigger {
  type: TriggerType;
  config: Record<string, any>;
}

export interface Action {
  type: ActionType;
  config: Record<string, any>;
  order: number;
}

export interface AutomationContext {
  entityType: string;
  entityId: string;
  entity: any;
  event: string;
  ownerUid: string;
}

export class AutomationEngine {
  /**
   * Execute an automation workflow
   */
  async execute(automationId: string, context: AutomationContext): Promise<void> {
    const automation = await prisma.automation.findUnique({
      where: { id: automationId },
    });

    if (!automation) {
      throw new Error(`Automation ${automationId} not found`);
    }

    if (automation.status !== 'ACTIVE') {
      console.log(`Automation ${automationId} is not active, skipping`);
      return;
    }

    const execution = await prisma.automationExecution.create({
      data: {
        automationId,
        status: 'SUCCESS',
        triggeredBy: {
          entityType: context.entityType,
          entityId: context.entityId,
          event: context.event,
        },
        actionsLog: [],
        startedAt: new Date(),
      },
    });

    const actionsLog: any[] = [];
    let executionStatus: 'SUCCESS' | 'FAILED' | 'PARTIAL' = 'SUCCESS';
    let errorMessage: string | null = null;

    try {
      // Check conditions
      if (automation.conditions) {
        const conditionsPassed = await this.checkConditions(
          automation.conditions as any,
          context
        );
        if (!conditionsPassed) {
          console.log(`Conditions not met for automation ${automationId}`);
          await prisma.automationExecution.update({
            where: { id: execution.id },
            data: {
              status: 'SUCCESS',
              actionsLog: [
                { action: 'CHECK_CONDITIONS', status: 'SKIPPED', result: 'Conditions not met' },
              ],
              completedAt: new Date(),
            },
          });
          return;
        }
      }

      // Execute actions in sequence
      const actions = automation.actions as Action[];
      for (const action of actions.sort((a, b) => a.order - b.order)) {
        try {
          const result = await this.executeAction(action, context);
          actionsLog.push({
            action: action.type,
            status: 'SUCCESS',
            result,
            timestamp: new Date(),
          });
        } catch (error: any) {
          actionsLog.push({
            action: action.type,
            status: 'FAILED',
            error: error.message,
            timestamp: new Date(),
          });
          executionStatus = 'PARTIAL';
        }
      }
    } catch (error: any) {
      executionStatus = 'FAILED';
      errorMessage = error.message;
      actionsLog.push({
        action: 'EXECUTION',
        status: 'FAILED',
        error: error.message,
        timestamp: new Date(),
      });
    }

    // Update execution log
    await prisma.automationExecution.update({
      where: { id: execution.id },
      data: {
        status: executionStatus,
        actionsLog,
        completedAt: new Date(),
        errorMessage,
      },
    });

    // Update automation stats
    const stats = (automation.stats as any) || {
      totalRuns: 0,
      successCount: 0,
      failCount: 0,
      lastRunAt: null,
    };
    stats.totalRuns += 1;
    if (executionStatus === 'SUCCESS') {
      stats.successCount += 1;
    } else {
      stats.failCount += 1;
    }
    stats.lastRunAt = new Date();

    await prisma.automation.update({
      where: { id: automationId },
      data: { stats },
    });
  }

  /**
   * Check if conditions are met
   */
  private async checkConditions(
    conditions: Record<string, any>,
    context: AutomationContext
  ): Promise<boolean> {
    // Basic condition checking logic
    // Can be expanded with more complex rules
    for (const [key, value] of Object.entries(conditions)) {
      if (context.entity[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: Action, context: AutomationContext): Promise<any> {
    switch (action.type) {
      case 'SEND_WHATSAPP':
        return this.sendWhatsApp(action.config, context);
      case 'SEND_EMAIL':
        return this.sendEmail(action.config, context);
      case 'SEND_SMS':
        return this.sendSMS(action.config, context);
      case 'CREATE_TASK':
        return this.createTask(action.config, context);
      case 'UPDATE_FIELD':
        return this.updateField(action.config, context);
      case 'ASSIGN_AGENT':
        return this.assignAgent(action.config, context);
      case 'SEND_NOTIFICATION':
        return this.sendNotification(action.config, context);
      case 'CALL_WEBHOOK':
        return this.callWebhook(action.config, context);
      case 'RUN_AI_ANALYSIS':
        return this.runAIAnalysis(action.config, context);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Action implementations
   */
  private async sendWhatsApp(config: any, context: AutomationContext): Promise<any> {
    // TODO: Integrate with WhatsApp Business API
    console.log('Sending WhatsApp:', config);
    return { sent: true, message: 'WhatsApp sent' };
  }

  private async sendEmail(config: any, context: AutomationContext): Promise<any> {
    // TODO: Integrate with email service
    console.log('Sending Email:', config);
    return { sent: true, message: 'Email sent' };
  }

  private async sendSMS(config: any, context: AutomationContext): Promise<any> {
    // TODO: Integrate with SMS service
    console.log('Sending SMS:', config);
    return { sent: true, message: 'SMS sent' };
  }

  private async createTask(config: any, context: AutomationContext): Promise<any> {
    const task = await prisma.task.create({
      data: {
        title: config.title,
        description: config.description,
        priority: config.priority || 'MEDIUM',
        status: 'PENDING',
        dueDate: config.dueDate ? new Date(config.dueDate) : null,
        ownerUid: context.ownerUid,
        category: config.category,
      },
    });
    return { taskId: task.id };
  }

  private async updateField(config: any, context: AutomationContext): Promise<any> {
    // Update entity field based on entity type
    if (context.entityType === 'LEAD') {
      await prisma.realEstateLead.update({
        where: { id: context.entityId },
        data: { [config.field]: config.value },
      });
    }
    return { updated: true, field: config.field };
  }

  private async assignAgent(config: any, context: AutomationContext): Promise<any> {
    // TODO: Implement agent assignment logic (round-robin, by location, etc.)
    console.log('Assigning Agent:', config);
    return { assigned: true, agentId: config.agentId };
  }

  private async sendNotification(config: any, context: AutomationContext): Promise<any> {
    // TODO: Integrate with notification system
    console.log('Sending Notification:', config);
    return { sent: true, notification: config.message };
  }

  private async callWebhook(config: any, context: AutomationContext): Promise<any> {
    const response = await fetch(config.url, {
      method: config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
      },
      body: JSON.stringify(config.data || context.entity),
    });
    return { status: response.status, ok: response.ok };
  }

  private async runAIAnalysis(config: any, context: AutomationContext): Promise<any> {
    // TODO: Integrate with OpenAI for lead qualification, property description, etc.
    console.log('Running AI Analysis:', config);
    return { analyzed: true, result: 'AI analysis complete' };
  }
}

/**
 * Trigger automations based on event
 */
export async function triggerAutomations(
  event: string,
  context: Omit<AutomationContext, 'event'>
): Promise<void> {
  const automations = await prisma.automation.findMany({
    where: {
      ownerUid: context.ownerUid,
      status: 'ACTIVE',
    },
  });

  const engine = new AutomationEngine();

  for (const automation of automations) {
    const trigger = automation.trigger as Trigger;

    // Match trigger type to event
    const triggerEventMap: Record<string, string[]> = {
      LEAD_CREATED: ['LEAD_CREATED'],
      LEAD_UPDATED: ['LEAD_UPDATED'],
      LEAD_STATUS_CHANGED: ['LEAD_STATUS_CHANGED'],
      PROPERTY_ADDED: ['PROPERTY_ADDED'],
      PROPERTY_PRICE_CHANGED: ['PROPERTY_PRICE_CHANGED'],
      // ... more mappings
    };

    const matchingEvents = triggerEventMap[trigger.type] || [];
    if (matchingEvents.includes(event)) {
      try {
        await engine.execute(automation.id, { ...context, event });
      } catch (error) {
        console.error(`Error executing automation ${automation.id}:`, error);
      }
    }
  }
}
