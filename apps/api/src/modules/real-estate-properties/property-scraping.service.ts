import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface ScrapedProperty {
  externalId: string;
  name: string;
  address?: string;
  city?: string;
  neighborhood?: string;
  description?: string;
  price?: number;
  currency?: string;
  rooms?: number;
  size?: number;
  floor?: number;
  yearBuilt?: number;
  type?: string;
  agentName?: string;
  agentPhone?: string;
  photos?: string[];
  amenities?: string;
  provider: 'YAD2' | 'MADLAN';
  externalUrl: string;
  rawData?: any;
}

@Injectable()
export class PropertyScrapingService {
  private readonly logger = new Logger(PropertyScrapingService.name);

  async scrapeProperty(url: string): Promise<ScrapedProperty> {
    try {
      const provider = this.detectProvider(url);
      
      if (provider === 'YAD2') {
        return await this.scrapeYad2Property(url);
      } else if (provider === 'MADLAN') {
        return await this.scrapeMadlanProperty(url);
      } else {
        throw new Error(`Unsupported URL provider: ${url}`);
      }
    } catch (error) {
      this.logger.error(`Failed to scrape property from ${url}`, error);
      throw error;
    }
  }

  private detectProvider(url: string): 'YAD2' | 'MADLAN' | null {
    if (url.includes('yad2.co.il') || url.includes('yad2.com')) {
      return 'YAD2';
    } else if (url.includes('madlan.co.il') || url.includes('madlan.com')) {
      return 'MADLAN';
    }
    return null;
  }

  private async scrapeYad2Property(url: string): Promise<ScrapedProperty> {
    this.logger.log(`Scraping Yad2 property: ${url}`);
    
    try {
      // Fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract external ID from URL
      const externalId = this.extractYad2Id(url);
      
      // Extract basic property information
      const name = this.extractYad2Title($);
      const price = this.extractYad2Price($);
      const address = this.extractYad2Address($);
      const city = this.extractYad2City($);
      const neighborhood = this.extractYad2Neighborhood($);
      const description = this.extractYad2Description($);
      const rooms = this.extractYad2Rooms($);
      const size = this.extractYad2Size($);
      const floor = this.extractYad2Floor($);
      const type = this.extractYad2Type($);
      const agentInfo = this.extractYad2AgentInfo($);
      const photos = this.extractYad2Photos($);
      const amenities = this.extractYad2Amenities($);

      const property: ScrapedProperty = {
        externalId,
        name,
        address,
        city,
        neighborhood,
        description,
        price,
        currency: 'ILS',
        rooms,
        size,
        floor,
        type,
        agentName: agentInfo.name,
        agentPhone: agentInfo.phone,
        photos,
        amenities,
        provider: 'YAD2',
        externalUrl: url,
        rawData: {
          scrapedAt: new Date(),
          html: html.length > 50000 ? '[Too large to store]' : html
        }
      };

      this.logger.log(`Successfully scraped Yad2 property: ${name}`);
      return property;

    } catch (error) {
      this.logger.error(`Failed to scrape Yad2 property: ${url}`, error);
      throw new Error(`Failed to scrape Yad2 property: ${error.message}`);
    }
  }

  private async scrapeMadlanProperty(url: string): Promise<ScrapedProperty> {
    this.logger.log(`Scraping Madlan property: ${url}`);
    
    try {
      // Fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract external ID from URL
      const externalId = this.extractMadlanId(url);
      
      // Extract basic property information
      const name = this.extractMadlanTitle($);
      const price = this.extractMadlanPrice($);
      const address = this.extractMadlanAddress($);
      const city = this.extractMadlanCity($);
      const neighborhood = this.extractMadlanNeighborhood($);
      const description = this.extractMadlanDescription($);
      const rooms = this.extractMadlanRooms($);
      const size = this.extractMadlanSize($);
      const floor = this.extractMadlanFloor($);
      const type = this.extractMadlanType($);
      const agentInfo = this.extractMadlanAgentInfo($);
      const photos = this.extractMadlanPhotos($);
      const amenities = this.extractMadlanAmenities($);

      const property: ScrapedProperty = {
        externalId,
        name,
        address,
        city,
        neighborhood,
        description,
        price,
        currency: 'ILS',
        rooms,
        size,
        floor,
        type,
        agentName: agentInfo.name,
        agentPhone: agentInfo.phone,
        photos,
        amenities,
        provider: 'MADLAN',
        externalUrl: url,
        rawData: {
          scrapedAt: new Date(),
          html: html.length > 50000 ? '[Too large to store]' : html
        }
      };

      this.logger.log(`Successfully scraped Madlan property: ${name}`);
      return property;

    } catch (error) {
      this.logger.error(`Failed to scrape Madlan property: ${url}`, error);
      throw new Error(`Failed to scrape Madlan property: ${error.message}`);
    }
  }

