import { readFileSync } from 'node:fs';
import { basename, dirname, join as joinPath } from 'path';

import { dump, load } from 'js-yaml';

import { moveSync, outputFileSync } from '../fileSystem.ts';
import type { ConfigType, EntryType } from '../types.ts';

import { globPaths } from './utils.ts';

// Moves all entries of component `from` (in every version, including "next") to component `to`.
// Merging two components is renaming one onto the other. Returns the number of moved entries.
export default function renameComponent(
  { path, components }: ConfigType,
  from: string,
  to: string
): number {
  if (!Object.keys(components).includes(to)) {
    throw new Error(`Unknown component "${to}", add it to the components in .strangelogrc first`);
  }

  if (from === to) {
    return 0;
  }

  const entryFilePathsToMove = globPaths(joinPath(path, '*', '*.yml')).filter(
    (entryFilePath) => readEntry(entryFilePath)?.component === from
  );

  entryFilePathsToMove.forEach((entryFilePath) => {
    outputFileSync(
      entryFilePath,
      dump({
        ...readEntry(entryFilePath),
        component: to
      })
    );
    moveSync(entryFilePath, renamedEntryFilePath(entryFilePath, from, to));
  });

  return entryFilePathsToMove.length;
}

function readEntry(entryFilePath: string): EntryType | null | undefined {
  return load(readFileSync(entryFilePath).toString()) as EntryType | null | undefined;
}

// Entry file names end with `_<component>.yml` (see addEntry)
function renamedEntryFilePath(entryFilePath: string, from: string, to: string): string {
  const fileName = basename(entryFilePath);
  const fromSuffix = `_${from}.yml`;

  if (!fileName.endsWith(fromSuffix)) {
    return entryFilePath;
  }

  return joinPath(dirname(entryFilePath), `${fileName.slice(0, -fromSuffix.length)}_${to}.yml`);
}
