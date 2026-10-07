import { existsSync, mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

// Writes a file and creates missing parent directories
export function outputFileSync(filePath: string, data: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, data);
}

// Moves a file or directory and creates missing parent directories. Never overwrites: entry files
// and version directories must not silently replace existing ones.
export function moveSync(sourcePath: string, destinationPath: string): void {
  if (sourcePath === destinationPath) {
    return;
  }

  if (existsSync(destinationPath)) {
    throw new Error(
      `Cannot move "${sourcePath}" to "${destinationPath}": destination already exists`
    );
  }

  mkdirSync(dirname(destinationPath), { recursive: true });
  renameSync(sourcePath, destinationPath);
}
