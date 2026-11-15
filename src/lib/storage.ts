import type { Intensity, WorkoutSession, WorkoutStructure } from '@/types/exercise'

const HISTORY_KEY = 'home-workout:history:v1'
const PREFS_KEY = 'home-workout:prefs:v1'

export interface Prefs {
  lastMinutes: number
  lastIntensity: Intensity
  lastStructure: WorkoutStructure
  lastSetsCount: number
}

const DEFAULT_PREFS: Prefs = {
  lastMinutes: 20,
  lastIntensity: 'medium',
  lastStructure: 'circuit',
  lastSetsCount: 3,
}

export function loadHistory(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isSession) : []
  } catch {
    return []
  }
}

// Drops entries that don't look like a session (corrupted or hand-edited storage),
// so one bad item can't break the history list.
function isSession(value: unknown): value is WorkoutSession {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.startedAt === 'string' &&
    typeof s.plannedMinutes === 'number' &&
    typeof s.actualSeconds === 'number' &&
    typeof s.completed === 'boolean' &&
    Array.isArray(s.exerciseNames) &&
    Array.isArray(s.bodyParts)
  )
}

// localStorage can throw (private mode, blocked site data, full quota). A failed
// write keeps the app running; the session just isn't persisted.
function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

export function saveSession(session: WorkoutSession): WorkoutSession[] {
  const history = [session, ...loadHistory()].slice(0, 200)
  safeSetItem(HISTORY_KEY, JSON.stringify(history))
  return history
}

// Each stored preference is checked on its own; anything invalid (corrupted or
// hand-edited storage) falls back to its default instead of breaking the generator.
export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return DEFAULT_PREFS
    const p = JSON.parse(raw) as Record<string, unknown>
    const isCount = (v: unknown, min: number, max: number) =>
      typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max
    return {
      lastMinutes: isCount(p.lastMinutes, 5, 60) ? (p.lastMinutes as number) : DEFAULT_PREFS.lastMinutes,
      lastIntensity: ['easy', 'medium', 'hard'].includes(p.lastIntensity as string)
        ? (p.lastIntensity as Intensity)
        : DEFAULT_PREFS.lastIntensity,
      lastStructure: ['circuit', 'rounds', 'sets'].includes(p.lastStructure as string)
        ? (p.lastStructure as WorkoutStructure)
        : DEFAULT_PREFS.lastStructure,
      lastSetsCount: isCount(p.lastSetsCount, 1, 10) ? (p.lastSetsCount as number) : DEFAULT_PREFS.lastSetsCount,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

export function savePrefs(prefs: Partial<Prefs>): Prefs {
  const next = { ...loadPrefs(), ...prefs }
  safeSetItem(PREFS_KEY, JSON.stringify(next))
  return next
}
