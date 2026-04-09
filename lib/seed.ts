 import { supabaseAdmin } from './supabase'

const metrics = [
  { metric: 'dam_mcp_inr', unit: 'INR/kWh', min: 3.5, max: 8.5 },
  { metric: 'demand_mw', unit: 'MW', min: 150000, max: 220000 },
  { metric: 'grid_frequency_hz', unit: 'Hz', min: 49.8, max: 50.2 },
  { metric: 'gen_coal_mw', unit: 'MW', min: 90000, max: 130000 },
  { metric: 'gen_solar_mw', unit: 'MW', min: 5000, max: 25000 },
  { metric: 'gen_wind_mw', unit: 'MW', min: 3000, max: 15000 },
  { metric: 'gen_hydro_mw', unit: 'MW', min: 10000, max: 40000 },
]

const articles = [
  {
    title: 'Solar Surge Drives DAM Prices to Seasonal Lows',
    summary: 'Exceptional solar generation across Gujarat and Rajasthan pushed midday DAM prices below ₹4/kWh. Expect continued softness through the afternoon block.',
    body: `**Market Conditions**\nSolar generation hit 22,400 MW at peak today, the highest this month. DAM clearing prices dropped to ₹3.8/kWh in the 12:00–15:00 block.\n\n**Demand Outlook**\nDemand is expected to remain moderate at 165,000–170,000 MW through tomorrow. No major industrial ramp-up signals detected.\n\n**Supply & Generation Mix**\nCoal at 58%, Solar at 14%, Wind at 8%, Hydro at 12%, Nuclear at 8%. Solar share is 3 percentage points above the 30-day average.\n\n**Price Signal**\nExpect DAM prices in the ₹4.2–5.1/kWh range for evening peak (18:00–22:00) as solar drops off and demand picks up.\n\n**Risk Factors**\nCloud cover forecast for tomorrow may reduce solar output by 15–20%. Monitor RTM prices closely in the 17:00 block.`,
    signal_type: 'BEARISH',
    tags: ['solar', 'DAM prices', 'Gujarat', 'generation mix'],
  },
  {
    title: 'Grid Frequency Dips Signal Tight Supply Ahead',
    summary: 'Sustained frequency readings below 49.9 Hz through the morning peak indicate supply tightness. Traders should watch RTM premiums closely.',
    body: `**Market Conditions**\nGrid frequency averaged 49.87 Hz between 07:00–10:00, below the IEGC target band. This signals that generation was not keeping pace with demand during the morning peak.\n\n**Demand Outlook**\nDemand touched 198,000 MW at 09:30, the highest reading this week. Industrial demand in the western region appears to be recovering.\n\n**Supply & Generation Mix**\nCoal at 63%, Solar at 9%, Wind at 6%, Hydro at 14%, Nuclear at 8%. Wind underperformed by 2,000 MW versus forecast.\n\n**Price Signal**\nRTM prices spiked to ₹7.8/kWh in the 09:00 block. Expect elevated evening prices in the ₹6.5–8.0/kWh range if frequency stays suppressed.\n\n**Risk Factors**\nTwo coal units in NTPC Vindhyachal reported forced outage. Combined capacity impact: ~800 MW. Situation being monitored.`,
    signal_type: 'BULLISH',
    tags: ['grid frequency', 'RTM', 'coal', 'supply tightness'],
  },
  {
    title: 'Monsoon Onset Reshapes Generation Mix for June',
    summary: 'Early monsoon arrival in Kerala is boosting hydro reserves while dampening solar output. Net effect on prices is neutral with a hydro upside.',
    body: `**Market Conditions**\nHydro generation up 18% week-on-week as reservoir levels improve across southern India. Solar output reduced by cloud cover — down 12% from last week.\n\n**Demand Outlook**\nCooling demand softening as temperatures drop in monsoon-affected regions. Expect demand to ease by 3–5% over the next two weeks in southern states.\n\n**Supply & Generation Mix**\nCoal at 55%, Solar at 10%, Wind at 11%, Hydro at 16%, Nuclear at 8%. Hydro share at highest since October.\n\n**Price Signal**\nDAM prices expected to stay in the ₹4.5–5.5/kWh range. Hydro surplus may push prices below ₹4/kWh in off-peak hours in southern regions.\n\n**Risk Factors**\nIf monsoon advances faster than forecast, wind generation in Gujarat could spike — watch for negative price events in RTM off-peak slots.`,
    signal_type: 'NEUTRAL',
    tags: ['monsoon', 'hydro', 'solar', 'seasonal'],
  },
  {
    title: 'Coal Supply Disruption — Alert for Northern Region',
    summary: 'Rail logistics disruptions are affecting coal delivery to three major thermal plants in the northern region. Prices could spike if situation persists beyond 48 hours.',
    body: `**Market Conditions**\nThree thermal plants in Uttar Pradesh and Punjab reporting coal stock below 7-day critical threshold. Combined capacity at risk: 3,200 MW.\n\n**Demand Outlook**\nNorthern region demand remains high at 52,000 MW with summer peak ongoing. No demand-side relief expected this week.\n\n**Supply & Generation Mix**\nCoal at 61%, Solar at 11%, Wind at 7%, Hydro at 13%, Nuclear at 8%. Northern region increasingly reliant on imports from western grid.\n\n**Price Signal**\nInter-regional transmission constraints already appearing. Northern DAM prices at ₹1.2/kWh premium over western region. Watch for further divergence.\n\n**Risk Factors**\nIf coal stock situation is not resolved within 48 hours, expect forced load shedding in affected discoms. RTM prices could breach ₹10/kWh ceiling in peak blocks.`,
    signal_type: 'ALERT',
    tags: ['coal supply', 'northern region', 'transmission', 'alert'],
  },
  {
    title: 'Renewable Integration Milestone as Wind Hits Record',
    summary: 'Wind generation crossed 18,500 MW today, a new all-time record for India. System operators managed the variability well with hydro balancing.',
    body: `**Market Conditions**\nWind generation peaked at 18,540 MW at 14:30 today, surpassing the previous record of 17,800 MW set in March. Tamil Nadu and Gujarat led generation.\n\n**Demand Outlook**\nDemand at 172,000 MW, moderate for this time of year. The high renewable share meant coal backing down significantly during midday hours.\n\n**Supply & Generation Mix**\nCoal at 48%, Solar at 13%, Wind at 12%, Hydro at 19%, Nuclear at 8%. Renewable share (solar + wind) at 25% — highest ever recorded for a full day.\n\n**Price Signal**\nDAM prices softened to ₹3.6/kWh during midday due to renewable surplus. Evening ramp expected to push prices to ₹5.8–6.5/kWh as wind drops post-sunset.\n\n**Risk Factors**\nHigh renewable variability requires careful balancing. Grid operators have pre-positioned hydro reserves for the evening ramp. Watch frequency closely between 17:00–19:00.`,
    signal_type: 'BULLISH',
    tags: ['wind', 'renewable record', 'grid balancing', 'hydro'],
  },
]

