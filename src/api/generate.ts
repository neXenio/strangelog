import { readFileSync } from 'node:fs';

import compactTemplate, {
  renderVersionChangelog as renderCompactVersionChangelog
} from '../templates/compactTemplate.ts';
import defaultTemplate, {
  renderVersionChangelog as renderDefaultVersionChangelog
} from '../templates/defaultTemplate.ts';
import type {
  ConfigType,
  ChangelogType,
  GenerateOptionsType,
  TemplateHelpersType,
  TemplateNameType,
  VersionChangelogType
} from '../types.ts';

import { getComponentTitle, stringifyVersion } from './utils.ts';

const templates: Record<
  TemplateNameType,
  {
    renderChangelog: (helpers: TemplateHelpersType, changelog: ChangelogType) => string;
    renderVersion: (helpers: TemplateHelpersType, versionChangelog: VersionChangelogType) => string;
  }
> = {
  default: { renderChangelog: defaultTemplate, renderVersion: renderDefaultVersionChangelog },
  compact: { renderChangelog: compactTemplate, renderVersion: renderCompactVersionChangelog }
};

function readableComponent(
  componentID: string | null | undefined,
  { components }: ConfigType
): string {
  if (componentID == null) {
    return 'All';
  }

  return getComponentTitle(components[componentID]);
}

function renderTickets(tickets: string[] | undefined, { ticketUrl }: ConfigType): string {
  return (tickets || [])
    .map((ticket) => (ticketUrl ? `[${ticket}](${ticketUrl.replace('{ticket}', ticket)})` : ticket))
    .join(', ');
}

export default function generate(
  config: ConfigType,
  changelog: ChangelogType,
  { version }: GenerateOptionsType = {}
): string {
  const templateName = config.template || 'default';
  const template = templates[templateName];

  if (!template) {
    throw new Error(`Unknown template "${templateName}", use "default" or "compact"`);
  }

  const helpers: TemplateHelpersType = {
    readableComponent: (componentID) => readableComponent(componentID, config),
    stringifyVersion,
    renderTickets: (tickets) => renderTickets(tickets, config),
    kindLabels: config.kindLabels || {},
    allComponentLabel: config.allComponentLabel || 'all'
  };

  if (version) {
    const versionChangelog = changelog.find(
      (versionChangelogCandidate) => stringifyVersion(versionChangelogCandidate.version) === version
    );

    if (!versionChangelog) {
      throw new Error(`Unknown version "${version}"`);
    }

    return template.renderVersion(helpers, versionChangelog);
  }

  const markdown = template.renderChangelog(helpers, changelog);

  if (!config.legacyChangelog) {
    return markdown;
  }

  return `${markdown.replace(/\n*$/, '')}\n\n${readLegacyChangelog(config.legacyChangelog)}`;
}

// The generated changelog has its own `# Changelog` header
function readLegacyChangelog(legacyChangelogPath: string): string {
  return readFileSync(legacyChangelogPath)
    .toString()
    .replace(/^# Changelog[ \t]*(\r?\n|$)(\r?\n)*/, '');
}
