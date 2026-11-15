import exercisesData from '@/data/exercises.json'
import type {
  BodyPart,
  Exercise,
  Intensity,
  IntensityPreset,
  WorkoutPlan,
  WorkoutStep,
  WorkoutStructure,
} from '@/types/exercise'

export const exercises = exercisesData as Exercise[]

export const BODY_PARTS: BodyPart[] = [
  'waist',
  'upper legs',
  'lower legs',
  'back',
  'chest',
  'cardio',
  'upper arms',
  'shoulders',
  'lower arms',
  'neck',
]

export const BODY_PART_LABELS: Record<BodyPart, string> = {
  waist: 'Core',
  'upper legs': 'Upper legs',
  'lower legs': 'Lower legs',
  back: 'Back',
  chest: 'Chest',
  cardio: 'Cardio',
  'upper arms': 'Upper arms',
  shoulders: 'Shoulders',
  'lower arms': 'Lower arms',
  neck: 'Neck',
}

export const INTENSITY_PRESETS: Record<Intensity, IntensityPreset> = {
  easy: {
    label: 'Easy',
    description: 'Longer rests, steady pace',
    workSeconds: 30,
    restSeconds: 25,
  },
  medium: {
    label: 'Medium',
    description: 'Balanced work and rest',
    workSeconds: 40,
    restSeconds: 15,
  },
  hard: {
    label: 'Hard',
    description: 'Short rests, high effort',
    workSeconds: 45,
    restSeconds: 10,
  },
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const STRUCTURE_LABELS: Record<WorkoutStructure, string> = {
  circuit: 'Single circuit',
  rounds: 'Rounds',
  sets: 'Sets per move',
}

export const STRUCTURE_DESCRIPTIONS: Record<WorkoutStructure, string> = {
  circuit: 'Every exercise once, back to back',
  rounds: 'Repeat the whole circuit',
  sets: 'Repeat each move before moving on',
}

/** Picks `count` unique exercises, round-robin balanced across body-part groups. */
function pickBalancedExercises(count: number, parts: BodyPart[]): Exercise[] {
  const groups = parts
    .map((part) => shuffle(exercises.filter((ex) => ex.bodyPart === part)))
    .filter((group) => group.length > 0)

  const picked: Exercise[] = []
  const used = new Set<string>()
  let lastExerciseId: string | null = null
  let groupIndex = 0
  let attemptsWithoutPick = 0

  while (picked.length < count && groups.length > 0 && attemptsWithoutPick < groups.length) {
    const group = groups[groupIndex % groups.length]
    groupIndex++

    let candidate = group.find((ex) => !used.has(ex.id) && ex.id !== lastExerciseId)
    if (!candidate) {
      candidate = group.find((ex) => ex.id !== lastExerciseId)
    }

    if (!candidate) {
      attemptsWithoutPick++
      continue
    }

    attemptsWithoutPick = 0
    used.add(candidate.id)
    lastExerciseId = candidate.id
    picked.push(candidate)

    if (used.size >= exercises.length) break
  }

  return picked
}

export interface GenerateWorkoutOptions {
  totalMinutes: number
  intensity: Intensity
  focusBodyParts?: BodyPart[]
  structure?: WorkoutStructure
  setsCount?: number
}

export function generateWorkout({
  totalMinutes,
  intensity,
  focusBodyParts = [],
  structure = 'circuit',
  setsCount = 3,
}: GenerateWorkoutOptions): WorkoutPlan {
  const preset = INTENSITY_PRESETS[intensity]
  const totalSeconds = totalMinutes * 60
  const slotSeconds = preset.workSeconds + preset.restSeconds
  const totalSlots = Math.max(1, Math.floor(totalSeconds / slotSeconds))
  const parts = focusBodyParts.length > 0 ? focusBodyParts : BODY_PARTS
  const sets = structure === 'circuit' ? 1 : Math.max(2, setsCount)

  const uniqueCount = structure === 'circuit' ? totalSlots : Math.max(1, Math.floor(totalSlots / sets))
  const picked = pickBalancedExercises(uniqueCount, parts)

  const steps: WorkoutStep[] = []

  if (structure === 'rounds') {
    for (let round = 1; round <= sets; round++) {
      for (const exercise of picked) {
        steps.push({
          exercise,
          workSeconds: preset.workSeconds,
          restSeconds: preset.restSeconds,
          setIndex: round,
          setsTotal: sets,
        })
      }
    }
  } else if (structure === 'sets') {
    for (const exercise of picked) {
      for (let set = 1; set <= sets; set++) {
        steps.push({
          exercise,
          workSeconds: preset.workSeconds,
          restSeconds: preset.restSeconds,
          setIndex: set,
          setsTotal: sets,
        })
      }
    }
  } else {
    for (const exercise of picked) {
      steps.push({
        exercise,
        workSeconds: preset.workSeconds,
        restSeconds: preset.restSeconds,
        setIndex: 1,
        setsTotal: 1,
      })
    }
  }

  return {
    steps,
    totalMinutes,
    intensity,
    focusBodyParts,
    structure,
    setsCount: sets,
  }
}
