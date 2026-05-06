// ─── Enumerations ─────────────────────────────────────────────────────────────

export type Jurisdiction = 'MAS' | 'FSA' | 'BOTH'

export type InvestorType =
  | 'individual'
  | 'corporate_sg'       // Private Company (Singapore)
  | 'corporate_overseas' // Private Company (Overseas)
  | 'listed_company'
  | 'regulated_institution'
  | 'regulated_bank'
  | 'fund'               // Pooled Investment Vehicle (PE/Hedge/Pension/VC)
  | 'swf'                // Sovereign Wealth Fund / Government Entity
  | 'trust'
  | 'partnership'
  | 'npo'                // Charity / NPO / NGO / Club / Society
  | 'nominee'            // Nominee / Omnibus Account

export type MASClassification =
  | 'accredited_individual'   // SFA s4A(1)(a) individual
  | 'accredited_corporate'    // SFA s4A(1)(b) corporation >S$10M
  | 'accredited_trust'        // SFA s4A(1)(c) trustee of qualifying trust
  | 'accredited_entity'       // SFA s4A(1)(d) entity >S$10M
  | 'accredited_partnership'  // SFA s4A(1)(e)
  | 'accredited_wholly_owned' // SFA s4A(1)(f) wholly owned by AI
  | 'institutional'           // SFA s4A(1)(c) institutional investor

export type AIBasis =
  | 'net_personal_assets'    // >S$2M incl. primary residence capped S$1M
  | 'financial_assets'       // >S$1M net of liabilities
  | 'annual_income'          // >S$300K in preceding 12 months
  | 'net_assets_10m'         // Corporation / trust / entity >S$10M

export type FSAClassification =
  | 'general'
  | 'professional'
  | 'qualified_institutional' // 適格機関投資家

// Japanese non-QII investor categories (FIEA Article 17-12 Para 1 Items 1-15)
export type JapanNonQIICategory =
  | 'japanese_government'
  | 'financial_instruments_operator'
  | 'fund_asset_manager'
  | 'linked_to_fund_manager'
  | 'listed_company'
  | 'juridical_person_50m'
  | 'subsidiary_of_regulated'
  | 'special_corporation'
  | 'tmk'
  | 'pension_fund_10b'
  | 'foreign_juridical_person'
  | 'individual_100m'
  | 'juridical_person_100m'
  | 'individual_managing_partner'
  | 'juridical_person_managing_partner'
  | 'public_interest_corporation'
  | 'asset_manager'
  | 'foreign_fund_issuer'

// ─── Shared sub-types ─────────────────────────────────────────────────────────

export interface Address {
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface TaxResidency {
  country: string
  tinType: string // e.g. NRIC, TIN, SSN, ABN
  tin: string
  tinNotAvailableReason?: string
}

export interface PersonIdentity {
  fullName: string
  aliases?: string
  idType: 'passport' | 'nric' | 'fin' | 'other'
  idNumber: string
  idExpiry?: string
  nationality: string
  dateOfBirth?: string
  isPEP: boolean
}

export interface AuthorisedPerson extends PersonIdentity {
  address: Address
  email?: string
  phone?: string
}

export interface ConnectedPerson extends PersonIdentity {
  connectionToClient: string
  address?: Address
}

export interface BeneficialOwner extends PersonIdentity {
  address: Address
  ownershipPct?: number
  controlType?: 'ownership' | 'other_means' | 'senior_managing_official'
}

export interface Director extends PersonIdentity {
  position: string
  domicile?: string
  address?: Address
}

export interface CorporateShareholder {
  companyName: string
  registrationNo: string
  placeOfIncorporation: string
  effectiveShareholding: number
  address: string
  screenDate?: string
}

export interface BankDetails {
  bankName: string
  bankAddress: string
  swiftOrAba: string
  ibanOrSortCode?: string
  correspondentBankName?: string
  correspondentBankAddress?: string
  correspondentAccountOrSwift?: string
  beneficiaryAccountName: string
  beneficiaryAccountNumber: string
}

// ─── Individual Investor ───────────────────────────────────────────────────────

export interface IndividualInfo {
  // Identity
  fullName: string
  aliases?: string
  dateOfBirth: string
  placeOfBirth: string
  countryOfBirth: string
  nationality: string
  countryOfResidence: string
  idType: 'passport' | 'nric' | 'fin' | 'other'
  idNumber: string
  idExpiry?: string
  idIssuingCountry: string

