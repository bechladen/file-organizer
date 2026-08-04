export function friendlyFsErrorMessage(error) {
  if (!error || typeof error !== 'object') return '❌ Невідома помилка'

  const code = error.code
  const path = error.path

  if (code === 'ENOENT') {
    return `❌ Не знайдено: ${path || '(невідомий шлях)'}`
  }

  if (code === 'EACCES' || code === 'EPERM') {
    return `❌ Немає доступу: ${path || '(невідомий шлях)'}`
  }

  if (code) {
    return `❌ Помилка (${code}): ${error.message || 'без повідомлення'}`
  }

  return `❌ Помилка: ${error.message || 'без повідомлення'}`
}

