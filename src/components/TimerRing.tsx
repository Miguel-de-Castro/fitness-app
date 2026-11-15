import { cn } from '@/lib/utils'

interface TimerRingProps {
  progress: number // 0 -> 1, remaining fraction (1 = full time left)
  phase: 'work' | 'rest'
  size?: number
  children?: React.ReactNode
  className?: string
}

const TICKS = 48

export function TimerRing({ progress, phase, size = 280, children, className }: TimerRingProps) {
  const clamped = Math.min(1, Math.max(0, progress))
  const radius = size / 2 - 18
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - clamped)
  const colorVar = phase === 'work' ? 'var(--work)' : 'var(--rest)'

  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const angle = (i / TICKS) * 360
    const major = i % 4 === 0
    const tickLength = major ? 10 : 5
    const r1 = size / 2 - 4
    const r2 = r1 - tickLength
    const rad = (angle - 90) * (Math.PI / 180)
    const x1 = size / 2 + r1 * Math.cos(rad)
    const y1 = size / 2 + r1 * Math.sin(rad)
    const x2 = size / 2 + r2 * Math.cos(rad)
    const y2 = size / 2 + r2 * Math.sin(rad)
    return { x1, y1, x2, y2, major }
  })

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            strokeWidth={t.major ? 2 : 1}
            className="stroke-border"
          />
        ))}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={10}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          stroke={colorVar}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
