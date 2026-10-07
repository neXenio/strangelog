// @flow

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

export type CLIBumpOptionsType = CLIOptionsType & {
 version: string,
 auto: boolean
};
