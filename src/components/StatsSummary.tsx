import type { Stats } from '@/lib/stats'

interface StatsSummaryProps {
  stats: Stats
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  const items = [
    { label: 'Total workouts', value: stats.totalWorkouts },
    { label: 'This week', value: stats.weekWorkouts },
    { label: 'Minutes this week', value: stats.weekMinutes },
    { label: 'Day streak', value: stats.streakDays },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-card p-4">
          <p className="font-timer text-3xl font-semibold text-foreground">{item.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  )
}
