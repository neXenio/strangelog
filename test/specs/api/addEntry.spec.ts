import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { connectChangelog } from '../../../src/api';
import { createTestProject } from '../../factories/testProject';
import { readSingleYAMLFileFromGlob } from '../../utils';

describe('addEntry', () => {

  beforeEach(() => {
    vi.useFakeTimers({
      now: new Date('2017-06-24T00:01:02.000Z'),
      toFake: ['Date']
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup() {
    const testProject = createTestProject();

    const changeLog = connectChangelog({
      path: testProject.changelogPath,
      components: {
        comp1: 'Comp 1',
        comp2: 'Comp 2'
      }
    });

    return {
      changeLog,
      testProject
    };
  }

  describe('when called with no component', () => {

    it('adds entry with null component', () => {
      const { changeLog, testProject } = setup();

      const entryFilePath = changeLog.addEntry({
        component: null,
        kind: 'fix',
        description: ''
      });

      expect(entryFilePath)
        .toBe(`${testProject.changelogPath}/next/2017-06-24T00-01-02.000Z_fix_all.yml`);
      expect(
        readSingleYAMLFileFromGlob(`${testProject.changelogPath}/next/**/*.yml`)
      ).toMatchSnapshot();
    });

  });

  describe('when called with unknown component', () => {

    it('throws appropriate error', () => {
      const { changeLog } = setup();

      expect(() => {
        changeLog.addEntry({
          component: 'unknown',
          kind: 'fix',
          description: ''
        });
      }).toThrow('Unknown component "unknown"');
    });

  });

});