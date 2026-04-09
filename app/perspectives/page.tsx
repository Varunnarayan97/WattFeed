 'use client'

import { useEffect, useState } from 'react'

type Perspective = {
  id: string
  author: string
  title: string
  body: string
  market: string
  published_at: string
}

export default function PerspectivesPage() {
  const [perspectives, setPerspectives] = useState<Perspective[]>([])
  const [selected, setSelected] = useState<Perspective | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ author: '', title: '', body: '' })

  useEffect(() => {
    async function fetchPerspectives() {
      const res = await fetch('/api/perspectives')
      const json = await res.json()
      setPerspectives(json)
      setLoading(false)
    }
    fetchPerspectives()
  }, [])

  async function handleSubmit() {
    if (!form.author || !form.title || !form.body) return
    setSubmitting(true)
    await fetch('/api/perspectives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, market: 'india' }),
    })
    setSubmitting(false)
    setSubmitted(true)
    setForm({ author: '', title: '', body: '' })
    const res = await fetch('/api/perspectives')
    setPerspectives(await res.json())
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Perspectives</h1>
        <p className="text-slate-500 text-sm mt-1">
          Expert views and analysis on power markets
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading perspectives...</div>
      ) : (
        <>
          {/* Featured Perspective */}
          {perspectives[0] && (
            <div
              onClick={() => setSelected(perspectives[0])}
              className="bg-blue-900 rounded-2xl p-8 mb-8 cursor-pointer hover:bg-blue-800 transition-colors"
            >
              <p className="text-blue-300 text-xs font-semibold mb-3 uppercase tracking-wider">
                Featured
              </p>
              <h2 className="text-2xl font-bold text-white mb-3">
                {perspectives[0].title}
              </h2>
              <p className="text-blue-200 text-sm leading-relaxed mb-4">
                {perspectives[0].body.slice(0, 200)}...
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{perspectives[0].author}</p>
                  <p className="text-blue-300 text-xs">
                    {new Date(perspectives[0].published_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <span className="text-blue-300 text-lg">→</span>
              </div>
            </div>
          )}

          {/* Perspectives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {perspectives.slice(1).map(p => (
              <div
                key={p.id}
                onClick={() => setSelected(p)}
                className="bg-white rounded-xl border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-blue-900 mb-2">{p.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {p.body.slice(0, 150)}...
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-700 text-sm font-medium">{p.author}</p>
                    <p className="text-slate-400 text-xs">
                      {new Date(p.published_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className="text-slate-300">→</span>
                </div>
              </div>
            ))}
          </div>

          {/* Submission Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-blue-900 mb-2">
              Share Your Perspective
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Have a view on India's power markets? Share it with the WattFeed community.
            </p>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <p className="text-green-700 font-semibold mb-1">Thank you!</p>
                <p className="text-green-600 text-sm">Your perspective has been submitted successfully.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm text-green-700 underline"
                >
                  Submit another
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={form.author}
                      onChange={e => setForm({ ...form, author: e.target.value })}
                      placeholder="e.g. Ravi Shankar"
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Why storage policy matters"
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Your Perspective
                  </label>
                  <textarea
                    value={form.body}
                    onChange={e => setForm({ ...form, body: e.target.value })}
                    placeholder="Share your analysis, views, or insights on the Indian power market..."
                    rows={6}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.author || !form.title || !form.body}
                  className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Perspective'}
                </button>
              </div>
            )}
          </div>
        </>
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
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Perspective
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-light"
              >
                ✕
              </button>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">{selected.title}</h2>
            <div className="flex items-center gap-2 mb-6">
              <p className="text-slate-700 text-sm font-medium">{selected.author}</p>
              <span className="text-slate-300">·</span>
              <p className="text-slate-400 text-sm">
                {new Date(selected.published_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <div className="border-t border-slate-100 pt-6">
              {selected.body.split('\n\n').map((para, i) => (
                <p key={i} className="text-slate-600 text-sm leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
