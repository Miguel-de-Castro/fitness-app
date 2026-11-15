import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shuffle, Play } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { BodyPartPicker } from '@/components/BodyPartPicker'
import { ExerciseCard } from '@/components/ExerciseCard'
import {
  generateWorkout,
  INTENSITY_PRESETS,
  STRUCTURE_DESCRIPTIONS,
  STRUCTURE_LABELS,
} from '@/lib/workout-generator'
import { loadPrefs, savePrefs } from '@/lib/storage'
import { cn } from '@/lib/utils'
import type { BodyPart, Intensity, WorkoutPlan, WorkoutStructure } from '@/types/exercise'

const STRUCTURES: WorkoutStructure[] = ['circuit', 'rounds', 'sets']
const SET_COUNTS = [2, 3, 4, 5]

export default function Generate() {
  const navigate = useNavigate()
  const prefs = loadPrefs()
  const [minutes, setMinutes] = useState(prefs.lastMinutes)
  const [intensity, setIntensity] = useState<Intensity>(prefs.lastIntensity)
  const [focusParts, setFocusParts] = useState<BodyPart[]>([])
  const [structure, setStructure] = useState<WorkoutStructure>(prefs.lastStructure)
  const [setsCount, setSetsCount] = useState(prefs.lastSetsCount)
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)

  const handleGenerate = () => {
    savePrefs({ lastMinutes: minutes, lastIntensity: intensity, lastStructure: structure, lastSetsCount: setsCount })
    setPlan(
      generateWorkout({
        totalMinutes: minutes,
        intensity,
        focusBodyParts: focusParts,
        structure,
        setsCount,
      }),
    )
  }

  const handleStart = () => {
    if (!plan) return
    navigate('/workout', { state: plan })
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label className="text-sm font-medium text-foreground">Time</label>
              <span className="font-timer text-2xl font-semibold text-foreground">
                {minutes}
                <span className="text-sm text-muted-foreground"> min</span>
              </span>
            </div>
            <Slider
              min={5}
              max={60}
              step={5}
              value={[minutes]}
              onValueChange={([v]) => setMinutes(v)}
            />
            <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
              <span>5</span>
              <span>60</span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Intensity</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(INTENSITY_PRESETS) as Intensity[]).map((key) => {
                const preset = INTENSITY_PRESETS[key]
                const active = intensity === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIntensity(key)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-left transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-transparent hover:bg-muted',
                    )}
                  >
                    <p className="text-sm font-medium">{preset.label}</p>
                    <p
                      className={cn(
                        'text-xs',
                        active ? 'text-primary-foreground/80' : 'text-muted-foreground',
                      )}
                    >
                      {preset.workSeconds}s/{preset.restSeconds}s
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Structure</p>
            <div className="grid grid-cols-3 gap-2">
              {STRUCTURES.map((key) => {
                const active = structure === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStructure(key)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-left transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-transparent hover:bg-muted',
                    )}
                  >
                    <p className="text-sm font-medium">{STRUCTURE_LABELS[key]}</p>
                    <p
                      className={cn(
                        'text-xs',
                        active ? 'text-primary-foreground/80' : 'text-muted-foreground',
                      )}
                    >
                      {STRUCTURE_DESCRIPTIONS[key]}
                    </p>
                  </button>
                )
              })}
            </div>
            {structure !== 'circuit' && (
              <div className="mt-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  {structure === 'rounds' ? 'Rounds through the circuit' : 'Sets per exercise'}
                </p>
                <div className="flex gap-2">
                  {SET_COUNTS.map((count) => {
                    const active = setsCount === count
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setSetsCount(count)}
                        aria-pressed={active}
                        className={cn(
                          'font-timer size-9 rounded-lg border text-sm font-medium transition-colors',
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-transparent hover:bg-muted',
                        )}
                      >
                        {count}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              Focus areas <span className="text-muted-foreground">(optional)</span>
            </p>
            <BodyPartPicker selected={focusParts} onChange={setFocusParts} />
          </div>

          <Button type="button" onClick={handleGenerate} size="lg" className="gap-1.5">
            <Shuffle className="size-4" />
            {plan ? 'Regenerate' : 'Generate workout'}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {plan ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">
                  {new Set(plan.steps.map((s) => s.exercise.id)).size} exercises
                  {plan.structure === 'rounds' && ` · ${plan.setsCount} rounds`}
                  {plan.structure === 'sets' && ` · ${plan.setsCount} sets each`}
                  {' · ~'}
                  {plan.totalMinutes} min
                </h2>
                <Button type="button" onClick={handleStart} className="gap-1.5">
                  <Play className="size-4" />
                  Start
                </Button>
              </div>
              <div className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto pr-1">
                {plan.steps.map((step, i) => (
                  <ExerciseCard
                    key={`${step.exercise.id}-${i}`}
                    exercise={step.exercise}
                    index={i}
                    workSeconds={step.workSeconds}
                    restSeconds={step.restSeconds}
                    setLabel={
                      step.setsTotal > 1
                        ? `${plan.structure === 'rounds' ? 'Round' : 'Set'} ${step.setIndex}/${step.setsTotal}`
                        : undefined
                    }
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Set your time and hit generate to preview your session.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
