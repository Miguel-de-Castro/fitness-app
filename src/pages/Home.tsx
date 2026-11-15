import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Flame } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { StatsSummary } from '@/components/StatsSummary'
import { HistoryList } from '@/components/HistoryList'
import { loadHistory, loadPrefs } from '@/lib/storage'
import { computeStats } from '@/lib/stats'

export default function Home() {
  const history = useMemo(loadHistory, [])
  const stats = useMemo(() => computeStats(history), [history])
  const prefs = useMemo(loadPrefs, [])

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            No equipment, no gym
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Set a time. Get a workout.
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Pick how many minutes you've got and we'll build a balanced, bodyweight-only
            session from {' '}
            <span className="text-foreground">325 exercises</span> — guided with a rep
            timer and GIFs for every move.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-1.5">
              <Link to="/generate">
                Start a workout
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            {stats.streakDays > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Flame className="size-4 text-work" />
                {stats.streakDays} day streak
              </span>
            )}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Last time: {prefs.lastMinutes} min · {prefs.lastIntensity} intensity
          </p>
        </div>

        <StatsSummary stats={stats} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-foreground">Recent workouts</h2>
        <HistoryList sessions={history.slice(0, 8)} />
      </section>
    </AppShell>
  )
}
