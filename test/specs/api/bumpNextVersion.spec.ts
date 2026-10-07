import { readFileSync } from 'node:fs';
import { resolve } from 'path';

import { globSync } from 'glob';
import { load } from 'js-yaml';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { connectChangelog } from '../../../src/api/index.ts';
import { multiToSingleLineString } from '../../../src/api/utils.ts';
import { getOwnTestPath } from '../../factories/fileSystem.ts';
import { mkdirsSync, outputFileSync, removeSync } from '../../fileSystem.ts';

const testPath = getOwnTestPath();

describe('bumpNextVersion', () => {
  beforeEach(() => {
    removeSync(testPath);
    vi.useFakeTimers({
      now: new Date('2017-06-24T00:01:02.000Z'),
      toFake: ['Date']
    });
  });

  afterEach(() => {
    removeSync(testPath);
    vi.useRealTimers();
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
        bumpNextVersion('1.0.0');
      }).toThrow(
        multiToSingleLineString(`
        Cannot release version "next" as 1.0.0
        because it does not contain any entries yet
        (${resolve(`${testPath}/next/`)})
      `)
      );
    });
  });

  describe('when called with already existing version', () => {
    it('throws error', () => {
      const { bumpNextVersion } = setup();

      outputFileSync(`${testPath}/next/fake.yml`, '');
      mkdirsSync(`${testPath}/1.0.0`);

      expect(() => {
        bumpNextVersion('1.0.0');
      }).toThrow(
        multiToSingleLineString(`
        Cannot release version "next" as 1.0.0
        because that version already exists
        (${resolve(`${testPath}/1.0.0`)})
      `)
      );
    });
  });

  describe('when called with correct "next" version entries', () => {
    it('renames "next" directory to new version string', () => {
      const { bumpNextVersion } = setup();

      outputFileSync(`${testPath}/next/fake.yml`, '');

      bumpNextVersion('1.0.0');

      expect(globSync(`${testPath}/next`).length).toEqual(0);
      expect(globSync(`${testPath}/1.0.0/fake.yml`).length).toEqual(1);
    });

    it('creates an new file with the correct content', () => {
      const { addEntry } = setup();

      addEntry({
        component: 'comp1',
        kind: 'fix',
        description: 'the description'
      });

      expect(
        load(readFileSync(`${testPath}/next/2017-06-24T00-01-02.000Z_fix_comp1.yml`).toString())
      ).toEqual({
        component: 'comp1',
        dateTime: '2017-06-24T00:01:02.000Z',
        description: 'the description',
        kind: 'fix'
      });
    });
  });
});
