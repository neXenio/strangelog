// @flow

import {
  join as joinPath,
  resolve as resolvePath
} from 'path';

import { sync as syncGlob } from 'glob';
import { moveSync } from 'fs-extra';

import type { ConfigType } from '../types';

import { multiToSingleLineString } from './utils';

export default function bumpNextVersion(
  { path }: ConfigType,
  nextVersionString: string
): void {
  ensureNextVersionHasEntries(path, nextVersionString);
  ensureVersionDoesNotExist(path, nextVersionString);

  moveSync(
    joinPath(path, 'next'),
    joinPath(path, nextVersionString)
  );
}

function ensureNextVersionHasEntries(
  changelogPath: string,
  nextVersionString: string
) {
  if (syncGlob(joinPath(changelogPath, 'next', '**/*')).length === 0) {
    throw new Error(multiToSingleLineString(`
      Cannot release version "next" as ${nextVersionString}
      because it does not contain any entries yet
      (${resolvePath(changelogPath, 'next')})`));
  }
}

function ensureVersionDoesNotExist(
  changelogPath: string,
  nextVersionString: string
) {
  if (syncGlob(joinPath(changelogPath, nextVersionString)).length > 0) {
    throw new Error(multiToSingleLineString(`
      Cannot release version "next" as ${nextVersionString}
      because that version already exists
      (${resolvePath(changelogPath, nextVersionString)})`));
  }
}