  // Contact
  email: string
  phone: string
  residentialAddress: Address
  mailingAddressSame: boolean
  mailingAddress?: Address

  // Employment
  employmentStatus: 'employed' | 'self_employed' | 'retired' | 'other'
  employerName?: string
  position?: string
  natureOfBusiness?: string

  // AML/KYC
  sourceOfWealth: string[]
  sourceOfWealthOther?: string
  sourceOfFunds: string[]
  sourceOfFundsOther?: string
  purposeOfInvestment: string

  // PEP
  isPEP: boolean
  pepDetails?: string
  isRelatedToPEP: boolean
  relatedPEPDetails?: string

  // Tax
  taxResidencies: TaxResidency[]

  // MAS Classification
  masClassification?: MASClassification
  aiBasis?: AIBasis[]
  netPersonalAssets?: number   // SGD
  financialAssets?: number     // SGD net of liabilities
  annualIncome?: number        // SGD
  aiOptIn?: boolean            // consent to be treated as AI

  // Japan FSA
  isJapanInvestor?: boolean
  isQII?: boolean
  qiiRegistrationNo?: string
  nonQIICategory?: JapanNonQIICategory[]
  investableFinancialAssets?: number // JPY (for 100M threshold)
  securitiesAccountOpenedOver1Year?: boolean
  antiSocialForcesDeclaration?: boolean
  capitalNotCriminalProceeds?: boolean

  // Bank
  bankDetails?: BankDetails
}

// ─── Entity / Corporate ────────────────────────────────────────────────────────

export interface EntityInfo {
  // Basic
  legalName: string
  tradingName?: string
  registrationNo: string
  dateOfIncorporation: string
  placeOfIncorporation: string
  legalForm: string // Private Limited, Partnership, Trust, etc.

  // Contact
  registeredAddress: Address
  operatingAddressSame: boolean
  operatingAddress?: Address
  email: string
  phone: string
  website?: string

  // Regulator
  regulatorName?: string
  exchangeListed?: string
  isListed: boolean

  // Nature of business
  industryType: string // Banks, Fund Management, Securities, Energy, Govt, Insurance, Others
  industryOther?: string
  natureOfBusiness?: string

  // AML/KYC
  sourceOfFunds: string[]
  sourceOfFundsOther?: string
  sourceOfWealth: string[]
  sourceOfWealthOther?: string
  purposeOfInvestment: string
  investmentForOwnAccount: boolean

  // Financials
  netAssets?: number
  currency?: string
  latestAuditedFinancials?: boolean

  // People
  directors: Director[]
  authorisedPersons: AuthorisedPerson[]
  connectedPersons: ConnectedPerson[]
  beneficialOwners: BeneficialOwner[]    // 10%+ (FGC threshold)
  corporateShareholders: CorporateShareholder[]
  boExemptionApplies: boolean
  boExemptionBasis?: string

  // MAS
  masClassification?: MASClassification
  aiOptIn?: boolean

  // Japan FSA
  isJapanInvestor?: boolean
  isQII?: boolean
  qiiRegistrationNo?: string
  nonQIICategory?: JapanNonQIICategory[]
  investableFinancialAssets?: number
  antiSocialForcesDeclaration?: boolean
  capitalNotCriminalProceeds?: boolean

  // Tax
  taxResidencies: TaxResidency[]
  isUSPerson: boolean
  usTIN?: string

