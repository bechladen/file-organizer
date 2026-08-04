import { EventEmitter } from 'node:events'
import fs from 'node:fs/promises'

import { walkDirectory } from './utils/walk.js'

export class Cleanup extends EventEmitter {
  async run(directory, options) {
    try {
      const now = Date.now()
      const dayMs = 1000 * 60 * 60 * 24

      const olderThanDays = options?.olderThanDays ?? 0
      const confirm = Boolean(options?.confirm)
      const yesIKnow = Boolean(options?.yesIKnow)

      const { totalFiles } = await walkDirectory(directory)
      this.emit('cleanup-start', { directory, totalFiles, olderThanDays, confirm, yesIKnow })

      const candidates = []
      let processed = 0

      await walkDirectory(directory, {
        onFile: async ({ path: filePath, name }) => {
          processed++

          const st = await fs.stat(filePath)
          const daysOld = (now - st.mtime.getTime()) / dayMs

          const fileInfo = {
            path: filePath,
            name,
            size: st.size,
            mtime: st.mtime,
            daysOld,
          }

          if (daysOld > olderThanDays) {
            candidates.push(fileInfo)
            this.emit('file-found', { processed, totalFiles, file: fileInfo })
          } else {
            this.emit('file-scanned', { processed, totalFiles })
          }
        },
      })

      // Dry-run: тільки список
      if (!confirm || !yesIKnow) {
        const totalBytes = candidates.reduce((sum, f) => sum + f.size, 0)
        const result = {
          mode: 'dry-run',
          directory,
          olderThanDays,
          candidates,
          totalBytes,
        }
        this.emit('cleanup-complete', result)
        return result
      }

      // Реальне видалення (подвійне підтвердження)
      let deleted = 0
      let freedBytes = 0

      for (const file of candidates) {
        await fs.unlink(file.path)
        deleted++
        freedBytes += file.size
        this.emit('file-deleted', {
          deleted,
          totalToDelete: candidates.length,
          file,
        })
      }

      const result = {
        mode: 'delete',
        directory,
        olderThanDays,
        deleted,
        freedBytes,
        candidates,
      }

      this.emit('cleanup-complete', result)
      return result
    } catch (error) {
      this.emit('error', error)
      return null
    }
  }
}

