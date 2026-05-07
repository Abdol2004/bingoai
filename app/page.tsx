import Link from 'next/link'
import { PawPrint, Calendar, Zap, Search, Link2, ImageIcon, CheckCircle, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Fetch Your Strategy',
    desc: 'Tell Bingo your niche and goals. He sniffs out the perfect content strategy and builds your whole week in seconds.',
  },
  {
    icon: Calendar,
    title: 'Weekly Calendar',
    desc: 'Bingo lays out every post — topic, time, platform. You review, approve, and he handles the rest. Good boy.',
  },
  {
    icon: ImageIcon,
    title: 'Sharp Visuals',
    desc: 'DALL-E 3 generates stunning branded images for every post. The kind of quality you get from ChatGPT.',
  },
  {
    icon: Link2,
    title: 'Auto-Posts Everywhere',
    desc: 'Approved posts go live automatically on Telegram and Discord. X posts land in your Telegram for one-tap posting.',
  },
  {
    icon: Search,
    title: 'Sniff Out Competitors',
    desc: 'Bingo analyzes competitor pages, flags their sponsorships, and finds the gaps you can dominate.',
  },
  {
    icon: CheckCircle,
    title: 'You Stay in Control',
    desc: 'Nothing posts without your approval. Review the full calendar each week, edit any post, then release the dog.',
  },
]

const steps = [
  { n: '01', title: 'Set your niche', desc: 'Tell Bingo what you do, your tone, and your goals.' },
  { n: '02', title: 'Connect your channels', desc: 'Link Telegram, Discord, and enable X delivery.' },
  { n: '03', title: 'Approve the week', desc: 'Review the AI calendar, tweak anything, then approve.' },
  { n: '04', title: 'Bingo does the rest', desc: 'Posts go out on schedule. You just check the results.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Nav ── */}
      <nav style={{ borderBottom: '1px solid var(--border)' }} className="px-6 py-4 sticky top-0 z-50 backdrop-blur-md" >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 logo-wag group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              <PawPrint size={18} className="wag-icon text-bark-900" strokeWidth={2.5} />
            </div>
            <span className="font-display font-800 text-xl" style={{ color: 'var(--primary)' }}>
              Bingo
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login" className="nav-link-muted text-sm font-semibold">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Start for free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center page-enter">
        {/* Floating paw badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold mb-8"
             style={{ background: 'var(--primary-glow)', border: '1px solid rgba(245,158,11,0.25)', color: 'var(--primary)' }}>
          <PawPrint size={14} strokeWidth={2.5} />
          Powered by DeepSeek + DALL-E 3
        </div>

        <h1 className="font-display font-extrabold text-6xl md:text-7xl leading-tight mb-6"
            style={{ color: 'var(--text)' }}>
          The only content manager
          <br />
          <span style={{ color: 'var(--primary)' }}>that actually fetches.</span>
        </h1>

        <p className="text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
           style={{ color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif' }}>
          Bingo builds your strategy, writes every post, generates stunning visuals, and posts them
          automatically — while you get on with your life.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className="btn-primary px-8 py-3 text-base">
            <PawPrint size={16} /> Unleash Bingo
          </Link>
          <Link href="/login" className="btn-secondary px-8 py-3 text-base">
            Sign in
          </Link>
        </div>

        {/* Floating paw prints decoration */}
        <div className="flex justify-center gap-8 mt-16 opacity-20 select-none pointer-events-none">
          {[16, 12, 20, 12, 16].map((size, i) => (
            <PawPrint key={i} size={size} style={{ color: 'var(--primary)', animationDelay: `${i * 0.3}s` }}
                      className="animate-float" />
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-4xl mb-3" style={{ color: 'var(--text)' }}>
            What Bingo can do
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            One well-trained AI. Endless content.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="card paw-hover group cursor-default">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                     style={{ background: 'var(--primary-glow)' }}>
                  <Icon size={20} className="paw-icon" style={{ color: 'var(--primary)' }} strokeWidth={2} />
                </div>
                <h3 className="font-display font-700 text-lg mb-2" style={{ color: 'var(--text)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif' }}>
                  {f.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-4xl mb-3" style={{ color: 'var(--text)' }}>
            Sit. Stay. Post.
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Four steps to automated content.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="card flex gap-5 items-start">
              <span className="font-display font-800 text-3xl leading-none shrink-0"
                    style={{ color: 'var(--primary)', opacity: 0.5 }}>{s.n}</span>
              <div>
                <h3 className="font-display font-700 text-lg mb-1" style={{ color: 'var(--text)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop: '1px solid var(--border)' }} className="py-24 text-center px-6">
        <PawPrint size={40} className="mx-auto mb-6 animate-paw-bounce" style={{ color: 'var(--primary)' }} />
        <h2 className="font-display font-bold text-4xl mb-4" style={{ color: 'var(--text)' }}>
          Ready to fetch more reach?
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Join Bingo. Your content calendar is one click away.
        </p>
        <Link href="/register" className="btn-primary px-10 py-3 text-base">
          <PawPrint size={16} /> Create free account
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', color: 'var(--text-dim)' }}
              className="text-center py-6 text-sm">
        Bingo — your AI content dog. Woof.
      </footer>
    </div>
  )
}
