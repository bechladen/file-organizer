import fs from 'node:fs/promises'
import path from 'node:path'

export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

// Якщо файл існує, додає суфікс: file.pdf -> file(1).pdf -> file(2).pdf ...
export async function resolveNameCollision(targetDir, filename) {
  const parsed = path.parse(filename)

  let candidate = filename
  let i = 1

  while (await pathExists(path.join(targetDir, candidate))) {
    candidate = `${parsed.name}(${i})${parsed.ext}`
    i++
  }

  return candidate
}

