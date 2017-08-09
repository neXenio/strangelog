// @flow

import { resolve } from 'path';

import { removeSync } from 'fs-extra';

import getProjectConfig from '../../src/getProjectConfig';
import { createTestProject } from '../factories/testProject';

describe('getProjectConfig', () => {

  let testProject, cwd;

  beforeEach(() => {
    cwd = process.cwd();
    testProject = createTestProject();
    process.chdir(resolve(testProject.rootPath));
  });

  afterEach(() => {
    removeSync(testProject.rootPath);
    process.chdir(cwd);
  });

  describe('when there is no .strangelogrc', () => {

    it('returns default configuration', () => {
      removeSync(testProject.configFilePath);
      expect(
        getProjectConfig()
      ).toMatchSnapshot();
    });

  });

  describe('when there is a .strangelogrc', () => {

    it('returns configuration from .strangelogrc merged over defaults', () => {
      expect(
        getProjectConfig()
      ).toMatchSnapshot();
    });

  });

});
