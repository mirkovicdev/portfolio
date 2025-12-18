import type { Metadata } from 'next'
import '../globals.css'
import { createClient } from '@/lib/supabase/server'
import { ConditionalSidebar } from './components/conditional-sidebar'
import { PyodideWrapper } from './components/PyodideWrapper'

export const metadata: Metadata = {
  title: 'QuantFrame - Break into Quant',
  description: 'Learn the math, code, and mindset that top quant firms look for.',
}

export default async function QuantframeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile to check subscription status
  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('membership_tier')
    .eq('id', user.id)
    .single() : { data: null }

  const hasPaid = profile?.membership_tier === 'pro'

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <PyodideWrapper>
        <ConditionalSidebar userEmail={user?.email} hasPaid={hasPaid || false}>
          {children}
        </ConditionalSidebar>
      </PyodideWrapper>
    </div>
  )
}