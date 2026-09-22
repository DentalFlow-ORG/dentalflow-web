# Database source reference

Generated with the source inventory. Exact field types, foreign-key relations, uniqueness, indexes, timestamps and mapped SQL names from [schema.prisma](../../../dentalflow-api/prisma/schema.prisma). SQL-only constraints must additionally be reviewed in migrations; see [architecture](../architecture/system.md).

## Clinic

```prisma
model Clinic {
  id           String    @id @default(cuid())
  name         String
  email        String?
  phone        String?
  logoUrl      String?
  websiteUrl   String?
  addressLine1 String?
  addressLine2 String?
  city         String?
  state        String?
  country      String    @default("BR")
  postalCode   String?
  timezone     String    @default("America/Sao_Paulo")
  isActive     Boolean   @default(true)
  deletedAt    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  users        User[]
  profiles     Profile[]
  availability Availability[]
  availabilityExceptions AvailabilityException[]
  appointments Appointment[]
  subscription Subscription?
  dailyMetrics DailyMetrics[]
  financialCategories FinancialCategory[]
  financialTransactions FinancialTransaction[]
  fixedExpenses FixedExpense[]
  fiscalProfile ClinicFiscalProfile?
  serviceInvoices ServiceInvoice[]
  googleCalendarIntegration          GoogleCalendarIntegration?
  googleCalendarOAuthStates          GoogleCalendarOAuthState[]
  userGoogleCalendarIntegrations     UserGoogleCalendarIntegration[] @relation("ClinicUserGoogleCalendars")
  clinicalRecords       ClinicalRecord[]
  clinicalRecordEvents  ClinicalRecordEvent[]
  clinicalTemplates     ClinicalTemplate[]
  odontogramRecords     OdontogramRecord[]
  stockCategories       StockCategory[]
  stockProducts         StockProduct[]
  stockMovements        StockMovement[]
  aiAssistantAnalyses   AiAssistantAnalysis[]
  notificationConsents  NotificationConsent[]
  notificationPreference NotificationPreference?
  notificationQuotas    NotificationQuota[]
  notificationMessages  NotificationMessage[]
  patientAvatars        PatientAvatar[]
  patients              Patient[]
  @@map("clinics")
}
```

## User

```prisma
model User {
  id                         String    @id @default(cuid())
  clinicId                   String?
  email                      String
  passwordHash               String
  firstName                  String
  lastName                   String
  phone                      String?
  avatarUrl                  String?
  role                       UserRole  @default(DENTIST)
  googleId                   String?   @unique
  isEmailVerified            Boolean   @default(false)
  isProfileComplete          Boolean   @default(true)
  emailVerificationToken     String?
  emailVerificationExpiresAt DateTime?
  passwordResetToken         String?
  passwordResetExpiresAt     DateTime?
  isActive                   Boolean   @default(true)
  tokenVersion               Int       @default(0)
  lastLoginAt                DateTime?
  deletedAt                  DateTime?
  createdAt                  DateTime  @default(now())
  updatedAt                  DateTime  @updatedAt
  clinic         Clinic?        @relation(fields: [clinicId], references: [id])
  profile        Profile?
  refreshTokens        RefreshToken[]
  passwordResetTokens  PasswordResetToken[]
  authOAuthStates      AuthOAuthState[] @relation("AuthOAuthStates")
  patientAppointments Appointment[] @relation("PatientAppointments")
  patientServiceInvoices ServiceInvoice[] @relation("ServiceInvoicePatient")
  createdFinancialTransactions FinancialTransaction[] @relation("FinancialTransactionCreatedBy")
  createdFixedExpenses FixedExpense[] @relation("FixedExpenseCreatedBy")
  createdServiceInvoices ServiceInvoice[] @relation("ServiceInvoiceCreatedBy")
  updatedServiceInvoices ServiceInvoice[] @relation("ServiceInvoiceUpdatedBy")
  issuedServiceInvoices ServiceInvoice[] @relation("ServiceInvoiceIssuedBy")
  fiscalInvoiceEvents FiscalInvoiceEvent[] @relation("FiscalInvoiceEventCreatedBy")
  googleCalendarConnections GoogleCalendarIntegration[] @relation("GoogleCalendarConnectedBy")
  googleCalendarOAuthStates GoogleCalendarOAuthState[]  @relation("GoogleCalendarOAuthStates")
  userGoogleCalendar        UserGoogleCalendarIntegration? @relation("UserGoogleCalendar")
  createdClinicalRecords    ClinicalRecord[]            @relation("ClinicalRecordCreatedBy")
  updatedClinicalRecords    ClinicalRecord[]            @relation("ClinicalRecordUpdatedBy")
  clinicalRecordEvents      ClinicalRecordEvent[]       @relation("ClinicalRecordEventCreatedBy")
  uploadedAttachments       ClinicalRecordAttachment[]  @relation("AttachmentUploadedBy")
  createdClinicalTemplates  ClinicalTemplate[]          @relation("ClinicalTemplateCreatedBy")
  createdOdontogramRecords  OdontogramRecord[]          @relation("OdontogramRecordCreatedBy")
  performedStockMovements   StockMovement[]             @relation("StockMovementPerformedBy")
  termsAcceptances          TermsAcceptance[]
  aiAssistantAnalyses       AiAssistantAnalysis[]
  notificationConsents      NotificationConsent[] @relation("PatientNotificationConsents")
  @@unique([email])
  @@index([clinicId])
  @@index([role])
  @@map("users")
}
```

