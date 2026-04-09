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

const signalColors: Record<string, string> = {
  BULLISH: 'bg-green-100 text-green-800',
  BEARISH: 'bg-red-100 text-red-800',
  NEUTRAL: 'bg-gray-100 text-gray-800',
  ALERT: 'bg-orange-100 text-orange-800',
}

export default async function HomePage() {
  const [metrics, article, priceHistory] = await Promise.all([
    getLatestMetrics(),
    getLatestArticle(),
    getPriceHistory(),
  ])

  const maxPrice = Math.max(...priceHistory.map(d => d.value))
  const minPrice = Math.min(...priceHistory.map(d => d.value))

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          India Power Markets
        </h1>
        <p className="text-slate-500 text-sm">
          Live intelligence dashboard · Last updated: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">DAM Price</p>
          <p className="text-2xl font-bold text-blue-900">
            ₹{metrics['dam_mcp_inr']?.toFixed(2) ?? '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">INR/kWh</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">Peak Demand</p>
          <p className="text-2xl font-bold text-blue-900">
            {metrics['demand_mw'] ? (metrics['demand_mw'] / 1000).toFixed(1) : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">GW</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">Grid Frequency</p>
          <p className="text-2xl font-bold text-blue-900">
            {metrics['grid_frequency_hz']?.toFixed(2) ?? '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Hz</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">Solar Generation</p>
          <p className="text-2xl font-bold text-blue-900">
            {metrics['gen_solar_mw'] ? (metrics['gen_solar_mw'] / 1000).toFixed(1) : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">GW</p>
        </div>
      </div>

      {/* Price Sparkline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h2 className="text-sm font-semibold text-slate-600 mb-4">DAM Price — Last 7 Days</h2>
        <svg viewBox="0 0 600 80" className="w-full h-20">
          {priceHistory.length > 1 && (() => {
            const points = priceHistory.map((d, i) => {
              const x = (i / (priceHistory.length - 1)) * 580 + 10
              const y = 70 - ((d.value - minPrice) / (maxPrice - minPrice || 1)) * 60
              return `${x},${y}`
            }).join(' ')
            return (
              <>
                <polyline
                  points={points}
                  fill="none"
                  stroke="#1e40af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text x="10" y="12" fontSize="9" fill="#94a3b8">
                  ₹{maxPrice.toFixed(2)}
                </text>
                <text x="10" y="76" fontSize="9" fill="#94a3b8">
                  ₹{minPrice.toFixed(2)}
                </text>
              </>
            )
          })()}
        </svg>
      </div>

      {/* Latest Signal */}
      {article && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-600">Today's Signal</h2>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${signalColors[article.signal_type] || signalColors.NEUTRAL}`}>
              {article.signal_type}
            </span>
          </div>
          <h3 className="text-lg font-bold text-blue-900 mb-2">{article.title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">{article.summary}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {article.tags?.map((tag: string) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <Link href="/feed" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
              View Full Feed →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}