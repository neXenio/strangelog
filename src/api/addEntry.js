// @flow

import { outputFileSync } from 'fs-extra';
import jsYaml from 'js-yaml';

import type { ConfigType, EntryType } from '../types';

export default function addEntry(
  { path, components }: ConfigType,
  entry: EntryType
): void {
  if (entry.component && !Object.keys(components).includes(entry.component)) {
    throw new Error(`Unknown component "${entry.component || ''}"`);
  }

  const date = new Date();
  const fsFriendlyDateTimeString = toFSFriendlyDateTime(date);
  const readableComponent = entry.component || 'all';
  const fileName = `${fsFriendlyDateTimeString}_${entry.kind}_${readableComponent}.yml`;

  outputFileSync(
    `${path}/next/${fileName}`,
    jsYaml.safeDump({
      dateTime: date.toISOString(),
      ...entry
    })
  );
}

function toFSFriendlyDateTime(date: Date): string {
  return date.toISOString().replace(/:/g, '-');
}