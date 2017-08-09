// @flow

import { removeSync } from 'fs-extra';

import { addTestVersionsWithEntries, addEntryWithoutComponent } from '../../factories/changelog';
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

  function setup(
    components = {
      comp1: 'Comp 1',
      comp2: 'Comp 2'
    }
  ) {
    return connectChangelog({
      path: testPath,
      components
    });
  }

  it('returns proper markdown string', () => {
    const changelogAPI = setup();

    addTestVersionsWithEntries(changelogAPI);

    expect(
      changelogAPI.generate()
    ).toMatchSnapshot();
  });

  describe('when there are no configured components', () => {
    it('renders "All" for the entries with null as component', () => {
      const changelogAPI = setup({});

      addEntryWithoutComponent(changelogAPI);

      expect(
        changelogAPI.generate()
      ).toMatchSnapshot();
    });
  });

});
