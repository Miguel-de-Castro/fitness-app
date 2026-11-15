import { Badge } from '@/components/ui/badge'
import { BODY_PART_LABELS } from '@/lib/workout-generator'
import type { Exercise } from '@/types/exercise'

interface ExerciseCardProps {
  exercise: Exercise
  index?: number
  workSeconds?: number
  restSeconds?: number
  setLabel?: string
}

export function ExerciseCard({
  exercise,
  index,
  workSeconds,
  restSeconds,
  setLabel,
}: ExerciseCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5">
      {typeof index === 'number' && (
        <span className="font-timer w-5 shrink-0 text-center text-xs text-muted-foreground">
          {String(index + 1).padStart(2, '0')}
        </span>
      )}
      <img
        src={exercise.gif}
        alt={exercise.name}
        loading="lazy"
        className="size-14 shrink-0 rounded-lg border border-border object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium capitalize text-foreground">{exercise.name}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <Badge variant="secondary" className="capitalize">
            {BODY_PART_LABELS[exercise.bodyPart]}
          </Badge>
          {setLabel && (
            <Badge variant="outline" className="font-timer">
              {setLabel}
            </Badge>
          )}
          {workSeconds && (
            <span className="font-timer text-xs text-muted-foreground">
              {workSeconds}s / {restSeconds}s rest
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
