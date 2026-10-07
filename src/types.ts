export type MigrationResultType = {
  from: number;
  to: number;
};

export type ConfigType = {
  path: string;
  components: ComponentsConfigType;
};

export type ChangelogInfoType = {
  version: number;
};

export type MigratorType = (config: ConfigType) => void;

// A component is configured either by its title or by an object; `enabled: false` keeps a
// component for rendering existing entries but no longer offers it for new ones
export type ComponentConfigType = string | {
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
};

export type VersionChangelogType = {
  version: string | null | undefined;
  entries: Record<EntryKindType, EntryType[]>;
};

export type ChangelogType = VersionChangelogType[];

export type ChangelogAPIType = {
  // returns the path of the written entry file
  addEntry: (entry: EntryType) => string;
  bumpNextVersion: (nextVersion: string) => void;
  generate: () => string;
  getChangelogData: () => ChangelogType;
  getPossibleNextVersions: () => string[] | null;
  getAutomaticNextVersion: () => string | null;
  getComponentsConfig: () => ComponentsConfigType;
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
};