  // Bank
  bankDetails?: BankDetails
}

// ─── Fund specific ────────────────────────────────────────────────────────────

export interface FundInfo extends EntityInfo {
  fundType: 'pe_closed_end' | 'hedge_fund' | 'pension_fund' | 'vc' | 'fof' | 'other'
  fundTypeOther?: string
  aumUSD?: number
  vintageYear?: string
  fundManagerName: string
  fundManagerJurisdiction: string
  fundManagerLicenseNo?: string
  fundAdministratorName?: string
  auditorName?: string
  amlConfirmationLetter?: boolean // written confirmation AML checks done on underlying investors
  offeringDocumentProvided?: boolean
}

// ─── Trust specific ───────────────────────────────────────────────────────────

export interface TrustInfo extends EntityInfo {
  trustType: 'discretionary' | 'fixed' | 'testamentary' | 'unit' | 'charitable' | 'bare' | 'other'
  trustTypeOther?: string
  trustDeedDate?: string
  isRegulatedTrustee: boolean
  settlorName: string
  settlorType: 'individual' | 'corporate'
  settlorNationality?: string
  settlorAddress?: Address
  settlorIsPEP?: boolean
  protectorName?: string
  protectorNationality?: string
  beneficiaries: {
    name: string
    type: 'individual' | 'corporate' | 'class'
    description?: string
    isPEP?: boolean
    interestPct?: number
  }[]
  amlConfirmationLetter?: boolean // regulated trustee undertaking
}

// ─── SWF / Government Entity ──────────────────────────────────────────────────

export interface SWFInfo extends EntityInfo {
  country: string
  legalMandate: string
  establishingLaw?: string
  isUNMember: boolean
  isFATFMember: boolean
  isCentralGovernmentOwned: boolean
  governingBody: string
}

// ─── Partnership ──────────────────────────────────────────────────────────────

export interface PartnershipInfo extends EntityInfo {
  partnershipType: 'general' | 'limited' | 'llp' | 'other'
  partnershipDeedDate?: string
  generalPartners: PersonIdentity[]
  limitedPartnersAMLConfirmation?: boolean
  managingPartnerName: string
  isGPRegulated: boolean
  gpRegulatoryDetails?: string
}

// ─── NPO / Charity ────────────────────────────────────────────────────────────

export interface NPOInfo extends EntityInfo {
  npoType: 'charity' | 'ngo' | 'npo' | 'club' | 'society' | 'other'
  npoTypeOther?: string
  registrationBody?: string
  constitution?: boolean
  activities: string
  committeeMembers: PersonIdentity[]
  chairmanName?: string
  majorDonors?: string
}

// ─── Nominee Account ──────────────────────────────────────────────────────────

export interface NomineeInfo extends EntityInfo {
  nomineeType: 'private_bank' | 'investment_adviser' | 'nominee_company' | 'other'
  isRegulatedNominee: boolean
  nomineeRegulatorEvidence?: boolean
  nomineeJurisdiction: string
  isFATFJurisdiction: boolean
  omnibusAccount: boolean // true = omnibus, false = named underlying
  namedInvestors?: string // names of underlying investors
  amlConfirmationLetter?: boolean
}

// ─── CRS-FATCA ────────────────────────────────────────────────────────────────

export interface IndividualCRSFATCA {
  // Identity (pre-filled from IndividualInfo)
  accountHolderName: string
  dateOfBirth: string
  placeAndCountryOfBirth: string
  permanentResidenceAddress: Address
  mailingAddress?: Address

  // US person
  isUSCitizen: boolean
  usTIN?: string
  bornInUSButRenouncedCitizenship?: boolean

  // Non-US tax residency
  taxResidencies: TaxResidency[]

  declaration: boolean
}

export interface EntityCRSFATCA {
  legalName: string
  countryOfIncorporation: string
  registeredAddress: Address
  mailingAddress?: Address

