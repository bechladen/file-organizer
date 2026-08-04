import { EventEmitter } from 'node:events'

export class Scanner extends EventEmitter {
  async scan(_directory) {
    throw new Error('Scanner not implemented')
  }
}

