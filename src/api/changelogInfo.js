// @flow

import { join as joinPath } from 'path';

import { outputFileSync, existsSync, readFileSync } from 'fs-extra';
import { dump, load } from 'js-yaml';

import type { ChangelogInfoType, ConfigType } from '../types';

import { CURRENT_VERSION } from './migrations';
import { globPaths } from './utils';

export function getChangelogInfo(config: ConfigType): ChangelogInfoType {
  ensureInitializedProject(config);

  return load(readFileSync(getInfoFilePath(config)).toString());
}

export function saveChangelogInfo(
  config: ConfigType,
  newChangelogInfo: ChangelogInfoType
): void {
  const infoFilePath = joinPath(config.path, 'info.yml');

  return outputFileSync(
    infoFilePath,
    dump(newChangelogInfo)
  );
}

// Three cases may occur:
//   1. info.yml exists already -> we can exit, the project is setup correctly
//   2. info.yml does not exist and we have no changelog entry files yet -> new project, write
//      initial config and set migration version to latest since it's implicitly up-to-date
//   3. info.yml does not exist but we have changelog entry files already -> old project, with
//      implicit migration version -1 (since info.yml was introduced with the first migration)
export function ensureInitializedProject(config: ConfigType): void {
  if (existsSync(getInfoFilePath(config))) {
    // Case 1
    return;
  }

  const hasEntries = globPaths(joinPath(config.path, '**/*')).length > 0;

  saveChangelogInfo(config, {
    version: hasEntries
      // Case 3
      ? -1
      // Case 2
      : CURRENT_VERSION
  });
}

function getInfoFilePath(config: ConfigType): string {
  return joinPath(config.path, 'info.yml');
}