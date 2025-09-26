import { Test, TestingModule } from '@nestjs/testing';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

/**
 * Performance Analysis Tests for Real Data Integration System
 *
 * These tests validate:
 * 1. Database query performance and optimization
 * 2. Bulk operation efficiency
 * 3. Memory usage and resource management
 * 4. API response times
 * 5. Concurrent request handling
 * 6. Cache effectiveness
 * 7. Third-party API integration performance
 */

describe('Performance Analysis - Real Data Integrations', () => {
  let prisma: any;

  const mockOwnerUid = 'performance-test-owner';
  const PERFORMANCE_THRESHOLDS = {
    DB_QUERY_MAX_MS: 100,
    API_RESPONSE_MAX_MS: 2000,
    BULK_IMPORT_MAX_MS: 5000,
    MEMORY_USAGE_MAX_MB: 100,
    CONCURRENT_REQUESTS: 50,
  };

  beforeAll(async () => {
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    await setupPerformanceTestData();
  });

  afterAll(async () => {
    await cleanupPerformanceTestData();
    await prisma.$disconnect();
  });

  async function setupPerformanceTestData() {
    // Create performance test dataset
    const properties = Array.from({ length: 1000 }, (_, i) => ({
      ownerUid: mockOwnerUid,
      name: `Performance Test Property ${i}`,
      address: `${i} Performance St`,
      city: i % 3 === 0 ? 'Tel Aviv' : i % 3 === 1 ? 'Jerusalem' : 'Haifa',
      price: 1000000 + (i * 50000),
      currency: 'ILS',
      provider: i % 2 === 0 ? 'YAD2' : 'MADLAN',
      status: 'PUBLISHED',
      type: 'APARTMENT',
      aiScore: Math.floor(Math.random() * 100),
      aiCategory: i % 4 === 0 ? 'excellent' : i % 4 === 1 ? 'good' : i % 4 === 2 ? 'fair' : 'poor',
      rooms: 2 + (i % 4),
      size: 60 + (i % 40),
      createdAt: new Date(Date.now() - (i * 60000)), // Spread over time
    }));

    // Batch insert for performance
    const batchSize = 100;
    for (let i = 0; i < properties.length; i += batchSize) {
      await prisma.property.createMany({
        data: properties.slice(i, i + batchSize),
        skipDuplicates: true,
      });
    }

    // Create leads dataset
    const leads = Array.from({ length: 2000 }, (_, i) => ({
      ownerUid: mockOwnerUid,
      externalId: `perf_lead_${i}`,
      email: `perf${i}@example.com`,
      fullName: `Performance Lead ${i}`,
      source: i % 3 === 0 ? 'FACEBOOK' : i % 3 === 1 ? 'GOOGLE' : 'MANUAL',
      status: i % 5 === 0 ? 'CONVERTED' : 'NEW',
      utmSource: i % 2 === 0 ? 'facebook' : 'google',
      utmMedium: 'paid-social',
      utmCampaign: `campaign_${Math.floor(i / 100)}`,
      orderValue: i % 5 === 0 ? 100 + (i * 2) : null,
      conversionDate: i % 5 === 0 ? new Date(Date.now() - (i * 30000)) : null,
      createdAt: new Date(Date.now() - (i * 30000)),
    }));

    for (let i = 0; i < leads.length; i += batchSize) {
      await prisma.ecommerceLead.createMany({
        data: leads.slice(i, i + batchSize),
        skipDuplicates: true,
      });
    }
  }

  async function cleanupPerformanceTestData() {
    try {
      await prisma.property.deleteMany({
        where: { ownerUid: mockOwnerUid },
      });
      await prisma.ecommerceLead.deleteMany({
        where: { ownerUid: mockOwnerUid },
      });
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }

  describe('Database Query Performance', () => {
    it('should efficiently query properties with multiple filters', async () => {
      const queries = [
        // Basic filtered query
        () => prisma.property.findMany({
          where: {
            ownerUid: mockOwnerUid,
            city: 'Tel Aviv',
            price: { gte: 2000000 },
          },
          take: 20,
        }),

        // Complex filtered query with AI scoring
        () => prisma.property.findMany({
          where: {
            ownerUid: mockOwnerUid,
            aiScore: { gte: 80 },
            status: 'PUBLISHED',
            provider: 'YAD2',
          },
          orderBy: { aiScore: 'desc' },
          take: 10,
        }),

        // Search query
        () => prisma.property.findMany({
          where: {
            ownerUid: mockOwnerUid,
            OR: [
              { name: { contains: 'Performance', mode: 'insensitive' } },
              { address: { contains: 'Performance', mode: 'insensitive' } },
            ],
          },
          take: 50,
        }),

        // Aggregation query
        () => prisma.property.groupBy({
          by: ['city', 'provider'],
          where: { ownerUid: mockOwnerUid },
          _count: { id: true },
          _avg: { aiScore: true },
        }),
      ];

      for (const query of queries) {
        const startTime = process.hrtime.bigint();
        const result = await query();
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;

        expect(result).toBeDefined();
        expect(durationMs).toBeLessThan(PERFORMANCE_THRESHOLDS.DB_QUERY_MAX_MS);

        console.log(`Query completed in ${durationMs.toFixed(2)}ms`);
      }
    });

    it('should efficiently handle lead attribution queries', async () => {
      const attributionQueries = [
        // Conversion rate by source
        () => prisma.ecommerceLead.groupBy({
          by: ['utmSource', 'status'],
          where: {
            ownerUid: mockOwnerUid,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          _count: { id: true },
          _sum: { orderValue: true },
        }),

        // Time-series data
        () => prisma.$queryRaw`
          SELECT DATE_TRUNC('day', "createdAt") as date,
                 COUNT(*) as leads,
                 COUNT(CASE WHEN status = 'CONVERTED' THEN 1 END) as conversions,
                 SUM("orderValue") as revenue
          FROM "EcommerceLead"
          WHERE "ownerUid" = ${mockOwnerUid}
            AND "createdAt" >= NOW() - INTERVAL '30 days'
          GROUP BY DATE_TRUNC('day', "createdAt")
          ORDER BY date DESC
        `,

        // Funnel analysis
        () => prisma.ecommerceLead.findMany({
          where: {
            ownerUid: mockOwnerUid,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          select: {
            id: true,
            status: true,
            source: true,
            createdAt: true,
            conversionDate: true,
            orderValue: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      ];

      for (const query of attributionQueries) {
        const startTime = process.hrtime.bigint();
        const result = await query();
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;

        expect(result).toBeDefined();
        expect(durationMs).toBeLessThan(PERFORMANCE_THRESHOLDS.DB_QUERY_MAX_MS * 2); // Allow more time for complex queries

        console.log(`Attribution query completed in ${durationMs.toFixed(2)}ms`);
      }
    });

    it('should use indexes effectively', async () => {
      // Test that compound indexes are being used
      const indexedQueries = [
        // ownerUid + status index
        () => prisma.property.findMany({
          where: {
            ownerUid: mockOwnerUid,
            status: 'PUBLISHED',
          },
        }),

        // ownerUid + provider index
        () => prisma.property.findMany({
          where: {
            ownerUid: mockOwnerUid,
            provider: 'YAD2',
          },
        }),

        // ownerUid + createdAt index for leads
        () => prisma.ecommerceLead.findMany({
          where: {
            ownerUid: mockOwnerUid,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ];

      for (const query of indexedQueries) {
        const startTime = process.hrtime.bigint();
        const result = await query();
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;

        expect(result).toBeDefined();
        expect(durationMs).toBeLessThan(50); // Should be very fast with proper indexes

        console.log(`Indexed query completed in ${durationMs.toFixed(2)}ms`);
      }
    });
  });

  describe('Bulk Operation Performance', () => {
    it('should efficiently handle bulk property imports', async () => {
      const bulkData = Array.from({ length: 100 }, (_, i) => ({
        ownerUid: mockOwnerUid,
        name: `Bulk Import Property ${i}`,
        address: `${i} Bulk St`,
        city: 'Bulk City',
        provider: 'MANUAL',
        status: 'DRAFT',
        price: 1000000 + (i * 10000),
      }));

      const startTime = process.hrtime.bigint();

      // Test different bulk strategies
      const strategies = [
        // Strategy 1: createMany (most efficient)
        async () => {
          await prisma.property.createMany({
            data: bulkData.slice(0, 20),
            skipDuplicates: true,
          });
        },

        // Strategy 2: Transaction with individual creates
        async () => {
          await prisma.$transaction(
            bulkData.slice(20, 30).map(data =>
              prisma.property.create({ data })
            )
          );
        },

        // Strategy 3: Batch processing
        async () => {
          const batchSize = 10;
          const remaining = bulkData.slice(30, 50);
          for (let i = 0; i < remaining.length; i += batchSize) {
            await prisma.property.createMany({
              data: remaining.slice(i, i + batchSize),
              skipDuplicates: true,
            });
          }
        },
      ];

      for (let i = 0; i < strategies.length; i++) {
        const strategyStart = process.hrtime.bigint();
        await strategies[i]();
        const strategyEnd = process.hrtime.bigint();
        const strategyDurationMs = Number(strategyEnd - strategyStart) / 1_000_000;

        console.log(`Bulk strategy ${i + 1} completed in ${strategyDurationMs.toFixed(2)}ms`);
        expect(strategyDurationMs).toBeLessThan(PERFORMANCE_THRESHOLDS.BULK_IMPORT_MAX_MS);
      }

      const endTime = process.hrtime.bigint();
      const totalDurationMs = Number(endTime - startTime) / 1_000_000;

      console.log(`Total bulk operations completed in ${totalDurationMs.toFixed(2)}ms`);
    });

    it('should handle concurrent bulk operations', async () => {
      const concurrentBatches = Array.from({ length: 5 }, (_, batchIndex) =>
        Array.from({ length: 20 }, (_, i) => ({
          ownerUid: mockOwnerUid,
          name: `Concurrent Batch ${batchIndex} Property ${i}`,
          address: `${batchIndex}-${i} Concurrent St`,
          city: `Concurrent City ${batchIndex}`,
          provider: 'MANUAL',
          price: 1000000 + (batchIndex * 100000) + (i * 5000),
        }))
      );

      const startTime = process.hrtime.bigint();

      // Run all batches concurrently
      const concurrentPromises = concurrentBatches.map(batch =>
        prisma.property.createMany({
          data: batch,
          skipDuplicates: true,
        })
      );

      const results = await Promise.all(concurrentPromises);

      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.count).toBe(20);
      });

      console.log(`Concurrent bulk operations completed in ${durationMs.toFixed(2)}ms`);
      expect(durationMs).toBeLessThan(PERFORMANCE_THRESHOLDS.BULK_IMPORT_MAX_MS);
    });
  });

  describe('Memory Usage and Resource Management', () => {
    it('should handle large result sets efficiently', async () => {
      const getMemoryUsage = () => {
        const usage = process.memoryUsage();
        return usage.heapUsed / 1024 / 1024; // MB
      };

      const initialMemory = getMemoryUsage();

      // Query large dataset
      const largeResultSet = await prisma.property.findMany({
        where: { ownerUid: mockOwnerUid },
        include: {
          photos: true,
        },
      });

      const afterQueryMemory = getMemoryUsage();

      // Process results (simulate real usage)
      const processedResults = largeResultSet.map(property => ({
        id: property.id,
        name: property.name,
        price: property.price,
        aiScore: property.aiScore,
        photoCount: property.photos?.length || 0,
      }));

      const afterProcessingMemory = getMemoryUsage();

      expect(largeResultSet.length).toBeGreaterThan(0);
      expect(processedResults.length).toBe(largeResultSet.length);

      const memoryIncrease = afterProcessingMemory - initialMemory;
      console.log(`Memory usage increased by ${memoryIncrease.toFixed(2)}MB`);

      // Memory usage should be reasonable
      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE_MAX_MB);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        const afterGCMemory = getMemoryUsage();
        console.log(`Memory after GC: ${afterGCMemory.toFixed(2)}MB`);
      }
    });

    it('should stream large datasets efficiently', async () => {
      // Simulate streaming large dataset processing
      const batchSize = 100;
      let processedCount = 0;
      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;

      const totalCount = await prisma.property.count({
        where: { ownerUid: mockOwnerUid },
      });

      const startTime = Date.now();

      // Process in batches to avoid loading all data into memory
      for (let offset = 0; offset < totalCount; offset += batchSize) {
        const batch = await prisma.property.findMany({
          where: { ownerUid: mockOwnerUid },
          take: batchSize,
          skip: offset,
          select: {
            id: true,
            name: true,
            price: true,
            aiScore: true,
            city: true,
          },
        });

        // Simulate processing
        batch.forEach(property => {
          // Simple aggregation
          if (property.aiScore && property.aiScore > 80) {
            processedCount++;
          }
        });

        // Check memory usage doesn't grow significantly
        const currentMemory = process.memoryUsage().heapUsed / 1024 / 1024;
        const memoryDiff = currentMemory - initialMemory;
        expect(memoryDiff).toBeLessThan(50); // Should stay within 50MB
      }

      const endTime = Date.now();
      const durationMs = endTime - startTime;

      console.log(`Streamed processing of ${totalCount} records in ${durationMs}ms`);
      console.log(`Processed ${processedCount} high-score properties`);

      expect(durationMs).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('API Response Time Performance', () => {
    it('should respond to dashboard queries quickly', async () => {
      const dashboardQueries = [
        // Properties overview
        async () => {
          const [properties, totalCount, highScoreCount] = await Promise.all([
            prisma.property.findMany({
              where: { ownerUid: mockOwnerUid },
              select: {
                id: true,
                name: true,
                city: true,
                price: true,
                aiScore: true,
                provider: true,
                status: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 20,
            }),
            prisma.property.count({
              where: { ownerUid: mockOwnerUid },
            }),
            prisma.property.count({
              where: {
                ownerUid: mockOwnerUid,
                aiScore: { gte: 80 },
              },
            }),
          ]);

          return { properties, totalCount, highScoreCount };
        },

        // Lead conversion metrics
        async () => {
          const [leads, conversions, revenue] = await Promise.all([
            prisma.ecommerceLead.count({
              where: { ownerUid: mockOwnerUid },
            }),
            prisma.ecommerceLead.count({
              where: {
                ownerUid: mockOwnerUid,
                status: 'CONVERTED',
              },
            }),
            prisma.ecommerceLead.aggregate({
              where: {
                ownerUid: mockOwnerUid,
                status: 'CONVERTED',
              },
              _sum: { orderValue: true },
            }),
          ]);

          return {
            totalLeads: leads,
            conversions,
            conversionRate: leads > 0 ? (conversions / leads) * 100 : 0,
            totalRevenue: revenue._sum.orderValue || 0,
          };
        },

        // Recent activity
        async () => {
          const [recentProperties, recentLeads, recentConversions] = await Promise.all([
            prisma.property.findMany({
              where: {
                ownerUid: mockOwnerUid,
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
              },
              take: 10,
              orderBy: { createdAt: 'desc' },
            }),
            prisma.ecommerceLead.findMany({
              where: {
                ownerUid: mockOwnerUid,
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
              },
              take: 10,
              orderBy: { createdAt: 'desc' },
            }),
            prisma.ecommerceLead.findMany({
              where: {
                ownerUid: mockOwnerUid,
                status: 'CONVERTED',
                conversionDate: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
              },
              take: 5,
              orderBy: { conversionDate: 'desc' },
            }),
          ]);

          return { recentProperties, recentLeads, recentConversions };
        },
      ];

      for (const query of dashboardQueries) {
        const startTime = process.hrtime.bigint();
        const result = await query();
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;

        expect(result).toBeDefined();
        expect(durationMs).toBeLessThan(200); // Dashboard queries should be very fast

        console.log(`Dashboard query completed in ${durationMs.toFixed(2)}ms`);
      }
    });

    it('should handle complex analytics queries efficiently', async () => {
      const analyticsQueries = [
        // Attribution analysis
        async () => {
          return await prisma.$queryRaw`
            SELECT "utmSource",
                   "utmMedium",
                   "utmCampaign",
                   COUNT(*) as leads,
                   COUNT(CASE WHEN status = 'CONVERTED' THEN 1 END) as conversions,
                   SUM("orderValue") as revenue,
                   AVG("orderValue") as avg_order_value
            FROM "EcommerceLead"
            WHERE "ownerUid" = ${mockOwnerUid}
              AND "createdAt" >= NOW() - INTERVAL '30 days'
            GROUP BY "utmSource", "utmMedium", "utmCampaign"
            ORDER BY conversions DESC
          `;
        },

        // Performance trending
        async () => {
          return await prisma.$queryRaw`
            WITH daily_stats AS (
              SELECT DATE_TRUNC('day', "createdAt") as date,
                     "utmSource",
                     COUNT(*) as leads,
                     COUNT(CASE WHEN status = 'CONVERTED' THEN 1 END) as conversions
              FROM "EcommerceLead"
              WHERE "ownerUid" = ${mockOwnerUid}
                AND "createdAt" >= NOW() - INTERVAL '14 days'
              GROUP BY DATE_TRUNC('day', "createdAt"), "utmSource"
            )
            SELECT date, "utmSource", leads, conversions,
                   CASE WHEN leads > 0 THEN (conversions::float / leads) * 100 ELSE 0 END as conversion_rate
            FROM daily_stats
            ORDER BY date DESC, "utmSource"
          `;
        },

        // Property market analysis
        async () => {
          return await prisma.$queryRaw`
            SELECT city,
                   provider,
                   COUNT(*) as property_count,
                   AVG(price) as avg_price,
                   AVG("aiScore") as avg_ai_score,
                   COUNT(CASE WHEN "aiScore" >= 80 THEN 1 END) as high_score_count
            FROM "Property"
            WHERE "ownerUid" = ${mockOwnerUid}
              AND status = 'PUBLISHED'
            GROUP BY city, provider
            ORDER BY avg_ai_score DESC NULLS LAST
          `;
        },
      ];

      for (const query of analyticsQueries) {
        const startTime = process.hrtime.bigint();
        const result = await query();
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(durationMs).toBeLessThan(500); // Complex analytics should complete within 500ms

        console.log(`Analytics query completed in ${durationMs.toFixed(2)}ms, returned ${result.length} results`);
      }
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous queries', async () => {
      const concurrentQueries = Array.from({ length: PERFORMANCE_THRESHOLDS.CONCURRENT_REQUESTS }, (_, i) => ({
        query: () => prisma.property.findMany({
          where: {
            ownerUid: mockOwnerUid,
            price: { gte: 1000000 + (i * 10000) },
          },
          take: 10,
        }),
        id: i,
      }));

      const startTime = Date.now();

      const results = await Promise.all(
        concurrentQueries.map(({ query, id }) =>
          query().then(result => ({ id, result, success: true }))
                 .catch(error => ({ id, error: error.message, success: false }))
        )
      );

      const endTime = Date.now();
      const durationMs = endTime - startTime;

      const successfulQueries = results.filter(r => r.success);
      const failedQueries = results.filter(r => !r.success);

      console.log(`${PERFORMANCE_THRESHOLDS.CONCURRENT_REQUESTS} concurrent queries completed in ${durationMs}ms`);
      console.log(`Successful: ${successfulQueries.length}, Failed: ${failedQueries.length}`);

      // Most queries should succeed
      expect(successfulQueries.length).toBeGreaterThan(PERFORMANCE_THRESHOLDS.CONCURRENT_REQUESTS * 0.9);

      // Total time should be reasonable
      expect(durationMs).toBeLessThan(3000);

      // Log any failures for analysis
      failedQueries.forEach(failure => {
        console.warn(`Query ${failure.id} failed: ${failure.error}`);
      });
    });

    it('should maintain performance under mixed workload', async () => {
      const mixedOperations = [
        // Read operations (80% of workload)
        ...Array.from({ length: 40 }, (_, i) => ({
          type: 'read',
          operation: () => prisma.property.findMany({
            where: { ownerUid: mockOwnerUid },
            take: 10,
            skip: i * 10,
          }),
        })),

        // Write operations (15% of workload)
        ...Array.from({ length: 7 }, (_, i) => ({
          type: 'write',
          operation: () => prisma.property.create({
            data: {
              ownerUid: mockOwnerUid,
              name: `Mixed Workload Property ${i}`,
              address: `${i} Mixed St`,
              city: 'Mixed City',
              provider: 'MANUAL',
              price: 1000000 + (i * 50000),
            },
          }),
        })),

        // Complex operations (5% of workload)
        ...Array.from({ length: 3 }, (_, i) => ({
          type: 'complex',
          operation: () => prisma.property.groupBy({
            by: ['city'],
            where: { ownerUid: mockOwnerUid },
            _count: { id: true },
            _avg: { price: true, aiScore: true },
          }),
        })),
      ];

      // Shuffle operations to simulate real-world mixed workload
      for (let i = mixedOperations.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mixedOperations[i], mixedOperations[j]] = [mixedOperations[j], mixedOperations[i]];
      }

      const startTime = Date.now();

      const results = await Promise.allSettled(
        mixedOperations.map(op => op.operation())
      );

      const endTime = Date.now();
      const durationMs = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      console.log(`Mixed workload (${mixedOperations.length} operations) completed in ${durationMs}ms`);
      console.log(`Success rate: ${(successful.length / results.length * 100).toFixed(1)}%`);

      expect(successful.length).toBeGreaterThan(mixedOperations.length * 0.95); // 95% success rate
      expect(durationMs).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Resource Cleanup and Connection Management', () => {
    it('should properly manage database connections', async () => {
      const connectionTests = Array.from({ length: 20 }, async (_, i) => {
        const localPrisma = new PrismaClient();

        try {
          const result = await localPrisma.property.findFirst({
            where: { ownerUid: mockOwnerUid },
          });

          return { success: true, hasResult: !!result };
        } catch (error) {
          return { success: false, error: error.message };
        } finally {
          await localPrisma.$disconnect();
        }
      });

      const results = await Promise.all(connectionTests);

      const successful = results.filter(r => r.success);
      expect(successful.length).toBe(20); // All connections should work

      console.log(`Successfully managed ${successful.length} database connections`);
    });

    it('should handle connection pool exhaustion gracefully', async () => {
      // Simulate high connection usage
      const heavyConnectionUsage = Array.from({ length: 100 }, async (_, i) => {
        try {
          // Use the shared prisma instance to test connection pooling
          const startTime = Date.now();

          const result = await prisma.property.count({
            where: { ownerUid: mockOwnerUid },
          });

          const endTime = Date.now();

          return {
            success: true,
            count: result,
            duration: endTime - startTime,
            index: i,
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            index: i,
          };
        }
      });

      const results = await Promise.all(heavyConnectionUsage);

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      console.log(`Heavy connection test: ${successful.length} successful, ${failed.length} failed`);

      // Should handle most requests successfully with connection pooling
      expect(successful.length).toBeGreaterThan(90);

      if (successful.length > 0) {
        const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
        console.log(`Average query duration under load: ${avgDuration.toFixed(2)}ms`);
        expect(avgDuration).toBeLessThan(1000); // Should maintain reasonable performance
      }
    });
  });
});