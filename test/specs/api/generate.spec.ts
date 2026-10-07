import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { connectChangelog } from '#src/api/index';
import type { ComponentsConfigType } from '#src/types';
import { addTestVersionsWithEntries, addEntryWithoutComponent } from '#test/factories/changelog';
import { getOwnTestPath } from '#test/factories/fileSystem';
import { removeSync } from '#test/fileSystem';

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

  describe('when "next" has no entries', () => {
    it('does not render a "next" section', () => {
      const changelogAPI = setup();

      addTestVersionsWithEntries(changelogAPI);
      changelogAPI.bumpNextVersion('1.2.0');

      const markdown = changelogAPI.generate();

      expect(markdown).not.toMatch('Version `next`');
      expect(markdown).toMatch(/^# Changelog\n\n## Version `1\.2\.0`/);
    });
  });

  describe('when entries have tickets', () => {
    function addEntryWithTickets({ addEntry }: ReturnType<typeof setup>) {
      addEntry({
        component: 'comp1',
        kind: 'fix',
        description: 'a fix',
        tickets: ['LUCA-1', 'LUCA-2']
      });
    }

    it('appends the ticket IDs to the entry line', () => {
      const changelogAPI = setup();

      addEntryWithTickets(changelogAPI);

      expect(changelogAPI.generate()).toMatch(/^- \*\*Comp 1:\*\* a fix \(LUCA-1, LUCA-2\)$/m);
    });

    it('appends links with ticketUrl', () => {
      const changelogAPI = connectChangelog({
        path: testPath,
        components: { comp1: 'Comp 1' },
        ticketUrl: 'https://tickets.example.com/{ticket}'
      });

      addEntryWithTickets(changelogAPI);

      expect(changelogAPI.generate()).toMatch(
        '- **Comp 1:** a fix ([LUCA-1](https://tickets.example.com/LUCA-1), '
          + '[LUCA-2](https://tickets.example.com/LUCA-2))'
      );
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
