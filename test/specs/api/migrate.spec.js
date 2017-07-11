// @flow

import { join as joinPath } from 'path';

import { removeSync, readFileSync, mkdirsSync, statSync } from 'fs-extra';
import { safeLoad } from 'js-yaml';

import { connectChangelog, CURRENT_VERSION } from '../../../src/api';
import { createTestProject } from '../../factories/testProject';

describe('migrate', () => {

  let currentRootPath;

  afterEach(() => {
    removeSync(currentRootPath);
  });

  function setup() {
    const { rootPath, changelogPath, infoFilePath } = createTestProject();

    currentRootPath = rootPath;

    const changelog = connectChangelog({
      path: changelogPath,
      components: {
        comp1: 'Comp 1',
        comp2: 'Comp 2'
      }
    });

    return {
      rootPath,
      infoFilePath,
      changelogPath,
      changelog
    };
  }

  test('only runs migrations beyond current version', () => {
    const { changelog } = setup();

    expect(changelog.migrate()).toEqual({
      from: CURRENT_VERSION,
      to: CURRENT_VERSION
    });
  });

  describe('migrations', () => {
    describe('without an info.yml in the changelog directory', () => {
      test('writes info.yml with version 0', () => {
        const { changelog, infoFilePath } = setup();

        removeSync(infoFilePath);

        expect(changelog.migrate()).toEqual({
          from: -1,
          to: CURRENT_VERSION
        });
        expect(safeLoad(readFileSync(infoFilePath).toString())).toEqual({
          version: CURRENT_VERSION
        });
      });
    });

    describe('to version 1', () => {
      test('transforms `x.y` version directory style to SemVer (`x.,y.z`)', () => {
        const { changelog, changelogPath } = setup();
        const oldPath = joinPath(changelogPath, '1.0');
        const newPath = joinPath(changelogPath, '1.0.0');

        mkdirsSync(oldPath);
        changelog.saveChangelogInfo({ version: 0 });

        changelog.migrate();

        expect(() => statSync(oldPath)).toThrow();
        expect(() => statSync(newPath)).not.toThrow();
      });
    });
  });

});