async function seed() {
  console.log('Seeding market data...')

  const rows = []
  for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
    for (const m of metrics) {
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      const value = m.min + Math.random() * (m.max - m.min)
      rows.push({
        timestamp: date.toISOString(),
        market: 'india',
        metric: m.metric,
        value: Math.round(value * 100) / 100,
        unit: m.unit,
        source: 'seed',
      })
    }
  }

  const { error: marketError } = await supabaseAdmin
    .from('market_data')
    .insert(rows)

  if (marketError) {
    console.error('Market data error:', marketError)
  } else {
    console.log(`Inserted ${rows.length} market data rows`)
  }

  console.log('Seeding feed articles...')

  const articleRows = articles.map((a, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i * 3)
    return { ...a, published_at: date.toISOString() }
  })

  const { error: articleError } = await supabaseAdmin
    .from('feed_articles')
    .insert(articleRows)

  if (articleError) {
    console.error('Article error:', articleError)
  } else {
    console.log(`Inserted ${articleRows.length} articles`)
  }

  console.log('Seeding perspectives...')

  const { error: perspError } = await supabaseAdmin
    .from('perspectives')
    .insert([
      {
        author: 'Ravi Shankar',
        title: 'Why Indias Renewable Transition Needs Better Storage Policy',
        body: `India's renewable capacity additions are impressive on paper, but the grid is struggling to absorb the variability. The missing piece is not generation — it's storage and flexible demand. Until BESS policy provides bankable returns, we will keep relying on expensive gas peakers and hydro for balancing. The government needs to move faster on the ancillary services market framework.\n\nThe recent wind record is exciting, but it masks a deeper problem: we backed down 4,000 MW of coal during that same period and still saw frequency dips in the evening ramp. The system is not yet designed for 25% renewable share in real-time operations.`,
        market: 'india',
      },
      {
        author: 'Priya Nair',
        title: 'DAM vs RTM: Why Real-Time Markets Are the Future',
        body: `The Day-Ahead Market has served India well, but the growth of variable renewables is making real-time pricing increasingly important. RTM volumes have grown 40% year-on-year, and for good reason — it allows participants to correct their positions as actual generation deviates from forecasts.\n\nFor industrial consumers with flexible loads, RTM offers genuine opportunities to reduce energy costs by shifting consumption to low-price blocks. The technology to do this exists. What's needed is better metering infrastructure and willingness from DISCOMs to pass through real-time price signals to large consumers.`,
        market: 'india',
      },
    ])

  if (perspError) {
    console.error('Perspectives error:', perspError)
  } else {
    console.log('Inserted perspectives')
  }

  console.log('Seeding complete!')
}

seed()
