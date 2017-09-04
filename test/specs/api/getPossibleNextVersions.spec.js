// @flow

import { join as joinPath } from 'path';

import { removeSync } from 'fs-extra';

import { connectChangelog } from '../../../src/api';
import { createTestProject } from '../../factories/testProject';

describe('getPossibleNextVersions', () => {

  const realCWD = process.cwd();

  function setup() {
    const testProject = createTestProject();

    const changelog = connectChangelog({
      path: testProject.changelogPath,
      components: {
        comp1: 'Comp 1',
        comp2: 'Comp 2'
      }
    });

    process.chdir(testProject.rootPath);

    return {
      changelog,
      testProject
    };
  }

  afterEach(() => {
    process.chdir(realCWD);
  });

  describe('when called with no package.json in working directory', () => {

    it('returns no possible version', () => {
      const { changelog, testProject } = setup();

      removeSync(joinPath(testProject.rootPath, 'package.json'));

      expect(changelog.getPossibleNextVersions()).toEqual(null);
    });

  });

  describe('when called with a "1.0.0"-version in package.json', () => {

    it('returns only 1.0.1, 1.1.0 and 2.0.0 as possible next versions', () => {
      const { changelog } = setup();

      expect(changelog.getPossibleNextVersions()).toEqual([{
        major: 1,
        minor: 0,
        patch: 1
      }, {
        major: 1,
        minor: 1,
        patch: 0
      }, {
        major: 2,
        minor: 0,
        patch: 0
      }]);
    });

  });

});