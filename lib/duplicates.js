import { EventEmitter } from 'node:events'
import fs from 'node:fs/promises'

import { hashFileSha256Stream } from './utils/hash.js'
import { walkDirectory } from './utils/walk.js'

export class DuplicateFinder extends EventEmitter {
  async find(directory) {
    try {
      const { totalFiles } = await walkDirectory(directory)
      this.emit('scan-start', { directory, totalFiles })

      let processed = 0

      // hash -> { files: [{ path, name, size }], size }
      const byHash = new Map()

      await walkDirectory(directory, {
        onFile: async ({ path: filePath, name }) => {
          processed++

          const st = await fs.stat(filePath)
          const size = st.size

          const hash = await hashFileSha256Stream(filePath)

          if (!byHash.has(hash)) {
            byHash.set(hash, { files: [], size })
          }

          byHash.get(hash).files.push({ path: filePath, name, size })

          this.emit('file-processed', { processed, totalFiles, path: filePath, name, size, hash })
        },
      })

      const groups = []
      let totalWastedBytes = 0

      for (const [hash, data] of byHash.entries()) {
        if (data.files.length <= 1) continue

        const fileSize = data.size
        const wastedBytes = fileSize * (data.files.length - 1)
        totalWastedBytes += wastedBytes

        groups.push({
          hash,
          fileSize,
          count: data.files.length,
          wastedBytes,
          files: data.files,
        })
      }

      groups.sort((a, b) => b.wastedBytes - a.wastedBytes)

      const result = { groups, totalWastedBytes }
      this.emit('duplicates-found', result)
      return result
    } catch (error) {
      this.emit('error', error)
      return null
    }
  }
}

