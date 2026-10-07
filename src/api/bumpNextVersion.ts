import { join as joinPath, resolve as resolvePath } from 'path';

import { dump } from 'js-yaml';

import { moveSync, outputFileSync } from '../fileSystem.ts';
import type { BumpOptionsType, ConfigType } from '../types.ts';

import { globPaths, multiToSingleLineString } from './utils.ts';

export default function bumpNextVersion(
  { path }: ConfigType,
  nextVersionString: string,
  { date = toLocalDateString(new Date()) }: BumpOptionsType = {}
): void {
  ensureValidDate(date);
  ensureNextVersionHasEntries(path, nextVersionString);
  ensureVersionDoesNotExist(path, nextVersionString);

  moveSync(joinPath(path, 'next'), joinPath(path, nextVersionString));
  // A dotfile, so that the entry globs (`*.yml`) never read it as an entry
  outputFileSync(joinPath(path, nextVersionString, '.release.yml'), dump({ date }));
}

// YYYY-MM-DD in local time: the day the release is made where it is made
function toLocalDateString(date: Date): string {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, '0'))
    .join('-');
}

function ensureValidDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00Z`);
  const isValidDate =
    /^\d{4}-\d{2}-\d{2}$/.test(date)
    && !Number.isNaN(parsedDate.getTime())
    && parsedDate.toISOString().slice(0, 10) === date;

  if (!isValidDate) {
    throw new Error(`Invalid release date "${date}", expected YYYY-MM-DD`);
  }
}

function ensureNextVersionHasEntries(changelogPath: string, nextVersionString: string) {
  if (globPaths(joinPath(changelogPath, 'next', '**/*')).length === 0) {
    throw new Error(
      multiToSingleLineString(`
      Cannot release version "next" as ${nextVersionString}
      because it does not contain any entries yet
      (${resolvePath(changelogPath, 'next')})`)
    );
  }
}

function ensureVersionDoesNotExist(changelogPath: string, nextVersionString: string) {
  if (globPaths(joinPath(changelogPath, nextVersionString)).length > 0) {
    throw new Error(
      multiToSingleLineString(`
      Cannot release version "next" as ${nextVersionString}
      because that version already exists
      (${resolvePath(changelogPath, nextVersionString)})`)
    );
  }
}
