import { access, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pinnedCommit = '063bee94c3f4df8453406c830b0a7df0f2860278'
const skillNames = [
  'vercel-composition-patterns',
  'vercel-react-best-practices',
]

async function fileExists(relativePath) {
  await access(resolve(projectRoot, relativePath))
}

test('project-local Vercel skills contain pinned, licensed packages', async () => {
  for (const skillName of skillNames) {
    const skillRoot = `.agents/skills/${skillName}`
    await fileExists(`${skillRoot}/SKILL.md`)
    await fileExists(`${skillRoot}/SOURCE.md`)
    await fileExists(`${skillRoot}/LICENSE`)
    await fileExists(`${skillRoot}/agents/openai.yaml`)

    const source = await readFile(
      resolve(projectRoot, `${skillRoot}/SOURCE.md`),
      'utf8',
    )
    const skill = await readFile(
      resolve(projectRoot, `${skillRoot}/SKILL.md`),
      'utf8',
    )

    if (!source.includes(pinnedCommit)) {
      throw new Error(`${skillName} has no pinned upstream commit`)
    }
    if (!/^---\nname: [a-z0-9-]+\n/m.test(skill)) {
      throw new Error(`${skillName} has invalid skill frontmatter`)
    }
    if (!skill.includes('license: MIT')) {
      throw new Error(`${skillName} does not declare its upstream license`)
    }
  }
})

test('frontend routing records the Vite and TanStack Query boundaries', async () => {
  const routing = await readFile(
    resolve(
      projectRoot,
      '.agents/skills/vercel-react-best-practices/references/project-routing.md',
    ),
    'utf8',
  )

  for (const requiredBoundary of ['Vite', 'TanStack Query', 'SWR', 'Next.js']) {
    if (!routing.includes(requiredBoundary)) {
      throw new Error(`routing is missing the ${requiredBoundary} boundary`)
    }
  }
})

test('review routing keeps Spec and Engineering as separate axes', async () => {
  const reviewSkill = await readFile(
    resolve(projectRoot, '.agents/skills/typescript-review/SKILL.md'),
    'utf8',
  )

  for (const axis of ['### Spec', '### Engineering']) {
    if (!reviewSkill.includes(axis)) {
      throw new Error(`typescript review is missing the ${axis} axis`)
    }
  }
})
