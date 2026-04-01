import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ---------------------------------------------------------------------------
  // 1. Demo Organization
  // ---------------------------------------------------------------------------
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-hotel-group' },
    update: {},
    create: {
      name: 'Demo Hotel Group',
      slug: 'demo-hotel-group',
      billingTier: 'STARTER',
      isActive: true,
    },
  });
  console.log(`  Organization: ${org.name} (${org.id})`);

  // ---------------------------------------------------------------------------
  // 2. Demo Property — Maple Leaf Boutique Hotel, Montreal QC
  // ---------------------------------------------------------------------------
  const property = await prisma.property.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: 'maple-leaf-boutique',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Maple Leaf Boutique Hotel',
      slug: 'maple-leaf-boutique',
      address: '1234 Rue Sainte-Catherine Ouest',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H3G 1P1',
      country: 'CA',
      timezone: 'America/Toronto',
      defaultLocale: 'en',
      roomCount: 48,
      isActive: true,
    },
  });
  console.log(`  Property: ${property.name} (${property.id})`);

  // ---------------------------------------------------------------------------
  // 3. Platform Admin User
  // ---------------------------------------------------------------------------
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hotelcheckin.ca' },
    update: {},
    create: {
      organizationId: org.id,
      email: 'admin@hotelcheckin.ca',
      // bcrypt hash of "ChangeMe123!" — replace before any real usage
      passwordHash:
        '$2b$12$LJ3m4ys3Lz0Y1r5XaGpHOeVkXZBvR5e6f7g8h9i0j1k2l3m4n5o6p',
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'PLATFORM_ADMIN',
      isActive: true,
    },
  });
  console.log(`  Admin user: ${adminUser.email} (${adminUser.id})`);

  // ---------------------------------------------------------------------------
  // 4. General Manager User
  // ---------------------------------------------------------------------------
  const gmUser = await prisma.user.upsert({
    where: { email: 'gm@mapleleafhotel.ca' },
    update: {},
    create: {
      organizationId: org.id,
      email: 'gm@mapleleafhotel.ca',
      passwordHash:
        '$2b$12$LJ3m4ys3Lz0Y1r5XaGpHOeVkXZBvR5e6f7g8h9i0j1k2l3m4n5o6p',
      firstName: 'Marie',
      lastName: 'Tremblay',
      role: 'GENERAL_MANAGER',
      isActive: true,
    },
  });
  console.log(`  GM user: ${gmUser.email} (${gmUser.id})`);

  // Give GM access to the property
  await prisma.userPropertyAccess.upsert({
    where: {
      userId_propertyId: {
        userId: gmUser.id,
        propertyId: property.id,
      },
    },
    update: {},
    create: {
      userId: gmUser.id,
      propertyId: property.id,
    },
  });

  // ---------------------------------------------------------------------------
  // 5. Sample Upsell Offers
  // ---------------------------------------------------------------------------
  const upsellData = [
    {
      category: 'BREAKFAST' as const,
      title: 'Continental Breakfast Buffet',
      titleFr: 'Buffet petit-dejeuner continental',
      description:
        'Start your day with our signature continental breakfast buffet featuring locally sourced Quebec ingredients.',
      descriptionFr:
        'Commencez votre journee avec notre buffet petit-dejeuner continental mettant en vedette des ingredients locaux du Quebec.',
      priceInCents: 2495,
      sortOrder: 1,
    },
    {
      category: 'SPA' as const,
      title: '60-Minute Relaxation Massage',
      titleFr: 'Massage de relaxation 60 minutes',
      description:
        'Unwind with a full-body relaxation massage at our in-house spa.',
      descriptionFr:
        'Detendez-vous avec un massage de relaxation complet dans notre spa.',
      priceInCents: 12500,
      sortOrder: 2,
    },
    {
      category: 'ROOM_UPGRADE' as const,
      title: 'Suite Upgrade',
      titleFr: 'Surclassement en suite',
      description:
        'Upgrade to a spacious suite with a separate living area and city views.',
      descriptionFr:
        'Passez a une suite spacieuse avec un salon separe et une vue sur la ville.',
      priceInCents: 7500,
      sortOrder: 3,
    },
    {
      category: 'EARLY_CHECKIN' as const,
      title: 'Early Check-In (11 AM)',
      titleFr: 'Arrivee anticipee (11h)',
      description:
        'Check in as early as 11:00 AM, subject to availability.',
      descriptionFr:
        'Enregistrement des 11h00, sous reserve de disponibilite.',
      priceInCents: 3500,
      sortOrder: 4,
    },
    {
      category: 'PARKING' as const,
      title: 'Underground Parking',
      titleFr: 'Stationnement souterrain',
      description:
        'Secure underground parking for the duration of your stay.',
      descriptionFr:
        'Stationnement souterrain securise pour la duree de votre sejour.',
      priceInCents: 3000,
      sortOrder: 5,
    },
  ];

  for (const data of upsellData) {
    await prisma.upsellOffer.create({
      data: {
        propertyId: property.id,
        ...data,
      },
    });
  }
  console.log(`  Created ${upsellData.length} upsell offers`);

  // ---------------------------------------------------------------------------
  // 6. Sample Communication Templates
  // ---------------------------------------------------------------------------
  const templateData = [
    {
      type: 'PRE_CHECK_INVITE' as const,
      channel: 'EMAIL' as const,
      subjectEn: 'Complete Your Pre-Check-In for {{propertyName}}',
      subjectFr: 'Completez votre pre-enregistrement pour {{propertyName}}',
      bodyEn:
        'Dear {{guestFirstName}},\n\nYour stay at {{propertyName}} is approaching! Complete your pre-check-in now to enjoy a seamless arrival experience.\n\nCheck-in date: {{checkInDate}}\nConfirmation: {{confirmationNumber}}\n\nComplete your pre-check-in: {{preCheckUrl}}\n\nWe look forward to welcoming you!\n\n{{propertyName}} Team',
      bodyFr:
        'Cher(e) {{guestFirstName}},\n\nVotre sejour au {{propertyName}} approche! Completez votre pre-enregistrement maintenant pour profiter d\'une arrivee sans souci.\n\nDate d\'arrivee: {{checkInDate}}\nConfirmation: {{confirmationNumber}}\n\nCompletez votre pre-enregistrement: {{preCheckUrl}}\n\nNous avons hate de vous accueillir!\n\nL\'equipe {{propertyName}}',
    },
    {
      type: 'REMINDER' as const,
      channel: 'EMAIL' as const,
      subjectEn: 'Reminder: Complete Your Pre-Check-In',
      subjectFr: 'Rappel: Completez votre pre-enregistrement',
      bodyEn:
        'Dear {{guestFirstName}},\n\nJust a friendly reminder to complete your pre-check-in before your arrival at {{propertyName}} on {{checkInDate}}.\n\nComplete your pre-check-in: {{preCheckUrl}}\n\nThank you!\n\n{{propertyName}} Team',
      bodyFr:
        'Cher(e) {{guestFirstName}},\n\nUn rappel amical pour completer votre pre-enregistrement avant votre arrivee au {{propertyName}} le {{checkInDate}}.\n\nCompletez votre pre-enregistrement: {{preCheckUrl}}\n\nMerci!\n\nL\'equipe {{propertyName}}',
    },
  ];

  for (const data of templateData) {
    await prisma.communicationTemplate.create({
      data: {
        propertyId: property.id,
        ...data,
      },
    });
  }
  console.log(`  Created ${templateData.length} communication templates`);

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
