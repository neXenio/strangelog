// @flow

import { resolve } from 'path';

import { sync as syncGlob } from 'glob';
import {
  removeSync,
  readFileSync,
  outputFileSync,
  mkdirsSync
} from 'fs-extra';
import jsYaml from 'js-yaml';
import { install as installClock } from 'lolex';

import { connectChangelog } from '../../../src/api';
import { multiToSingleLineString } from '../../../src/api/utils';
import { getOwnTestPath } from '../../factories/fileSystem';

const testPath = getOwnTestPath();

describe('bumpNextVersion', () => {

  let clock;

  beforeEach(() => {
    removeSync(testPath);
    clock = installClock(new Date('2017-06-24T00:01:02.000Z'));
  });

  afterEach(() => {
    removeSync(testPath);
    clock.uninstall();
  });

  function setup() {
    return connectChangelog({
      path: testPath,
      components: {
        comp1: 'Comp 1',
        comp2: 'Comp 2'
      }
    });
  }

  describe('when called with empty "next" directory', () => {

    it('throws error', () => {
      const { bumpNextVersion } = setup();

      expect(() => {
        bumpNextVersion({
          major: 1,
          minor: 0,
          patch: 0
        });
      }).toThrow(multiToSingleLineString(`
        Cannot release version "next" as 1.0.0
        because it does not contain any entries yet
        (${resolve(`${testPath}/next/`)})
      `));
    });

  });

  describe('when called with already existing version', () => {

    it('throws error', () => {
      const { bumpNextVersion } = setup();

      outputFileSync(`${testPath}/next/fake.yml`);
      mkdirsSync(`${testPath}/1.0.0`);

      expect(() => {
        bumpNextVersion({
          major: 1,
          minor: 0,
          patch: 0
        });
      }).toThrow(multiToSingleLineString(`
        Cannot release version "next" as 1.0.0
        because that version already exists
        (${resolve(`${testPath}/1.0.0`)})
      `));
    });

  });

  describe('when called with correct "next" version entries', () => {

    it('renames "next" directory to new version string', () => {
      const { bumpNextVersion } = setup();

      outputFileSync(`${testPath}/next/fake.yml`);

      bumpNextVersion({
        major: 1,
        minor: 0,
        patch: 0
      });

      expect(syncGlob(`${testPath}/next`).length).toEqual(0);
      expect(syncGlob(`${testPath}/1.0.0/fake.yml`).length).toEqual(1);
    });

    it('creates an new file with the correct content', () => {
      const { addEntry } = setup();

      addEntry({
        component: 'comp1',
        kind: 'fix',
        description: 'the description'
      });

      expect(
        jsYaml.safeLoad(
          readFileSync(
            `${testPath}/next/2017-06-24T00-01-02.000Z_fix_comp1.yml`
          ).toString()
        )
      ).toEqual({
        component: 'comp1',
        dateTime: '2017-06-24T00:01:02.000Z',
        description: 'the description',
        kind: 'fix'
      });
    });

  });

});