## AuthOAuthState

```prisma
model AuthOAuthState {
  id        String   @id @default(cuid())
  state     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  userId    String?
  user User? @relation("AuthOAuthStates", fields: [userId], references: [id], onDelete: Cascade)
  @@index([expiresAt])
  @@map("auth_oauth_states")
}
```

## RefreshToken

```prisma
model RefreshToken {
  id         String    @id @default(cuid())
  userId     String
  tokenHash  String    @unique
  expiresAt  DateTime
  revokedAt  DateTime?
  deviceInfo String?
  ipAddress  String?
  createdAt  DateTime  @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@map("refresh_tokens")
}
```

## PasswordResetToken

```prisma
model PasswordResetToken {
  id        String    @id @default(cuid())
  userId    String
  tokenHash String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@map("password_reset_tokens")
}
```

## Profile

```prisma
model Profile {
  id             String    @id @default(cuid())
  clinicId       String
  userId         String?   @unique
  slug           String    @unique
  displayName    String
  bio            String?   @db.Text
  avatarUrl      String?
  crmNumber      String?
  crmState       String?
  phone          String?
  whatsappNumber String?
  publicEmail    String?
  instagramUrl   String?
  facebookUrl    String?
  websiteUrl     String?
  addressLine1   String?
  city           String?
  state          String?
  country        String    @default("BR")
  postalCode     String?
  latitude       Decimal?  @db.Decimal(10, 8)
  longitude      Decimal?  @db.Decimal(11, 8)
  isPublished    Boolean   @default(false)
  viewsCount     Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  clinic                 Clinic                  @relation(fields: [clinicId], references: [id])
  user                   User?                   @relation(fields: [userId], references: [id])
  profileSpecialties     ProfileSpecialty[]
  services               Service[]
  availability           Availability[]
  availabilityExceptions AvailabilityException[]
  appointments           Appointment[]
  financialTransactions  FinancialTransaction[]
  clinicalRecords        ClinicalRecord[]
  @@index([clinicId])
  @@index([isPublished])
  @@map("profiles")
}
```

## Specialty

```prisma
model Specialty {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  createdAt DateTime @default(now())
  profileSpecialties ProfileSpecialty[]
  @@map("specialties")
}
```

## ProfileSpecialty

```prisma
model ProfileSpecialty {
  profileId   String
  specialtyId String
  createdAt   DateTime @default(now())
  profile   Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  specialty Specialty @relation(fields: [specialtyId], references: [id], onDelete: Cascade)
  @@id([profileId, specialtyId])
  @@map("profile_specialties")
}
```

## Service

```prisma
model Service {
  id               String   @id @default(cuid())
  profileId        String
  clinicId         String
  name             String
  description      String?  @db.Text
  priceFrom        Decimal? @db.Decimal(10, 2)
  priceTo          Decimal? @db.Decimal(10, 2)
  durationMinutes           Int?
  isPriceDisplayed          Boolean  @default(true)
  isActive                  Boolean  @default(true)
  displayOrder              Int      @default(0)
  estimatedDirectCostCents  Int?
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt
  profile      Profile       @relation(fields: [profileId], references: [id], onDelete: Cascade)
  appointments Appointment[]
  financialTransactions FinancialTransaction[]
  @@index([profileId])
  @@index([clinicId])
  @@map("services")
}
```

## Availability

```prisma
model Availability {
  id        String   @id @default(cuid())
  profileId String
  clinicId  String
  dayOfWeek Int      // 0 = Sunday … 6 = Saturday
  startTime DateTime @db.Time // wall-clock in clinic's timezone
  endTime   DateTime @db.Time
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  clinic  Clinic  @relation(fields: [clinicId], references: [id])
  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  @@index([profileId])
  @@index([clinicId])
  @@unique([profileId, dayOfWeek, startTime, endTime])
  @@map("availability")
}
```

## AvailabilityException

