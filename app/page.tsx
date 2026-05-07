import Link from 'next/link'
import { PawPrint, Calendar, Zap, Search, Link2, ImageIcon, CheckCircle, ArrowRight } from 'lucide-react'

const features = [
  { icon: Zap,         title: 'Fetch Your Strategy',    desc: 'Tell Bingo your niche and goals. He builds your whole week in seconds.' },
  { icon: Calendar,    title: 'Weekly Calendar',         desc: 'Bingo lays out every post — topic, time, pillar. You approve, he executes.' },
  { icon: ImageIcon,   title: 'Sharp Visuals',           desc: 'DALL-E 3 generates stunning branded images. ChatGPT quality, every post.' },
  { icon: Link2,       title: 'Delivers to Telegram',    desc: 'Approved posts land in your Telegram as ready-to-copy X drafts.' },
  { icon: Search,      title: 'Sniff Out Competitors',   desc: 'Bingo analyzes competitor pages, flags sponsorships, finds gaps.' },
  { icon: CheckCircle, title: 'You Stay in Control',     desc: 'Nothing posts without your approval. Review, edit, then release the dog.' },
]

const steps = [
  { n: '01', title: 'Set your niche',      desc: 'Tell Bingo what you do, your tone, and your goals.' },
  { n: '02', title: 'Connect Telegram',    desc: 'Link your personal Telegram to receive X post drafts.' },
  { n: '03', title: 'Approve the week',    desc: 'Review the AI calendar, tweak anything, then approve.' },
  { n: '04', title: 'Bingo does the rest', desc: 'Posts are sent to your Telegram on schedule. You post in one tap.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Nav ── */}
      <nav
        className="px-4 md:px-6 py-4 sticky top-0 z-50 backdrop-blur-md"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 logo-wag group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
            >
              <PawPrint size={16} className="wag-icon" style={{ color: '#0d0804' }} strokeWidth={2.5} />
            </div>
            <span className="font-display font-extrabold text-xl" style={{ color: 'var(--primary)' }}>Bingo</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/login" className="nav-link-muted text-sm font-semibold px-3 py-2">Sign in</Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-2">
              Start free <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pt-16 pb-12 md:pt-24 md:pb-20 text-center page-enter">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 md:mb-8"
          style={{ background: 'var(--primary-glow)', border: '1px solid rgba(245,158,11,0.25)', color: 'var(--primary)' }}
        >
          <PawPrint size={13} strokeWidth={2.5} />
          Powered by DeepSeek + DALL-E 3
        </div>

        <h1
          className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl leading-tight mb-5 md:mb-6"
          style={{ color: 'var(--text)' }}
        >
          The only content manager
          <br className="hidden sm:block" />
          <span style={{ color: 'var(--primary)' }}> that actually fetches.</span>
        </h1>

        <p
          className="text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          Bingo builds your strategy, writes every post, generates visuals,
          and delivers them to your Telegram — ready to post on X.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="btn-primary px-8 py-3 text-base w-full sm:w-auto justify-center">
            <PawPrint size={16} /> Unleash Bingo
          </Link>
          <Link href="/login" className="btn-secondary px-8 py-3 text-base w-full sm:w-auto justify-center">
            Sign in
          </Link>
        </div>

        {/* Decorative paws */}
        <div className="flex justify-center gap-6 md:gap-8 mt-12 md:mt-16 opacity-20 select-none pointer-events-none">
          {[14, 10, 18, 10, 14].map((size, i) => (
            <PawPrint
              key={i}
              size={size}
              style={{ color: 'var(--primary)', animationDelay: `${i * 0.3}s` }}
              className="animate-float"
            />
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-3" style={{ color: 'var(--text)' }}>
            What Bingo can do
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>One well-trained AI. Endless content.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="card paw-hover group cursor-default">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: 'var(--primary-glow)' }}
                >
                  <Icon size={20} className="paw-icon" style={{ color: 'var(--primary)' }} strokeWidth={2} />
                </div>
                <h3 className="font-display font-bold text-base md:text-lg mb-2" style={{ color: 'var(--text)' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-3" style={{ color: 'var(--text)' }}>
            Sit. Stay. Post.
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Four steps to automated content.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
          {steps.map((s) => (
            <div key={s.n} className="card flex gap-4 items-start">
              <span
                className="font-display font-extrabold text-2xl md:text-3xl leading-none shrink-0"
                style={{ color: 'var(--primary)', opacity: 0.45 }}
              >
                {s.n}
              </span>
              <div>
                <h3 className="font-display font-bold text-base md:text-lg mb-1" style={{ color: 'var(--text)' }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-16 md:py-24 text-center px-4"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <PawPrint size={36} className="mx-auto mb-5 md:mb-6 animate-paw-bounce" style={{ color: 'var(--primary)' }} />
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-4" style={{ color: 'var(--text)' }}>
          Ready to fetch more reach?
        </h2>
        <p className="mb-7 md:mb-8" style={{ color: 'var(--text-muted)' }}>
          Join Bingo. Your content calendar is one click away.
        </p>
        <Link href="/register" className="btn-primary px-8 md:px-10 py-3 text-base inline-flex">
          <PawPrint size={16} /> Create free account
        </Link>
      </section>

      <footer
        className="text-center py-6 text-sm"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-dim)' }}
      >
        Bingo — your AI content dog. Woof.
      </footer>
    </div>
  )
}
