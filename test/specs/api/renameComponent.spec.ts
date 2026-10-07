import { basename } from 'path';

import { removeSync } from 'fs-extra';

import { connectChangelog } from '../../../src/api';
import { addTestVersionsWithEntries } from '../../factories/changelog';
import { getOwnTestPath } from '../../factories/fileSystem';
import { joinAndGlob, readSingleYAMLFileFromGlob } from '../../utils';

const testPath = getOwnTestPath();

describe('renameComponent', () => {

  beforeEach(() => {
    removeSync(testPath);
    jest.useFakeTimers({ now: new Date('2017-06-24T00:01:02.000Z') });
  });

  afterEach(() => {
    removeSync(testPath);
    jest.useRealTimers();
  });

  function setup() {
    const changelogAPI = connectChangelog({
      path: testPath,
      components: {
        comp1: 'Comp 1',
        comp2: 'Comp 2',
        comp3: 'Comp 3'
      }
    });

    // comp1 in 1.0.0 and 1.1.0, comp2 in "next"
    addTestVersionsWithEntries(changelogAPI);

    return changelogAPI;
  }

  it('moves the entries of all versions to the new component', () => {
    const changelogAPI = setup();

    expect(changelogAPI.renameComponent('comp1', 'comp3')).toBe(2);

    expect(readSingleYAMLFileFromGlob(testPath, '1.0.0/*.yml')).toEqual({
      dateTime: '2017-06-24T00:01:02.000Z',
      component: 'comp3',
      kind: 'addition',
      description: 'comp1 addition description'
    });
    expect(readSingleYAMLFileFromGlob(testPath, '1.1.0/*.yml').component).toBe('comp3');
    expect(readSingleYAMLFileFromGlob(testPath, 'next/*.yml').component).toBe('comp2');
  });

  it('renames the component suffix of the entry file names', () => {
    const changelogAPI = setup();

    changelogAPI.renameComponent('comp1', 'comp3');

    expect(joinAndGlob(testPath, '1.0.0/*.yml').map((filePath) => basename(filePath)))
      .toEqual(['2017-06-24T00-01-02.000Z_addition_comp3.yml']);
  });

  it('merges entries into an already used component', () => {
    const changelogAPI = setup();

    expect(changelogAPI.renameComponent('comp2', 'comp1')).toBe(1);

    const components = changelogAPI.getChangelogData()
      .flatMap(({ entries }) => Object.values(entries).flat())
      .map(({ component }) => component);

    expect(components).toEqual(['comp1', 'comp1', 'comp1']);
  });

  it('throws when the target component is not configured', () => {
    const changelogAPI = setup();

    expect(() => changelogAPI.renameComponent('comp1', 'unknown')).toThrow(
      'Unknown component "unknown", add it to the components in .strangelogrc first'
    );
    expect(readSingleYAMLFileFromGlob(testPath, '1.0.0/*.yml').component).toBe('comp1');
  });

});
