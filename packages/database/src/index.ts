// Re-export PrismaClient singleton
export { prisma } from './client';

// Re-export all generated Prisma types
export { PrismaClient, Prisma } from '@prisma/client';
export type {
  Organization,
  Property,
  User,
  UserPropertyAccess,
  Guest,
  Reservation,
  PreCheckSubmission,
  UpsellOffer,
  UpsellRule,
  UpsellSelection,
  UpsellImpression,
  Payment,
  Subscription,
  UsageRecord,
  CommunicationTemplate,
  CommunicationLog,
  AuditLog,
  ConsentRecord,
  PmsSyncLog,
} from '@prisma/client';

// Re-export enums (they are values, not just types)
export {
  Role,
  BillingTier,
  PreCheckStatus,
  UpsellCategory,
  ReservationStatus,
  UpsellRuleOperator,
  UpsellSelectionStatus,
  PaymentGateway,
  PaymentStatus,
  PaymentType,
  SubscriptionStatus,
  UsageEventType,
  CommunicationType,
  CommunicationChannel,
  CommunicationStatus,
  ConsentType,
  PmsSyncDirection,
  PmsSyncStatus,
} from '@prisma/client';