  // FATCA
  isUSPerson: boolean
  usTIN?: string
  fatcaClassification:
    | 'specified_us_person'
    | 'us_person_not_specified'
    | 'reporting_model1_ffi'
    | 'reporting_model2_ffi'
    | 'participating_ffi'
    | 'registered_deemed_compliant_ffi'
    | 'sponsored_fi'
    | 'trustee_documented_trust'
    | 'certified_deemed_compliant_ffi'
    | 'non_participating_ffi'
    | 'exempt_beneficial_owner'
    | 'active_nffe'
    | 'direct_reporting_nffe'
    | 'sponsored_direct_reporting_nffe'
    | 'passive_nffe'
  giin?: string
  sponsoringEntityName?: string
  sponsoringEntityGIIN?: string

  // CRS
  crsClassification:
    | 'reporting_fi'
    | 'non_reporting_fi_governmental'
    | 'non_reporting_fi_international_org'
    | 'non_reporting_fi_central_bank'
    | 'non_reporting_fi_retirement_fund'
    | 'non_reporting_fi_exempt_civ'
    | 'non_reporting_fi_other'
    | 'fi_non_participating_jurisdiction'
    | 'active_nfe_traded'
    | 'active_nfe_governmental'
    | 'active_nfe_other'
    | 'passive_nfe'
  taxResidencies: TaxResidency[]

  // Controlling persons (for Passive NFE)
  controllingPersons: {
    name: string
    address: Address
    dateOfBirth: string
    placeOfBirth: string
    countryOfBirth: string
    taxResidencies: TaxResidency[]
    controlType:
      | 'legal_person_ownership'
      | 'legal_person_other_means'
      | 'legal_person_senior_official'
      | 'trust_settlor'
      | 'trust_trustee'
      | 'trust_protector'
      | 'trust_beneficiary'
      | 'trust_other'
      | 'arrangement_settlor_equiv'
      | 'arrangement_trustee_equiv'
      | 'arrangement_protector_equiv'
      | 'arrangement_beneficiary_equiv'
      | 'arrangement_other_equiv'
    entityName: string
  }[]

  declaration: boolean
}

// ─── Tax Offences Questionnaire (Schedule 4) ──────────────────────────────────

export interface TaxOffencesQuestionnaire {
  // Part I (all investors)
  incomeTaxConviction: boolean | null
  incomeTaxOmission: boolean | null
  incomeTaxFalseStatement: boolean | null
  incomeTaxFalseAnswer: boolean | null
  incomeTaxFalseNotification: boolean | null
  incomeTaxFailureToNotify: boolean | null
  incomeTaxFalseBooks: boolean | null
  incomeTaxFraud: boolean | null
  consumptionTaxConviction: boolean | null
  consumptionTaxOmission: boolean | null
  consumptionTaxFalseStatement: boolean | null
  consumptionTaxFalseAnswer: boolean | null
  consumptionTaxFalseBooks: boolean | null
  consumptionTaxFraud: boolean | null
  consumptionTaxRefundFraud: boolean | null
  consumptionTaxFalseInfo: boolean | null
  // Part II (non-individuals)
  authorisedSignatoryPersonalKnowledge?: boolean | null
  taxOffencesDetails?: string
}

// ─── AML Risk Profile (internal compliance scoring) ───────────────────────────

export interface AMLRiskProfile {
  // Country risk
  countryRisk: 'low' | 'medium' | 'high'
  countryRiskBasis?: string

  // Tax risk
  taxRisk: 'low' | 'medium' | 'high'
  taxRiskBasis?: string

  // Industry risk
  industryRisk: 'low' | 'medium' | 'high'
  industryRiskBasis?: string

  // Red flags
  taxHavens: boolean
  complexStructures: boolean
  mismatchIdentity: boolean
  negativeNewsReports: boolean
  multipleRegionTaxReturns: boolean
  commonAddresses: boolean
  poBoxAddress: boolean
  inconsistentTransactions: boolean
  insufficientIncome: boolean
  unusualEarnings: boolean
  nonFaceToFace: boolean
  otherRedFlags?: string

