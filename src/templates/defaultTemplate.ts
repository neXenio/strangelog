import type {
  ChangelogType,
  VersionChangelogType,
  TemplateHelpersType,
  EntryType,
  EntryKindType
} from '../types.ts';

const entryKindToReadable: Partial<Record<EntryKindType, string>> = {
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
export function isEmptyUnreleasedVersion({ version, entries }: VersionChangelogType): boolean {
  return !version && Object.values(entries).every((kindEntries) => kindEntries.length === 0);
}

export function renderVersionChangelog(
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
    `### ${entryKindToReadable[kind] || helpers.kindLabels[kind] || capitalize(kind)}`,
    ...entries.map(({ component, description, tickets }) => {
      const componentLabel = component ? `**${helpers.readableComponent(component)}:** ` : '';
      const renderedTickets = helpers.renderTickets(tickets);

      return `- ${componentLabel}${description}${renderedTickets ? ` (${renderedTickets})` : ''}`;
    })
  ].join('\n');
}

function capitalize(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}
