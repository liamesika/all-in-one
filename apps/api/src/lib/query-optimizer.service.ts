// Query optimization service for Prisma
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export interface QueryPerformanceOptions {
  enableTracking?: boolean;
  queryType?: string;
  tableName?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface QueryResult<T> {
  data: T;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
  performance?: {
    executionTime: number;
    rowsReturned: number;
    queryType: string;
  };
}

@Injectable()
export class QueryOptimizerService {
  constructor(private prisma: PrismaService) {}

  // Optimized paginated queries
  async paginateQuery<T>(
    queryFn: (skip: number, take: number) => Promise<T[]>,
    countFn: () => Promise<number>,
    options: PaginationOptions & QueryPerformanceOptions = {}
  ): Promise<QueryResult<T[]>> {
    const startTime = performance.now();
    const { page = 1, limit = 20, enableTracking = false } = options;
    
    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 per page
    const skip = (validatedPage - 1) * validatedLimit;

    // Execute queries in parallel for better performance
    const [data, total] = await Promise.all([
      queryFn(skip, validatedLimit),
      countFn(),
    ]);

    const executionTime = performance.now() - startTime;
    const totalPages = Math.ceil(total / validatedLimit);

    // Track performance if enabled
    if (enableTracking) {
      this.trackQueryPerformance({
        queryType: options.queryType || 'paginated_query',
        tableName: options.tableName || 'unknown',
        executionTime: Math.round(executionTime),
        rowsReturned: data.length,
      });
    }

    return {
      data,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        hasNext: validatedPage < totalPages,
        hasPrev: validatedPage > 1,
      },
      performance: enableTracking ? {
        executionTime: Math.round(executionTime),
        rowsReturned: data.length,
        queryType: options.queryType || 'paginated_query',
      } : undefined,
    };
  }

  // Cursor-based pagination for better performance on large datasets
  async paginateCursor<T extends { id: string; createdAt: Date }>(
    queryFn: (cursor?: string, take?: number) => Promise<T[]>,
    options: PaginationOptions & QueryPerformanceOptions = {}
  ): Promise<QueryResult<T[]>> {
    const startTime = performance.now();
    const { limit = 20, cursor, enableTracking = false } = options;
    
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    
    const data = await queryFn(cursor, validatedLimit + 1); // Get one extra to check if there's more
    const hasNext = data.length > validatedLimit;
    
    if (hasNext) {
      data.pop(); // Remove the extra item
    }

    const executionTime = performance.now() - startTime;

    // Track performance if enabled
    if (enableTracking) {
      this.trackQueryPerformance({
        queryType: options.queryType || 'cursor_paginated_query',
        tableName: options.tableName || 'unknown',
        executionTime: Math.round(executionTime),
        rowsReturned: data.length,
      });
    }

    return {
      data,
      pagination: {
        limit: validatedLimit,
        hasNext,
        nextCursor: hasNext ? data[data.length - 1]?.id : undefined,
      },
      performance: enableTracking ? {
        executionTime: Math.round(executionTime),
        rowsReturned: data.length,
        queryType: options.queryType || 'cursor_paginated_query',
      } : undefined,
    };
  }

  // Optimized search with full-text search
  async searchQuery<T>(
    searchTerm: string,
    queryFn: (searchVector: string, pagination: { skip: number; take: number }) => Promise<T[]>,
    countFn: (searchVector: string) => Promise<number>,
    options: PaginationOptions & QueryPerformanceOptions = {}
  ): Promise<QueryResult<T[]>> {
    const startTime = performance.now();
    const { page = 1, limit = 20, enableTracking = false } = options;
    
    // Prepare search term for full-text search
    const searchVector = searchTerm
      .trim()
      .split(/\s+/)
      .map(term => `${term}:*`)
      .join(' & ');

    if (!searchVector) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const skip = (validatedPage - 1) * validatedLimit;

    // Execute search and count in parallel
    const [data, total] = await Promise.all([
      queryFn(searchVector, { skip, take: validatedLimit }),
      countFn(searchVector),
    ]);

    const executionTime = performance.now() - startTime;

    // Track performance if enabled
    if (enableTracking) {
      this.trackQueryPerformance({
        queryType: options.queryType || 'search_query',
        tableName: options.tableName || 'unknown',
        executionTime: Math.round(executionTime),
        rowsReturned: data.length,
      });
    }

    return {
      data,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        hasNext: validatedPage * validatedLimit < total,
        hasPrev: validatedPage > 1,
      },
      performance: enableTracking ? {
        executionTime: Math.round(executionTime),
        rowsReturned: data.length,
        queryType: options.queryType || 'search_query',
      } : undefined,
    };
  }

  // Optimized batch operations
  async batchOperation<T, R>(
    items: T[],
    operationFn: (batch: T[]) => Promise<R[]>,
    batchSize: number = 100,
    options: QueryPerformanceOptions = {}
  ): Promise<R[]> {
    const startTime = performance.now();
    const { enableTracking = false } = options;
    
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await operationFn(batch);
      results.push(...batchResults);
    }

    const executionTime = performance.now() - startTime;

    // Track performance if enabled
    if (enableTracking) {
      this.trackQueryPerformance({
        queryType: options.queryType || 'batch_operation',
        tableName: options.tableName || 'unknown',
        executionTime: Math.round(executionTime),
        rowsReturned: results.length,
      });
    }

    return results;
  }

  // Track query performance
  private async trackQueryPerformance(data: {
    queryType: string;
    tableName: string;
    executionTime: number;
    rowsReturned: number;
  }) {
    try {
      // Use raw SQL to avoid recursion in tracking
      await this.prisma.$executeRaw`
        SELECT track_query_performance(
          ${data.queryType}, 
          ${data.tableName}, 
          ${data.executionTime}, 
          ${data.rowsReturned}
        )
      `;
    } catch (error) {
      // Don't throw error for tracking failures
      console.warn('Failed to track query performance:', error);
    }
  }

  // Get query performance stats
  async getPerformanceStats(hours: number = 24) {
    return this.prisma.$queryRaw`
      SELECT 
        query_type,
        table_name,
        AVG(execution_time_ms)::INTEGER as avg_time_ms,
        MAX(execution_time_ms) as max_time_ms,
        MIN(execution_time_ms) as min_time_ms,
        COUNT(*) as query_count,
        AVG(rows_returned)::INTEGER as avg_rows_returned
      FROM "QueryPerformanceStats"
      WHERE recorded_at >= NOW() - INTERVAL '${hours} hours'
      GROUP BY query_type, table_name
      ORDER BY avg_time_ms DESC
      LIMIT 50
    `;
  }

  // Get slow queries
  async getSlowQueries(minExecutionTime: number = 100, hours: number = 24) {
    return this.prisma.$queryRaw`
      SELECT * FROM "SlowQueries"
      WHERE hour >= NOW() - INTERVAL '${hours} hours'
        AND avg_time_ms >= ${minExecutionTime}
      ORDER BY avg_time_ms DESC
      LIMIT 20
    `;
  }

  // Refresh dashboard stats materialized view
  async refreshDashboardStats() {
    await this.prisma.$executeRaw`REFRESH MATERIALIZED VIEW "DashboardStats"`;
  }

  // Get dashboard stats
  async getDashboardStats() {
    return this.prisma.$queryRaw`
      SELECT * FROM "DashboardStats"
    `;
  }

  // Optimize table statistics
  async optimizeTableStats(tableName: string) {
    await this.prisma.$executeRaw`ANALYZE "${tableName}"`;
  }

  // Check index usage
  async getIndexUsageStats(tableName?: string) {
    const whereClause = tableName ? `WHERE schemaname = 'public' AND tablename = '${tableName}'` : `WHERE schemaname = 'public'`;
    
    return this.prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch,
        idx_tup_read::float / NULLIF(idx_tup_fetch, 0) AS ratio
      FROM pg_stat_user_indexes
      ${whereClause}
      ORDER BY idx_tup_read DESC
    `;
  }

  // Get table sizes
  async getTableSizes() {
    return this.prisma.$queryRaw`
      SELECT 
        tablename,
        pg_size_pretty(pg_total_relation_size(tablename::regclass)) AS size,
        pg_total_relation_size(tablename::regclass) AS bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(tablename::regclass) DESC
    `;
  }
}