```prisma
model AvailabilityException {
  id            String   @id @default(cuid())
  profileId     String
  clinicId      String
  exceptionDate DateTime @db.Date
  isDayOff      Boolean   @default(true)
  startTime     DateTime? @db.Time
  endTime       DateTime? @db.Time
  reason        String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  clinic  Clinic  @relation(fields: [clinicId], references: [id])
  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  @@unique([profileId, exceptionDate])
  @@index([exceptionDate])
  @@map("availability_exceptions")
}
```

## Appointment

```prisma
model Appointment {
  id                 String            @id @default(cuid())
  clinicId           String
  profileId          String
  patientUserId      String?
  patientId          String?
  serviceId          String?
  patientName        String
  patientEmail       String?
  patientPhone       String?
  appointmentDate    DateTime          @db.Date
  startTime          DateTime          @db.Time
  endTime            DateTime          @db.Time
  durationMinutes    Int
  status             AppointmentStatus @default(PENDING)
  notes              String?           @db.Text
  patientNotes       String?           @db.Text
  canceledBy         CanceledBy?
  canceledAt         DateTime?
  cancellationReason String?
  confirmedAt        DateTime?
  completedAt        DateTime?
  googleCalendarEventId         String?
  dentistGoogleCalendarEventId  String?
  estimatedAmountCents  Int?
  paidAmountCents       Int?
  paymentStatus         AppointmentPaymentStatus @default(PAYMENT_PENDING)
  paymentMethod         AppointmentPaymentMethod?
  paymentDate           DateTime?
  paymentNotes          String?                  @db.Text
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  clinic  Clinic  @relation(fields: [clinicId], references: [id])
  profile Profile  @relation(fields: [profileId], references: [id])
  patient User?    @relation("PatientAppointments", fields: [patientUserId], references: [id])
  patientRecord Patient? @relation(fields: [patientId], references: [id])
  service Service? @relation(fields: [serviceId], references: [id])
  financialTransactions FinancialTransaction[]
  serviceInvoices ServiceInvoice[]
  clinicalRecord  ClinicalRecord?
  notificationMessages NotificationMessage[]
  @@index([clinicId])
  @@index([profileId])
  @@index([patientUserId])
  @@index([patientId])
  @@index([clinicId, patientId])
  @@index([appointmentDate])
  @@index([status])
  @@index([clinicId, appointmentDate])
  @@index([profileId, appointmentDate])
  @@index([clinicId, profileId, appointmentDate])
  @@index([clinicId, status, appointmentDate])
  @@map("appointments")
}
```

## GoogleCalendarIntegration

```prisma
model GoogleCalendarIntegration {
  id                    String    @id @default(cuid())
  clinicId              String    @unique
  connectedByUserId     String
  googleCalendarId      String    @default("primary")
  googleCalendarSummary String?
  accessTokenEncrypted  String
  refreshTokenEncrypted String
  tokenExpiresAt        DateTime
  syncToken             String?
  connectedAt           DateTime  @default(now())
  lastSyncedAt          DateTime?
  disconnectedAt        DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  clinic          Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  connectedByUser User   @relation("GoogleCalendarConnectedBy", fields: [connectedByUserId], references: [id], onDelete: Restrict)
  @@index([connectedByUserId])
  @@map("google_calendar_integrations")
}
```

## GoogleCalendarOAuthState

```prisma
model GoogleCalendarOAuthState {
  id        String   @id
  clinicId  String
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  clinic Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  user   User   @relation("GoogleCalendarOAuthStates", fields: [userId], references: [id], onDelete: Cascade)
  @@index([clinicId])
  @@index([userId])
  @@map("google_calendar_oauth_states")
}
```

## UserGoogleCalendarIntegration

```prisma
model UserGoogleCalendarIntegration {
  id                    String    @id @default(cuid())
  userId                String    @unique
  clinicId              String
  googleCalendarId      String    @default("primary")
  googleCalendarSummary String?
  accessTokenEncrypted  String
  refreshTokenEncrypted String
  tokenExpiresAt        DateTime
  syncToken             String?
  connectedAt           DateTime  @default(now())
  lastSyncedAt          DateTime?
  disconnectedAt        DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user   User   @relation("UserGoogleCalendar", fields: [userId], references: [id], onDelete: Cascade)
  clinic Clinic @relation("ClinicUserGoogleCalendars", fields: [clinicId], references: [id], onDelete: Cascade)
  @@index([clinicId])
  @@map("user_google_calendar_integrations")
}
```

## Plan

