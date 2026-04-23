/**
 * Central pricing config — edit here, updates site-wide.
 * All pricing values and display strings in one place.
 */

export const pricing = {
  // Core numbers
  monthly: 149,
  annual: 99,
  annualTotal: 1188,
  trialDays: 30,

  // Competitor
  freedMonthly: 99,

  // Display strings — used directly in templates
  introPrice: '$149/month',
  annualPrice: '$99/month',

  // Headlines & descriptions
  introHeadline: '$149/month. Start free.',
  introSubline: 'Annual billing available at $99/month.',
  trialLine: '30-day free trial, no credit card required.',

  // Trust line items (used in hero sections)
  trustIntro: '$149/month after trial',
  trustTrial: '30-day free trial',
  trustNoCc: 'No credit card required',
  trustHipaa: 'HIPAA Compliant',

  // Offer banner
  bannerText: '$149/month. Annual billing at $99/month.',
  bannerPrefix: 'Try Stream free for 30 days.',

  // FAQ
  faqQuestion: 'What does Stream cost?',
  faqAnswer: 'Stream is $149/month per user, billed monthly. Annual billing is available at $99/month ($1,188/year). Every plan starts with a 30-day free trial — no credit card required. Cancel anytime.',

  // Freed comparison
  freedSavings: 'Same price as Freed with annual billing',
  freedComparison: 'Same price as Freed, more features',

  // CTA body lines
  ctaBody: '$149/month after trial. Works alongside any EHR.',
  ctaBodyWithTrial: 'Start your 30-day free trial. No credit card. $149/month after trial. Works alongside any EHR.',
  featureCtaBody: 'No credit card required. $149/month after trial. Works alongside any EHR.',

  // Pricing card (homepage)
  cardAmount: '149',
  cardPeriod: 'per user / month · billed monthly',
  cardNormal: '30-day free trial. No credit card required. Annual billing at $99/month.',
  toggleMonthly: { amt: '149', period: 'per user / month · billed monthly' },
  toggleAnnual: { amt: '99', period: 'per user / month · billed annually ($1,188/yr)' },

  // Specialty page pricing callout
  calloutHeadline: '$149/month. Start free.',
  calloutBody: 'Unlimited visits. Works alongside any EHR. 30-day free trial, no credit card required.',
  calloutSmall: 'Cancel anytime. Annual billing available at $99/month.',
} as const;
