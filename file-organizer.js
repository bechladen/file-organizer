import process from 'node:process'

import { Scanner } from './lib/scanner.js'
import { DuplicateFinder } from './lib/duplicates.js'
import { Organizer } from './lib/organizer.js'
import { formatSize } from './lib/utils/format.js'
import { friendlyFsErrorMessage } from './lib/utils/errors.js'
import { drawProgressBar } from './lib/utils/progress.js'

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

function formatDaysAgo(date) {
  const dayMs = 1000 * 60 * 60 * 24
  const days = Math.floor((Date.now() - date.getTime()) / dayMs)
  return `${days} дн. тому`
}

function printScanReport(stats) {
  console.log('\n\n📊 Результати сканування:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Всього файлів: ${stats.totalFiles}`)
  console.log(`Всього директорій: ${stats.totalDirs}`)
  console.log(`Загальний розмір: ${formatSize(stats.totalSize)}\n`)

  console.log('За типами файлів:')
  const exts = Object.entries(stats.byExt).sort(([, a], [, b]) => b.count - a.count)
  for (const [ext, data] of exts) {
    console.log(`  ${ext.padEnd(14)} ${String(data.count).padStart(4)} файлів   ${formatSize(data.size)}`)
  }

  console.log('\nВік файлів:')
  console.log(`  Останні 7 днів:     ${stats.age.last7Days} файлів`)
  console.log(`  Останні 30 днів:    ${stats.age.last30Days} файлів`)
  console.log(`  Старші за 90 днів:  ${stats.age.olderThan90Days} файлів`)

  if (stats.largestFiles.length > 0) {
    console.log('\nНайбільші файли:')
    stats.largestFiles.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.name}   ${formatSize(f.size)}`)
    })
  }

  if (stats.oldestFile) {
    console.log(`\nНайстаріший файл: ${stats.oldestFile.name} (змінено ${formatDaysAgo(stats.oldestFile.mtime)})`)
  }
}

function printDuplicatesReport(result) {
  const { groups, totalWastedBytes } = result

  if (groups.length === 0) {
    console.log('\n✅ Дублікатів не знайдено.')
    return
  }

  console.log(`\nЗнайдено груп дублікатів: ${groups.length} (марно: ${formatSize(totalWastedBytes)})\n`)

  groups.forEach((g, idx) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Група ${idx + 1} (${g.count} копій, ${formatSize(g.fileSize)} кожна):`)
    console.log(`  SHA-256: ${g.hash}`)
    console.log('')
    for (const f of g.files) {
      console.log(`  📄 ${f.path}`)
    }
    console.log(`\n  Марно: ${formatSize(g.wastedBytes)}\n`)
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`💾 Разом марно: ${formatSize(totalWastedBytes)}`)
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
      const scanner = new Scanner()

      scanner.on('scan-start', ({ directory: dir, totalFiles }) => {
        console.log(`📂 Сканування: ${dir}`)
        process.stdout.write(`Обробка... ${drawProgressBar(0, totalFiles)}\n`)
      })

      scanner.on('file-found', ({ processed, totalFiles }) => {
        process.stdout.write(`\rОбробка... ${drawProgressBar(processed, totalFiles)}   `)
      })

      scanner.on('scan-complete', (stats) => {
        process.stdout.write('\n')
        printScanReport(stats)
      })

      scanner.on('error', (err) => {
        console.error(friendlyFsErrorMessage(err))
        process.exit(1)
      })

      await scanner.scan(directory)
      return
    }

    if (command === 'duplicates') {
      if (!directory) {
        printHelp()
        process.exit(1)
      }
      const finder = new DuplicateFinder()

      finder.on('scan-start', ({ directory: dir, totalFiles }) => {
        console.log(`🔍 Пошук дублікатів у: ${dir}`)
        process.stdout.write(`Обчислення хешів... ${drawProgressBar(0, totalFiles)}\n`)
      })

      finder.on('file-processed', ({ processed, totalFiles }) => {
        process.stdout.write(`\rОбчислення хешів... ${drawProgressBar(processed, totalFiles)}   `)
      })

      finder.on('duplicates-found', (result) => {
        process.stdout.write('\n')
        printDuplicatesReport(result)
      })

      finder.on('error', (err) => {
        console.error(friendlyFsErrorMessage(err))
        process.exit(1)
      })

      await finder.find(directory)
      return
    }

    if (command === 'organize') {
      if (!directory || !flags.output) {
        printHelp()
        process.exit(1)
      }
      const organizer = new Organizer()

      organizer.on('organize-start', ({ sourceDirectory, outputDirectory, totalFiles }) => {
        console.log(`📦 Організація: ${sourceDirectory}`)
        console.log(`Ціль: ${outputDirectory}\n`)
        process.stdout.write(`Копіювання... ${drawProgressBar(0, totalFiles)}\n`)
      })

      organizer.on('copy-start', ({ processed, totalFiles }) => {
        process.stdout.write(`\rКопіювання... ${drawProgressBar(processed, totalFiles)}   `)
      })

      organizer.on('copy-complete', ({ processed, totalFiles }) => {
        process.stdout.write(`\rКопіювання... ${drawProgressBar(processed, totalFiles)}   `)
      })

      organizer.on('copy-error', ({ error }) => {
        console.error('\n' + friendlyFsErrorMessage(error))
        process.exit(1)
      })

      organizer.on('organize-complete', (result) => {
        process.stdout.write('\n')
        console.log('\n✅ Готово!\n')
        console.log('Підсумок:')
        for (const [category, count] of Object.entries(result.summary)) {
          console.log(`  ${category}: ${count} файлів → ${result.outputDirectory}/${category}/`)
        }
        console.log(`\nВсього скопійовано: ${result.totalFiles} файлів (${formatSize(result.totalCopiedBytes)})`)
      })

      organizer.on('error', (err) => {
        console.error(friendlyFsErrorMessage(err))
        process.exit(1)
      })

      await organizer.organize(directory, flags.output)
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

