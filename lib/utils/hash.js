import crypto from 'node:crypto'
import fs from 'node:fs'

// SHA-256 для файлу через stream (без fs.readFile)
export function hashFileSha256Stream(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)

    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

