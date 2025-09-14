import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PropertyScrapingService, ScrapedProperty } from './property-scraping.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

export interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  duplicates: number;
  errors: number;
  details: ImportDetail[];
}

export interface ImportDetail {
  url?: string;
  externalId?: string;
  status: 'imported' | 'updated' | 'duplicate' | 'error';
  message?: string;
  propertyId?: string;
  property?: any;
}

export interface BulkImportOptions {
  urls?: string[];
  csvData?: any[];
  skipDuplicates?: boolean;
  updateExisting?: boolean;
}

@Injectable()
export class PropertyImportService {
  private readonly logger = new Logger(PropertyImportService.name);
  private prisma = new PrismaClient();

  constructor(private readonly scrapingService: PropertyScrapingService) {}

  async importSingleProperty(ownerUid: string, url: string): Promise<ImportResult> {
    this.logger.log(`Starting single property import for: ${url}`);

    try {
      // Create import batch record
      const batch = await this.prisma.propertyImportBatch.create({
        data: {
          ownerUid,
          source: this.detectProvider(url),
          importType: 'single_url',
          urls: [url],
          totalItems: 1,
          status: 'processing'
        }
      });

      const result: ImportResult = {
        success: false,
        imported: 0,
        updated: 0,
        duplicates: 0,
        errors: 0,
        details: []
      };

      try {
        // Scrape property data
        const scrapedProperty = await this.scrapingService.scrapeProperty(url);
        
        // Check for existing property
        const existingProperty = await this.findExistingProperty(ownerUid, scrapedProperty);
        
        if (existingProperty) {
          // Update existing property
          const updatedProperty = await this.updateExistingProperty(existingProperty.id, scrapedProperty);
          
          result.updated = 1;
          result.details.push({
            url,
            externalId: scrapedProperty.externalId,
            status: 'updated',
            message: 'Property updated successfully',
            propertyId: updatedProperty.id,
            property: updatedProperty
          });
        } else {
          // Create new property
          const newProperty = await this.createNewProperty(ownerUid, scrapedProperty);
          
          result.imported = 1;
          result.details.push({
            url,
            externalId: scrapedProperty.externalId,
            status: 'imported',
            message: 'Property imported successfully',
            propertyId: newProperty.id,
            property: newProperty
          });
        }

        result.success = true;

        // Update batch status
        await this.prisma.propertyImportBatch.update({
          where: { id: batch.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            importedItems: result.imported,
            updatedItems: result.updated,
            duplicateItems: result.duplicates,
            errorItems: result.errors,
            progress: 100,
            summary: result
          }
        });

      } catch (error) {
        this.logger.error(`Error importing property from ${url}:`, error);
        
        result.errors = 1;
        result.details.push({
          url,
          status: 'error',
          message: error.message || 'Unknown error occurred'
        });

        // Update batch with error
        await this.prisma.propertyImportBatch.update({
          where: { id: batch.id },
          data: {
            status: 'failed',
            completedAt: new Date(),
            errorItems: 1,
            errors: [{ url, error: error.message }],
            summary: result
          }
        });
      }

      return result;

    } catch (error) {
      this.logger.error(`Failed to import single property:`, error);
      throw new BadRequestException(`Import failed: ${error.message}`);
    }
  }

  async importBulkProperties(ownerUid: string, options: BulkImportOptions): Promise<ImportResult> {
    this.logger.log(`Starting bulk property import for ${options.urls?.length || options.csvData?.length || 0} items`);

    const urls = options.urls || [];
    const csvData = options.csvData || [];
    const totalItems = urls.length + csvData.length;

    // Create import batch record
    const batch = await this.prisma.propertyImportBatch.create({
      data: {
        ownerUid,
        source: urls.length > 0 ? this.detectProvider(urls[0]) : 'MANUAL',
        importType: urls.length > 0 ? 'bulk_urls' : 'csv',
        urls: urls.length > 0 ? urls : undefined,
        totalItems,
        status: 'processing'
      }
    });

    const result: ImportResult = {
      success: false,
      imported: 0,
      updated: 0,
      duplicates: 0,
      errors: 0,
      details: []
    };

    try {
      // Process URLs
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        
        try {
          // Update progress
          await this.updateBatchProgress(batch.id, Math.floor((i / totalItems) * 100), `Processing URL: ${url}`);
          
          const scrapedProperty = await this.scrapingService.scrapeProperty(url);
          const existingProperty = await this.findExistingProperty(ownerUid, scrapedProperty);
          
          if (existingProperty && !options.updateExisting) {
            result.duplicates++;
            result.details.push({
              url,
              externalId: scrapedProperty.externalId,
              status: 'duplicate',
              message: 'Property already exists',
              propertyId: existingProperty.id
            });
          } else if (existingProperty && options.updateExisting) {
            const updatedProperty = await this.updateExistingProperty(existingProperty.id, scrapedProperty);
            result.updated++;
            result.details.push({
              url,
              externalId: scrapedProperty.externalId,
              status: 'updated',
              message: 'Property updated successfully',
              propertyId: updatedProperty.id,
              property: updatedProperty
            });
          } else {
            const newProperty = await this.createNewProperty(ownerUid, scrapedProperty);
            result.imported++;
            result.details.push({
              url,
              externalId: scrapedProperty.externalId,
              status: 'imported',
              message: 'Property imported successfully',
              propertyId: newProperty.id,
              property: newProperty
            });
          }
        } catch (error) {
          this.logger.error(`Error processing URL ${url}:`, error);
          result.errors++;
          result.details.push({
            url,
            status: 'error',
            message: error.message || 'Failed to scrape property'
          });
        }
      }

      // Process CSV data
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        
        try {
          // Update progress
          await this.updateBatchProgress(batch.id, Math.floor(((urls.length + i) / totalItems) * 100), `Processing CSV row: ${i + 1}`);
          
          const property = await this.createPropertyFromCsvRow(ownerUid, row);
          result.imported++;
          result.details.push({
            status: 'imported',
            message: 'Property created from CSV',
            propertyId: property.id,
            property
          });
        } catch (error) {
          this.logger.error(`Error processing CSV row ${i + 1}:`, error);
          result.errors++;
          result.details.push({
            status: 'error',
            message: `CSV row ${i + 1}: ${error.message}`
          });
        }
      }