  // Sanctions screening
  worldCheckScreened: boolean
  publicDomainScreened: boolean
  masWatchlistScreened: boolean
  strDataChecked: boolean
  screeningDate?: string
  screeningResult: 'no_match' | 'match_cleared' | 'match_pending'
  screeningComments?: string

  // Overall
  overallRisk: 'low' | 'medium' | 'high'
  overallRiskCode: string // LLL, MMM, HHH etc.
  eddRequired: boolean
  eddTriggers?: string
  reviewedBy?: string
  approvedBy?: string
  reviewDate?: string
}

// ─── Investment Risk Profile ───────────────────────────────────────────────────

export interface InvestmentRiskProfile {
  investmentObjective: string
  riskTolerance: 'conservative' | 'moderate_conservative' | 'moderate' | 'aggressive' | 'very_aggressive'
  investmentHorizon: '<1yr' | '1-3yr' | '3-5yr' | '5-10yr' | '>10yr'
  liquidityNeeds: 'low' | 'moderate' | 'high'
  investmentExperience: 'none' | 'limited' | 'moderate' | 'extensive'
  productsExperience: string[]
  estimatedInvestmentAmountUSD: number
  percentageOfNetWorth?: number
}

// ─── Declarations ─────────────────────────────────────────────────────────────

export interface Declarations {
  // AI opt-in (Schedule 2B Notice A)
  aiOptInConsent?: boolean      // true = consent, false = do not consent
  aiOptInDate?: string
  aiOptInSignatoryName?: string
  aiOptInSignatoryDesignation?: string

  // Accuracy
  informationAccurate: boolean

  // Privacy (Schedule 6)
  privacyNoticeRead: boolean

  // Terms
  termsAccepted: boolean

  // Japan specific
  japanImportantMattersExplained?: boolean
  japanCriminalProceedsDeclaration?: boolean
  japanIdentityDocumentsCorrect?: boolean
}

// ─── Document Checklist ────────────────────────────────────────────────────────

export interface DocumentItem {
  id: string
  label: string
  required: boolean
  uploaded: boolean
  fileName?: string
  waived?: boolean
  waivedReason?: string
}

// ─── Master Onboarding Record ─────────────────────────────────────────────────

export interface OnboardingData {
  // Step 1
  jurisdiction: Jurisdiction
  investorType: InvestorType
  fundName?: string
  fundType?: string

  // Step 2+: entity data (only one of these will be populated)
  individual?: IndividualInfo
  entity?: EntityInfo | FundInfo | TrustInfo | SWFInfo | PartnershipInfo | NPOInfo | NomineeInfo

  // Step: CRS-FATCA
  crsFatcaIndividual?: IndividualCRSFATCA
  crsFatcaEntity?: EntityCRSFATCA

  // Step: Tax Offences
  taxOffences?: TaxOffencesQuestionnaire

  // Step: AML Risk
  amlRisk?: AMLRiskProfile

  // Step: Investment Risk Profile
  investmentRisk?: InvestmentRiskProfile

  // Step: Documents
  documents?: DocumentItem[]

  // Step: Declarations
  declarations?: Declarations

  // Metadata
  submittedAt?: string
  referenceNo?: string
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
}

// ─── Step Navigation ──────────────────────────────────────────────────────────

export type StepId =
  | 'welcome'
  | 'identity'
  | 'mas_classification'
  | 'japan_qualification'
  | 'entity_people'
  | 'beneficial_ownership'
  | 'aml_kyc'
  | 'crs_fatca'
  | 'tax_offences'
  | 'risk_profile'
  | 'documents'
  | 'declarations'
  | 'review'
  | 'confirmation'

export interface Step {
  id: StepId
  title: string
  subtitle?: string
  applicable: (data: OnboardingData) => boolean
}
