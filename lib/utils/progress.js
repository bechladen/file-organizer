export function drawProgressBar(current, total, width = 20) {
  const safeTotal = total > 0 ? total : 1
  const ratio = Math.min(Math.max(current / safeTotal, 0), 1)
  const filled = Math.round(ratio * width)
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
  return `${bar} ${current}/${total}`
}

