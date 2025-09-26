import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

export interface MetaLeadFormData {
  leadgen_id: string;
  form_id: string;
  campaign_id: string;
  campaign_name: string;
  adset_id: string;
  adset_name: string;
  ad_id: string;
  ad_name: string;
  created_time: string;
  field_data: Array<{
    name: string;
    values: string[];
  }>;
  platform: 'facebook' | 'instagram';
}

export interface ImportedLead {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  source: string;
  sourceName: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  campaign?: any;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  duplicates: number;
  errors: number;
  details: ImportDetail[];
}

export interface ImportDetail {
  leadId?: string;
  externalId?: string;
  status: 'imported' | 'updated' | 'duplicate' | 'error';
  message?: string;
  data?: any;
}

@Injectable()
export class LeadImportService {
  private readonly logger = new Logger(LeadImportService.name);
  private prisma = new PrismaClient();

  /**
   * Import leads from Meta Marketing API
   */
  async importMetaLeads(ownerUid: string, formData: MetaLeadFormData[]): Promise<ImportResult> {
    this.logger.log(`Starting Meta leads import for ${formData.length} leads`);

    const result: ImportResult = {
      success: false,
      imported: 0,
      updated: 0,
      duplicates: 0,
      errors: 0,
      details: []
    };

    try {
      for (const leadForm of formData) {
        try {
          // Parse lead form data
          const leadData = this.parseMetaLeadForm(leadForm);

          // Check for existing lead
          const existingLead = await this.findExistingLead(ownerUid, leadForm.leadgen_id, leadData.email);

          if (existingLead) {
            // Update existing lead
            const updatedLead = await this.updateExistingLead(existingLead.id, leadForm, leadData);

            result.updated++;
            result.details.push({
              leadId: updatedLead.id,
              externalId: leadForm.leadgen_id,
              status: 'updated',
              message: 'Lead updated successfully',
              data: updatedLead
            });
          } else {
            // Create new lead
            const newLead = await this.createNewLead(ownerUid, leadForm, leadData);

            result.imported++;
            result.details.push({
              leadId: newLead.id,
              externalId: leadForm.leadgen_id,
              status: 'imported',
              message: 'Lead imported successfully',
              data: newLead
            });
          }
        } catch (error) {
          this.logger.error(`Error processing lead ${leadForm.leadgen_id}:`, error);
          result.errors++;
          result.details.push({
            externalId: leadForm.leadgen_id,
            status: 'error',
            message: error.message || 'Unknown error occurred'
          });
        }
      }

      result.success = result.errors < formData.length;
      this.logger.log(`Meta leads import completed: ${result.imported} imported, ${result.updated} updated, ${result.errors} errors`);

      return result;
    } catch (error) {
      this.logger.error('Meta leads import failed:', error);
      throw error;
    }
  }

  /**
   * Get campaign attribution data for conversion tracking
   */
  async getCampaignAttribution(ownerUid: string, leadId: string): Promise<any> {
    const lead = await this.prisma.ecommerceLead.findFirst({
      where: { id: leadId, ownerUid },
      include: {
        // Include related campaign data if exists
      }
    });

    if (!lead) {
      return null;
    }

    // Get campaign data from Meta if we have campaign IDs
    const attribution = {
      leadId: lead.id,
      source: lead.source,
      sourceName: lead.sourceName,
      utmSource: lead.utmSource,
      utmMedium: lead.utmMedium,
      utmCampaign: lead.utmCampaign,
      utmTerm: lead.utmTerm,
      createdAt: lead.createdAt
    };

    return attribution;
  }

