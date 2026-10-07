import type {
  ChangelogType,
  VersionChangelogType,
  TemplateHelpersType,
  EntryType,
  EntryKindType
} from '../types.ts';

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
): string {
  return [
    '# Changelog',
    ...changelog
      .filter((versionChangelog) => !isEmptyUnreleasedVersion(versionChangelog))
      .map((versionChangelog) => renderVersionChangelog(helpers, versionChangelog))
  ].join('\n\n');
}

// Right after a release `next` has no entries; an empty `next` heading would only be noise
function isEmptyUnreleasedVersion({ version, entries }: VersionChangelogType): boolean {
  return !version && Object.values(entries).every((kindEntries) => kindEntries.length === 0);
}

function renderVersionChangelog(
  helpers: TemplateHelpersType,
  { version, entries }: VersionChangelogType
): string {
  // Object.keys() does not narrow to the key type
  const entryKeys = Object.keys(entries) as EntryKindType[];

  return [
    `## Version \`${helpers.stringifyVersion(version)}\``,
    ...entryKeys
      .map((entryKind) => renderEntriesOfKind(helpers, entryKind, entries[entryKind]))
      .filter((entry) => entry)
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
      const componentLabel = component ? `**${helpers.readableComponent(component)}:** ` : '';

      return `- ${componentLabel}${description}`;
    })
  ].join('\n');
}