```prisma
model Plan {
  id                    String   @id @default(cuid())
  name                  String
  slug                  String   @unique
  description           String?  @db.Text
  stripePriceIdMonthly  String?
  stripePriceIdYearly   String?
  priceMonthly          Int      // in cents — e.g. 9900 = R$99,00
  priceYearly           Int      // in cents
  maxUsersPerClinic     Int      @default(8)
  maxProfiles           Int?     // NULL = unlimited
  maxServicesPerProfile Int?     // NULL = unlimited
  hasAppointments       Boolean  @default(false)
  hasAnalytics          Boolean  @default(false)
  hasCustomDomain       Boolean  @default(false)
  hasPrioritySupport    Boolean  @default(false)
  hasWhatsApp           Boolean  @default(false)
  whatsappMonthlyLimit  Int?     // NULL = WhatsApp not included in plan
  whatsappAutoReminder  Boolean  @default(false)
  isActive              Boolean  @default(true)
  isPublic              Boolean  @default(true)
  displayOrder          Int      @default(0)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  subscriptions Subscription[]
  @@map("plans")
}
```

## Subscription

```prisma
model Subscription {
  id                   String             @id @default(cuid())
  clinicId             String             @unique
  planId               String
  stripeCustomerId     String?            @unique
  stripeSubscriptionId String?            @unique
  status               SubscriptionStatus @default(TRIALING)
  billingInterval      BillingInterval?
  trialEndsAt          DateTime?
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  canceledAt           DateTime?
  endedAt              DateTime?
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  clinic Clinic @relation(fields: [clinicId], references: [id])
  plan   Plan   @relation(fields: [planId], references: [id])
  items  SubscriptionItem[]
  @@map("subscriptions")
}
```

## SubscriptionItem

```prisma
model SubscriptionItem {
  id                       String           @id @default(cuid())
  subscriptionId           String
  stripeSubscriptionItemId String           @unique
  stripePriceId            String
  priceNickname            String?
  billingInterval          BillingInterval?
  unitAmount               Int?
  unitAmountDecimal        String?
  currency                 String
  quantity                 Int              @default(1)
  createdAt                DateTime         @default(now())
  updatedAt                DateTime         @updatedAt
  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  @@index([subscriptionId])
  @@index([stripePriceId])
  @@map("subscription_items")
}
```

## StripeEvent

```prisma
model StripeEvent {
  id           String    @id // Stripe event ID (evt_xxx) — idempotency PK
  type         String
  processed    Boolean   @default(false)
  processedAt  DateTime?
  errorMessage String?   @db.Text
  rawPayload   Json
  createdAt    DateTime
  receivedAt   DateTime  @default(now())
  @@index([type])
  @@index([processed])
  @@map("stripe_events")
}
```

## FinancialCategory

```prisma
model FinancialCategory {
  id        String                   @id @default(cuid())
  clinicId  String
  name      String
  type      FinancialTransactionType
  color     String?
  icon      String?
  isDefault Boolean                  @default(false)
  createdAt DateTime                 @default(now())
  updatedAt DateTime                 @updatedAt
  clinic        Clinic                 @relation(fields: [clinicId], references: [id])
  transactions  FinancialTransaction[]
  fixedExpenses FixedExpense[]
  @@unique([clinicId, type, name])
  @@index([clinicId])
  @@index([clinicId, type])
  @@map("financial_categories")
}
```

## FinancialTransaction

```prisma
model FinancialTransaction {
  id               String                     @id @default(cuid())
  clinicId         String
  type             FinancialTransactionType
  source           FinancialTransactionSource @default(MANUAL)
  categoryId       String
  fixedExpenseId   String?
  amount           Decimal                    @db.Decimal(10, 2)
  description      String
  transactionDate  DateTime                   @db.Date
  dueDate          DateTime?                  @db.Date
  paidAt           DateTime?
  status           FinancialTransactionStatus @default(PENDING)
  appointmentId    String?
  serviceId        String?
  profileId        String?
  paymentReference String?
  createdByUserId  String
  createdAt        DateTime                   @default(now())
  updatedAt        DateTime                   @updatedAt
  clinic        Clinic            @relation(fields: [clinicId], references: [id])
  category      FinancialCategory @relation(fields: [categoryId], references: [id])
  fixedExpense  FixedExpense?     @relation(fields: [fixedExpenseId], references: [id])
  appointment   Appointment?      @relation(fields: [appointmentId], references: [id])
  service       Service?          @relation(fields: [serviceId], references: [id])
  profile       Profile?          @relation(fields: [profileId], references: [id])
  createdByUser User              @relation("FinancialTransactionCreatedBy", fields: [createdByUserId], references: [id])
  @@unique([clinicId, appointmentId, source])
  @@unique([clinicId, fixedExpenseId, dueDate])
  @@index([clinicId])
  @@index([clinicId, transactionDate])
  @@index([clinicId, status])
  @@index([clinicId, type])
  @@index([categoryId])
  @@index([serviceId])
  @@index([profileId])
  @@map("financial_transactions")
}
```

## FixedExpense