  // Yad2 extraction methods
  private extractYad2Id(url: string): string {
    const match = url.match(/\/item\/(\d+)/);
    return match?.[1] || url.split('/').pop() || 'unknown';
  }

  private extractYad2Title($: cheerio.CheerioAPI): string {
    // Try multiple selectors for title
    return $('.item-title h1').text().trim() ||
           $('h1[data-testid="item-title"]').text().trim() ||
           $('.title-wrapper h1').text().trim() ||
           $('title').text().replace(' - יד2', '').trim() ||
           'נכס מיובא מיד2';
  }

  private extractYad2Price($: cheerio.CheerioAPI): number | undefined {
    const priceText = $('.price-container .price').text().trim() ||
                     $('[data-testid="price"]').text().trim() ||
                     $('.item-price').text().trim();
    
    const price = priceText.replace(/[^\d]/g, '');
    return price ? parseInt(price) : undefined;
  }

  private extractYad2Address($: cheerio.CheerioAPI): string | undefined {
    return $('.address-wrapper .address').text().trim() ||
           $('[data-testid="address"]').text().trim() ||
           $('.item-address').text().trim() || undefined;
  }

  private extractYad2City($: cheerio.CheerioAPI): string | undefined {
    const address = this.extractYad2Address($);
    if (address) {
      // Try to extract city from address
      const parts = address.split(',');
      return parts[parts.length - 1]?.trim();
    }
    return $('.breadcrumbs a').last().text().trim() || undefined;
  }

  private extractYad2Neighborhood($: cheerio.CheerioAPI): string | undefined {
    const address = this.extractYad2Address($);
    if (address) {
      const parts = address.split(',');
      if (parts.length > 1) {
        return parts[parts.length - 2]?.trim();
      }
    }
    return undefined;
  }

  private extractYad2Description($: cheerio.CheerioAPI): string | undefined {
    return $('.item-description-text').text().trim() ||
           $('.description-text').text().trim() ||
           $('[data-testid="description"]').text().trim() || undefined;
  }

  private extractYad2Rooms($: cheerio.CheerioAPI): number | undefined {
    const roomsText = $('.rooms-value').text().trim() ||
                     $('[data-testid="rooms"]').text().trim() ||
                     $('.item-rooms').text().trim();
    
    const rooms = roomsText.replace(/[^\d.]/g, '');
    return rooms ? parseFloat(rooms) : undefined;
  }

  private extractYad2Size($: cheerio.CheerioAPI): number | undefined {
    const sizeText = $('.size-value').text().trim() ||
                    $('[data-testid="size"]').text().trim() ||
                    $('.item-size').text().trim();
    
    const size = sizeText.replace(/[^\d]/g, '');
    return size ? parseInt(size) : undefined;
  }

  private extractYad2Floor($: cheerio.CheerioAPI): number | undefined {
    const floorText = $('.floor-value').text().trim() ||
                     $('[data-testid="floor"]').text().trim() ||
                     $('.item-floor').text().trim();
    
    const floor = floorText.replace(/[^\d]/g, '');
    return floor ? parseInt(floor) : undefined;
  }

  private extractYad2Type($: cheerio.CheerioAPI): string | undefined {
    return $('.property-type').text().trim() ||
           $('[data-testid="property-type"]').text().trim() ||
           $('.item-type').text().trim() || undefined;
  }

  private extractYad2AgentInfo($: cheerio.CheerioAPI): { name?: string; phone?: string } {
    const name = $('.agent-name').text().trim() ||
                $('.contact-name').text().trim() ||
                $('[data-testid="agent-name"]').text().trim();
    
    const phone = $('.agent-phone').text().trim() ||
                 $('.contact-phone').text().trim() ||
                 $('[data-testid="agent-phone"]').text().trim();

    return { name: name || undefined, phone: phone || undefined };
  }

