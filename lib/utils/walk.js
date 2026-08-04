import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * Рекурсивно обходить директорію і викликає колбеки для файлів/папок.
 * Повертає лічильники знайдених файлів і директорій.
 */
export async function walkDirectory(rootDir, { onFile, onDir } = {}) {
  let totalFiles = 0
  let totalDirs = 0

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        totalDirs++
        if (onDir) {
          await onDir({ path: fullPath, name: entry.name })
        }
        await walk(fullPath)
        continue
      }

      if (entry.isFile()) {
        totalFiles++
        if (onFile) {
          await onFile({ path: fullPath, name: entry.name })
        }
      }
    }
  }

  await walk(rootDir)

  return { totalFiles, totalDirs }
}

