import { useState, useEffect, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import './App.css'

const REGION_NAMES = {
  NSW1: 'New South Wales',
  QLD1: 'Queensland',
  SA1: 'South Australia',
  TAS1: 'Tasmania',
  VIC1: 'Victoria',
}

const REFRESH_INTERVAL = 30

function getPriceColor(price) {
  if (price < 0) return '#f91880'
  if (price < 50) return '#00ba7c'
  if (price <= 100) return '#f97316'
  return '#ef4444'
}

function getPriceClass(price) {
  if (price < 0) return 'negative'
  if (price < 50) return 'low'
  if (price <= 100) return 'medium'
  return 'high'
}

function RegionCard({ region }) {
  const price = region.PRICE
  const priceClass = getPriceClass(price)
  const isSA = region.REGIONID === 'SA1'

  return (
    <div className={`region-card ${priceClass} ${isSA ? 'highlighted' : ''}`}>
      <div className="region-header">
        <span className="region-name">{REGION_NAMES[region.REGIONID]}</span>
      </div>
      <div className={`price ${priceClass}`}>
        ${price.toFixed(2)}
      </div>
      <div className="price-label">$/MWh</div>
      <div className="stats">
        <div className="stat-row">
          <span className="stat-label">Total Demand</span>
          <span className="stat-value">{region.TOTALDEMAND.toLocaleString()} MW</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Scheduled Generation</span>
          <span className="stat-value">{region.SCHEDULEDGENERATION.toLocaleString()} MW</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Semi-Scheduled Generation</span>
          <span className="stat-value">{region.SEMISCHEDULEDGENERATION.toLocaleString()} MW</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Net Interchange</span>
          <span className="stat-value">{region.NETINTERCHANGE.toLocaleString()} MW</span>
        </div>
      </div>
    </div>
  )
}

function PriceChart({ regions }) {
  const data = regions.map((r) => ({
    name: REGION_NAMES[r.REGIONID],
    price: r.PRICE,
  }))

  return (
    <div className="chart-container">
      <h2 className="chart-title">Spot Price by Region</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2f3336" />
          <XAxis
            type="number"
            stroke="#71767b"
            tick={{ fill: '#71767b', fontSize: 11 }}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#71767b"
            tick={{ fill: '#e7e9ea', fontSize: 11 }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#16202a',
              border: '1px solid #2f3336',
              borderRadius: '8px',
              color: '#e7e9ea',
            }}
            formatter={(value) => [`$${value.toFixed(2)}/MWh`, 'Price']}
          />
          <Bar dataKey="price" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getPriceColor(entry.price)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function GenerationChart({ regions }) {
  const data = regions.map((r) => ({
    name: REGION_NAMES[r.REGIONID],
    scheduled: Math.round(r.SCHEDULEDGENERATION),
    semiScheduled: Math.round(r.SEMISCHEDULEDGENERATION),
  }))

  return (
    <div className="chart-container">
      <h2 className="chart-title">Generation by Region</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2f3336" />
          <XAxis
            type="number"
            stroke="#71767b"
            tick={{ fill: '#71767b', fontSize: 11 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#71767b"
            tick={{ fill: '#e7e9ea', fontSize: 11 }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#16202a',
              border: '1px solid #2f3336',
              borderRadius: '8px',
              color: '#e7e9ea',
            }}
            formatter={(value) => [`${value.toLocaleString()} MW`]}
          />
          <Legend
            wrapperStyle={{ color: '#e7e9ea', fontSize: 11 }}
            formatter={(value) =>
              value === 'scheduled' ? 'Scheduled' : 'Semi-Scheduled'
            }
          />
          <Bar dataKey="scheduled" stackId="a" fill="#1d9bf0" name="scheduled" />
          <Bar
            dataKey="semiScheduled"
            stackId="a"
            fill="#00ba7c"
            name="semiScheduled"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function App() {
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/aemo/ELEC_NEM_SUMMARY')
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const data = await response.json()
      setRegions(data.ELEC_NEM_SUMMARY || [])
      setLastUpdated(new Date())
      setError(null)
      setCountdown(REFRESH_INTERVAL)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData()
          return REFRESH_INTERVAL
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return <div className="loading">Loading NEM data...</div>
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button className="refresh-btn" onClick={fetchData}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>National Energy Market — Live</h1>
        <p>Real-time electricity prices across Australia</p>
      </header>
      <div className="status-bar">
        <div className="last-updated">
          Last updated: {lastUpdated?.toLocaleTimeString()}
        </div>
        <div className="countdown">
          <span className="countdown-label">Next update in</span>
          <span className="countdown-value">{countdown}s</span>
          <button
            className="refresh-btn"
            onClick={fetchData}
            disabled={refreshing}
          >
            {refreshing ? 'Updating...' : 'Refresh Now'}
          </button>
        </div>
      </div>
      <div className="charts-section">
        <PriceChart regions={regions} />
        <GenerationChart regions={regions} />
      </div>
      <div className="regions-grid">
        {regions.map((region) => (
          <RegionCard key={region.REGIONID} region={region} />
        ))}
      </div>
    </div>
  )
}

export default App
