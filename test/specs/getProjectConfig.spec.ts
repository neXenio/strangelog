import { resolve } from 'path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import getProjectConfig from '../../src/getProjectConfig.ts';
import { createTestProject } from '../factories/testProject.ts';
import { removeSync } from '../fileSystem.ts';

describe('getProjectConfig', () => {
  let testProject: ReturnType<typeof createTestProject>, cwd: string;

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
      expect(getProjectConfig()).toMatchSnapshot();
    });
  });

  describe('when there is a .strangelogrc', () => {
    it('returns configuration from .strangelogrc merged over defaults', () => {
      expect(getProjectConfig()).toMatchSnapshot();
    });
  });
});
