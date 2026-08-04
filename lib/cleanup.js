import { EventEmitter } from 'node:events'

export class Cleanup extends EventEmitter {
  async run(_directory, _options) {
    throw new Error('Cleanup not implemented')
  }
}

