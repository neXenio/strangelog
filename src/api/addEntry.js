// @flow

import { outputFileSync } from 'fs-extra';
import { dump } from 'js-yaml';

import type { ConfigType, EntryType } from '../types';

import { ensureInitializedProject } from './changelogInfo';

export default function addEntry(
  config: ConfigType,
  entry: EntryType
): void {
  const { path, components } = config;
  const { component } = entry;

  if (component && !Object.keys(components).includes(component)) {
    throw new Error(`Unknown component "${component}"`);
  }

  // Record the format version before the first entry exists, otherwise the project would later
  // be taken for one created before info.yml was introduced
  ensureInitializedProject(config);

  const date = new Date();
  const fsFriendlyDateTimeString = toFSFriendlyDateTime(date);
  const readableComponent = entry.component || 'all';
  const fileName = `${fsFriendlyDateTimeString}_${entry.kind}_${readableComponent}.yml`;

  outputFileSync(
    `${path}/next/${fileName}`,
    dump({
      dateTime: date.toISOString(),
      ...entry
    })
  );
}

function toFSFriendlyDateTime(date: Date): string {
  return date.toISOString().replace(/:/g, '-');
}