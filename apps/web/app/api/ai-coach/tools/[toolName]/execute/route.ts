import { NextResponse, NextRequest } from 'next/server';
import { resolveTenantContext, logTenantOperation } from '../../../../../../lib/auth/tenant-guard';

interface ToolExecuteRequest {
  parameters: Record<string, any>;
}

export async function POST(req: NextRequest, { params }: { params: { toolName: string } }) {
  const startTime = Date.now();
  const toolName = params.toolName;

  try {
    // Resolve tenant context with proper authentication
    const guardResult = resolveTenantContext(req);

    if (!guardResult.success) {
      logTenantOperation({
        module: 'ai-coach-tools',
        action: 'execute',
        status: 'error',
        errorCode: guardResult.error?.code,
        duration: Date.now() - startTime,
        metadata: { toolName },
      });

      return NextResponse.json(
        {
          code: guardResult.error?.code || 'UNAUTHORIZED',
          message: guardResult.error?.message || 'Authentication required',
        },
        { status: guardResult.error?.status || 401 }
      );
    }

    const { ownerUid, isDevFallback } = guardResult.context!;

    // Parse request body
    const body: ToolExecuteRequest = await req.json();

    // Execute the requested tool action
    let result;
    switch (toolName) {
      case 'create_lead':
        result = await handleCreateLead(ownerUid, body.parameters);
        break;
      case 'view_leads':
        result = await handleViewLeads(ownerUid, body.parameters);
        break;
      case 'create_campaign':
        result = await handleCreateCampaign(ownerUid, body.parameters);
        break;
      case 'view_campaigns':
        result = await handleViewCampaigns(ownerUid, body.parameters);
        break;
      case 'view_performance':
        result = await handleViewPerformance(ownerUid, body.parameters);
        break;
      case 'manage_connections':
        result = await handleManageConnections(ownerUid, body.parameters);
        break;
      case 'view_dashboard':
        result = await handleViewDashboard(ownerUid, body.parameters);
        break;
      default:
        logTenantOperation({
          module: 'ai-coach-tools',
          action: 'execute',
          ownerUid,
          status: 'error',
          errorCode: 'UNKNOWN_TOOL',
          duration: Date.now() - startTime,
          metadata: { toolName, isDevFallback },
        });

        return NextResponse.json(
          {
            code: 'UNKNOWN_TOOL',
            message: `Unknown tool: ${toolName}`,
          },
          { status: 400 }
        );
    }

    logTenantOperation({
      module: 'ai-coach-tools',
      action: 'execute',
      ownerUid,
      status: 'success',
      duration: Date.now() - startTime,
      metadata: {
        toolName,
        resultType: result.type,
        isDevFallback,
      },
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
      type: result.type,
    });

  } catch (error: any) {
    logTenantOperation({
      module: 'ai-coach-tools',
      action: 'execute',
      status: 'error',
      errorCode: 'EXECUTION_ERROR',
      duration: Date.now() - startTime,
      metadata: {
        toolName,
        error: error.message,
      },
    });

    console.error(`[AiCoachTools] ${toolName} execution error:`, error);

    return NextResponse.json(
      {
        code: 'EXECUTION_ERROR',
        message: 'Failed to execute tool action',
      },
      { status: 500 }
    );
  }
}

// Tool action handlers
async function handleCreateLead(ownerUid: string, params: Record<string, any>) {
  return {
    type: 'navigation',
    message: 'Opening new lead form...',
    data: { url: '/e-commerce/leads?new=1' },
  };
}

async function handleViewLeads(ownerUid: string, params: Record<string, any>) {
  return {
    type: 'navigation',
    message: 'Opening leads page...',
    data: { url: '/e-commerce/leads' },
  };
}

async function handleCreateCampaign(ownerUid: string, params: Record<string, any>) {
  return {
    type: 'navigation',
    message: 'Opening new campaign form...',
    data: { url: '/e-commerce/campaigns?new=1' },
  };
}

async function handleViewCampaigns(ownerUid: string, params: Record<string, any>) {
  return {
    type: 'navigation',
    message: 'Opening campaigns page...',
    data: { url: '/e-commerce/campaigns' },
  };
}

async function handleViewPerformance(ownerUid: string, params: Record<string, any>) {
  return {
    type: 'navigation',
    message: 'Opening performance dashboard...',
    data: { url: '/e-commerce/dashboard' },
  };
}

async function handleManageConnections(ownerUid: string, params: Record<string, any>) {
  return {
    type: 'navigation',
    message: 'Opening connections page...',
    data: { url: '/e-commerce/connections' },
  };
}

async function handleViewDashboard(ownerUid: string, params: Record<string, any>) {
  return {
    type: 'navigation',
    message: 'Opening dashboard...',
    data: { url: '/e-commerce/dashboard' },
  };
}