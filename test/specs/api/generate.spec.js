// @flow

import { removeSync } from 'fs-extra';

import { addTestVersionsWithEntries } from '../../factories/changelog';
import { connectChangelog } from '../../../src/api';
import { getOwnTestPath } from '../../factories/fileSystem';

const testPath = getOwnTestPath();

describe('generate', () => {

  beforeEach(() => {
    removeSync(testPath);
  });

  afterEach(() => {
    removeSync(testPath);
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

  it('returns proper markdown string', () => {
    const changelogAPI = setup();

    addTestVersionsWithEntries(changelogAPI);

    expect(
      changelogAPI.generate()
    ).toMatchSnapshot();
  });

});
