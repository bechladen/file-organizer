const categories = {
  Documents: ['.pdf', '.docx', '.doc', '.txt', '.md', '.xlsx', '.pptx'],
  Images: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'],
  Archives: ['.zip', '.rar', '.tar', '.gz', '.7z'],
  Code: ['.js', '.py', '.java', '.cpp', '.html', '.css', '.json'],
  Videos: ['.mp4', '.avi', '.mkv', '.mov', '.webm'],
  Other: [],
}

export function getCategoryByExt(ext) {
  const e = (ext || '').toLowerCase()
  for (const [category, exts] of Object.entries(categories)) {
    if (category === 'Other') continue
    if (exts.includes(e)) return category
  }
  return 'Other'
}

export function getAllCategoryNames() {
  return Object.keys(categories)
}

