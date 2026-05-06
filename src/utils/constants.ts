export const COUNTRIES = [
  { code: 'SG', name: 'Singapore' },
  { code: 'JP', name: 'Japan' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CN', name: 'China' },
  { code: 'HK', name: 'Hong Kong SAR' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'KR', name: 'South Korea' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'IN', name: 'India' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'OM', name: 'Oman' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'EG', name: 'Egypt' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'VG', name: 'British Virgin Islands' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'JE', name: 'Jersey' },
  { code: 'GG', name: 'Guernsey' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IL', name: 'Israel' },
  { code: 'RU', name: 'Russia' },
  { code: 'OTHER', name: 'Other' },
]

export const SOURCE_OF_WEALTH_OPTIONS = [
  { value: 'savings', label: 'Savings' },
  { value: 'salary', label: 'Salary / Employment Income' },
  { value: 'business_earnings', label: 'Business Earnings' },
  { value: 'inherited_wealth', label: 'Inherited Wealth' },
  { value: 'rental_income', label: 'Rental Income' },
  { value: 'sale_property', label: 'Sale / Investment of Property' },
  { value: 'trading_investment', label: 'Trading / Investment Returns' },
  { value: 'business_income', label: 'Business Income (Corporate)' },
  { value: 'sale_investment', label: 'Sale of Investment (Corporate)' },
  { value: 'capital_injection', label: 'Injection of Capital (Corporate)' },
  { value: 'other', label: 'Others (please specify)' },
]

export const INDUSTRY_OPTIONS = [
  { value: 'banks', label: 'Banks' },
  { value: 'fund_management', label: 'Fund Management' },
  { value: 'securities_futures', label: 'Securities and Futures Firm' },
  { value: 'energy_commodity', label: 'Energy / Commodity Firms' },
  { value: 'government', label: 'Government Firms / Agencies' },
  { value: 'insurance', label: 'Insurance Companies' },
  { value: 'technology', label: 'Technology' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'healthcare', label: 'Healthcare / Pharmaceuticals' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail / Consumer' },
  { value: 'education', label: 'Education' },
  { value: 'npo', label: 'Non-Profit Organisation' },
  { value: 'other', label: 'Others (please specify)' },
]

export const INVESTMENT_PRODUCT_OPTIONS = [
  'Equities / Stocks',
  'Fixed Income / Bonds',
  'Private Equity',
  'Venture Capital',
  'Hedge Funds',
  'Real Estate / REITs',
  'Commodities',
  'Foreign Exchange (FX)',
  'Derivatives / Options',
  'Collective Investment Schemes (CIS)',
  'Structured Products',
  'Digital Assets / Crypto',
]

export const LEGAL_FORM_OPTIONS = [
  'Private Limited Company (Pte. Ltd.)',
  'Public Listed Company',
  'Sole Proprietorship',
  'General Partnership',
  'Limited Partnership (LP)',
  'Limited Liability Partnership (LLP)',
  'Trust',
  'Foundation',
  'Exempted Limited Partnership',
  'Government / Statutory Board',
  'Sovereign Wealth Fund',
  'International Organisation',
  'Others',
]

export const FATF_HIGH_RISK_COUNTRIES = [
  'IR', // Iran
  'KP', // North Korea
  'MM', // Myanmar
  'BY', // Belarus (OFAC sanctions)
  'RU', // Russia
  'SY', // Syria
  'CU', // Cuba
]

export const FUND_TYPES = [
  { value: 'pe_closed_end', label: 'Private Equity (Closed-End)' },
  { value: 'hedge_fund', label: 'Hedge Fund' },
  { value: 'pension_fund', label: 'Pension Fund' },
  { value: 'vc', label: 'Venture Capital Fund' },
  { value: 'fof', label: 'Fund of Funds' },
  { value: 'other', label: 'Other' },
]
