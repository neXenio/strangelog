import { dump } from 'js-yaml';

import { outputFileSync } from '../fileSystem.ts';
import type { ConfigType, EntryType } from '../types.ts';

import { ensureInitializedProject } from './changelogInfo.ts';
import { getAllowedKinds } from './utils.ts';

export default function addEntry(config: ConfigType, entry: EntryType): string {
  const { path, components } = config;
  const { component, kind } = entry;
  const { tickets, ...entryData } = entry;

  if (component && !Object.keys(components).includes(component)) {
    throw new Error(`Unknown component "${component}"`);
  }

  const allowedKinds = getAllowedKinds(config);

  if (config.kinds && !allowedKinds.includes(kind)) {
    throw new Error(`Kind "${kind}" is not allowed, allowed kinds: ${allowedKinds.join(', ')}`);
  }

  // Record the format version before the first entry exists, otherwise the project would later
  // be taken for one created before info.yml was introduced
  ensureInitializedProject(config);

  const date = new Date();
  const fsFriendlyDateTimeString = toFSFriendlyDateTime(date);
  const readableComponent = entry.component || 'all';
  const fileName = `${fsFriendlyDateTimeString}_${entry.kind}_${readableComponent}.yml`;

  const entryFilePath = `${path}/next/${fileName}`;

  outputFileSync(
    entryFilePath,
    dump({
      dateTime: date.toISOString(),
      ...entryData,
      // only written when there are tickets, so entries without them keep their format
      ...(tickets && tickets.length > 0 ? { tickets } : {})
    })
  );

  return entryFilePath;
}

function toFSFriendlyDateTime(date: Date): string {
  return date.toISOString().replace(/:/g, '-');
}
