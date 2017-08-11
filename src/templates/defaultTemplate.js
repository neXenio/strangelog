// @flow

import type {
  ChangelogType,
  VersionChangelogType,
  TemplateHelpersType,
  EntryType,
  EntryKindType
} from '../types';

const entryKindToReadable = {
  change: 'Changed',
  addition: 'Added',
  fix: 'Fixed',
  security: 'Security',
  removal: 'Removed',
  deprecation: 'Deprecated'
};

export default function defaultTemplate(
  helpers: TemplateHelpersType,
  changelog: ChangelogType
) {
  return [
    '# Changelog',
    ...changelog.map((versionChangelog) => renderVersionChangelog(helpers, versionChangelog))
  ].join('\n\n');
}

function renderVersionChangelog(
  helpers: TemplateHelpersType,
  { version, entries }: VersionChangelogType
): string {
  // $FlowFixMe: Object.keys() does not refine correctly based on type definition of keys
  const entryKeys: EntryKindType[] = Object.keys(entries);

  return [
    `## Version \`${helpers.stringifyVersion(version)}\``,
    ...entryKeys.map(
      (entryKind) => renderEntriesOfKind(helpers, entryKind, entries[entryKind])
    ).filter((entry) => entry)
  ].join('\n\n');
}

function renderEntriesOfKind(
  helpers: TemplateHelpersType,
  kind: EntryKindType,
  entries: EntryType[]
): string {
  if (entries.length === 0) {
    return '';
  }

  return [
    `### ${entryKindToReadable[kind]}`,
    ...entries.map(({ component, description }) => {
      const componentLabel = component
        ? `**${helpers.readableComponent(component)}:** `
        : '';

      return `- ${componentLabel}${description}`;
    })
  ].join('\n');
}