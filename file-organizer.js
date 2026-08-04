import process from 'node:process'

import { friendlyFsErrorMessage } from './lib/utils/errors.js'

function printHelp() {
  console.log(`file-organizer

Usage:
  node file-organizer.js scan <directory>
  node file-organizer.js duplicates <directory>
  node file-organizer.js organize <sourceDirectory> --output <targetDirectory>
  node file-organizer.js cleanup <directory> --older-than <days> [--confirm --yes-i-know]
`)
}

function parseArgs(argv) {
  const args = argv.slice(2)
  const command = args[0]
  const directory = args[1]

  const flags = {}
  for (let i = 2; i < args.length; i++) {
    const token = args[i]

    if (token === '--output') {
      flags.output = args[i + 1]
      i++
      continue
    }

    if (token === '--older-than') {
      flags.olderThan = args[i + 1]
      i++
      continue
    }

    if (token === '--confirm') {
      flags.confirm = true
      continue
    }

    if (token === '--yes-i-know') {
      flags.yesIKnow = true
      continue
    }
  }

  return { command, directory, flags }
}

async function main() {
  const { command, directory, flags } = parseArgs(process.argv)

  if (!command || command === '--help' || command === '-h') {
    printHelp()
    process.exit(command ? 0 : 1)
  }

  try {
    if (command === 'scan') {
      if (!directory) {
        printHelp()
        process.exit(1)
      }
      console.log('OK: scan', directory)
      return
    }

    if (command === 'duplicates') {
      if (!directory) {
        printHelp()
        process.exit(1)
      }
      console.log('OK: duplicates', directory)
      return
    }

    if (command === 'organize') {
      if (!directory || !flags.output) {
        printHelp()
        process.exit(1)
      }
      console.log('OK: organize', directory, '->', flags.output)
      return
    }

    if (command === 'cleanup') {
      if (!directory || !flags.olderThan) {
        printHelp()
        process.exit(1)
      }
      console.log('OK: cleanup', directory, 'older-than', flags.olderThan)
      return
    }

    console.error('Невідома команда:', command)
    printHelp()
    process.exit(1)
  } catch (err) {
    console.error(friendlyFsErrorMessage(err))
    process.exit(1)
  }
}

main()