```prisma
model FixedExpense {
  id              String                 @id @default(cuid())
  clinicId        String
  categoryId      String
  description     String
  amount          Decimal                @db.Decimal(10, 2)
  recurrence      FixedExpenseRecurrence @default(MONTHLY)
  dueDay          Int
  startDate       DateTime               @db.Date
  endDate         DateTime?              @db.Date
  isActive        Boolean                @default(true)
  createdByUserId String
  createdAt       DateTime               @default(now())
  updatedAt       DateTime               @updatedAt
  clinic        Clinic                 @relation(fields: [clinicId], references: [id])
  category      FinancialCategory      @relation(fields: [categoryId], references: [id])
  createdByUser User                   @relation("FixedExpenseCreatedBy", fields: [createdByUserId], references: [id])
  transactions  FinancialTransaction[]
  @@index([clinicId])
  @@index([clinicId, isActive])
  @@index([categoryId])
  @@map("fixed_expenses")
}
```

## ClinicFiscalProfile

```prisma
model ClinicFiscalProfile {
  id                    String             @id @default(cuid())
  clinicId              String             @unique
  legalName             String
  tradeName             String?
  documentType          FiscalDocumentType
  documentNumber        String
  municipalRegistration String?
  stateRegistration     String?
  taxRegime             FiscalTaxRegime
  specialTaxRegime      String?
  serviceCode           String?
  cnae                  String?
  issRate               Decimal?           @db.Decimal(5, 2)
  addressStreet         String
  addressNumber         String
  addressComplement     String?
  addressNeighborhood   String
  addressCity           String
  addressState          String
  addressZipCode        String
  cityIbgeCode          String?
  fiscalProvider        FiscalProvider     @default(LOCAL)
  fiscalProviderMode    FiscalProviderMode @default(LOCAL)
  isConfigured          Boolean            @default(false)
  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt
  clinic Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  @@map("clinic_fiscal_profiles")
}
```

## ServiceInvoice

```prisma
model ServiceInvoice {
  id                  String               @id @default(cuid())
  clinicId            String
  patientId           String?
  appointmentId       String?
  createdByUserId     String
  updatedByUserId     String?
  issuedByUserId      String?
  externalInvoiceId   String?
  status              ServiceInvoiceStatus @default(DRAFT)
  environment         FiscalProviderMode   @default(LOCAL)
  isLegalDocument     Boolean              @default(false)
  invoiceNumber       String?
  verificationCode    String?
  rpsNumber           String?
  rpsSeries           String?
  customerName        String
  customerDocument    String?
  customerEmail       String?
  customerPhone       String?
  serviceDescription  String               @db.Text
  serviceCode         String?
  amountCents         Int
  deductionsCents     Int?
  issRate             Decimal?             @db.Decimal(5, 2)
  issAmountCents      Int?
  currency            String               @default("BRL")
  competenceDate      DateTime             @db.Date
  simulatedIssueDate  DateTime?
  issueDate           DateTime?
  pdfUrl              String?
  xmlUrl              String?
  providerRawResponse Json?
  errorMessage        String?              @db.Text
  cancellationReason  String?              @db.Text
  canceledAt          DateTime?
  notes               String?              @db.Text
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  clinic        Clinic       @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  patient       User?        @relation("ServiceInvoicePatient", fields: [patientId], references: [id])
  appointment   Appointment? @relation(fields: [appointmentId], references: [id])
  createdByUser User         @relation("ServiceInvoiceCreatedBy", fields: [createdByUserId], references: [id])
  updatedByUser User?        @relation("ServiceInvoiceUpdatedBy", fields: [updatedByUserId], references: [id])
  issuedByUser  User?        @relation("ServiceInvoiceIssuedBy", fields: [issuedByUserId], references: [id])
  events        FiscalInvoiceEvent[]
  @@index([clinicId])
  @@index([clinicId, status])
  @@index([clinicId, competenceDate])
  @@index([clinicId, createdAt])
  @@index([appointmentId])
  @@index([patientId])
  @@map("service_invoices")
}
```

## FiscalInvoiceEvent

```prisma
model FiscalInvoiceEvent {
  id               String                @id @default(cuid())
  serviceInvoiceId String
  eventType        String
  previousStatus   ServiceInvoiceStatus?
  nextStatus       ServiceInvoiceStatus?
  message          String?
  metadata         Json?
  createdByUserId  String?
  createdAt        DateTime              @default(now())
  serviceInvoice ServiceInvoice @relation(fields: [serviceInvoiceId], references: [id], onDelete: Cascade)
  createdByUser  User?          @relation("FiscalInvoiceEventCreatedBy", fields: [createdByUserId], references: [id])
  @@index([serviceInvoiceId])
  @@index([serviceInvoiceId, createdAt])
  @@map("fiscal_invoice_events")
}
```

## DailyMetrics

