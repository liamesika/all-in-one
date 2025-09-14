import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../lib/prisma.service';
// Using string literals instead of enum import until Prisma client is properly generated
type SearchJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
import OpenAI from 'openai';

interface SearchJobData {
  jobId: string;
  searchParams: {
    location?: string;
    minRooms?: number;
    maxRooms?: number;
    minSize?: number;
    maxSize?: number;
    minPrice?: number;
    maxPrice?: number;
    keywords?: string[];
    description?: string;
  };
}

@Processor('real-estate-search')
export class SearchProcessor {
  private readonly logger = new Logger(SearchProcessor.name);
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  @Process('process-search')
  async handleSearch(job: Job<SearchJobData>) {
    const { jobId, searchParams } = job.data;
    
    try {
      await this.updateJobStatus(jobId, 'PROCESSING', 10);
      
      const mockListings = await this.performSearch(searchParams);
      await this.updateJobStatus(jobId, 'PROCESSING', 50);
      
      const processedListings = await this.processListingsWithAI(mockListings, searchParams);
      await this.updateJobStatus(jobId, 'PROCESSING', 80);
      
      await this.saveListings(jobId, processedListings);
      await this.updateJobStatus(jobId, 'COMPLETED', 100, mockListings.length);
      
      this.logger.log(`Search job ${jobId} completed successfully with ${mockListings.length} listings`);
      
    } catch (error) {
      this.logger.error(`Search job ${jobId} failed:`, error);
      await this.updateJobStatus(jobId, 'FAILED', 0, 0, error.message);
      throw error;
    }
  }

  private async updateJobStatus(
    jobId: string, 
    status: SearchJobStatus, 
    progress: number, 
    totalListings?: number, 
    error?: string
  ) {
    const updateData: any = {
      status,
      progress,
      updatedAt: new Date(),
    };

    if (totalListings !== undefined) {
      updateData.totalListings = totalListings;
    }

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    if (error) {
      updateData.error = error;
    }

    await this.prisma.searchJob.update({
      where: { id: jobId },
      data: updateData,
    });
  }

  private async performSearch(searchParams: SearchJobData['searchParams']) {
    this.logger.log('Starting property search with params:', searchParams);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockListings = [
      {
        title: 'Modern 3BR Apartment in Tel Aviv Center',
        description: 'Beautiful modern apartment with high ceilings, fully renovated kitchen, and balcony facing north. Close to public transport and shopping centers.',
        location: 'Tel Aviv Center',
        price: 8500,
        rooms: 3,
        size: 85,
        sourceUrl: 'https://example.com/listing1',
        imageUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      },
      {
        title: 'Spacious 4BR Villa in Ramat Aviv',
        description: 'Luxury villa with garden, private parking, and swimming pool. Perfect for families. Recently renovated with modern appliances.',
        location: 'Ramat Aviv',
        price: 15000,
        rooms: 4,
        size: 150,
        sourceUrl: 'https://example.com/listing2',
        imageUrls: ['https://example.com/img3.jpg'],
      },
      {
        title: '2BR Cozy Apartment in Florentin',
        description: 'Charming apartment in the heart of Florentin, walking distance to cafes and nightlife. Original character with modern touches.',
        location: 'Florentin',
        price: 6500,
        rooms: 2,
        size: 65,
        sourceUrl: 'https://example.com/listing3',
        imageUrls: ['https://example.com/img4.jpg', 'https://example.com/img5.jpg'],
      },
      {
        title: '5BR Penthouse in Herzliya Pituach',
        description: 'Stunning penthouse with sea view, private rooftop terrace, and premium finishes throughout. Located in prestigious area.',
        location: 'Herzliya Pituach',
        price: 25000,
        rooms: 5,
        size: 200,
        sourceUrl: 'https://example.com/listing4',
        imageUrls: ['https://example.com/img6.jpg'],
      },
      {
        title: '3BR Garden Apartment in Givatayim',
        description: 'Ground floor apartment with private garden, perfect for families with children. Quiet neighborhood with easy access to Tel Aviv.',
        location: 'Givatayim',
        price: 7800,
        rooms: 3,
        size: 90,
        sourceUrl: 'https://example.com/listing5',
        imageUrls: ['https://example.com/img7.jpg', 'https://example.com/img8.jpg'],
      },
    ];

    return mockListings;
  }

  private async processListingsWithAI(listings: any[], searchParams: SearchJobData['searchParams']) {
    if (!this.openai) {
      return listings.map(listing => ({
        ...listing,
        aiScore: Math.random() * 100,
        aiNotes: 'AI processing not available - missing OpenAI API key',
      }));
    }

    const processedListings = [];
    
    for (const listing of listings) {
      try {
        const prompt = this.buildAIPrompt(listing, searchParams);
        
        const response = await this.openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS_PER_JOB || '500'),
        });

        const aiResponse = response.choices[0].message.content;
        const { score, notes } = this.parseAIResponse(aiResponse);

        processedListings.push({
          ...listing,
          aiScore: score,
          aiNotes: notes,
        });
        
      } catch (error) {
        this.logger.warn(`AI processing failed for listing ${listing.title}:`, error);
        processedListings.push({
          ...listing,
          aiScore: 50,
          aiNotes: `AI processing failed: ${error.message}`,
        });
      }
    }

    return processedListings;
  }

  private buildAIPrompt(listing: any, searchParams: SearchJobData['searchParams']): string {
    return `
Please analyze this real estate listing and rate it on a scale of 0-100 based on how well it matches the search criteria.

SEARCH CRITERIA:
- Location: ${searchParams.location || 'Any'}
- Rooms: ${searchParams.minRooms || 'Any'} - ${searchParams.maxRooms || 'Any'}
- Size: ${searchParams.minSize || 'Any'}m² - ${searchParams.maxSize || 'Any'}m²
- Price: ₪${searchParams.minPrice || 'Any'} - ₪${searchParams.maxPrice || 'Any'}
- Keywords: ${searchParams.keywords?.join(', ') || 'None'}
- Description: ${searchParams.description || 'None'}

LISTING:
Title: ${listing.title}
Description: ${listing.description}
Location: ${listing.location}
Price: ₪${listing.price}
Rooms: ${listing.rooms}
Size: ${listing.size}m²

Please respond in the following JSON format:
{
  "score": [number from 0-100],
  "notes": "[brief explanation of the score, highlighting matches and mismatches with criteria]"
}
    `.trim();
  }

  private parseAIResponse(response: string): { score: number; notes: string } {
    try {
      const parsed = JSON.parse(response);
      return {
        score: Math.min(100, Math.max(0, parsed.score || 50)),
        notes: parsed.notes || 'AI analysis completed',
      };
    } catch (error) {
      return {
        score: 50,
        notes: 'Failed to parse AI response',
      };
    }
  }

  private async saveListings(jobId: string, listings: any[]) {
    for (const listing of listings) {
      await this.prisma.listing.create({
        data: {
          searchJobId: jobId,
          title: listing.title,
          description: listing.description,
          location: listing.location,
          price: listing.price,
          rooms: listing.rooms,
          size: listing.size,
          aiScore: listing.aiScore,
          aiNotes: listing.aiNotes,
          sourceUrl: listing.sourceUrl,
          imageUrls: listing.imageUrls,
          createdAt: new Date(),
        },
      });
    }
  }
}