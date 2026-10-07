// @flow

import { outputFileSync } from 'fs-extra';
import { dump } from 'js-yaml';

import type { ConfigType, EntryType } from '../types';

export default function addEntry(
  { path, components }: ConfigType,
  entry: EntryType
): void {
  const { component } = entry;

  if (component && !Object.keys(components).includes(component)) {
    throw new Error(`Unknown component "${component}"`);
  }

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