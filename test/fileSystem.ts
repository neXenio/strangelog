import { mkdirSync, rmSync } from 'node:fs';

export { outputFileSync } from '../src/fileSystem.ts';

export function removeSync(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

export function mkdirsSync(path: string): void {
  mkdirSync(path, { recursive: true });
}
