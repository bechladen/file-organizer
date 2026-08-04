import { EventEmitter } from 'node:events'

export class DuplicateFinder extends EventEmitter {
  async find(_directory) {
    throw new Error('DuplicateFinder not implemented')
  }
}

