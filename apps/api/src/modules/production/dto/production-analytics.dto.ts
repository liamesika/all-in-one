import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ProjectStatus, ProjectType } from './production-project.dto';
import { ProductionTaskStatus, TaskDomain } from './production-task.dto';
import { BudgetCategory } from './production-budget.dto';
import { SupplierCategory } from './production-supplier.dto';

export class ProductionAnalyticsQueryDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  projectStatus?: ProjectStatus;

  @IsOptional()
  @IsEnum(ProjectType)
  projectType?: ProjectType;
}

export class ProductionOverviewStatsDto {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;

  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;

  totalBudgetPlanned: number;
  totalBudgetActual: number;
  budgetVariance: number;
  budgetVariancePercentage: number;

  totalSuppliers: number;
  activeSuppliers: number; // Suppliers with active projects

  totalFiles: number;

  // Time-based metrics
  averageProjectDuration: number; // in days
  projectsThisMonth: number;
  tasksCompletedThisWeek: number;
}

export class ProjectStatusDistributionDto {
  status: ProjectStatus;
  count: number;
  percentage: number;
}

export class TaskStatusDistributionDto {
  status: ProductionTaskStatus;
  count: number;
  percentage: number;
}

export class TaskDomainDistributionDto {
  domain: TaskDomain;
  count: number;
  percentage: number;
}

export class BudgetCategoryBreakdownDto {
  category: BudgetCategory;
  plannedTotal: number;
  actualTotal: number;
  variance: number;
  variancePercentage: number;
  itemCount: number;
}

export class SupplierCategoryBreakdownDto {
  category: SupplierCategory;
  count: number;
  averageRating: number;
  totalBudgetValue: number;
}

export class TopPerformersDto {
  // Top users by completed tasks
  topTaskCompletors: {
    userId: string;
    userName: string;
    completedTasks: number;
    onTimeCompletionRate: number;
  }[];

  // Top suppliers by budget value
  topSuppliersByValue: {
    supplierId: string;
    supplierName: string;
    totalBudgetValue: number;
    projectCount: number;
    averageRating: number;
  }[];

  // Most active projects
  mostActiveProjects: {
    projectId: string;
    projectName: string;
    taskCount: number;
    completedTasks: number;
    budgetTotal: number;
    teamSize: number;
  }[];
}

export class ProductionTimelineStatsDto {
  date: string; // YYYY-MM-DD format
  projectsCreated: number;
  tasksCompleted: number;
  budgetSpent: number;
}

export class ProductionAnalyticsResponseDto {
  overview: ProductionOverviewStatsDto;
  projectStatusDistribution: ProjectStatusDistributionDto[];
  taskStatusDistribution: TaskStatusDistributionDto[];
  taskDomainDistribution: TaskDomainDistributionDto[];
  budgetCategoryBreakdown: BudgetCategoryBreakdownDto[];
  supplierCategoryBreakdown: SupplierCategoryBreakdownDto[];
  topPerformers: TopPerformersDto;
  timeline: ProductionTimelineStatsDto[]; // Last 30 days by default

  // Metadata
  generatedAt: string;
  dataRange: {
    startDate: string;
    endDate: string;
  };
}

export class ProductionDashboardKPIDto {
  // Critical KPIs for dashboard cards
  activeProjectsCount: number;
  overdueTasks: number;
  budgetOverruns: number; // Projects over budget
  teamUtilization: number; // Percentage of team members with active tasks

  // Trending indicators (compared to previous period)
  projectsTrend: {
    value: number;
    change: number; // percentage change
    isPositive: boolean;
  };

  taskCompletionTrend: {
    value: number; // completion rate percentage
    change: number;
    isPositive: boolean;
  };

  budgetVarianceTrend: {
    value: number; // variance percentage
    change: number;
    isPositive: boolean;
  };

  // Quick alerts
  upcomingDeadlines: {
    projectId: string;
    projectName: string;
    dueDate: string;
    daysUntilDue: number;
  }[];

  criticalTasks: {
    taskId: string;
    taskTitle: string;
    projectName: string;
    assignee?: string;
    overdueDays: number;
  }[];
}