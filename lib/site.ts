// Single source of truth for the link-in-bio page content and booking rules (shared by page and server).
// Values marked PLACEHOLDER need confirming before going live.

export type SocialIcon = 'instagram' | 'tiktok' | 'linkedin' | 'github'

export const site = {
  name: 'Antonije Mirkovic',
  url: 'https://mirkovic.dev',
  handle: '@mirkovicdev',
  avatar: {
    src: '/avatar.webp',
    zoom: 1.4, // 1 = whole photo; zoom is done in CSS so the file stays untouched
    focus: '50% 45%', // point that stays fixed while zooming (roughly the face)
  },
  contactEmail: 'contact@mirkovic.dev',

  // go.quantframe.io links open the real site directly instead of Instagram's in-app browser
  socials: [
    { label: 'Instagram', href: 'https://go.quantframe.io/instagram', icon: 'instagram' },
    { label: 'TikTok', href: 'https://tiktok.com/@mirkovicdev', icon: 'tiktok' },
    { label: 'LinkedIn', href: 'https://go.quantframe.io/linkedin', icon: 'linkedin' },
    { label: 'GitHub', href: 'https://go.quantframe.io/github', icon: 'github' },
  ] satisfies { label: string; href: string; icon: SocialIcon }[],

  quantframe: {
    href: 'https://go.quantframe.io/home',
    description: 'Want to work in quant? Start here: real projects, 1,000+ problems and a roadmap built around you.',
    image: '/quantframe-card.webp', // 1000×562 screenshot of quantframe.io
    imageZoom: 1.2, // trims the empty sides; full height is always kept
  },

  discord: {
    href: 'https://go.quantframe.io/discord',
    title: 'Discord community',
    description: 'Ask questions, share progress and meet people on the same path.',
  },

  booking: {
    durationMin: 45,
    bufferMin: 15, // kept free between calls
    currency: 'USD',
    hostTimeZone: 'Europe/Oslo', // opened hours (admin page) are in this time zone
    daysAhead: 21,
    minNoticeHours: 24,
    holdMinutes: 15, // how long a time stays reserved while someone is paying
    reminderMinutesBefore: 60, // one reminder email to the client, this long before the call

    // Price is per tier; each topic belongs to one tier. The server charges from this, never from the browser.
    tiers: [
      { id: 'career', label: 'Career & study', price: 300 },
      { id: 'technical', label: 'Technical session', price: 500 },
    ] satisfies { id: TierId; label: string; price: number }[],
    topics: [
      { id: 'study-plan', label: 'Study plan', tier: 'career' },
      { id: 'career-advice', label: 'Career advice', tier: 'career' },
      { id: 'general-chat', label: 'General chat', tier: 'career' },
      { id: 'project-consulting', label: 'Project consulting', tier: 'technical' },
      { id: 'lesson', label: '1:1 lesson on a topic', tier: 'technical' },
    ] satisfies { id: string; label: string; tier: TierId }[],
    backgrounds: [
      { id: 'student', label: 'Student' },
      { id: 'working', label: 'Working' },
      { id: 'switching', label: 'Switching into quant' },
    ],
    custom: {
      label: 'Long-term help or collaboration',
      description: 'Email me the scope and we take it from there.',
    },
    cancellationPolicy:
      'Free cancellation or rescheduling until 24 hours before the call: just email contact@mirkovic.dev. No refunds after that.',
  },
}

export type TierId = 'career' | 'technical'

// "$60" style price label
export function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
