import { globSync } from 'glob';

import type {
  BuiltInEntryKindType,
  ComponentConfigType,
  ConfigType,
  EntryKindType
} from '../types.ts';

// In the order of the `add` prompt and of the generated changelog
export const ENTRY_KINDS: BuiltInEntryKindType[] = [
  'addition',
  'change',
  'fix',
  'removal',
  'deprecation',
  'security'
];

export function isBuiltInKind(kind: EntryKindType): kind is BuiltInEntryKindType {
  return (ENTRY_KINDS as string[]).includes(kind);
}

// The kinds new entries may have (`kinds` in .strangelogrc): built-in kinds in the order of
// ENTRY_KINDS, then custom kinds (e.g. `chore`) in the order of `kinds`
export function getAllowedKinds({ kinds }: ConfigType): EntryKindType[] {
  if (!kinds) {
    return ENTRY_KINDS;
  }

  return [
    ...ENTRY_KINDS.filter((kind) => kinds.includes(kind)),
    ...kinds.filter((kind) => !isBuiltInKind(kind))
  ];
}

// Label of a kind in the compact template and the default template's section heading of a
// custom kind: `kindLabels` first, the kind's own name otherwise
export function getCustomKindLabel({ kindLabels }: ConfigType, kind: EntryKindType): string {
  return kindLabels?.[kind] || kind;
}

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
