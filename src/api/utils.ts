import { globSync } from 'glob';

import type { ComponentConfigType, EntryKindType } from '../types.ts';

// In the order of the `add` prompt and of the generated changelog
export const ENTRY_KINDS: EntryKindType[] = [
  'addition',
  'change',
  'fix',
  'removal',
  'deprecation',
  'security'
];

// glob >= 9 treats `\` as an escape character; keep `path.join()`-built patterns working on Windows
export function globPaths(pattern: string): string[] {
  return globSync(pattern, { windowsPathsNoEscape: true });
}

export function getComponentTitle(componentConfig: ComponentConfigType): string {
  return typeof componentConfig === 'string' ? componentConfig : componentConfig.title;
}

export function isComponentEnabled(componentConfig: ComponentConfigType): boolean {
  return typeof componentConfig === 'string' || componentConfig.enabled !== false;
}

export function stringifyVersion(version: string | null | undefined): string {
  if (!version) {
    return 'next';
  }

  return version;
}

export function multiToSingleLineString(multiLineIndentedString: string): string {
  return multiLineIndentedString.replace(/\n[ \t]*/g, ' ').trim();
}
