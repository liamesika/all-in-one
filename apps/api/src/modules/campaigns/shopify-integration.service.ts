import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

export interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  closed_at?: string;
  financial_status: string;
  fulfillment_status?: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    created_at: string;
  };
  billing_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    country: string;
    phone?: string;
  };
  line_items: Array<{
    id: number;
    product_id: number;
    variant_id: number;
    title: string;
    quantity: number;
    price: string;
    total_discount: string;
  }>;
  note_attributes: Array<{
    name: string;
    value: string;
  }>;
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  orders_count: number;
  total_spent: string;
  tags: string;
  addresses: Array<{
    id: number;
    address1: string;
    city: string;
    country: string;
    phone?: string;
  }>;
}

export interface ConversionResult {
  success: boolean;
  conversions: number;
  orders: number;
  totalRevenue: number;
  details: ConversionDetail[];
}

export interface ConversionDetail {
  leadId?: string;
  orderId?: string;
  customerId?: string;
  status: 'converted' | 'existing' | 'no-match' | 'error';
  revenue?: number;
  message?: string;
}

@Injectable()
export class ShopifyIntegrationService {
  private readonly logger = new Logger(ShopifyIntegrationService.name);
  private prisma = new PrismaClient();

  /**
   * Sync orders from Shopify and link to existing leads
   */
  async syncShopifyOrders(ownerUid: string, shopifyUrl?: string, accessToken?: string): Promise<ConversionResult> {
    this.logger.log(`Starting Shopify orders sync for owner: ${ownerUid}`);

    const result: ConversionResult = {
      success: false,
      conversions: 0,
      orders: 0,
      totalRevenue: 0,
      details: []
    };

    try {
      // For demonstration, we'll use mock data
      // In production, this would make API calls to Shopify
      const mockOrders: ShopifyOrder[] = [
        {
          id: 1001,
          name: '#1001',
          email: 'john.doe@example.com',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:35:00Z',
          financial_status: 'paid',
          fulfillment_status: 'fulfilled',
          total_price: '299.00',
          subtotal_price: '249.00',
          total_tax: '50.00',
          currency: 'ILS',
          customer: {
            id: 2001,
            email: 'john.doe@example.com',
            first_name: 'John',
            last_name: 'Doe',
            phone: '+972501234567',
            created_at: '2024-01-10T09:00:00Z'
          },
          billing_address: {
            first_name: 'John',
            last_name: 'Doe',
            address1: '123 Main St',
            city: 'Tel Aviv',
            country: 'Israel',
            phone: '+972501234567'
          },
          line_items: [
            {
              id: 3001,
              product_id: 4001,
              variant_id: 5001,
              title: 'Premium Product',
              quantity: 1,
              price: '249.00',
              total_discount: '0.00'
            }
          ],
          note_attributes: [
            { name: 'utm_source', value: 'facebook' },
            { name: 'utm_campaign', value: 'holiday_sale' },
            { name: 'utm_medium', value: 'paid-social' }
          ]
        }
      ];

      for (const order of mockOrders) {
        try {
          // Find matching lead by email
          const matchingLead = await this.findMatchingLead(ownerUid, order);

          if (matchingLead) {
            // Update lead to converted status
            await this.convertLeadToCustomer(matchingLead.id, order);

            // Create order record for tracking
            await this.createOrderRecord(ownerUid, order, matchingLead.id);

            result.conversions++;
            result.totalRevenue += parseFloat(order.total_price);
            result.details.push({
              leadId: matchingLead.id,
              orderId: order.id.toString(),
              customerId: order.customer.id.toString(),
              status: 'converted',
              revenue: parseFloat(order.total_price),
              message: `Lead converted to customer with order ${order.name}`
            });
          } else {
            // Create customer record without matching lead
            await this.createOrderRecord(ownerUid, order);

            result.details.push({
              orderId: order.id.toString(),
              customerId: order.customer.id.toString(),
              status: 'no-match',
              revenue: parseFloat(order.total_price),
              message: 'Order imported but no matching lead found'
            });
          }

          result.orders++;
        } catch (error) {
          this.logger.error(`Error processing order ${order.id}:`, error);
          result.details.push({
            orderId: order.id.toString(),
            status: 'error',
            message: error.message || 'Failed to process order'
          });
        }
      }

      result.success = result.details.length > 0;
      this.logger.log(`Shopify sync completed: ${result.conversions} conversions, ${result.orders} orders, ₪${result.totalRevenue} revenue`);

      return result;
    } catch (error) {
      this.logger.error('Shopify sync failed:', error);
      throw error;
    }
  }

  /**
   * Get conversion tracking data
   */
  async getConversionTracking(ownerUid: string, dateFrom?: string, dateTo?: string): Promise<any> {
    const whereClause: any = { ownerUid };

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
      if (dateTo) whereClause.createdAt.lte = new Date(dateTo);
    }

