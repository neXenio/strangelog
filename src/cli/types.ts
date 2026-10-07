export type CLIOptionsType = {
  directory: string
};

export type CLIGenerateOptionsType = CLIOptionsType & {
  outFile: string
};

export type CLIRenameComponentOptionsType = CLIOptionsType & {
  from: string,
  to: string
};

export type CLIAddOptionsType = CLIOptionsType & {
  kind?: string,
  component?: string,
  description?: string
};

export type CLIBumpOptionsType = CLIOptionsType & {
 version: string,
 auto: boolean
};
