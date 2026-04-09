import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type GenDay = {
  date: string
  coal: number
  solar: number
  wind: number
  hydro: number
}

export async function GET(req: NextRequest) {
  const days = parseInt(req.nextUrl.searchParams.get('days') || '30')
  const since = new Date()
  since.setDate(since.getDate() - days)

  const metrics = [
    'dam_mcp_inr',
    'demand_mw',
    'grid_frequency_hz',
    'gen_coal_mw',
    'gen_solar_mw',
    'gen_wind_mw',
    'gen_hydro_mw',
  ]

  const result: Record<string, any[]> = {}

  for (const metric of metrics) {
    const { data } = await supabase
      .from('market_data')
      .select('value, timestamp')
      .eq('metric', metric)
      .eq('market', 'india')
      .gte('timestamp', since.toISOString())
      .order('timestamp', { ascending: true })

    result[metric] = data || []
  }

  const genByDay: Record<string, GenDay> = {}

  const genMetrics: Array<{ metric: string; key: keyof Omit<GenDay, 'date'> }> = [
    { metric: 'gen_coal_mw', key: 'coal' },
    { metric: 'gen_solar_mw', key: 'solar' },
    { metric: 'gen_wind_mw', key: 'wind' },
    { metric: 'gen_hydro_mw', key: 'hydro' },
  ]

  for (const { metric, key } of genMetrics) {
    for (const row of result[metric]) {
      const date = row.timestamp.split('T')[0]
      if (!genByDay[date]) {
        genByDay[date] = { date, coal: 0, solar: 0, wind: 0, hydro: 0 }
      }
      genByDay[date][key] = Math.round(row.value)
    }
  }

  result.generation = Object.values(genByDay).sort((a, b) =>
    a.date.localeCompare(b.date)
  )

  return NextResponse.json(result)
}