import process from 'node:process'

function printHelp() {
  console.log(`file-organizer

Usage:
  node file-organizer.js scan <directory>
  node file-organizer.js duplicates <directory>
  node file-organizer.js organize <sourceDirectory> --output <targetDirectory>
  node file-organizer.js cleanup <directory> --older-than <days> [--confirm --yes-i-know]
`)
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command || command === '--help' || command === '-h') {
    printHelp()
    process.exit(command ? 0 : 1)
  }

  console.error('Not implemented yet:', command)
  process.exit(1)
}

main()

