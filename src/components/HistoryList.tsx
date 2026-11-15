import { BODY_PART_LABELS } from '@/lib/workout-generator'
import type { WorkoutSession } from '@/types/exercise'

interface HistoryListProps {
  sessions: WorkoutSession[]
}

function formatDate(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function HistoryList({ sessions }: HistoryListProps) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No workouts yet. Generate one and it'll show up here.
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {sessions.map((session) => {
        const minutes = Math.round(session.actualSeconds / 60)
        const uniqueParts = Array.from(new Set(session.bodyParts))
        return (
          <li
            key={session.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-3.5"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {formatDate(session.startedAt)}
                {!session.completed && (
                  <span className="ml-2 text-xs text-muted-foreground">(ended early)</span>
                )}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground capitalize">
                {uniqueParts.map((p) => BODY_PART_LABELS[p]).join(', ') || 'Mixed'}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-timer text-lg font-semibold text-foreground">{minutes}m</p>
              <p className="text-xs text-muted-foreground">{session.exerciseNames.length} exercises</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
