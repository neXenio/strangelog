import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { connectChangelog } from '#src/api/index';
import { addTestVersionsWithEntries } from '#test/factories/changelog';
import { getOwnTestPath } from '#test/factories/fileSystem';
import { removeSync } from '#test/fileSystem';

const testPath = getOwnTestPath();

describe('getChangelogData', () => {
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
        comp2: 'Comp 2',
        comp3: 'Comp 3'
      }
    });
  }

  it('returns correct changelog data', () => {
    const changelogAPI = setup();

    addTestVersionsWithEntries(changelogAPI);

    expect(changelogAPI.getChangelogData()).toMatchSnapshot();
  });

  it('sorts the entries by their component name', () => {
    const changelogAPI = setup();

    changelogAPI.addEntry({
      component: 'comp2',
      kind: 'addition',
      description: 'some silly description'
    });
    changelogAPI.addEntry({
      component: 'comp3',
      kind: 'addition',
      description: 'some silly description'
    });
    changelogAPI.addEntry({
      component: 'comp1',
      kind: 'addition',
      description: 'some silly description'
    });

    const additionEntries = changelogAPI.getChangelogData()[0].entries.addition;

    expect(additionEntries[0].component).toBe('comp1');
    expect(additionEntries[1].component).toBe('comp2');
    expect(additionEntries[2].component).toBe('comp3');
  });

  it('sorts by title when components are configured as objects', () => {
    const changelogAPI = connectChangelog({
      path: testPath,
      components: {
        comp1: {
          title: 'B Comp',
          enabled: false
        },
        comp2: 'A Comp'
      }
    });

    changelogAPI.addEntry({
      component: 'comp1',
      kind: 'addition',
      description: 'some silly description'
    });
    changelogAPI.addEntry({
      component: 'comp2',
      kind: 'addition',
      description: 'some silly description'
    });

    const additionEntries = changelogAPI.getChangelogData()[0].entries.addition;

    expect(additionEntries.map(({ component }) => component)).toEqual(['comp2', 'comp1']);
  });

  describe('when there are no entries of a certain kind', () => {
    it('returns an empty array for that kind', () => {
      const changelogAPI = setup();

      changelogAPI.addEntry({
        component: 'comp1',
        kind: 'removal',
        description: 'some removal description'
      });

      expect(changelogAPI.getChangelogData()[0].entries.deprecation).toEqual([]);
    });
  });
});
