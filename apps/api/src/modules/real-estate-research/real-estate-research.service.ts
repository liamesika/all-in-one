import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
// Using string literals instead of enum import until Prisma client is properly generated
type SearchJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
import { PrismaService } from '../../lib/prisma.service';
import { CreateSearchJobDto } from './dto/create-search-job.dto';

@Injectable()
export class RealEstateResearchService {
  constructor(
    @InjectQueue('real-estate-search') private searchQueue: Queue,
    private prisma: PrismaService
  ) {}

  async createSearchJob(ownerUid: string, createSearchJobDto: CreateSearchJobDto) {
    const searchJob = await this.prisma.searchJob.create({
      data: {
        ownerUid,
        location: createSearchJobDto.location,
        minRooms: createSearchJobDto.minRooms,
        maxRooms: createSearchJobDto.maxRooms,
        minSize: createSearchJobDto.minSize,
        maxSize: createSearchJobDto.maxSize,
        minPrice: createSearchJobDto.minPrice,
        maxPrice: createSearchJobDto.maxPrice,
        keywords: createSearchJobDto.keywords || [],
        description: createSearchJobDto.description,
        status: 'QUEUED' as SearchJobStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    await this.searchQueue.add('process-search', {
      jobId: searchJob.id,
      searchParams: createSearchJobDto,
    }, {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      }
    });

    return { jobId: searchJob.id };
  }

  async getJobStatus(jobId: string, ownerUid: string) {
    const job = await this.prisma.searchJob.findFirst({
      where: { id: jobId, ownerUid },
      select: {
        id: true,
        status: true,
        progress: true,
        error: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        totalListings: true,
      }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }

  async getJobResults(jobId: string, ownerUid: string, page = 1, limit = 20, sortBy = 'aiScore', sortOrder: 'asc' | 'desc' = 'desc') {
    const job = await this.prisma.searchJob.findFirst({
      where: { id: jobId, ownerUid }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const skip = (page - 1) * limit;
    const orderBy = sortBy === 'aiScore' ? { aiScore: sortOrder } :
                   sortBy === 'price' ? { price: sortOrder } :
                   sortBy === 'size' ? { size: sortOrder } :
                   { createdAt: sortOrder };

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { searchJobId: jobId },
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          price: true,
          rooms: true,
          size: true,
          aiScore: true,
          aiNotes: true,
          sourceUrl: true,
          imageUrls: true,
          createdAt: true,
        }
      }),
      this.prisma.listing.count({
        where: { searchJobId: jobId }
      })
    ]);

    return {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}