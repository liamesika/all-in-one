// Production Vertical Seed Data
import { PrismaClient, Vertical, AccountType, MembershipRole, ProjectType, ProjectStatus, TaskDomain, ProductionTaskStatus, BudgetCategory, SupplierCategory, FileFolder } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProductionData() {
  console.log('🎬 Seeding Production vertical data...');

  try {
    // Create owner user for the production company
    const productionOwner = await prisma.user.upsert({
      where: { email: 'owner@eventpro.com' },
      update: {},
      create: {
        id: 'prod-owner-001',
        fullName: 'Sarah Production',
        email: 'owner@eventpro.com',
        passwordHash: '$2b$10$K4Q9Z1j8VjT5U9oP7Vq.3O8H6y4s8R2N7xF1kM9L6C4E5B8G3A2D', // hashed "password123"
        lang: 'en',
      },
    });

    // Create user profile for production owner
    await prisma.userProfile.upsert({
      where: { userId: productionOwner.id },
      update: {},
      create: {
        userId: productionOwner.id,
        defaultVertical: Vertical.PRODUCTION,
        accountType: AccountType.COMPANY,
        termsConsentAt: new Date(),
        termsVersion: '1.0',
      },
    });

    // Create production organization
    const productionOrg = await prisma.organization.upsert({
      where: { ownerUid: productionOwner.id },
      update: {},
      create: {
        ownerUid: productionOwner.id,
        ownerUserId: productionOwner.id,
        name: 'EventPro Productions',
        slug: 'eventpro-productions',
        seatLimit: 10,
        usedSeats: 3,
        planTier: 'PROFESSIONAL',
      },
    });

    // Create owner membership
    await prisma.membership.upsert({
      where: { userId_orgId: { userId: productionOwner.id, orgId: productionOrg.id } },
      update: {},
      create: {
        userId: productionOwner.id,
        orgId: productionOrg.id,
        ownerUid: productionOwner.id,
        role: MembershipRole.OWNER,
        status: 'ACTIVE',
        acceptedAt: new Date(),
      },
    });

    // Create team members
    const member1 = await prisma.user.upsert({
      where: { email: 'manager@eventpro.com' },
      update: {},
      create: {
        id: 'prod-member-001',
        fullName: 'Alex Manager',
        email: 'manager@eventpro.com',
        passwordHash: '$2b$10$K4Q9Z1j8VjT5U9oP7Vq.3O8H6y4s8R2N7xF1kM9L6C4E5B8G3A2D',
        lang: 'en',
      },
    });

    const member2 = await prisma.user.upsert({
      where: { email: 'coordinator@eventpro.com' },
      update: {},
      create: {
        id: 'prod-member-002',
        fullName: 'Emma Coordinator',
        email: 'coordinator@eventpro.com',
        passwordHash: '$2b$10$K4Q9Z1j8VjT5U9oP7Vq.3O8H6y4s8R2N7xF1kM9L6C4E5B8G3A2D',
        lang: 'en',
      },
    });

    // Create member profiles
    await prisma.userProfile.upsert({
      where: { userId: member1.id },
      update: {},
      create: {
        userId: member1.id,
        defaultVertical: Vertical.PRODUCTION,
        accountType: AccountType.COMPANY,
        termsConsentAt: new Date(),
        termsVersion: '1.0',
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: member2.id },
      update: {},
      create: {
        userId: member2.id,
        defaultVertical: Vertical.PRODUCTION,
        accountType: AccountType.COMPANY,
        termsConsentAt: new Date(),
        termsVersion: '1.0',
      },
    });

    // Create memberships for team members
    await prisma.membership.upsert({
      where: { userId_orgId: { userId: member1.id, orgId: productionOrg.id } },
      update: {},
      create: {
        userId: member1.id,
        orgId: productionOrg.id,
        ownerUid: productionOwner.id,
        role: MembershipRole.MANAGER,
        status: 'ACTIVE',
        acceptedAt: new Date(),
      },
    });

    await prisma.membership.upsert({
      where: { userId_orgId: { userId: member2.id, orgId: productionOrg.id } },
      update: {},
      create: {
        userId: member2.id,
        orgId: productionOrg.id,
        ownerUid: productionOwner.id,
        role: MembershipRole.MEMBER,
        status: 'ACTIVE',
        acceptedAt: new Date(),
      },
    });

    // Create freelancer user
    const freelancerUser = await prisma.user.upsert({
      where: { email: 'freelancer@example.com' },
      update: {},
      create: {
        id: 'prod-freelancer-001',
        fullName: 'Jordan Freelancer',
        email: 'freelancer@example.com',
        passwordHash: '$2b$10$K4Q9Z1j8VjT5U9oP7Vq.3O8H6y4s8R2N7xF1kM9L6C4E5B8G3A2D',
        lang: 'he', // Hebrew freelancer
      },
    });

    // Create freelancer profile
    await prisma.userProfile.upsert({
      where: { userId: freelancerUser.id },
      update: {},
      create: {
        userId: freelancerUser.id,
        defaultVertical: Vertical.PRODUCTION,
        accountType: AccountType.FREELANCER,
        termsConsentAt: new Date(),
        termsVersion: '1.0',
      },
    });

    // Create freelancer organization
    const freelancerOrg = await prisma.organization.upsert({
      where: { ownerUid: freelancerUser.id },
      update: {},
      create: {
        ownerUid: freelancerUser.id,
        ownerUserId: freelancerUser.id,
        name: 'Jordan Productions',
        slug: 'jordan-productions',
        seatLimit: 1,
        usedSeats: 1,
        planTier: 'STARTER',
      },
    });

    // Create freelancer membership
    await prisma.membership.upsert({
      where: { userId_orgId: { userId: freelancerUser.id, orgId: freelancerOrg.id } },
      update: {},
      create: {
        userId: freelancerUser.id,
        orgId: freelancerOrg.id,
        ownerUid: freelancerUser.id,
        role: MembershipRole.OWNER,
        status: 'ACTIVE',
        acceptedAt: new Date(),
      },
    });

    // Create suppliers for the production company
    const suppliers = [
      {
        id: 'supplier-001',
        name: 'Premium Stage Solutions',
        category: SupplierCategory.STAGE,
        rating: 5,
        notes: 'Excellent stage setup for large events',
        priceNotes: '$2000-5000 per event',
        contactInfo: { email: 'contact@premiumstage.com', phone: '+1-555-0101' },
      },
      {
        id: 'supplier-002',
        name: 'Bright Lights Audio Visual',
        category: SupplierCategory.LIGHTING,
        rating: 4,
        notes: 'Professional lighting equipment',
        priceNotes: '$800-2500 per event',
        contactInfo: { email: 'info@brightlights.com', phone: '+1-555-0102' },
      },
      {
        id: 'supplier-003',
        name: 'Crystal Clear Audio',
        category: SupplierCategory.AUDIO,
        rating: 4,
        notes: 'High-quality sound systems',
        priceNotes: '$600-2000 per event',
        contactInfo: { email: 'hello@crystalclear.com', phone: '+1-555-0103' },
      },
      {
        id: 'supplier-004',
        name: 'Gourmet Catering Co',
        category: SupplierCategory.CATERING,
        rating: 5,
        notes: 'Exceptional catering service',
        priceNotes: '$50-120 per person',
        contactInfo: { email: 'orders@gourmetcatering.com', phone: '+1-555-0104' },
      },
      {
        id: 'supplier-005',
        name: 'Grand Event Venue',
        category: SupplierCategory.VENUE,
        rating: 4,
        notes: 'Beautiful venue for corporate events',
        priceNotes: '$1500-4000 per day',
        contactInfo: { email: 'bookings@grandevenue.com', phone: '+1-555-0105' },
      },
    ];

    for (const supplierData of suppliers) {
      await prisma.productionSupplier.upsert({
        where: { id: supplierData.id },
        update: {},
        create: {
          id: supplierData.id,
          name: supplierData.name,
          category: supplierData.category,
          rating: supplierData.rating,
          notes: supplierData.notes,
          priceNotes: supplierData.priceNotes,
          contactInfo: supplierData.contactInfo,
          ownerUid: productionOwner.id,
          organizationId: productionOrg.id,
        },
      });
    }

    // Create projects
    const project1 = await prisma.productionProject.upsert({
      where: { id: 'project-001' },
      update: {},
      create: {
        id: 'project-001',
        name: 'Tech Summit 2025',
        description: 'Annual technology conference for 500 attendees',
        type: ProjectType.CONFERENCE,
        status: ProjectStatus.ACTIVE,
        startDate: new Date('2025-03-15'),
        endDate: new Date('2025-03-17'),
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
    });

    const project2 = await prisma.productionProject.upsert({
      where: { id: 'project-002' },
      update: {},
      create: {
        id: 'project-002',
        name: 'Product Launch Show',
        description: 'Product launch event with live demonstration',
        type: ProjectType.SHOW,
        status: ProjectStatus.PLANNING,
        startDate: new Date('2025-04-20'),
        endDate: new Date('2025-04-20'),
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
    });

    // Create freelancer project
    const freelancerProject = await prisma.productionProject.upsert({
      where: { id: 'project-003' },
      update: {},
      create: {
        id: 'project-003',
        name: 'Wedding Video Production',
        description: 'Complete wedding cinematography package',
        type: ProjectType.FILMING,
        status: ProjectStatus.ACTIVE,
        startDate: new Date('2025-05-15'),
        endDate: new Date('2025-05-16'),
        ownerUid: freelancerUser.id,
        organizationId: freelancerOrg.id,
      },
    });

    // Create tasks for projects
    const tasks = [
      // Tech Summit tasks
      {
        id: 'task-001',
        title: 'Book venue and confirm capacity',
        description: 'Secure venue for 500+ attendees with AV capabilities',
        domain: TaskDomain.LOGISTICS,
        status: ProductionTaskStatus.DONE,
        projectId: project1.id,
        assigneeId: member1.id,
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      {
        id: 'task-002',
        title: 'Design conference branding',
        description: 'Create logos, banners, and promotional materials',
        domain: TaskDomain.CONTENT,
        status: ProductionTaskStatus.IN_PROGRESS,
        dueDate: new Date('2025-02-15'),
        projectId: project1.id,
        assigneeId: member2.id,
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      {
        id: 'task-003',
        title: 'Setup social media campaign',
        description: 'Create LinkedIn and Twitter promotion campaigns',
        domain: TaskDomain.MARKETING,
        status: ProductionTaskStatus.OPEN,
        dueDate: new Date('2025-02-01'),
        projectId: project1.id,
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      {
        id: 'task-004',
        title: 'Confirm catering suppliers',
        description: 'Book catering for breakfast, lunch and coffee breaks',
        domain: TaskDomain.SUPPLIERS,
        status: ProductionTaskStatus.OPEN,
        dueDate: new Date('2025-02-10'),
        projectId: project1.id,
        assigneeId: member1.id,
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      // Product Launch tasks
      {
        id: 'task-005',
        title: 'Design stage layout',
        description: 'Plan stage setup for product demonstration',
        domain: TaskDomain.LOGISTICS,
        status: ProductionTaskStatus.OPEN,
        projectId: project2.id,
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      {
        id: 'task-006',
        title: 'Prepare demo script',
        description: 'Write and rehearse product demonstration',
        domain: TaskDomain.CONTENT,
        status: ProductionTaskStatus.OPEN,
        projectId: project2.id,
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      // Freelancer project tasks
      {
        id: 'task-007',
        title: 'Pre-wedding consultation',
        description: 'Meet with couple to discuss shot list and timeline',
        domain: TaskDomain.CONTENT,
        status: ProductionTaskStatus.DONE,
        projectId: freelancerProject.id,
        ownerUid: freelancerUser.id,
        organizationId: freelancerOrg.id,
      },
      {
        id: 'task-008',
        title: 'Equipment preparation',
        description: 'Check and prepare cameras, drones, and audio equipment',
        domain: TaskDomain.LOGISTICS,
        status: ProductionTaskStatus.IN_PROGRESS,
        dueDate: new Date('2025-05-14'),
        projectId: freelancerProject.id,
        ownerUid: freelancerUser.id,
        organizationId: freelancerOrg.id,
      },
    ];

    for (const taskData of tasks) {
      await prisma.productionTask.upsert({
        where: { id: taskData.id },
        update: {},
        create: taskData,
      });
    }

    // Create budget items
    const budgetItems = [
      // Tech Summit budget
      {
        id: 'budget-001',
        category: BudgetCategory.STAGE,
        planned: 5000.00,
        actual: 4800.00,
        projectId: project1.id,
        supplierId: suppliers[0].id,
        notes: 'Main stage setup with screens',
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      {
        id: 'budget-002',
        category: BudgetCategory.LIGHTING,
        planned: 2500.00,
        actual: 2500.00,
        projectId: project1.id,
        supplierId: suppliers[1].id,
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      {
        id: 'budget-003',
        category: BudgetCategory.CATERING,
        planned: 8000.00,
        actual: 0.00,
        projectId: project1.id,
        supplierId: suppliers[3].id,
        notes: '500 attendees x 2 days',
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      {
        id: 'budget-004',
        category: BudgetCategory.MARKETING,
        planned: 3000.00,
        actual: 1200.00,
        projectId: project1.id,
        notes: 'Social media ads and print materials',
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      // Product Launch budget
      {
        id: 'budget-005',
        category: BudgetCategory.STAGE,
        planned: 3000.00,
        actual: 0.00,
        projectId: project2.id,
        supplierId: suppliers[0].id,
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      // Freelancer budget
      {
        id: 'budget-006',
        category: BudgetCategory.OTHER,
        planned: 2500.00,
        actual: 0.00,
        projectId: freelancerProject.id,
        notes: 'Equipment rental and travel',
        ownerUid: freelancerUser.id,
        organizationId: freelancerOrg.id,
      },
    ];

    for (const budgetData of budgetItems) {
      await prisma.productionBudgetItem.upsert({
        where: { id: budgetData.id },
        update: {},
        create: {
          id: budgetData.id,
          category: budgetData.category,
          planned: budgetData.planned,
          actual: budgetData.actual,
          projectId: budgetData.projectId,
          supplierId: budgetData.supplierId || undefined,
          notes: budgetData.notes,
          ownerUid: budgetData.ownerUid,
          organizationId: budgetData.organizationId,
        },
      });
    }

    // Create project-supplier relationships
    const projectSuppliers = [
      {
        id: 'proj-supp-001',
        projectId: project1.id,
        supplierId: suppliers[0].id,
        role: 'Main stage provider',
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      {
        id: 'proj-supp-002',
        projectId: project1.id,
        supplierId: suppliers[1].id,
        role: 'Lighting contractor',
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      {
        id: 'proj-supp-003',
        projectId: project1.id,
        supplierId: suppliers[2].id,
        role: 'Audio systems',
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
      {
        id: 'proj-supp-004',
        projectId: project1.id,
        supplierId: suppliers[3].id,
        role: 'Catering services',
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
      },
    ];

    for (const projSuppData of projectSuppliers) {
      await prisma.productionProjectSupplier.upsert({
        where: { id: projSuppData.id },
        update: {},
        create: projSuppData,
      });
    }

    // Create file assets
    const files = [
      {
        id: 'file-001',
        name: 'Venue Contract - Grand Convention Center.pdf',
        folder: FileFolder.CONTRACTS,
        url: '/uploads/venue-contract-001.pdf',
        version: 1,
        notes: 'Signed venue contract for Tech Summit',
        mimeType: 'application/pdf',
        size: 2048576,
        projectId: project1.id,
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
        createdBy: member1.id,
      },
      {
        id: 'file-002',
        name: 'Safety Plan - Emergency Procedures.pdf',
        folder: FileFolder.SAFETY,
        url: '/uploads/safety-plan-001.pdf',
        version: 2,
        notes: 'Updated safety procedures for large events',
        mimeType: 'application/pdf',
        size: 1024768,
        projectId: project1.id,
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
        createdBy: productionOwner.id,
      },
      {
        id: 'file-003',
        name: 'Stage Design Layout v3.dwg',
        folder: FileFolder.DESIGNS,
        url: '/uploads/stage-design-v3.dwg',
        version: 3,
        notes: 'Final stage layout approved by client',
        mimeType: 'application/acad',
        size: 4096512,
        projectId: project1.id,
        ownerUid: productionOwner.id,
        organizationId: productionOrg.id,
        createdBy: member2.id,
      },
      {
        id: 'file-004',
        name: 'Filming Permit - City Hall.pdf',
        folder: FileFolder.PERMITS,
        url: '/uploads/filming-permit-001.pdf',
        version: 1,
        notes: 'Permit for outdoor wedding ceremony filming',
        mimeType: 'application/pdf',
        size: 512768,
        projectId: freelancerProject.id,
        ownerUid: freelancerUser.id,
        organizationId: freelancerOrg.id,
        createdBy: freelancerUser.id,
      },
      {
        id: 'file-005',
        name: 'Shot List - Wedding Timeline.docx',
        folder: FileFolder.OTHER,
        url: '/uploads/shot-list-001.docx',
        version: 2,
        notes: 'Detailed shot list with timeline for wedding day',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 256384,
        projectId: freelancerProject.id,
        ownerUid: freelancerUser.id,
        organizationId: freelancerOrg.id,
        createdBy: freelancerUser.id,
      },
    ];

    for (const fileData of files) {
      await prisma.productionFileAsset.upsert({
        where: { id: fileData.id },
        update: {},
        create: fileData,
      });
    }

    console.log('✅ Production vertical seed data created successfully!');
    console.log('📊 Summary:');
    console.log('  - 1 Production company (EventPro Productions) with 3 members');
    console.log('  - 1 Freelancer (Jordan Productions)');
    console.log('  - 3 Projects (Tech Summit, Product Launch, Wedding Video)');
    console.log('  - 8 Tasks across different domains');
    console.log('  - 5 Suppliers with ratings and contact info');
    console.log('  - 6 Budget items with planned vs actual costs');
    console.log('  - 5 File assets in various folders');
    console.log('');
    console.log('🔑 Test accounts:');
    console.log('  Company Owner: owner@eventpro.com / password123');
    console.log('  Manager: manager@eventpro.com / password123');
    console.log('  Member: coordinator@eventpro.com / password123');
    console.log('  Freelancer: freelancer@example.com / password123 (Hebrew interface)');

  } catch (error) {
    console.error('❌ Error seeding production data:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedProductionData()
    .then(() => {
      console.log('🎬 Production seed completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Production seed failed:', error);
      process.exit(1);
    });
}

export default seedProductionData;