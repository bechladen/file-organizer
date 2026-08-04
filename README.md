# file-organizer

Навчальний CLI-інструмент на Node.js (у стилі лекцій), який вміє сканувати директорію, знаходити дублікати, організовувати файли по категоріях та (опційно) очищати старі файли.

## Безпека

- `scan` / `duplicates`: тільки читання (нічого не змінює).
- `organize`: копіює файли в цільову директорію (оригінали не видаляє).
- `cleanup`: за замовчуванням **dry-run** (без видалення). Реальне видалення потребує **двох** прапорців: `--confirm` і `--yes-i-know`.

## Використання (спочатку тестова директорія)

Використовуй тестову директорію:

- `~/Desktop/organizer-test/`

### scan

```bash
node file-organizer.js scan ~/Desktop/organizer-test
```

### duplicates

```bash
node file-organizer.js duplicates ~/Desktop/organizer-test
```

### organize

```bash
node file-organizer.js organize ~/Desktop/organizer-test --output ~/Desktop/organizer-output
```

### cleanup (dry-run)

```bash
node file-organizer.js cleanup ~/Desktop/organizer-test --older-than 90
```

### cleanup (реальне видалення; подвійне підтвердження)

```bash
node file-organizer.js cleanup ~/Desktop/organizer-test --older-than 90 --confirm --yes-i-know
```

## Здача в GitHub

Опублікуй директорію `file-organizer/` у GitHub і прикріпи посилання на неї.

