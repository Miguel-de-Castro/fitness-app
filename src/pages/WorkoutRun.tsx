import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Pause, Play, SkipForward, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TimerRing } from '@/components/TimerRing'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { saveSession } from '@/lib/storage'
import { BODY_PART_LABELS } from '@/lib/workout-generator'
import type { WorkoutPlan, WorkoutSession } from '@/types/exercise'

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function WorkoutRun() {
  const navigate = useNavigate()
  const location = useLocation()
  const plan = location.state as WorkoutPlan | null

  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<'work' | 'rest'>('work')
  const [remaining, setRemaining] = useState(plan?.steps[0]?.workSeconds ?? 0)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const startedAtRef = useRef(new Date().toISOString())

  useEffect(() => {
    if (!plan || plan.steps.length === 0) {
      navigate('/generate', { replace: true })
    }
  }, [plan, navigate])

  useEffect(() => {
    if (paused || finished || !plan) return
    const id = setInterval(() => {
      setRemaining((r) => r - 1)
      setElapsed((e) => e + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [paused, finished, plan, phase, stepIndex])

  useEffect(() => {
    if (!plan || finished || remaining > 0) return

    const step = plan.steps[stepIndex]
    const goNext = () => {
      if (stepIndex + 1 >= plan.steps.length) {
        finishWorkout(true)
      } else {
        setStepIndex(stepIndex + 1)
        setPhase('work')
        setRemaining(plan.steps[stepIndex + 1].workSeconds)
      }
    }

    if (phase === 'work' && step.restSeconds > 0) {
      setPhase('rest')
      setRemaining(step.restSeconds)
    } else {
      goNext()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, finished])

  function finishWorkout(isCompleted: boolean) {
    if (!plan) return
    const includedSteps = isCompleted ? plan.steps : plan.steps.slice(0, stepIndex + 1)
    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      startedAt: startedAtRef.current,
      plannedMinutes: plan.totalMinutes,
      actualSeconds: elapsed,
      intensity: plan.intensity,
      completed: isCompleted,
      exerciseNames: includedSteps.map((s) => s.exercise.name),
      bodyParts: includedSteps.map((s) => s.exercise.bodyPart),
    }
    saveSession(session)
    setFinished(true)
    navigate('/', { replace: true })
  }

  if (!plan || plan.steps.length === 0) return null

  const step = plan.steps[stepIndex]
  const phaseSeconds = phase === 'work' ? step.workSeconds : step.restSeconds
  const progress = phaseSeconds > 0 ? remaining / phaseSeconds : 0
  const nextStep = plan.steps[stepIndex + 1]

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <p className="text-sm text-muted-foreground">
          Exercise <span className="font-timer text-foreground">{stepIndex + 1}</span> / {plan.steps.length}
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => setShowEndConfirm(true)}
          aria-label="End workout"
        >
          <X className="size-4" />
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-10">
        <figure className="flex flex-col items-center gap-1.5">
          <img
            src={step.exercise.gif}
            alt={step.exercise.name}
            className="size-40 rounded-2xl border border-border object-cover sm:size-[180px]"
          />
          {/* Required by the media terms on every use of the GIFs. */}
          <figcaption className="text-[11px] text-muted-foreground">{step.exercise.attribution}</figcaption>
        </figure>

        <TimerRing progress={progress} phase={phase} size={260}>
          <div className="flex flex-col items-center">
            <span
              className={
                'text-xs font-semibold tracking-widest uppercase ' +
                (phase === 'work' ? 'text-work' : 'text-rest')
              }
            >
              {phase === 'work' ? 'Work' : 'Rest'}
            </span>
            <span className="font-timer text-6xl font-semibold tabular-nums text-foreground">
              {formatTime(Math.max(0, remaining))}
            </span>
          </div>
        </TimerRing>

        <div className="text-center">
          <h1 className="font-heading text-xl font-semibold capitalize text-foreground sm:text-2xl">
            {step.exercise.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground capitalize">
            {BODY_PART_LABELS[step.exercise.bodyPart]} · {step.exercise.target}
          </p>
          {step.setsTotal > 1 && (
            <p className="font-timer mt-1.5 text-xs font-medium text-primary">
              {plan.structure === 'rounds' ? 'Round' : 'Set'} {step.setIndex} / {step.setsTotal}
            </p>
          )}
        </div>

        {nextStep && (
          <p className="text-xs text-muted-foreground">
            Next: <span className="capitalize text-foreground">{nextStep.exercise.name}</span>
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => setPaused((p) => !p)}
            className="gap-1.5"
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            onClick={() => {
              if (stepIndex + 1 >= plan.steps.length) {
                finishWorkout(true)
              } else {
                setStepIndex(stepIndex + 1)
                setPhase('work')
                setRemaining(plan.steps[stepIndex + 1].workSeconds)
              }
            }}
            className="gap-1.5"
          >
            <SkipForward className="size-4" />
            Skip
          </Button>
        </div>
      </main>

      <Dialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End this workout?</DialogTitle>
            <DialogDescription>
              You've completed {stepIndex} of {plan.steps.length} exercises. This session will
              still be saved to your history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndConfirm(false)}>
              Keep going
            </Button>
            <Button variant="destructive" onClick={() => finishWorkout(false)}>
              End workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