```prisma
model DailyMetrics {
  id                    String   @id @default(cuid())
  clinicId              String
  date                  DateTime @db.Date
  profileViews          Int      @default(0)
  leadsNew              Int      @default(0)
  leadsContacted        Int      @default(0)
  leadsConverted        Int      @default(0)
  leadsLost             Int      @default(0)
  appointmentsScheduled Int      @default(0)
  appointmentsCompleted Int      @default(0)
  appointmentsCanceled  Int      @default(0)
  appointmentsNoShow    Int      @default(0)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  clinic Clinic @relation(fields: [clinicId], references: [id])
  @@unique([clinicId, date])
  @@index([clinicId])
  @@index([date])
  @@map("daily_metrics")
}
```

## ClinicalRecord

```prisma
model ClinicalRecord {
  id               String               @id @default(cuid())
  clinicId         String
  appointmentId    String?              @unique
  profileId        String
  patientId        String?
  patientName      String
  patientEmail     String?
  patientPhone     String?
  status           ClinicalRecordStatus @default(DRAFT)
  chiefComplaint   String?              @db.Text
  anamnesis        String?              @db.Text
  clinicalEvolution String?             @db.Text
  diagnosis        String?              @db.Text
  proceduresPerformed String?           @db.Text
  treatmentPlan    String?              @db.Text
  prescription     String?              @db.Text
  recommendations  String?              @db.Text
  privateNotes     String?              @db.Text
  aiDraft          String?              @db.Text
  aiSummary        String?              @db.Text
  odontogramSnapshot Json?
  printedAt        DateTime?
  completedAt      DateTime?
  lockedAt         DateTime?
  createdByUserId  String
  updatedByUserId  String?
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt
  clinic        Clinic                    @relation(fields: [clinicId], references: [id])
  appointment   Appointment?              @relation(fields: [appointmentId], references: [id])
  profile       Profile                   @relation(fields: [profileId], references: [id])
  patientRecord Patient?                  @relation(fields: [patientId], references: [id])
  createdByUser User                      @relation("ClinicalRecordCreatedBy", fields: [createdByUserId], references: [id])
  updatedByUser User?                     @relation("ClinicalRecordUpdatedBy", fields: [updatedByUserId], references: [id])
  events        ClinicalRecordEvent[]
  attachments   ClinicalRecordAttachment[]
  @@index([clinicId])
  @@index([clinicId, status])
  @@index([clinicId, patientEmail])
  @@index([clinicId, patientName])
  @@index([clinicId, patientId])
  @@index([profileId])
  @@index([createdAt])
  @@map("clinical_records")
}
```

## ClinicalRecordEvent

```prisma
model ClinicalRecordEvent {
  id               String                @id @default(cuid())
  clinicId         String
  clinicalRecordId String
  eventType        String
  previousStatus   ClinicalRecordStatus?
  nextStatus       ClinicalRecordStatus?
  message          String?
  metadata         Json?
  createdByUserId  String?
  createdAt        DateTime              @default(now())
  clinic         Clinic         @relation(fields: [clinicId], references: [id])
  clinicalRecord ClinicalRecord @relation(fields: [clinicalRecordId], references: [id], onDelete: Cascade)
  createdByUser  User?          @relation("ClinicalRecordEventCreatedBy", fields: [createdByUserId], references: [id])
  @@index([clinicalRecordId])
  @@index([clinicalRecordId, createdAt])
  @@map("clinical_record_events")
}
```

## ClinicalRecordAttachment

```prisma
model ClinicalRecordAttachment {
  id               String   @id @default(cuid())
  clinicId         String
  clinicalRecordId String
  fileName         String
  fileType         String?
  mimeType         String?
  sizeBytes        Int?
  storageKey       String?
  dataBase64       String?  @db.Text
  thumbnailBase64  String?  @db.Text
  description      String?
  uploadedByUserId String
  createdAt        DateTime @default(now())
  clinicalRecord ClinicalRecord @relation(fields: [clinicalRecordId], references: [id], onDelete: Cascade)
  uploadedByUser User           @relation("AttachmentUploadedBy", fields: [uploadedByUserId], references: [id])
  @@index([clinicalRecordId])
  @@map("clinical_record_attachments")
}
```

## ClinicalTemplate

```prisma
model ClinicalTemplate {
  id              String                   @id @default(cuid())
  clinicId        String
  name            String
  category        ClinicalTemplateCategory @default(OTHER)
  content         String                   @db.Text
  isActive        Boolean                  @default(true)
  createdByUserId String
  createdAt       DateTime                 @default(now())
  updatedAt       DateTime                 @updatedAt
  clinic        Clinic @relation(fields: [clinicId], references: [id])
  createdByUser User   @relation("ClinicalTemplateCreatedBy", fields: [createdByUserId], references: [id])
  @@index([clinicId])
  @@index([clinicId, isActive])
  @@index([clinicId, category])
  @@map("clinical_templates")
}
```

## OdontogramRecord