      result.success = result.errors < totalItems;

      // Update final batch status
      await this.prisma.propertyImportBatch.update({
        where: { id: batch.id },
        data: {
          status: result.success ? 'completed' : 'failed',
          completedAt: new Date(),
          importedItems: result.imported,
          updatedItems: result.updated,
          duplicateItems: result.duplicates,
          errorItems: result.errors,
          progress: 100,
          summary: result
        }
      });

      return result;

    } catch (error) {
      this.logger.error(`Bulk import failed:`, error);
      
      // Update batch with error
      await this.prisma.propertyImportBatch.update({
        where: { id: batch.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errors: [{ error: error.message }]
        }
      });

      throw new BadRequestException(`Bulk import failed: ${error.message}`);
    }
  }

  async getImportBatches(ownerUid: string, limit = 20): Promise<any[]> {
    return await this.prisma.propertyImportBatch.findMany({
      where: { ownerUid },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getImportBatch(ownerUid: string, batchId: string): Promise<any> {
    return await this.prisma.propertyImportBatch.findFirst({
      where: { id: batchId, ownerUid }
    });
  }

  private detectProvider(url: string): 'YAD2' | 'MADLAN' | 'MANUAL' {
    if (url.includes('yad2.co.il') || url.includes('yad2.com')) {
      return 'YAD2';
    } else if (url.includes('madlan.co.il') || url.includes('madlan.com')) {
      return 'MADLAN';
    }
    return 'MANUAL';
  }

  private async findExistingProperty(ownerUid: string, scrapedProperty: ScrapedProperty): Promise<any> {
    // First try to find by external ID and provider
    const byExternalId = await this.prisma.property.findFirst({
      where: {
        ownerUid,
        provider: scrapedProperty.provider,
        externalId: scrapedProperty.externalId
      }
    });

    if (byExternalId) {
      return byExternalId;
    }

    // Then try to find potential duplicates by address and price
    if (scrapedProperty.address && scrapedProperty.price) {
      const byAddressAndPrice = await this.prisma.property.findFirst({
        where: {
          ownerUid,
          address: { contains: scrapedProperty.address, mode: 'insensitive' },
          price: scrapedProperty.price
        }
      });

      if (byAddressAndPrice) {
        return byAddressAndPrice;
      }
    }

    return null;
  }

  private async createNewProperty(ownerUid: string, scrapedProperty: ScrapedProperty): Promise<any> {
    const slug = await this.ensureUniqueSlug(scrapedProperty.name || 'imported-property', ownerUid);

    const data: any = {
      ownerUid,
      name: scrapedProperty.name || 'Imported Property',
      address: scrapedProperty.address || '',
      city: scrapedProperty.city || '',
      neighborhood: scrapedProperty.neighborhood || '',
      description: scrapedProperty.description || '',
      price: scrapedProperty.price,
      currency: scrapedProperty.currency || 'ILS',
      rooms: scrapedProperty.rooms,
      size: scrapedProperty.size,
      floor: scrapedProperty.floor,
      yearBuilt: scrapedProperty.yearBuilt,
      agentName: scrapedProperty.agentName,
      agentPhone: scrapedProperty.agentPhone,
      amenities: scrapedProperty.amenities,
      slug,
      provider: scrapedProperty.provider,
      externalId: scrapedProperty.externalId,
      externalUrl: scrapedProperty.externalUrl,
      syncStatus: 'SUCCESS',
      lastSyncAt: new Date(),
      syncData: scrapedProperty.rawData,
      needsReview: false
    };

    // Map property type
    if (scrapedProperty.type) {
      data.type = this.mapPropertyType(scrapedProperty.type);
    }

    const property = await this.prisma.property.create({
      data,
      include: { photos: true }
    });

    // Create photos if available
    if (scrapedProperty.photos && scrapedProperty.photos.length > 0) {
      await this.createPropertyPhotos(property.id, scrapedProperty.photos);
    }

    return property;
  }

  private async updateExistingProperty(propertyId: string, scrapedProperty: ScrapedProperty): Promise<any> {
    const data: any = {
      name: scrapedProperty.name,
      address: scrapedProperty.address,
      city: scrapedProperty.city,
      neighborhood: scrapedProperty.neighborhood,
      description: scrapedProperty.description,
      price: scrapedProperty.price,
      currency: scrapedProperty.currency || 'ILS',
      rooms: scrapedProperty.rooms,
      size: scrapedProperty.size,
      floor: scrapedProperty.floor,
      yearBuilt: scrapedProperty.yearBuilt,
      agentName: scrapedProperty.agentName,
      agentPhone: scrapedProperty.agentPhone,
      amenities: scrapedProperty.amenities,
      externalUrl: scrapedProperty.externalUrl,
      syncStatus: 'SUCCESS',
      lastSyncAt: new Date(),
      syncData: scrapedProperty.rawData,
      updatedAt: new Date()
    };

    // Map property type
    if (scrapedProperty.type) {
      data.type = this.mapPropertyType(scrapedProperty.type);
    }

    return await this.prisma.property.update({
      where: { id: propertyId },
      data,
      include: { photos: true }
    });
  }

  private async createPropertyFromCsvRow(ownerUid: string, row: any): Promise<any> {
    const slug = await this.ensureUniqueSlug(row.name || 'csv-import', ownerUid);

    const data: any = {
      ownerUid,
      name: row.name || 'CSV Import',
      address: row.address || '',
      city: row.city || '',
      neighborhood: row.neighborhood || '',
      description: row.description || '',
      price: row.price ? parseInt(row.price) : undefined,
      currency: row.currency || 'ILS',
      rooms: row.rooms ? parseFloat(row.rooms) : undefined,
      size: row.size ? parseInt(row.size) : undefined,
      floor: row.floor ? parseInt(row.floor) : undefined,
      agentName: row.agentName || '',
      agentPhone: row.agentPhone || '',
      amenities: row.amenities || '',
      slug,
      provider: 'MANUAL',
      syncStatus: 'IDLE'
    };

    // Map property type
    if (row.type) {
      data.type = this.mapPropertyType(row.type);
    }

    return await this.prisma.property.create({
      data,
      include: { photos: true }
    });
  }

  private async createPropertyPhotos(propertyId: string, photoUrls: string[]): Promise<void> {
    const photoData = photoUrls.map((url, index) => ({
      propertyId,
      url,
      sortIndex: index
    }));

    await this.prisma.propertyPhoto.createMany({
      data: photoData
    });
  }

  private async ensureUniqueSlug(base: string, ownerUid: string): Promise<string> {
    const baseSlug = this.slugify(base);
    let slug = baseSlug || `${Date.now()}`;
    let n = 1;
    
    while (true) {
      const exists = await this.prisma.property.findFirst({ 
        where: { ownerUid, slug } 
      });
      if (!exists) return slug;
      slug = `${baseSlug}-${n++}`;
    }
  }

  private slugify(input: string): string {
    return (input || '')
      .normalize('NFKD')
      .replace(/[^\\p{L}\\p{N}\\s-]/gu, '')
      .trim()
      .replace(/\\s+/g, '-')
      .toLowerCase();
  }

  private mapPropertyType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'דירה': 'APARTMENT',
      'בית': 'HOUSE',
      'וילה': 'VILLA',
      'פנטהאוז': 'PENTHOUSE',
      'דופלקס': 'DUPLEX',
      'קוטג': 'COTTAGE',
      'משרד': 'OFFICE',
      'חנות': 'STORE',
      'מגרש': 'LOT',
      'מסחרי': 'COMMERCIAL',
      'apartment': 'APARTMENT',
      'house': 'HOUSE',
      'villa': 'VILLA',
      'penthouse': 'PENTHOUSE',
      'duplex': 'DUPLEX',
      'cottage': 'COTTAGE',
      'office': 'OFFICE',
      'store': 'STORE',
      'lot': 'LOT',
      'commercial': 'COMMERCIAL'
    };

    return typeMap[type.toLowerCase()] || 'OTHER';
  }

  private async updateBatchProgress(batchId: string, progress: number, currentItem?: string): Promise<void> {
    await this.prisma.propertyImportBatch.update({
      where: { id: batchId },
      data: {
        progress,
        currentItem
      }
    });
  }
}