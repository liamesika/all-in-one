import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

// Enums based on Prisma schema
export enum ProductionTaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED'
}

export enum TaskDomain {
  LOGISTICS = 'LOGISTICS',
  CONTENT = 'CONTENT',
  MARKETING = 'MARKETING',
  SUPPLIERS = 'SUPPLIERS'
}

export class CreateProductionTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(TaskDomain)
  domain?: TaskDomain = TaskDomain.LOGISTICS;

  @IsOptional()
  @IsEnum(ProductionTaskStatus)
  status?: ProductionTaskStatus = ProductionTaskStatus.OPEN;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsUUID()
  predecessorId?: string;

  @IsUUID()
  projectId: string;
}

export class UpdateProductionTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(TaskDomain)
  domain?: TaskDomain;

  @IsOptional()
  @IsEnum(ProductionTaskStatus)
  status?: ProductionTaskStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsUUID()
  predecessorId?: string;
}

export class AssignTaskDto {
  @IsUUID()
  assigneeId: string;
}

export class ProductionTaskResponseDto {
  id: string;
  title: string;
  description?: string;
  domain: TaskDomain;
  status: ProductionTaskStatus;
  dueDate?: string;
  predecessorId?: string;
  assigneeId?: string;
  projectId: string;
  ownerUid: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;

  // Relations (when included)
  assignee?: {
    id: string;
    fullName: string;
    email: string;
  };

  project?: {
    id: string;
    name: string;
    status: string;
  };
}

export class ProductionTaskListQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProductionTaskStatus)
  status?: ProductionTaskStatus;

  @IsOptional()
  @IsEnum(TaskDomain)
  domain?: TaskDomain;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class TaskAssignmentQueryDto {
  @IsOptional()
  @IsUUID()
  assigneeId?: string; // Filter tasks assigned to specific user
}