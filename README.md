# file-organizer

Lecture-style Node.js CLI tool to scan a directory, find duplicates, organize files by category, and (optionally) cleanup old files.

## Safety

- `scan` / `duplicates`: read-only.
- `organize`: copies files into an output directory (does not delete originals).
- `cleanup`: **dry-run by default**. Real deletion requires **both** `--confirm` and `--yes-i-know`.

## Usage (test directory first)

Use your test directory:

- `~/Desktop/organizer-test/`

### Scan

```bash
node file-organizer.js scan ~/Desktop/organizer-test
```

### Duplicates

```bash
node file-organizer.js duplicates ~/Desktop/organizer-test
```

### Organize

```bash
node file-organizer.js organize ~/Desktop/organizer-test --output ~/Desktop/organizer-output
```

### Cleanup (dry run)

```bash
node file-organizer.js cleanup ~/Desktop/organizer-test --older-than 90
```

### Cleanup (real delete; double confirm)

```bash
node file-organizer.js cleanup ~/Desktop/organizer-test --older-than 90 --confirm --yes-i-know
```

## GitHub submission

Publish the `file-organizer/` folder to GitHub and submit the link to it.

