import { cn } from '@/lib/utils'
import { BODY_PART_LABELS, BODY_PARTS } from '@/lib/workout-generator'
import type { BodyPart } from '@/types/exercise'

interface BodyPartPickerProps {
  selected: BodyPart[]
  onChange: (parts: BodyPart[]) => void
}

export function BodyPartPicker({ selected, onChange }: BodyPartPickerProps) {
  const toggle = (part: BodyPart) => {
    if (selected.includes(part)) {
      onChange(selected.filter((p) => p !== part))
    } else {
      onChange([...selected, part])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {BODY_PARTS.map((part) => {
        const active = selected.includes(part)
        return (
          <button
            key={part}
            type="button"
            onClick={() => toggle(part)}
            aria-pressed={active}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm capitalize transition-colors',
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-transparent text-foreground hover:bg-muted',
            )}
          >
            {BODY_PART_LABELS[part]}
          </button>
        )
      })}
    </div>
  )
}