  private extractYad2Photos($: cheerio.CheerioAPI): string[] {
    const photos: string[] = [];
    
    $('.gallery-image img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.includes('placeholder')) {
        photos.push(src);
      }
    });

    $('.image-gallery img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.includes('placeholder')) {
        photos.push(src);
      }
    });

    return [...new Set(photos)]; // Remove duplicates
  }

  private extractYad2Amenities($: cheerio.CheerioAPI): string | undefined {
    const amenities: string[] = [];
    
    $('.amenities-list li').each((_, el) => {
      const amenity = $(el).text().trim();
      if (amenity) amenities.push(amenity);
    });

    $('.features-list li').each((_, el) => {
      const feature = $(el).text().trim();
      if (feature) amenities.push(feature);
    });

    return amenities.length > 0 ? amenities.join(', ') : undefined;
  }

  // Madlan extraction methods
  private extractMadlanId(url: string): string {
    const match = url.match(/\/property\/(\d+)/);
    return match?.[1] || url.split('/').pop() || 'unknown';
  }

  private extractMadlanTitle($: cheerio.CheerioAPI): string {
    return $('.property-title h1').text().trim() ||
           $('h1[data-testid="property-title"]').text().trim() ||
           $('.main-title').text().trim() ||
           $('title').text().replace(' - מדלן', '').trim() ||
           'נכס מיובא ממדלן';
  }

  private extractMadlanPrice($: cheerio.CheerioAPI): number | undefined {
    const priceText = $('.price-display .price').text().trim() ||
                     $('[data-testid="price"]').text().trim() ||
                     $('.property-price').text().trim();
    
    const price = priceText.replace(/[^\d]/g, '');
    return price ? parseInt(price) : undefined;
  }

  private extractMadlanAddress($: cheerio.CheerioAPI): string | undefined {
    return $('.property-address .address').text().trim() ||
           $('[data-testid="address"]').text().trim() ||
           $('.address-display').text().trim() || undefined;
  }

  private extractMadlanCity($: cheerio.CheerioAPI): string | undefined {
    const address = this.extractMadlanAddress($);
    if (address) {
      const parts = address.split(',');
      return parts[parts.length - 1]?.trim();
    }
    return $('.location-breadcrumb a').last().text().trim() || undefined;
  }

  private extractMadlanNeighborhood($: cheerio.CheerioAPI): string | undefined {
    const address = this.extractMadlanAddress($);
    if (address) {
      const parts = address.split(',');
      if (parts.length > 1) {
        return parts[parts.length - 2]?.trim();
      }
    }
    return undefined;
  }

  private extractMadlanDescription($: cheerio.CheerioAPI): string | undefined {
    return $('.property-description .description-text').text().trim() ||
           $('.description-content').text().trim() ||
           $('[data-testid="description"]').text().trim() || undefined;
  }

  private extractMadlanRooms($: cheerio.CheerioAPI): number | undefined {
    const roomsText = $('.rooms-count').text().trim() ||
                     $('[data-testid="rooms"]').text().trim() ||
                     $('.property-rooms').text().trim();
    
    const rooms = roomsText.replace(/[^\d.]/g, '');
    return rooms ? parseFloat(rooms) : undefined;
  }

  private extractMadlanSize($: cheerio.CheerioAPI): number | undefined {
    const sizeText = $('.property-size').text().trim() ||
                    $('[data-testid="size"]').text().trim() ||
                    $('.size-display').text().trim();
    
    const size = sizeText.replace(/[^\d]/g, '');
    return size ? parseInt(size) : undefined;
  }

  private extractMadlanFloor($: cheerio.CheerioAPI): number | undefined {
    const floorText = $('.property-floor').text().trim() ||
                     $('[data-testid="floor"]').text().trim() ||
                     $('.floor-display').text().trim();
    
    const floor = floorText.replace(/[^\d]/g, '');
    return floor ? parseInt(floor) : undefined;
  }

  private extractMadlanType($: cheerio.CheerioAPI): string | undefined {
    return $('.property-type-display').text().trim() ||
           $('[data-testid="property-type"]').text().trim() ||
           $('.type-badge').text().trim() || undefined;
  }

  private extractMadlanAgentInfo($: cheerio.CheerioAPI): { name?: string; phone?: string } {
    const name = $('.agent-info .agent-name').text().trim() ||
                $('.contact-details .name').text().trim() ||
                $('[data-testid="agent-name"]').text().trim();
    
    const phone = $('.agent-info .agent-phone').text().trim() ||
                 $('.contact-details .phone').text().trim() ||
                 $('[data-testid="agent-phone"]').text().trim();

    return { name: name || undefined, phone: phone || undefined };
  }

  private extractMadlanPhotos($: cheerio.CheerioAPI): string[] {
    const photos: string[] = [];
    
    $('.property-gallery img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.includes('placeholder')) {
        photos.push(src);
      }
    });

    $('.images-carousel img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.includes('placeholder')) {
        photos.push(src);
      }
    });

    return [...new Set(photos)]; // Remove duplicates
  }

  private extractMadlanAmenities($: cheerio.CheerioAPI): string | undefined {
    const amenities: string[] = [];
    
    $('.property-features li').each((_, el) => {
      const feature = $(el).text().trim();
      if (feature) amenities.push(feature);
    });

    $('.amenities-grid .amenity').each((_, el) => {
      const amenity = $(el).text().trim();
      if (amenity) amenities.push(amenity);
    });

    return amenities.length > 0 ? amenities.join(', ') : undefined;
  }
}