// @flow

export type CLIOptionsType = {
  directory: string
};

export type CLIGenerateOptionsType = CLIOptionsType & {
  outFile: string
};

export type CLIBumpOptionsType = CLIOptionsType & {
 version: string
};
