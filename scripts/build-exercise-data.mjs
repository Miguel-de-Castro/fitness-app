// One-time (re-runnable) data pipeline: fetch a pinned commit of hasaneyldrm/exercises-dataset,
// pull out the bodyweight/no-equipment exercises + their GIFs, write a
// trimmed dataset into the app, then delete the clone. Not used at runtime.
//
// Usage: npm run fetch-exercises

import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const REPO_URL = 'https://github.com/hasaneyldrm/exercises-dataset'
// Pinned upstream commit: a new upstream version is picked up deliberately
// (bump this after reviewing it), never silently.
const REPO_COMMIT = '7455efae41b330c265e7cd4b78dfa848e7ce5ebd'
// Media paths must look like videos/<name>.gif. Anything else (e.g. "../") is
// rejected, so a bad upstream entry can never copy a file from outside the clone.
const GIF_PATH = /^videos\/[\w.-]+\.gif$/
const cloneDir = mkdtempSync(path.join(tmpdir(), 'exercises-dataset-'))

const outDataFile = path.join(repoRoot, 'src', 'data', 'exercises.json')
const outGifDir = path.join(repoRoot, 'public', 'exercises', 'gifs')

function log(msg) {
  console.log(`[fetch-exercises] ${msg}`)
}

try {
  log(`Fetching ${REPO_URL} @ ${REPO_COMMIT.slice(0, 7)} (shallow) into ${cloneDir} ...`)
  const git = (...args) => execFileSync('git', ['-C', cloneDir, ...args], { stdio: 'inherit' })
  git('init', '--quiet')
  git('fetch', '--depth', '1', '--', REPO_URL, REPO_COMMIT)
  git('checkout', '--quiet', 'FETCH_HEAD')

  const jsonPath = path.join(cloneDir, 'data', 'exercises.json')
  if (!existsSync(jsonPath)) {
    throw new Error(`Expected dataset file not found at ${jsonPath}`)
  }

  log('Reading dataset ...')
  const all = JSON.parse(readFileSync(jsonPath, 'utf-8'))
  log(`Total exercises in source dataset: ${all.length}`)

  const bodyweight = all.filter((ex) => (ex.equipment ?? '').toLowerCase() === 'body weight')
  log(`Bodyweight (no-equipment) exercises: ${bodyweight.length}`)

  mkdirSync(outGifDir, { recursive: true })
  mkdirSync(path.dirname(outDataFile), { recursive: true })

  const trimmed = []
  let missingGif = 0

  for (const ex of bodyweight) {
    if (typeof ex.gif_url !== 'string' || !GIF_PATH.test(ex.gif_url)) {
      missingGif++
      continue
    }
    const srcGif = path.resolve(cloneDir, ex.gif_url)
    if (!srcGif.startsWith(path.resolve(cloneDir) + path.sep)) {
      missingGif++
      continue
    }
    const gifFileName = path.basename(ex.gif_url)
    const destGif = path.join(outGifDir, gifFileName)

    if (!existsSync(srcGif)) {
      missingGif++
      continue
    }
    copyFileSync(srcGif, destGif)

    trimmed.push({
      id: ex.id,
      name: ex.name,
      bodyPart: ex.body_part,
      target: ex.target,
      muscleGroup: ex.muscle_group,
      secondaryMuscles: ex.secondary_muscles ?? [],
      instructions: ex.instructions?.en ?? '',
      instructionSteps: ex.instruction_steps?.en ?? [],
      gif: `/exercises/gifs/${gifFileName}`,
      attribution: ex.attribution ?? '© Gym visual — https://gymvisual.com/',
    })
  }

  if (missingGif > 0) {
    log(`Warning: ${missingGif} exercises were missing a GIF file and were skipped.`)
  }

  writeFileSync(outDataFile, JSON.stringify(trimmed, null, 2))
  log(`Wrote ${trimmed.length} exercises to ${path.relative(repoRoot, outDataFile)}`)
  log(`Copied ${trimmed.length} GIFs to ${path.relative(repoRoot, outGifDir)}`)
} finally {
  log(`Cleaning up clone dir ${cloneDir} ...`)
  rmSync(cloneDir, { recursive: true, force: true })
}

log('Done.')
