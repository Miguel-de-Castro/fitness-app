import type { WorkoutSession } from '@/types/exercise'

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sunday
  const diff = (day + 6) % 7 // days since Monday
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export interface Stats {
  totalWorkouts: number
  weekWorkouts: number
  weekMinutes: number
  streakDays: number
}

export function computeStats(history: WorkoutSession[]): Stats {
  const completed = history.filter((s) => s.completed)
  const weekStart = startOfWeek(new Date())

  const weekSessions = completed.filter((s) => new Date(s.startedAt) >= weekStart)
  const weekMinutes = Math.round(
    weekSessions.reduce((sum, s) => sum + s.actualSeconds, 0) / 60,
  )

  const dayStrings = new Set(completed.map((s) => new Date(s.startedAt).toDateString()))

  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  if (!dayStrings.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1)
  }
  let streakDays = 0
  while (dayStrings.has(cursor.toDateString())) {
    streakDays++
    cursor.setDate(cursor.getDate() - 1)
  }

  return {
    totalWorkouts: completed.length,
    weekWorkouts: weekSessions.length,
    weekMinutes,
    streakDays,
  }
}
