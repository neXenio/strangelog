import { join as joinPath } from 'path';

import { outputFileSync, removeSync } from 'fs-extra';
import { afterEach, describe, expect, it } from 'vitest';

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

      expect(changelog.getPossibleNextVersions()).toMatchSnapshot();
    });

  });

  describe('when called with a "1.2.3"-version in package.json', () => {

    it('resets the lower version parts like SemVer requires', () => {
      const { changelog, testProject } = setup();

      outputFileSync(
        joinPath(testProject.rootPath, 'package.json'),
        JSON.stringify({ version: '1.2.3' })
      );

      expect(changelog.getPossibleNextVersions()).toEqual(['1.2.4', '1.3.0', '2.0.0']);
    });

  });

  describe('when called with a prerelease version in package.json', () => {

    it('offers the release of that version as patch version', () => {
      const { changelog, testProject } = setup();

      outputFileSync(
        joinPath(testProject.rootPath, 'package.json'),
        JSON.stringify({ version: '1.2.3-beta.1' })
      );

      expect(changelog.getPossibleNextVersions()).toEqual(['1.2.3', '1.3.0', '2.0.0']);
    });

  });

});