// @flow

import { removeSync } from 'fs-extra';
import { install as installClock } from 'lolex';

import { connectChangelog } from '../../../src/api';
import { getOwnTestPath } from '../../factories/fileSystem';

const testPath = getOwnTestPath();

describe('addEntry', () => {

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

  describe('when called with unknown component', () => {

    it('creates an new file with the correct file name', () => {
      const { addEntry } = setup();

      expect(() => {
        addEntry({
          component: 'unknown',
          kind: 'fix',
          description: ''
        });
      }).toThrow('Unknown component "unknown"');
    });

  });

});