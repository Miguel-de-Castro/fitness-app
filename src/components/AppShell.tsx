import { Link } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="size-4.5" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Home Workout
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      {/* Required by the media terms: every use of the GIFs carries this notice. */}
      <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-muted-foreground sm:px-6">
        Exercise animations © Gym visual —{' '}
        <a href="https://gymvisual.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2">
          https://gymvisual.com/
        </a>
      </footer>
    </div>
  )
}
