import type {
  ChangelogType,
  VersionChangelogType,
  TemplateHelpersType,
  EntryKindType
} from '../types.ts';

import { isEmptyUnreleasedVersion } from './defaultTemplate.ts';

// Overridable via `kindLabels` in .strangelogrc
const defaultKindLabels: Record<EntryKindType, string> = {
  addition: 'feat',
  change: 'change',
  fix: 'fix',
  removal: 'removal',
  deprecation: 'deprecation',
  security: 'security'
};

// One line per entry, no sections per kind:
//   ### 1.2.3 (2026-10-07)
//   * **component** feat: description (TICKET-1)
export default function compactTemplate(
  helpers: TemplateHelpersType,
  changelog: ChangelogType
): string {
  const versionSections = changelog
    .filter((versionChangelog) => !isEmptyUnreleasedVersion(versionChangelog))
    .map((versionChangelog) => renderVersionChangelog(helpers, versionChangelog));

  return ['# Changelog\n', ...versionSections].join('\n');
}

// Ends with a line break
export function renderVersionChangelog(
  helpers: TemplateHelpersType,
  { version, date, entries }: VersionChangelogType
): string {
  const kindLabels = { ...defaultKindLabels, ...helpers.kindLabels };
  // Object.keys() does not narrow to the key type
  const entryKeys = Object.keys(entries) as EntryKindType[];
  const entryLines = entryKeys.flatMap((entryKind) =>
    entries[entryKind].map(({ component, description, tickets }) => {
      const renderedTickets = helpers.renderTickets(tickets);
      const componentLabel = component || helpers.allComponentLabel;

      return `* **${componentLabel}** ${kindLabels[entryKind]}: ${description}${renderedTickets ? ` (${renderedTickets})` : ''}`;
    })
  );

  return [
    `### ${helpers.stringifyVersion(version)}${date ? ` (${date})` : ''}`,
    ...entryLines,
    ''
  ].join('\n');
}