  /**
   * Sync leads with Meta Marketing API
   */
  async syncMetaCampaignLeads(ownerUid: string, campaignId?: string): Promise<ImportResult> {
    this.logger.log(`Starting Meta campaign leads sync for owner: ${ownerUid}`);

    try {
      // This would integrate with Meta Marketing API to fetch leads
      // For now, we'll simulate the process with mock data

      const mockLeads: MetaLeadFormData[] = [
        {
          leadgen_id: 'lead_' + Date.now(),
          form_id: 'form_123456789',
          campaign_id: campaignId || 'campaign_123456789',
          campaign_name: 'E-commerce Lead Gen Campaign',
          adset_id: 'adset_123456789',
          adset_name: 'Target Audience 1',
          ad_id: 'ad_123456789',
          ad_name: 'Product Promotion Ad',
          created_time: new Date().toISOString(),
          platform: 'facebook',
          field_data: [
            { name: 'full_name', values: ['John Doe'] },
            { name: 'email', values: ['john.doe@example.com'] },
            { name: 'phone_number', values: ['+972501234567'] },
            { name: 'city', values: ['Tel Aviv'] }
          ]
        }
      ];

      return await this.importMetaLeads(ownerUid, mockLeads);
    } catch (error) {
      this.logger.error('Meta campaign leads sync failed:', error);
      throw error;
    }
  }

  private parseMetaLeadForm(leadForm: MetaLeadFormData): any {
    const data: any = {};

    leadForm.field_data.forEach(field => {
      const value = field.values[0]; // Take first value

      switch (field.name.toLowerCase()) {
        case 'full_name':
          data.fullName = value;
          const nameParts = value.split(' ');
          data.firstName = nameParts[0];
          data.lastName = nameParts.slice(1).join(' ');
          break;
        case 'first_name':
          data.firstName = value;
          break;
        case 'last_name':
          data.lastName = value;
          break;
        case 'email':
          data.email = value;
          break;
        case 'phone_number':
        case 'phone':
          data.phone = value;
          break;
        case 'city':
          data.city = value;
          break;
        case 'budget':
          data.budget = parseFloat(value) || null;
          break;
      }
    });

    return data;
  }

  private async findExistingLead(ownerUid: string, externalId: string, email?: string): Promise<any> {
    // First try to find by external ID
    const byExternalId = await this.prisma.ecommerceLead.findFirst({
      where: {
        ownerUid,
        externalId
      }
    });

    if (byExternalId) {
      return byExternalId;
    }

    // Then try to find by email if provided
    if (email) {
      const byEmail = await this.prisma.ecommerceLead.findFirst({
        where: {
          ownerUid,
          email: { equals: email, mode: 'insensitive' }
        }
      });

      if (byEmail) {
        return byEmail;
      }
    }

    return null;
  }

  private async createNewLead(ownerUid: string, leadForm: MetaLeadFormData, leadData: any): Promise<any> {
    const data: any = {
      ownerUid,
      externalId: leadForm.leadgen_id,
      fullName: leadData.fullName,
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      phone: leadData.phone,
      email: leadData.email,
      city: leadData.city,
      budget: leadData.budget,
      source: 'FACEBOOK',
      sourceName: leadForm.campaign_name,
      status: 'NEW',
      score: 'WARM',
      utmSource: leadForm.platform,
      utmMedium: 'paid-social',
      utmCampaign: leadForm.campaign_name,
      utmTerm: leadForm.adset_name,
      notes: `Imported from Meta Lead Ads\\nCampaign: ${leadForm.campaign_name}\\nAdset: ${leadForm.adset_name}\\nAd: ${leadForm.ad_name}`
    };

    return await this.prisma.ecommerceLead.create({
      data
    });
  }

  private async updateExistingLead(leadId: string, leadForm: MetaLeadFormData, leadData: any): Promise<any> {
    const updateData: any = {
      fullName: leadData.fullName,
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      phone: leadData.phone,
      email: leadData.email,
      city: leadData.city,
      budget: leadData.budget,
      sourceName: leadForm.campaign_name,
      utmSource: leadForm.platform,
      utmMedium: 'paid-social',
      utmCampaign: leadForm.campaign_name,
      utmTerm: leadForm.adset_name,
      updatedAt: new Date()
    };

    return await this.prisma.ecommerceLead.update({
      where: { id: leadId },
      data: updateData
    });
  }
}