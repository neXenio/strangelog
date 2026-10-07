export type CLIOptionsType = {
  directory: string;
};

export type CLIGenerateOptionsType = CLIOptionsType & {
  outFile: string;
  version?: string;
};

export type CLIRenameComponentOptionsType = CLIOptionsType & {
  from: string;
  to: string;
};

export type CLIAddOptionsType = CLIOptionsType & {
  kind?: string;
  component?: string;
  description?: string;
  // yargs turns a repeated flag into an array
  ticket?: string | string[];
};

export type CLIBumpOptionsType = CLIOptionsType & {
  version: string;
  auto: boolean;
};
