import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'

const TEN_MB = 10 * 1024 * 1024

// Копіює файл: <10MB через copyFile, >=10MB через streams+pipeline
export async function copyFileSmart(sourcePath, targetPath, sizeBytes) {
  const size = Number(sizeBytes)

  if (Number.isFinite(size) && size >= TEN_MB) {
    await pipeline(fs.createReadStream(sourcePath), fs.createWriteStream(targetPath))
    return { method: 'pipeline' }
  }

  await fsp.copyFile(sourcePath, targetPath)
  return { method: 'copyFile' }
}

