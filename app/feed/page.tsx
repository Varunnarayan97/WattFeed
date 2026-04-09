 'use client'

import { useEffect, useState } from 'react'

type Article = {
  id: string
  title: string
  summary: string
  body: string
  signal_type: string
  tags: string[]
  published_at: string
}

const signalColors: Record<string, string> = {
  BULLISH: 'bg-green-100 text-green-800',
  BEARISH: 'bg-red-100 text-red-800',
  NEUTRAL: 'bg-gray-100 text-gray-800',
  ALERT: 'bg-orange-100 text-orange-800',
}

const signalBorder: Record<string, string> = {
  BULLISH: 'border-l-green-500',
  BEARISH: 'border-l-red-500',
  NEUTRAL: 'border-l-gray-400',
  ALERT: 'border-l-orange-500',
}

export default function FeedPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [filtered, setFiltered] = useState<Article[]>([])
  const [selected, setSelected] = useState<Article | null>(null)
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticles() {
      const res = await fetch('/api/articles')
      const json = await res.json()
      setArticles(json)
      setFiltered(json)
      setLoading(false)
    }
    fetchArticles()
  }, [])

  useEffect(() => {
    if (filter === 'ALL') {
      setFiltered(articles)
    } else {
      setFiltered(articles.filter(a => a.signal_type === filter))
    }
  }, [filter, articles])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">AI Market Signals</h1>
        <p className="text-slate-500 text-sm mt-1">
          Forward-looking analysis, generated daily from live market data
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'BULLISH', 'BEARISH', 'ALERT', 'NEUTRAL'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading signals...</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(article => (
            <div
              key={article.id}
              onClick={() => setSelected(article)}
              className={`bg-white rounded-xl border border-slate-200 border-l-4 ${signalBorder[article.signal_type] || 'border-l-gray-400'} p-6 cursor-pointer hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${signalColors[article.signal_type] || signalColors.NEUTRAL}`}>
                      {article.signal_type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(article.published_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">{article.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{article.summary}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {article.tags?.map(tag => (
                      <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-slate-300 text-lg">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${signalColors[selected.signal_type] || signalColors.NEUTRAL}`}>
                {selected.signal_type}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-light"
              >
                ✕
              </button>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">{selected.title}</h2>
            <p className="text-slate-500 text-sm mb-4">
              {new Date(selected.published_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
            <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium">
              {selected.summary}
            </p>
            <div className="border-t border-slate-100 pt-6">
              {selected.body.split('\n\n').map((para, i) => (
                <p key={i} className={`text-sm leading-relaxed mb-4 ${para.startsWith('**') ? 'font-semibold text-blue-900' : 'text-slate-600'}`}>
                  {para.replace(/\*\*/g, '')}
                </p>
              ))}
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {selected.tags?.map(tag => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
