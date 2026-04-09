 'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer
} from 'recharts'

const METRICS = ['dam_mcp_inr', 'demand_mw', 'grid_frequency_hz']

type DataPoint = { timestamp: string; value: number }
type GenData = { date: string; coal: number; solar: number; wind: number; hydro: number }

export default function VisualizationsPage() {
  const [days, setDays] = useState(30)
  const [damData, setDamData] = useState<DataPoint[]>([])
  const [demandData, setDemandData] = useState<DataPoint[]>([])
  const [freqData, setFreqData] = useState<DataPoint[]>([])
  const [genData, setGenData] = useState<GenData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      const res = await fetch(`/api/data?days=${days}`)
      const json = await res.json()
      setDamData(json.dam_mcp_inr || [])
      setDemandData(json.demand_mw || [])
      setFreqData(json.grid_frequency_hz || [])
      setGenData(json.generation || [])
      setLoading(false)
    }
    fetchAll()
  }, [days])

  const fmt = (ts: string) => {
    const d = new Date(ts)
    return `${d.getDate()}/${d.getMonth() + 1}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Visualizations</h1>
          <p className="text-slate-500 text-sm mt-1">India power market charts</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                days === d
                  ? 'bg-blue-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading charts...</div>
      ) : (
        <div className="space-y-8">

          {/* DAM Price */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-600 mb-4">
              DAM Market Clearing Price (INR/kWh)
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={damData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="timestamp" tickFormatter={fmt} tick={{ fontSize: 11 }} interval={Math.floor(damData.length / 6)}/>
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']}/>
                <Tooltip
                  labelFormatter={(v) => new Date(v).toLocaleDateString('en-IN')}
                  formatter={(v: any) => [`₹${Number(v).toFixed(2)}`, 'DAM Price']}
                />
                <Line type="monotone" dataKey="value" stroke="#1e40af" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Demand */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-600 mb-4">
              All-India Demand (MW)
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={demandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="timestamp" tickFormatter={fmt} tick={{ fontSize: 11 }} interval={Math.floor(demandData.length / 6)}/>
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']}/>
                <Tooltip
                  labelFormatter={(v) => new Date(v).toLocaleDateString('en-IN')}
                  formatter={(v: any) => [`${Number(v).toLocaleString()} MW`, 'Demand']}
                />
                <Area type="monotone" dataKey="value" stroke="#0891b2" fill="#e0f2fe" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Generation Mix */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-600 mb-4">
              Generation Mix (MW)
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={genData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={Math.floor(genData.length / 6)}/>
                <YAxis tick={{ fontSize: 11 }}/>
                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} MW`}>
                <Legend/>
                <Bar dataKey="coal" stackId="a" fill="#475569" name="Coal"/>
                <Bar dataKey="hydro" stackId="a" fill="#0891b2" name="Hydro"/>
                <Bar dataKey="wind" stackId="a" fill="#22c55e" name="Wind"/>
                <Bar dataKey="solar" stackId="a" fill="#f59e0b" name="Solar"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grid Frequency */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-600 mb-4">
              Grid Frequency (Hz)
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={freqData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="timestamp" tickFormatter={fmt} tick={{ fontSize: 11 }} interval={Math.floor(freqData.length / 6)}/>
                <YAxis tick={{ fontSize: 11 }} domain={[49.7, 50.3]}/>
                <Tooltip
                  labelFormatter={(v) => new Date(v).toLocaleDateString('en-IN')}
                  formatter={(v: any) => [`${Number(v).toFixed(3)} Hz`, 'Frequency']}
                />
                <ReferenceLine y={50.2} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '50.2', fontSize: 10 }}/>
                <ReferenceLine y={49.8} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '49.8', fontSize: 10 }}/>
                <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  )
}
