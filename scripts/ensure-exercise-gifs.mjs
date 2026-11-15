// Runs before `dev` and `build`. The exercise GIFs are © Gym visual and are not
// committed to this repo (see README → License), so on a fresh clone they're
// missing. If any GIF referenced by src/data/exercises.json is absent, this
// runs the full fetch pipeline once; otherwise it exits immediately.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataFile = path.join(repoRoot, 'src', 'data', 'exercises.json')

const exercises = existsSync(dataFile) ? JSON.parse(readFileSync(dataFile, 'utf-8')) : []
const missing = exercises.filter((ex) => !existsSync(path.join(repoRoot, 'public', ex.gif)))

if (exercises.length > 0 && missing.length === 0) process.exit(0)

console.log(
  exercises.length === 0
    ? '[ensure-exercise-gifs] No exercise data yet; fetching the dataset ...'
    : `[ensure-exercise-gifs] ${missing.length} exercise GIFs missing; fetching the dataset ...`,
)
execFileSync(process.execPath, [path.join(repoRoot, 'scripts', 'build-exercise-data.mjs')], {
  stdio: 'inherit',
})
