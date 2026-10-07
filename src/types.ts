export type MigrationResultType = {
  from: number;
  to: number;
};

export type TemplateNameType = 'default' | 'compact';

export type ConfigType = {
  path: string;
  components: ComponentsConfigType;
  // Markdown template of `generate`
  template?: TemplateNameType;
  // Labels of the kinds in the compact template, merged over its defaults
  kindLabels?: Partial<Record<EntryKindType, string>>;
  // Kinds that new entries may have; entries of other kinds still render
  kinds?: EntryKindType[];
  // Turns ticket IDs into links, `{ticket}` is replaced with the ID
  ticketUrl?: string;
  // Regular expression that ticket IDs given to `add` must match
  ticketPattern?: string;
  // Component label of entries without component in the compact template
  allComponentLabel?: string;
  // Markdown file appended to the generated changelog
  legacyChangelog?: string;
};

export type ChangelogInfoType = {
  version: number;
};

export type MigratorType = (config: ConfigType) => void;

// A component is configured either by its title or by an object; `enabled: false` keeps a
// component for rendering existing entries but no longer offers it for new ones
export type ComponentConfigType =
  | string
  | {
      title: string;
      enabled?: boolean;
    };

export type ComponentsConfigType = {
  [name: string]: ComponentConfigType;
};

export type EntryKindType = 'addition' | 'change' | 'fix' | 'security' | 'removal' | 'deprecation';

export type EntryType = {
  component: string | null | undefined;
  kind: EntryKindType;
  description: string;
  tickets?: string[];
};

export type VersionChangelogType = {
  version: string | null | undefined;
  // release date (YYYY-MM-DD) from <version>/.release.yml
  date?: string | null;
  entries: Record<EntryKindType, EntryType[]>;
};

export type ChangelogType = VersionChangelogType[];

export type BumpOptionsType = {
  // release date (YYYY-MM-DD), defaults to the local date
  date?: string;
};

export type GenerateOptionsType = {
  // renders only this version's section, without the `# Changelog` header
  version?: string;
};

export type ChangelogAPIType = {
  // returns the path of the written entry file
  addEntry: (entry: EntryType) => string;
  bumpNextVersion: (nextVersion: string, options?: BumpOptionsType) => void;
  generate: (options?: GenerateOptionsType) => string;
  getChangelogData: () => ChangelogType;
  getPossibleNextVersions: () => string[] | null;
  getAutomaticNextVersion: () => string | null;
  getComponentsConfig: () => ComponentsConfigType;
  getConfig: () => ConfigType;
  migrate: () => MigrationResultType;
  renameComponent: (from: string, to: string) => number;
  getChangelogInfo: () => ChangelogInfoType;
  saveChangelogInfo: (newChangelogInfo: ChangelogInfoType) => void;
};

export type CLIOptionsType = {
  _: string[];
  directory: string;
};

export type TemplateHelpersType = {
  stringifyVersion: (version: string | null | undefined) => string;
  readableComponent: (componentID: string) => string;
  // ticket IDs or links joined with `, `; empty string without tickets
  renderTickets: (tickets: string[] | undefined) => string;
  kindLabels: Partial<Record<EntryKindType, string>>;
  allComponentLabel: string;
};
