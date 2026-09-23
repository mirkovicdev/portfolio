// Lookups over the booking config. Safe to import from client and server (no secrets).
import { site } from '@/lib/site'

const { booking } = site

export type Topic = (typeof booking.topics)[number]
export type Tier = (typeof booking.tiers)[number]

export const getTopic = (id: string): Topic | undefined => booking.topics.find((t) => t.id === id)

export const getTier = (id: string): Tier | undefined => booking.tiers.find((t) => t.id === id)

export const isBackground = (id: string) => booking.backgrounds.some((b) => b.id === id)

// Whole currency units, e.g. 300 for $300
export function priceForTopic(topicId: string): number | undefined {
  const topic = getTopic(topicId)
  return topic ? getTier(topic.tier)?.price : undefined
}

export const lowestPrice = Math.min(...booking.tiers.map((t) => t.price))
