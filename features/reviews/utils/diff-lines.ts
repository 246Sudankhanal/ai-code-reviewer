/** New-file (RIGHT) line numbers for `+` rows in a unified diff. */
export function addedLineNumbersFromPatch(patch: string): Set<number> {
  const lines = new Set<number>();
  let newLine = 0;

  for (const raw of patch.split("\n")) {
    if (raw.startsWith("@@")) {
      const match = raw.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        newLine = Number(match[1]);
      }
      continue;
    }

    if (raw.startsWith("+++") || raw.startsWith("---") || raw.startsWith("\\")) {
      continue;
    }

    if (raw.startsWith("+")) {
      lines.add(newLine);
      newLine += 1;
      continue;
    }

    if (raw.startsWith("-")) {
      continue;
    }

    newLine += 1;
  }

  return lines;
}

export function addedLinesByFile(
  files: { filePath: string; patch: string }[]
): Map<string, Set<number>> {
  const map = new Map<string, Set<number>>();
  for (const file of files) {
    map.set(file.filePath, addedLineNumbersFromPatch(file.patch));
  }
  return map;
}
