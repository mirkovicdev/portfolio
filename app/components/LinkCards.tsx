import type { ReactNode } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { site } from '@/lib/site'
import { DiscordIcon, QuantFrameLogo } from './BrandIcons'

const cardClass =
  'group block overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-colors hover:border-white/[0.16] hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300'

// Shared bottom row: icon tile, title + one line, arrow
function CardRow({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <span className="flex items-center gap-3.5 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-zinc-900">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[15px] font-medium text-zinc-50">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-zinc-400">{description}</span>
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-zinc-500 transition-colors group-hover:text-zinc-50" />
    </span>
  )
}

// Primary card: competition preview image on top, full frame
export function FrontierHackCard() {
  const { href, description, image, logo } = site.frontierhack
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cardClass}>
      <div className="border-b border-white/[0.08]">
        <Image src={image} alt="" width={1200} height={630} className="h-auto w-full" />
      </div>
      {/* lighten turns the icon's near-black square (#050505) into the tile's gray; the file stays untouched */}
      <CardRow
        icon={<Image src={logo} alt="" width={512} height={512} className="size-7 mix-blend-lighten" />}
        title="FrontierHack"
        description={description}
      />
    </a>
  )
}

export function QuantFrameCard() {
  const { href, description } = site.quantframe
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cardClass}>
      <CardRow icon={<QuantFrameLogo className="size-6" />} title="QuantFrame" description={description} />
    </a>
  )
}

export function DiscordCard() {
  const { href, title, description } = site.discord
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cardClass}>
      <CardRow icon={<DiscordIcon className="size-5 text-zinc-50" />} title={title} description={description} />
    </a>
  )
}
