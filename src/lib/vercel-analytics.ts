export type DayStats = { date: string; visitors: number }

export async function getWeeklyVisitors(): Promise<DayStats[]> {
  const token = process.env.VERCEL_ACCESS_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID

  if (!token || !projectId) return []

  const to = new Date()
  const from = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    projectId,
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
    granularity: '1d',
    environment: 'production',
  })

  try {
    const res = await fetch(`https://api.vercel.com/v1/web-analytics/timeseries?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const json = await res.json()
    // Response: { data: [{ key: '2024-01-01', total: 123, devices: {...} }] }
    return (json.data ?? []).map((d: { key: string; total: number }) => ({
      date: d.key,
      visitors: d.total,
    }))
  } catch {
    return []
  }
}
