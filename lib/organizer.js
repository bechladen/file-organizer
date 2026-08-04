import { EventEmitter } from 'node:events'

export class Organizer extends EventEmitter {
  async organize(_sourceDirectory, _outputDirectory) {
    throw new Error('Organizer not implemented')
  }
}

