# file-organizer

Навчальний CLI-інструмент на Node.js, який вміє сканувати директорію, знаходити дублікати, організовувати файли по категоріях та (опційно) очищати старі файли.

## Безпека

- `scan` / `duplicates`: тільки читання (нічого не змінює).
- `organize`: копіює файли в цільову директорію (оригінали не видаляє).
- `cleanup`: за замовчуванням **dry-run** (без видалення). Реальне видалення потребує **двох** прапорців: `--confirm` і `--yes-i-know`.

## Використання (спочатку тестова директорія)

Використовуй тестову директорію:

- `~/Desktop/organizer-test/`

Порада: можна запускати напряму через `node`, або через `npm run ...` (див. приклади нижче).

### scan

```bash
node file-organizer.js scan ~/Desktop/organizer-test
```

Або через npm scripts:

```bash
npm run scan -- ~/Desktop/organizer-test
```

### duplicates

```bash
node file-organizer.js duplicates ~/Desktop/organizer-test
```

Або через npm scripts:

```bash
npm run duplicates -- ~/Desktop/organizer-test
```

### organize

```bash
node file-organizer.js organize ~/Desktop/organizer-test --output ~/Desktop/organizer-output
```

Або через npm scripts:

```bash
npm run organize -- ~/Desktop/organizer-test --output ~/Desktop/organizer-output
```

### cleanup (dry-run)

```bash
node file-organizer.js cleanup ~/Desktop/organizer-test --older-than 90
```

Або через npm scripts:

```bash
npm run cleanup -- ~/Desktop/organizer-test --older-than 90
```

### cleanup (реальне видалення; подвійне підтвердження)

```bash
node file-organizer.js cleanup ~/Desktop/organizer-test --older-than 90 --confirm --yes-i-know
```

## Ручний тест-чекліст (на `~/Desktop/organizer-test/`)

1) **scan**
   - Команда відпрацьовує без помилок.
   - Є підсумок: кількість файлів, розмір, топ-3, найстаріший файл.

2) **duplicates**
   - Якщо є копії одного й того ж файлу — показує групи.
   - Якщо копій немає — пише, що дублікатів не знайдено.

3) **organize**
   - Створює папки `Documents/Images/Archives/Code/Videos/Other` у `--output`.
   - Файли копіюються (оригінали в `organizer-test` залишаються).
   - Якщо в output вже є файл з такою назвою — створюється `name(1).ext`.

4) **cleanup**
   - Без `--confirm --yes-i-know` нічого не видаляє (dry-run).
   - З `--confirm --yes-i-know` видаляє знайдені файли (перевіряти тільки на тестовій папці).

## Здача (GitHub)

Потрібно прикріпити посилання на директорію `file-organizer/` у твоєму GitHub.

Оскільки ти хочеш запускати `git` команди сам, ось короткий варіант (виконай у терміналі, перебуваючи в `file-organizer/`):

```bash
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```

Після пуша надай лінк на репозиторій або конкретну папку `file-organizer/`.