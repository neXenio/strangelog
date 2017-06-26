// @flow

import { removeSync } from 'fs-extra';
import { install as installClock } from 'lolex';

import { connectChangelog } from '../../../src/api';
import { addTestVersionsWithEntries } from '../../factories/changelog';
import { getOwnTestPath } from '../../factories/fileSystem';

const testPath = getOwnTestPath();

describe('getChangelogData', () => {

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

  it('returns correct changelog data', () => {
    const changelogAPI = setup();

    addTestVersionsWithEntries(changelogAPI);

    expect(changelogAPI.getChangelogData()).toMatchSnapshot();
  });

});
