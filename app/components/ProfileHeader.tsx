import Image from 'next/image'
import { site } from '@/lib/site'
import { socialIcons } from './BrandIcons'

export default function ProfileHeader() {
  const { avatar } = site
  return (
    <header className="flex flex-col items-center px-5 pt-14 text-center">
      {/* Hairline ring with a small gap around the avatar */}
      <div className="rounded-full p-1 ring-1 ring-white/10">
        <div className="size-[104px] overflow-hidden rounded-full">
          <Image
            src={avatar.src}
            alt={site.name}
            width={104}
            height={104}
            priority
            className="size-full object-cover"
            style={{ transform: `scale(${avatar.zoom})`, transformOrigin: avatar.focus }}
          />
        </div>
      </div>

      <p className="mt-5 text-[14px] text-zinc-400">{site.handle}</p>
      <h1 className="mt-1 font-mono text-[27px] font-semibold leading-[1.1] tracking-[-0.04em] text-zinc-50">
        {site.name}
      </h1>

      <nav aria-label="Social profiles" className="mt-5 flex gap-1">
        {site.socials.map(({ label, href, icon }) => {
          const Icon = socialIcons[icon]
          return (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="grid size-10 place-items-center rounded-full text-zinc-400 transition-colors hover:text-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300"
            >
              <Icon className="size-[19px]" />
            </a>
          )
        })}
      </nav>
    </header>
  )
}