```prisma
model OdontogramRecord {
  id              String   @id @default(cuid())
  clinicId        String
  patientId       String?
  patientEmail    String?
  patientName     String
  data            Json
  createdByUserId String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  clinic        Clinic @relation(fields: [clinicId], references: [id])
  patientRecord Patient? @relation(fields: [patientId], references: [id])
  createdByUser User   @relation("OdontogramRecordCreatedBy", fields: [createdByUserId], references: [id])
  @@index([clinicId])
  @@index([clinicId, patientEmail])
  @@index([clinicId, patientName])
  @@index([clinicId, patientId])
  @@map("odontogram_records")
}
```

## StockCategory

```prisma
model StockCategory {
  id        String   @id @default(cuid())
  clinicId  String
  name      String
  color     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  clinic   Clinic         @relation(fields: [clinicId], references: [id])
  products StockProduct[]
  @@unique([clinicId, name])
  @@index([clinicId])
  @@map("stock_categories")
}
```

## StockProduct

```prisma
model StockProduct {
  id               String    @id @default(cuid())
  clinicId         String
  categoryId       String
  name             String
  description      String?   @db.Text
  unit             String    @default("unidade")
  currentQuantity  Decimal   @default(0) @db.Decimal(10, 3)
  minQuantity      Decimal   @default(0) @db.Decimal(10, 3)
  purchasePrice    Int?      // in cents — e.g. 1500 = R$15,00
  supplier         String?
  expiresAt        DateTime? @db.Date
  notes            String?   @db.Text
  isActive         Boolean   @default(true)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  clinic   Clinic        @relation(fields: [clinicId], references: [id])
  category StockCategory @relation(fields: [categoryId], references: [id])
  movements StockMovement[]
  @@index([clinicId])
  @@index([categoryId])
  @@index([clinicId, isActive])
  @@index([expiresAt])
  @@map("stock_products")
}
```

## StockMovement

```prisma
model StockMovement {
  id                String            @id @default(cuid())
  clinicId          String
  productId         String
  type              StockMovementType
  quantity          Decimal           @db.Decimal(10, 3)
  previousQuantity  Decimal           @db.Decimal(10, 3)
  newQuantity       Decimal           @db.Decimal(10, 3)
  reason            String?
  notes             String?           @db.Text
  performedByUserId String
  createdAt         DateTime          @default(now())
  clinic      Clinic       @relation(fields: [clinicId], references: [id])
  product     StockProduct @relation(fields: [productId], references: [id])
  performedBy User         @relation("StockMovementPerformedBy", fields: [performedByUserId], references: [id])
  @@index([clinicId])
  @@index([productId])
  @@index([clinicId, createdAt])
  @@index([clinicId, type])
  @@index([performedByUserId])
  @@map("stock_movements")
}
```

## PrivacyRequest

```prisma
model PrivacyRequest {
  id                          String               @id @default(cuid())
  requestCode                 String               @unique
  requesterName               String
  requesterEmail              String
  requesterType               RequesterType
  clinicName                  String?
  requestType                 PrivacyRequestType
  description                 String               @db.Text
  identityConfirmationAccepted Boolean             @default(false)
  status                      PrivacyRequestStatus @default(OPEN)
  assignedToUserId            String?
  responseNotes               String?              @db.Text
  completedAt                 DateTime?
  createdAt                   DateTime             @default(now())
  updatedAt                   DateTime             @updatedAt
  @@index([status])
  @@index([requesterEmail])
  @@index([createdAt])
  @@map("privacy_requests")
}
```

## CookieConsentLog

```prisma
model CookieConsentLog {
  id            String   @id @default(cuid())
  userId        String?
  anonymousId   String?
  categories    Json
  policyVersion String
  source        String   // banner | preferences
  ipHash        String?
  userAgent     String?
  createdAt     DateTime @default(now())
  @@index([userId])
  @@index([createdAt])
  @@map("cookie_consent_logs")
}
```

## TermsAcceptance

```prisma
model TermsAcceptance {
  id                   String   @id @default(cuid())
  userId               String
  privacyPolicyVersion String
  termsVersion         String
  acceptedAt           DateTime @default(now())
  ipHash               String?
  userAgent            String?
  user User @relation(fields: [userId], references: [id])
  @@index([userId])
  @@map("terms_acceptances")
}
```

## AuditLog

```prisma
model AuditLog {
  id          String      @id @default(cuid())
  actorUserId String?
  clinicId    String?
  action      AuditAction
  entityType  String?
  entityId    String?
  metadata    Json?
  ipHash      String?
  userAgent   String?
  createdAt   DateTime    @default(now())
  @@index([actorUserId])
  @@index([clinicId])
  @@index([action])
  @@index([createdAt])
  @@index([entityType, entityId])
  @@map("audit_logs")
}
```

