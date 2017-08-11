// @flow

import { mkdirsSync } from 'fs-extra';

import { connectChangelog } from '../../../src/api';
import { createTestProject } from '../../factories/testProject';

describe('getPossibleNextVersions', () => {

  function setup() {
    const testProject = createTestProject();

    const changelog = connectChangelog({
      path: testProject.changelogPath,
      components: {
        comp1: 'Comp 1',
        comp2: 'Comp 2'
      }
    });

    return {
      changelog,
      testProject
    };
  }

  describe('when called with no version directories', () => {

    it('returns no possible version', () => {
      const { changelog } = setup();

      expect(changelog.getPossibleNextVersions()).toEqual(null);
    });

  });

  describe('when called with only "next" version directory', () => {

    it('returns no possible version', () => {
      const { changelog } = setup();

      expect(changelog.getPossibleNextVersions()).toEqual(null);
    });

  });

  describe('when called with a "1.0.0" version directory', () => {

    it('returns only 1.0.1, 1.1.0 and 2.0.0 as possible next versions', () => {
      const { changelog, testProject } = setup();

      mkdirsSync(`${testProject.changelogPath}/1.0`);

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