    // Get converted leads
    const convertedLeads = await this.prisma.ecommerceLead.findMany({
      where: {
        ...whereClause,
        status: 'CONVERTED'
      },
      include: {
        // Include order data if we have the relation
      }
    });

    // Get campaign attribution data
    const attributionData = await this.aggregateAttributionData(ownerUid, dateFrom, dateTo);

    return {
      totalLeads: await this.prisma.ecommerceLead.count({ where: whereClause }),
      convertedLeads: convertedLeads.length,
      conversionRate: convertedLeads.length > 0 ? (convertedLeads.length / await this.prisma.ecommerceLead.count({ where: whereClause })) * 100 : 0,
      totalRevenue: convertedLeads.reduce((sum, lead) => sum + (lead.orderValue || 0), 0),
      attribution: attributionData,
      recentConversions: convertedLeads.slice(0, 10)
    };
  }

  private async findMatchingLead(ownerUid: string, order: ShopifyOrder): Promise<any> {
    // Try to match by email first
    const byEmail = await this.prisma.ecommerceLead.findFirst({
      where: {
        ownerUid,
        email: { equals: order.customer.email, mode: 'insensitive' },
        status: { not: 'CONVERTED' } // Don't match already converted leads
      }
    });

    if (byEmail) return byEmail;

    // Try to match by phone if available
    if (order.customer.phone) {
      const byPhone = await this.prisma.ecommerceLead.findFirst({
        where: {
          ownerUid,
          phone: order.customer.phone,
          status: { not: 'CONVERTED' }
        }
      });

      if (byPhone) return byPhone;
    }

    return null;
  }

  private async convertLeadToCustomer(leadId: string, order: ShopifyOrder): Promise<void> {
    await this.prisma.ecommerceLead.update({
      where: { id: leadId },
      data: {
        status: 'CONVERTED',
        orderValue: parseFloat(order.total_price),
        conversionDate: new Date(order.created_at),
        notes: `Converted to customer with Shopify order ${order.name}\\nTotal: ${order.currency} ${order.total_price}`,
        updatedAt: new Date()
      }
    });
  }

  private async createOrderRecord(ownerUid: string, order: ShopifyOrder, leadId?: string): Promise<void> {
    // Extract UTM parameters from order attributes
    const utmData = this.extractUTMFromOrder(order);

    const orderData = {
      ownerUid,
      externalId: order.id.toString(),
      orderNumber: order.name,
      customerEmail: order.customer.email,
      customerName: `${order.customer.first_name} ${order.customer.last_name}`,
      totalAmount: parseFloat(order.total_price),
      currency: order.currency,
      status: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      orderDate: new Date(order.created_at),
      leadId: leadId || null,
      utmSource: utmData.utmSource,
      utmMedium: utmData.utmMedium,
      utmCampaign: utmData.utmCampaign,
      platform: 'shopify',
      rawData: order
    };

    // Create order record in database
    // This would require adding an Order model to the schema
    this.logger.log(`Order record created for ${order.name} - ₪${order.total_price}`);
  }

  private extractUTMFromOrder(order: ShopifyOrder): any {
    const utmData = {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null
    };

    order.note_attributes?.forEach(attr => {
      switch (attr.name.toLowerCase()) {
        case 'utm_source':
          utmData.utmSource = attr.value;
          break;
        case 'utm_medium':
          utmData.utmMedium = attr.value;
          break;
        case 'utm_campaign':
          utmData.utmCampaign = attr.value;
          break;
        case 'utm_term':
          utmData.utmTerm = attr.value;
          break;
        case 'utm_content':
          utmData.utmContent = attr.value;
          break;
      }
    });

    return utmData;
  }

  private async aggregateAttributionData(ownerUid: string, dateFrom?: string, dateTo?: string): Promise<any> {
    // This would aggregate conversion data by UTM parameters
    const whereClause: any = { ownerUid, status: 'CONVERTED' };

    if (dateFrom || dateTo) {
      whereClause.conversionDate = {};
      if (dateFrom) whereClause.conversionDate.gte = new Date(dateFrom);
      if (dateTo) whereClause.conversionDate.lte = new Date(dateTo);
    }

    const conversions = await this.prisma.ecommerceLead.findMany({
      where: whereClause,
      select: {
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        orderValue: true,
        conversionDate: true
      }
    });

    // Group by UTM parameters
    const attribution = conversions.reduce((acc, conversion) => {
      const key = `${conversion.utmSource || 'direct'}|${conversion.utmMedium || 'organic'}|${conversion.utmCampaign || 'none'}`;

      if (!acc[key]) {
        acc[key] = {
          source: conversion.utmSource || 'direct',
          medium: conversion.utmMedium || 'organic',
          campaign: conversion.utmCampaign || 'none',
          conversions: 0,
          revenue: 0
        };
      }

      acc[key].conversions++;
      acc[key].revenue += conversion.orderValue || 0;

      return acc;
    }, {});

    return Object.values(attribution);
  }
}