import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

// Create a client instance
const { PrismaClient } = require('@prisma/client');

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  constructor() {
    this.client = new PrismaClient();
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  // Delegate all Prisma client methods
  get user() {
    return this.client.user;
  }

  get organization() {
    return this.client.organization;
  }

  get membership() {
    return this.client.membership;
  }

  get userProfile() {
    return this.client.userProfile;
  }

  get emailVerification() {
    return this.client.emailVerification;
  }

  get ecommerceLead() {
    return this.client.ecommerceLead;
  }

  get leadEvent() {
    return this.client.leadEvent;
  }

  get leadActivity() {
    return this.client.leadActivity;
  }

  get leadImportBatch() {
    return this.client.leadImportBatch;
  }

  get leadSourceHealth() {
    return this.client.leadSourceHealth;
  }

  get leadAssignmentRule() {
    return this.client.leadAssignmentRule;
  }

  get searchJob() {
    return this.client.searchJob;
  }

  get listing() {
    return this.client.listing;
  }

  get savedSearch() {
    return this.client.savedSearch;
  }

  // Real Estate models
  get property() {
    return this.client.property;
  }

  get propertyPhoto() {
    return this.client.propertyPhoto;
  }

  get realEstateLead() {
    return this.client.realEstateLead;
  }

  get realEstateLeadEvent() {
    return this.client.realEstateLeadEvent;
  }

  get propertyImportBatch() {
    return this.client.propertyImportBatch;
  }

  // Campaign and connections models
  get campaign() {
    return this.client.campaign;
  }

  get campaignEvent() {
    return this.client.campaignEvent;
  }

  get connection() {
    return this.client.connection;
  }

  get oAuthToken() {
    return this.client.oAuthToken;
  }

  get adAccount() {
    return this.client.adAccount;
  }

  get externalCampaign() {
    return this.client.externalCampaign;
  }

  get insight() {
    return this.client.insight;
  }

  get job() {
    return this.client.job;
  }

  get apiAuditLog() {
    return this.client.apiAuditLog;
  }

  // Auto follow-up models
  get autoFollowupTemplate() {
    return this.client.autoFollowupTemplate;
  }

  get autoFollowupExecution() {
    return this.client.autoFollowupExecution;
  }

  get sale() {
    return this.client.sale;
  }

  // AI Coach Bot models
  get task() {
    return this.client.task;
  }

  get message() {
    return this.client.message;
  }

  // Missing getters for models referenced in the codebase
  get invite() {
    return this.client.invite;
  }

  get domainClaim() {
    return this.client.domainClaim;
  }

  get oAuthConnection() {
    return this.client.oAuthConnection;
  }


  // Production models
  get productionProject() {
    return this.client.productionProject;
  }

  get productionTask() {
    return this.client.productionTask;
  }

  get productionBudgetItem() {
    return this.client.productionBudgetItem;
  }

  get productionSupplier() {
    return this.client.productionSupplier;
  }

  get productionProjectSupplier() {
    return this.client.productionProjectSupplier;
  }

  get productionFileAsset() {
    return this.client.productionFileAsset;
  }

  $transaction<T>(fn: (prisma: any) => Promise<T>): Promise<T> {
    return this.client.$transaction(fn);
  }

  $executeRaw(query: any, ...args: any[]) {
    return this.client.$executeRaw(query, ...args);
  }

  $queryRaw(query: any, ...args: any[]) {
    return this.client.$queryRaw(query, ...args);
  }
}