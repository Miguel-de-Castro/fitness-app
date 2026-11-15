export type BodyPart =
  | 'waist'
  | 'upper legs'
  | 'lower legs'
  | 'back'
  | 'chest'
  | 'cardio'
  | 'upper arms'
  | 'shoulders'
  | 'lower arms'
  | 'neck'

export interface Exercise {
  id: string
  name: string
  bodyPart: BodyPart
  target: string
  muscleGroup: string
  secondaryMuscles: string[]
  instructions: string
  instructionSteps: string[]
  gif: string
  attribution: string
}

export type Intensity = 'easy' | 'medium' | 'hard'

export interface IntensityPreset {
  label: string
  description: string
  workSeconds: number
  restSeconds: number
}

export type WorkoutStructure = 'circuit' | 'rounds' | 'sets'

export interface WorkoutStep {
  exercise: Exercise
  workSeconds: number
  restSeconds: number
  setIndex: number
  setsTotal: number
}

export interface WorkoutPlan {
  steps: WorkoutStep[]
  totalMinutes: number
  intensity: Intensity
  focusBodyParts: BodyPart[]
  structure: WorkoutStructure
  setsCount: number
}

export interface WorkoutSession {
  id: string
  startedAt: string
  plannedMinutes: number
  actualSeconds: number
  intensity: Intensity
  completed: boolean
  exerciseNames: string[]
  bodyParts: BodyPart[]
}
