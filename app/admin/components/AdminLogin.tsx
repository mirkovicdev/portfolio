interface Props {
  denied: boolean
  configured: boolean
}

// Signed-out view: one button to Google. Plain <a> so the browser does a full redirect.
export default function AdminLogin({ denied, configured }: Props) {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-5">
      <div className="w-full max-w-[360px] rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h1 className="font-mono text-[22px] font-semibold tracking-[-0.03em] text-zinc-50">Admin</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">Sign in with the Google account that manages bookings.</p>

        {denied && (
          <p role="alert" className="mt-4 text-[13px] leading-relaxed text-red-400">
            Sign-in was refused. Only the admin Google account can sign in.
          </p>
        )}

        {configured ? (
          <a
            href="/api/admin/login"
            className="mt-5 flex h-12 items-center justify-center rounded-xl bg-zinc-50 text-[15px] font-medium text-zinc-950 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300"
          >
            Sign in with Google
          </a>
        ) : (
          <p className="mt-5 text-[13px] leading-relaxed text-zinc-400">
            Sign-in isn&apos;t set up yet. Add ADMIN_GOOGLE_CLIENT_ID, ADMIN_GOOGLE_CLIENT_SECRET, ADMIN_GOOGLE_EMAIL and
            ADMIN_SESSION_SECRET to the environment.
          </p>
        )}
      </div>
    </main>
  )
}
