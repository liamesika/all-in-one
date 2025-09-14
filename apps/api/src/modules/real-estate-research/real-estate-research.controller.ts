import { Controller, Post, Get, Body, Param, Query, Res, Headers, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { RealEstateResearchService } from './real-estate-research.service';
import { CreateSearchJobDto } from './dto/create-search-job.dto';

@Controller('real-estate/research')
export class RealEstateResearchController {
  constructor(private readonly researchService: RealEstateResearchService) {}

  @Post()
  async createSearchJob(
    @Headers('x-user-id') userId: string,
    @Body() createSearchJobDto: CreateSearchJobDto
  ) {
    if (!userId) {
      throw new Error('User ID required');
    }
    return this.researchService.createSearchJob(userId, createSearchJobDto);
  }

  @Get(':jobId/status')
  async getJobStatus(
    @Param('jobId') jobId: string,
    @Headers('x-user-id') userId: string
  ) {
    if (!userId) {
      throw new Error('User ID required');
    }
    return this.researchService.getJobStatus(jobId, userId);
  }

  @Get(':jobId/results')
  async getJobResults(
    @Param('jobId') jobId: string,
    @Headers('x-user-id') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('sortBy') sortBy = 'aiScore',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    if (!userId) {
      throw new Error('User ID required');
    }
    return this.researchService.getJobResults(
      jobId, 
      userId, 
      parseInt(page), 
      parseInt(limit),
      sortBy,
      sortOrder
    );
  }

  @Get(':jobId/stream')
  async streamJobUpdates(
    @Param('jobId') jobId: string,
    @Headers('x-user-id') userId: string,
    @Res() res: Response
  ) {
    if (!userId) {
      throw new Error('User ID required');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const intervalId = setInterval(async () => {
      try {
        const status = await this.researchService.getJobStatus(jobId, userId);
        sendEvent({ type: 'status', data: status });
        
        if (status.status === 'COMPLETED' || status.status === 'FAILED') {
          clearInterval(intervalId);
          res.end();
        }
      } catch (error) {
        sendEvent({ type: 'error', message: error.message });
        clearInterval(intervalId);
        res.end();
      }
    }, 2000);

    res.on('close', () => {
      clearInterval(intervalId);
    });
  }
}