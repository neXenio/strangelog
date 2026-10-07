import { removeSync } from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { connectChangelog } from '../../../src/api';
import type { ComponentsConfigType } from '../../../src/types';
import { addTestVersionsWithEntries, addEntryWithoutComponent } from '../../factories/changelog';
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
    components: ComponentsConfigType = {
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

    expect(changelogAPI.generate()).toMatchSnapshot();
  });

  describe('when components are configured as objects', () => {
    it('renders their titles, including disabled components', () => {
      const changelogAPI = setup({
        comp1: { title: 'Comp 1' },
        comp2: {
          title: 'Comp 2',
          enabled: false
        }
      });

      addTestVersionsWithEntries(changelogAPI);

      const markdown = changelogAPI.generate();

      expect(markdown).toMatch('- **Comp 1:** comp1 addition description');
      expect(markdown).toMatch('- **Comp 2:** comp2 fix description');
    });
  });

  describe('when there are no configured components', () => {
    it('renders "All" for the entries with null as component', () => {
      const changelogAPI = setup({});

      addEntryWithoutComponent(changelogAPI);

      expect(changelogAPI.generate()).toMatchSnapshot();
    });
  });
});