## AiAssistantAnalysis

```prisma
model AiAssistantAnalysis {
  id           String                    @id @default(cuid())
  clinicId     String
  userId       String?
  type         AiAssistantAnalysisType
  status       AiAssistantAnalysisStatus
  content      Json?
  model        String?
  generatedAt  DateTime
  periodStart  DateTime?
  periodEnd    DateTime?
  errorMessage String?
  createdAt    DateTime                  @default(now())
  updatedAt    DateTime                  @updatedAt
  clinic Clinic @relation(fields: [clinicId], references: [id])
  user   User?  @relation(fields: [userId], references: [id])
  @@index([clinicId, type, generatedAt])
  @@index([clinicId, type, status])
  @@map("ai_assistant_analyses")
}
```

## NotificationConsent

```prisma
model NotificationConsent {
  id            String              @id @default(cuid())
  clinicId      String
  patientUserId String?             // User with PATIENT role, when available
  entityType    String?             // flexible future association ("appointment" | "lead")
  entityId      String?
  phone         String              // normalized: digits only, no country code
  channel       NotificationChannel
  scope         NotificationScope
  granted       Boolean             @default(false)
  grantedAt     DateTime?
  revokedAt     DateTime?
  source        ConsentSource
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
  clinic      Clinic                @relation(fields: [clinicId], references: [id])
  patientUser User?                 @relation("PatientNotificationConsents", fields: [patientUserId], references: [id])
  messages    NotificationMessage[]
  @@index([clinicId, phone, channel, scope])
  @@index([clinicId, patientUserId])
  @@index([clinicId, granted])
  @@map("notification_consents")
}
```

## NotificationPreference

```prisma
model NotificationPreference {
  id                  String   @id @default(cuid())
  clinicId            String   @unique
  whatsappEnabled     Boolean  @default(false)
  autoReminder        Boolean  @default(false)
  autoConfirmation    Boolean  @default(false)
  reminderHoursBefore Int      @default(24)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  clinic Clinic @relation(fields: [clinicId], references: [id])
  @@map("notification_preferences")
}
```

## NotificationQuota

```prisma
model NotificationQuota {
  id        String              @id @default(cuid())
  clinicId  String
  month     String              // "2026-05" — YYYY-MM
  channel   NotificationChannel
  used      Int                 @default(0)
  limit     Int
  createdAt DateTime            @default(now())
  updatedAt DateTime            @updatedAt
  clinic Clinic @relation(fields: [clinicId], references: [id])
  @@unique([clinicId, month, channel])
  @@index([clinicId])
  @@map("notification_quotas")
}
```

## NotificationMessage

```prisma
model NotificationMessage {
  id            String              @id @default(cuid())
  clinicId      String
  consentId     String?
  appointmentId String?
  templateSlug  String
  channel       NotificationChannel
  scope         NotificationScope
  status        NotificationStatus  @default(PENDING)
  providerRef   String?             // future: real provider message ID
  sentAt        DateTime?
  deliveredAt   DateTime?
  readAt        DateTime?
  failedAt      DateTime?
  failReason    String?
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
  clinic      Clinic               @relation(fields: [clinicId], references: [id])
  consent     NotificationConsent? @relation(fields: [consentId], references: [id])
  appointment Appointment?         @relation(fields: [appointmentId], references: [id])
  @@index([clinicId])
  @@index([clinicId, appointmentId])
  @@index([clinicId, createdAt])
  @@index([consentId])
  @@map("notification_messages")
}
```

## NotificationTemplate

```prisma
model NotificationTemplate {
  id        String                       @id @default(cuid())
  slug      String                       @unique
  channel   NotificationChannel
  category  NotificationTemplateCategory
  bodyPt    String                       @db.Text
  variables String[]
  isActive  Boolean                      @default(true)
  createdAt DateTime                     @default(now())
  @@map("notification_templates")
}
```

## Patient

```prisma
model Patient {
  id        String    @id @default(cuid())
  clinicId  String
  name      String
  email     String?
  phone     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
  clinic Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  appointments      Appointment[]
  clinicalRecords   ClinicalRecord[]
  odontogramRecords OdontogramRecord[]
  avatars           PatientAvatar[]
  @@index([clinicId])
  @@index([clinicId, email])
  @@index([clinicId, phone])
  @@index([clinicId, name])
  @@map("patients")
}
```

## PatientAvatar

```prisma
model PatientAvatar {
  id         String   @id @default(cuid())
  clinicId   String
  patientId  String?
  identifier String   // patient email (preferred) or name when no email
  avatarUrl  String?  @db.Text
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  clinic Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  patientRecord Patient? @relation(fields: [patientId], references: [id])
  @@unique([clinicId, identifier])
  @@unique([clinicId, patientId])
  @@index([clinicId])
  @@map("patient_avatars")
}
```

