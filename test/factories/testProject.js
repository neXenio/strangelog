// @flow

import { join as joinPath, resolve as resolvePath } from 'path';

import { outputFileSync, removeSync } from 'fs-extra';
import jsYaml from 'js-yaml';

import { CURRENT_VERSION } from '../../src/api';

import { getOwnTestPath } from './fileSystem';

const testProjectPaths = [];

export function createTestProject(customPath?: string = 'changelog'): {
  rootPath: string,
  changelogPath: string,
  infoFilePath: string,
  configFilePath: string
} {
  const rootPath = resolvePath(getOwnTestPath());
  const changelogPath = joinPath(rootPath, customPath);
  const infoFilePath = joinPath(changelogPath, 'info.yml');
  const configFilePath = joinPath(rootPath, '.strangelogrc');

  outputFileSync(joinPath(rootPath, 'package.json'), JSON.stringify({
    version: '1.0.0'
  }));
  outputYAMLSync(joinPath(rootPath, '.strangelogrc'), {
    path: customPath,
    components: {
      comp1: 'Comp 1',
      comp2: 'Comp 2'
    }
  });

  outputYAMLSync(infoFilePath, { version: CURRENT_VERSION });

  testProjectPaths.push(rootPath);

  return {
    rootPath,
    changelogPath,
    infoFilePath,
    configFilePath
  };
}

export function removeTestProjects() {
  testProjectPaths.splice(0, testProjectPaths.length).forEach(removeSync);
}

function outputYAMLSync(path, json) {
  outputFileSync(path, jsYaml.safeDump(json));
}

afterEach(removeTestProjects);
