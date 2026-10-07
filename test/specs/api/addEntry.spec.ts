import { readFileSync } from 'node:fs';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { connectChangelog } from '#src/api/index';
import type { ConfigType } from '#src/types';
import { createTestProject } from '#test/factories/testProject';
import { readSingleYAMLFileFromGlob } from '#test/utils';

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

  function setup(config: Partial<ConfigType> = {}) {
    const testProject = createTestProject();

    const changeLog = connectChangelog({
      path: testProject.changelogPath,
      components: {
        comp1: 'Comp 1',
        comp2: 'Comp 2'
      },
      ...config
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

      expect(entryFilePath).toBe(
        `${testProject.changelogPath}/next/2017-06-24T00-01-02.000Z_fix_all.yml`
      );
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

  describe('when called with tickets', () => {
    it('writes the tickets', () => {
      const { changeLog } = setup();

      const entryFilePath = changeLog.addEntry({
        component: 'comp1',
        kind: 'fix',
        description: 'a fix',
        tickets: ['LUCA-1', 'LUCA-2']
      });

      expect(readFileSync(entryFilePath).toString()).toBe(
        [
          "dateTime: '2017-06-24T00:01:02.000Z'",
          'component: comp1',
          'kind: fix',
          'description: a fix',
          'tickets:',
          '  - LUCA-1',
          '  - LUCA-2',
          ''
        ].join('\n')
      );
    });

    it('does not write an empty ticket list', () => {
      const { changeLog } = setup();

      const entryFilePath = changeLog.addEntry({
        component: 'comp1',
        kind: 'fix',
        description: 'a fix',
        tickets: []
      });

      expect(readFileSync(entryFilePath).toString()).not.toMatch('tickets');
    });
  });

  describe('when .strangelogrc restricts the kinds', () => {
    it('throws for a kind that is not allowed', () => {
      const { changeLog } = setup({ kinds: ['addition', 'fix'] });

      expect(() => {
        changeLog.addEntry({ component: 'comp1', kind: 'change', description: 'a change' });
      }).toThrow('Kind "change" is not allowed, allowed kinds: addition, fix');
    });

    it('adds entries of allowed kinds', () => {
      const { changeLog } = setup({ kinds: ['addition', 'fix'] });

      expect(changeLog.addEntry({ component: 'comp1', kind: 'fix', description: 'a fix' })).toMatch(
        /_fix_comp1\.yml$/
      );
    });
  });
});
