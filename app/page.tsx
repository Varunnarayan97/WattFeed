import Link from 'next/link'
import { supabase } from '@/lib/supabase'

async function getLatestMetrics() {
  const metrics = ['dam_mcp_inr', 'demand_mw', 'grid_frequency_hz', 'gen_solar_mw']
  const results: Record<string, number> = {}

  for (const metric of metrics) {
    const { data } = await supabase
      .from('market_data')
      .select('value, timestamp')
      .eq('metric', metric)
      .eq('market', 'india')
      .order('timestamp', { ascending: false })
      .limit(1)

    if (data && data[0]) results[metric] = data[0].value
  }
  return results
}

async function getLatestArticle() {
  const { data } = await supabase
    .from('feed_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(1)
  return data?.[0] || null
}

async function getPriceHistory() {
  const since = new Date()
  since.setDate(since.getDate() - 7)
  const { data } = await supabase
    .from('market_data')
    .select('value, timestamp')
    .eq('metric', 'dam_mcp_inr')
    .eq('market', 'india')
    .gte('timestamp', since.toISOString())
    .order('timestamp', { ascending: true })
  return data || []
}

async function getRecentArticles() {
  const { data } = await supabase
    .from('feed_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(3)
  return data || []
}

const signalColors: Record<string, string> = {
  BULLISH: 'bg-green-100 text-green-800',
  BEARISH: 'bg-red-100 text-red-800',
  NEUTRAL: 'bg-gray-100 text-gray-800',
  ALERT: 'bg-orange-100 text-orange-800',
}

const signalDot: Record<string, string> = {
  BULLISH: 'bg-green-500',
  BEARISH: 'bg-red-500',
  NEUTRAL: 'bg-gray-400',
  ALERT: 'bg-orange-500',
}

export default async function HomePage() {
  const [metrics, article, priceHistory, recentArticles] = await Promise.all([
    getLatestMetrics(),
    getLatestArticle(),
    getPriceHistory(),
    getRecentArticles(),
  ])

  const maxPrice = Math.max(...priceHistory.map(d => d.value))
  const minPrice = Math.min(...priceHistory.map(d => d.value))
  const latestPrice = priceHistory[priceHistory.length - 1]?.value || 0
  const prevPrice = priceHistory[priceHistory.length - 2]?.value || 0
  const priceChange = latestPrice - prevPrice
  const priceUp = priceChange >= 0

  return (
    <div>

      {/* Hero Banner */}
      <div className="relative bg-blue-900 rounded-2xl p-8 md:p-12 mb-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">
                Live Market Intelligence
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
              India Power Markets<br />
              <span className="text-blue-300">at Your Fingertips</span>
            </h1>
            <p className="text-blue-200 text-sm md:text-base max-w-lg leading-relaxed">
              Real-time DAM prices, grid frequency, generation mix, and
              AI-powered forward signals — all in one place.
            </p>
            <div className="flex gap-3 mt-6">
              <Link
                href="/visualizations"
                className="bg-white text-blue-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                View Charts
              </Link>
              <Link
                href="/feed"
                className="border border-blue-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                Read Signals
              </Link>
            </div>
          </div>

          {/* Mini Sparkline in Hero */}
          <div className="bg-blue-800 bg-opacity-60 rounded-xl p-4 min-w-[220px]">
            <p className="text-blue-300 text-xs mb-1">DAM Price — 7 days</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-white text-2xl font-bold">
                ₹{latestPrice.toFixed(2)}
              </span>
              <span className={`text-xs font-medium ${priceUp ? 'text-green-400' : 'text-red-400'}`}>
                {priceUp ? '▲' : '▼'} ₹{Math.abs(priceChange).toFixed(2)}
              </span>
            </div>
            <svg viewBox="0 0 200 50" className="w-full h-12">
              {priceHistory.length > 1 && (() => {
                const points = priceHistory.map((d, i) => {
                  const x = (i / (priceHistory.length - 1)) * 190 + 5
                  const y = 45 - ((d.value - minPrice) / (maxPrice - minPrice || 1)) * 38
                  return `${x},${y}`
                }).join(' ')
                return (
                  <polyline
                    points={points}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )
              })()}
            </svg>
            <p className="text-blue-400 text-xs mt-1">
              INR/kWh · Updated {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'DAM Price',
            value: `₹${metrics['dam_mcp_inr']?.toFixed(2) ?? '—'}`,
            unit: 'INR/kWh',
            icon: '⚡',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Peak Demand',
            value: metrics['demand_mw']
              ? `${(metrics['demand_mw'] / 1000).toFixed(1)} GW`
              : '—',
            unit: 'All-India',
            icon: '📈',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
          {
            label: 'Grid Frequency',
            value: `${metrics['grid_frequency_hz']?.toFixed(2) ?? '—'} Hz`,
            unit: 'Target: 50.0 Hz',
            icon: '〰️',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Solar Generation',
            value: metrics['gen_solar_mw']
              ? `${(metrics['gen_solar_mw'] / 1000).toFixed(1)} GW`
              : '—',
            unit: 'Live output',
            icon: '☀️',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
        ].map(card => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center text-lg mb-3`}>
              {card.icon}
            </div>
            <p className="text-xs text-slate-400 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.unit}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Today's Signal - Featured */}
        {article && (
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${signalDot[article.signal_type] || 'bg-gray-400'}`}></span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Today's Signal
                </span>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${signalColors[article.signal_type] || signalColors.NEUTRAL}`}>
                {article.signal_type}
              </span>
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-3 leading-snug">
              {article.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-5">
              {article.summary}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {article.tags?.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/feed"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
              >
                Full analysis →
              </Link>
            </div>
          </div>
        )}

        {/* Market Status Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Market Status
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">DAM Session</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">RTM Session</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Grid Status</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                Normal
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Market</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                India · IEX
              </span>
            </div>
            <div className="border-t border-slate-100 pt-4 mt-2">
              <p className="text-xs text-slate-400 text-center">
                More markets coming soon
              </p>
              <div className="flex justify-center gap-2 mt-2">
                {['EU', 'US', 'AU', 'SG'].map(m => (
                  <span
                    key={m}
                    className="text-xs bg-slate-100 text-slate-400 px-2 py-1 rounded-full"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Signals */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Recent Signals
          </h2>
          <Link
            href="/feed"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {recentArticles.map((a, i) => (
            <div
              key={a.id}
              className={`flex items-start gap-4 ${i < recentArticles.length - 1 ? 'pb-3 border-b border-slate-100' : ''}`}
            >
              <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${signalDot[a.signal_type] || 'bg-gray-400'}`}></span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900 truncate">{a.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(a.published_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${signalColors[a.signal_type] || signalColors.NEUTRAL}`}>
                {a.signal_type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            href: '/visualizations',
            icon: '📊',
            title: 'Interactive Charts',
            desc: 'DAM prices, demand curves, generation mix and grid frequency — all in one dashboard.',
            cta: 'Explore charts',
          },
          {
            href: '/feed',
            icon: '🤖',
            title: 'AI Signal Feed',
            desc: 'Forward-looking market signals generated daily from live data by our AI analyst.',
            cta: 'Read signals',
          },
          {
            href: '/perspectives',
            icon: '💡',
            title: 'Expert Perspectives',
            desc: 'Analysis and opinions from power market professionals across India.',
            cta: 'Read perspectives',
          },
        ].map(card => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <span className="text-2xl mb-3 block">{card.icon}</span>
            <h3 className="text-base font-bold text-blue-900 mb-2">{card.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">{card.desc}</p>
            <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-800 transition-colors">
              {card.cta} →
            </span>
          </Link>
        ))}
      </div>

    </div>
  )
}
