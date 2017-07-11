// @flow

import { join as joinPath } from 'path';

import { outputFileSync } from 'fs-extra';
import jsYaml from 'js-yaml';

import { CURRENT_VERSION } from '../../src/api';

import { getOwnTestPath } from './fileSystem';

export function createTestProject(): {
  rootPath: string,
  changelogPath: string,
  infoFilePath: string
} {
  const rootPath = getOwnTestPath();
  const changelogPath = joinPath(rootPath, '/changelog');
  const infoFilePath = joinPath(changelogPath, '/info.yml');

  outputYAMLSync(joinPath(rootPath, '.strangelogrc'), {
    path: 'changelog',
    components: {
      comp1: 'Comp 1',
      comp2: 'Comp 2'
    }
  });

  outputYAMLSync(infoFilePath, { version: CURRENT_VERSION });

  return {
    rootPath,
    changelogPath,
    infoFilePath
  };
}

function outputYAMLSync(path, json) {
  outputFileSync(path, jsYaml.safeDump(json));
}