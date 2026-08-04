import { EventEmitter } from 'node:events'
import fs from 'node:fs/promises'
import path from 'node:path'

import { copyFileSmart } from './utils/copy.js'
import { getAllCategoryNames, getCategoryByExt } from './utils/categories.js'
import { resolveNameCollision } from './utils/fs-extra.js'
import { walkDirectory } from './utils/walk.js'

export class Organizer extends EventEmitter {
  async organize(sourceDirectory, outputDirectory) {
    try {
      const { totalFiles } = await walkDirectory(sourceDirectory)
      this.emit('organize-start', { sourceDirectory, outputDirectory, totalFiles })

      // Створюємо папки категорій
      const categoryNames = getAllCategoryNames()
      for (const category of categoryNames) {
        await fs.mkdir(path.join(outputDirectory, category), { recursive: true })
      }

      const summary = {}
      for (const category of categoryNames) summary[category] = 0

      let processed = 0
      let totalCopiedBytes = 0

      await walkDirectory(sourceDirectory, {
        onFile: async ({ path: sourcePath, name }) => {
          processed++

          const st = await fs.stat(sourcePath)
          const ext = path.extname(name)
          const category = getCategoryByExt(ext)
          const targetDir = path.join(outputDirectory, category)

          const safeName = await resolveNameCollision(targetDir, name)
          const targetPath = path.join(targetDir, safeName)

          this.emit('copy-start', {
            processed,
            totalFiles,
            sourcePath,
            targetPath,
            category,
            size: st.size,
          })

          try {
            await copyFileSmart(sourcePath, targetPath, st.size)
            totalCopiedBytes += st.size
            summary[category] = (summary[category] || 0) + 1

            this.emit('copy-complete', {
              processed,
              totalFiles,
              sourcePath,
              targetPath,
              category,
              size: st.size,
            })
          } catch (error) {
            this.emit('copy-error', {
              processed,
              totalFiles,
              sourcePath,
              targetPath,
              category,
              size: st.size,
              error,
            })
            throw error
          }
        },
      })

      const result = {
        totalFiles,
        totalCopiedBytes,
        summary,
        outputDirectory,
      }

      this.emit('organize-complete', result)
      return result
    } catch (error) {
      this.emit('error', error)
      return null
    }
  }
}

