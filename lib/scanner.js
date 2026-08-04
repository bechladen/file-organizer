import { EventEmitter } from 'node:events'
import fs from 'node:fs/promises'
import path from 'node:path'

import { walkDirectory } from './utils/walk.js'

export class Scanner extends EventEmitter {
  async scan(directory) {
    try {
      const now = Date.now()
      const dayMs = 1000 * 60 * 60 * 24

      // Перший прохід: порахувати загальну кількість файлів для прогресу
      const { totalFiles, totalDirs } = await walkDirectory(directory)

      this.emit('scan-start', { directory, totalFiles })

      const stats = {
        totalFiles: 0,
        totalDirs,
        totalSize: 0,
        byExt: {}, // ext -> { count, size }
        age: {
          last7Days: 0,
          last30Days: 0,
          olderThan90Days: 0,
        },
        largestFiles: [], // top-3
        oldestFile: null, // { path, name, size, mtime }
      }

      let processed = 0

      await walkDirectory(directory, {
        onFile: async ({ path: filePath, name }) => {
          processed++

          const fileStat = await fs.stat(filePath)
          const size = fileStat.size
          const mtime = fileStat.mtime

          stats.totalFiles++
          stats.totalSize += size

          const extRaw = path.extname(name)
          const ext = extRaw ? extRaw.toLowerCase() : '(без_розширення)'

          if (!stats.byExt[ext]) {
            stats.byExt[ext] = { count: 0, size: 0 }
          }
          stats.byExt[ext].count++
          stats.byExt[ext].size += size

          const ageDays = (now - mtime.getTime()) / dayMs
          if (ageDays <= 7) stats.age.last7Days++
          if (ageDays <= 30) stats.age.last30Days++
          if (ageDays > 90) stats.age.olderThan90Days++

          // Top-3 найбільших файлів (просте підтримання маленького масиву)
          stats.largestFiles.push({ path: filePath, name, size })
          stats.largestFiles.sort((a, b) => b.size - a.size)
          stats.largestFiles = stats.largestFiles.slice(0, 3)

          // Найстаріший файл
          if (!stats.oldestFile || mtime.getTime() < stats.oldestFile.mtime.getTime()) {
            stats.oldestFile = { path: filePath, name, size, mtime }
          }

          this.emit('file-found', {
            processed,
            totalFiles,
            path: filePath,
            name,
            size,
            mtime,
          })
        },
      })

      this.emit('scan-complete', stats)
      return stats
    } catch (error) {
      this.emit('error', error)
      return null
    }
  }
}

