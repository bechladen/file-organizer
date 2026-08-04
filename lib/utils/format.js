export function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes === 0) return '0 B'

  const kb = 1024
  const mb = kb * 1024
  const gb = mb * 1024

  if (bytes < kb) return `${bytes} B`
  if (bytes < mb) return `${(bytes / kb).toFixed(1)} KB`
  if (bytes < gb) return `${(bytes / mb).toFixed(1)} MB`
  return `${(bytes / gb).toFixed(2)} GB`
}

