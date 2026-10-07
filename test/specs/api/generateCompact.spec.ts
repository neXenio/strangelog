import { join as joinPath } from 'path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { connectChangelog } from '#src/api/index';
import type { ConfigType } from '#src/types';
import { addTestVersionsWithEntries, addEntryWithoutComponent } from '#test/factories/changelog';
import { getOwnTestPath } from '#test/factories/fileSystem';
import { outputFileSync, removeSync } from '#test/fileSystem';

const testPath = getOwnTestPath();
const legacyChangelogPath = joinPath(testPath, 'legacy.md');
const ticketUrl = 'https://horizoncloud.atlassian.net/browse/{ticket}';

describe('generate with the compact template', () => {
  beforeEach(() => {
    removeSync(testPath);
  });

  afterEach(() => {
    removeSync(testPath);
    vi.useRealTimers();
  });

  function setup(config: Partial<ConfigType> = {}) {
    return connectChangelog({
      path: testPath,
      components: {
        comp1: 'Comp 1',
        comp2: 'Comp 2'
      },
      template: 'compact',
      ...config
    });
  }

  it('renders one line per entry with component ID, kind label and release date', () => {
    const changelogAPI = setup();

    addTestVersionsWithEntries(changelogAPI);

    expect(changelogAPI.generate()).toBe(
      [
        '# Changelog',
        '',
        '### next',
        '* **comp2** fix: comp2 fix description',
        '',
        '### 1.1.0 (2017-06-25)',
        '* **comp1** change: comp1 change description',
        '',
        '### 1.0.0 (2017-06-24)',
        '* **comp1** feat: comp1 addition description',
        ''
      ].join('\n')
    );
  });

  it('leaves out the date of versions without .release.yml', () => {
    const changelogAPI = setup();

    addEntryWithoutComponent(changelogAPI);
    changelogAPI.bumpNextVersion('1.0.0');
    removeSync(joinPath(testPath, '1.0.0', '.release.yml'));

    expect(changelogAPI.generate()).toMatch(/^### 1\.0\.0$/m);
  });

  it('merges kindLabels over the defaults and uses allComponentLabel', () => {
    const changelogAPI = setup({
      kindLabels: { addition: 'added' },
      allComponentLabel: 'everything'
    });

    addEntryWithoutComponent(changelogAPI);
    changelogAPI.addEntry({ component: 'comp1', kind: 'fix', description: 'a fix' });

    const markdown = changelogAPI.generate();

    expect(markdown).toMatch('* **everything** added: addition to no specific component');
    expect(markdown).toMatch('* **comp1** fix: a fix');
  });

  it('renders entries without component as "all" by default', () => {
    const changelogAPI = setup();

    addEntryWithoutComponent(changelogAPI);

    expect(changelogAPI.generate()).toMatch('* **all** feat: addition to no specific component');
  });

  it('renders tickets as links with ticketUrl and as plain IDs without', () => {
    const entry = {
      component: 'comp1',
      kind: 'fix' as const,
      description: 'a fix',
      tickets: ['LUCA-1', 'LUCA-2']
    };

    const withoutUrl = setup();

    withoutUrl.addEntry(entry);

    expect(withoutUrl.generate()).toMatch('* **comp1** fix: a fix (LUCA-1, LUCA-2)\n');

    removeSync(testPath);

    const withUrl = setup({ ticketUrl });

    withUrl.addEntry(entry);

    expect(withUrl.generate()).toMatch(
      '* **comp1** fix: a fix ([LUCA-1](https://horizoncloud.atlassian.net/browse/LUCA-1), '
        + '[LUCA-2](https://horizoncloud.atlassian.net/browse/LUCA-2))\n'
    );
  });

  describe('with legacyChangelog', () => {
    it('reproduces a hand-written CHANGELOG.md exactly', () => {
      vi.useFakeTimers({ now: new Date('2026-10-07T08:00:00.000Z'), toFake: ['Date'] });

      const changelogAPI = setup({
        components: {
          'backend-pay': 'Backend Pay',
          'web-at-consumer-app': 'Consumer App'
        },
        ticketUrl,
        legacyChangelog: legacyChangelogPath
      });

      outputFileSync(
        legacyChangelogPath,
        [
          '# Changelog',
          '',
          '### 5.75.9 (2026-10-06)',
          '* **backend-pay** fix: Refunds of split payments are booked once',
          '',
          '### 5.75.8',
          '* **all** change: Old entries keep their format',
          ''
        ].join('\n')
      );

      changelogAPI.addEntry({
        component: 'backend-pay',
        kind: 'fix',
        description: 'The unused contact columns are removed',
        tickets: ['LUCA-36548', 'LUCA-36549']
      });
      vi.setSystemTime(new Date('2026-10-07T08:00:01.000Z'));
      changelogAPI.addEntry({
        component: 'backend-pay',
        kind: 'fix',
        description: 'Cashout failure records include trace details'
      });
      changelogAPI.bumpNextVersion('5.75.10', { date: '2026-10-07' });

      vi.setSystemTime(new Date('2026-10-07T09:00:00.000Z'));
      changelogAPI.addEntry({
        component: 'web-at-consumer-app',
        kind: 'fix',
        description: 'Members whose plan has no bookings are told so',
        tickets: ['LUCA-36509']
      });
      vi.setSystemTime(new Date('2026-10-07T09:00:01.000Z'));
      changelogAPI.addEntry({
        component: 'web-at-consumer-app',
        kind: 'addition',
        description: 'Members see how much of their plan is left',
        tickets: ['LUCA-36509']
      });
      changelogAPI.bumpNextVersion('5.75.11', { date: '2026-10-07' });

      expect(changelogAPI.generate()).toBe(`# Changelog

### 5.75.11 (2026-10-07)
* **web-at-consumer-app** feat: Members see how much of their plan is left ([LUCA-36509](https://horizoncloud.atlassian.net/browse/LUCA-36509))
* **web-at-consumer-app** fix: Members whose plan has no bookings are told so ([LUCA-36509](https://horizoncloud.atlassian.net/browse/LUCA-36509))

### 5.75.10 (2026-10-07)
* **backend-pay** fix: The unused contact columns are removed ([LUCA-36548](https://horizoncloud.atlassian.net/browse/LUCA-36548), [LUCA-36549](https://horizoncloud.atlassian.net/browse/LUCA-36549))
* **backend-pay** fix: Cashout failure records include trace details

### 5.75.9 (2026-10-06)
* **backend-pay** fix: Refunds of split payments are booked once

### 5.75.8
* **all** change: Old entries keep their format
`);
    });

    it('outputs only the header and the legacy changelog without versions', () => {
      const changelogAPI = setup({ legacyChangelog: legacyChangelogPath });

      outputFileSync(legacyChangelogPath, '### 0.1.0\n* **all** feat: First release\n');

      expect(changelogAPI.generate()).toBe(
        '# Changelog\n\n### 0.1.0\n* **all** feat: First release\n'
      );
    });

    it('appends a legacy changelog without header verbatim, also to the default template', () => {
      const changelogAPI = setup({ template: 'default', legacyChangelog: legacyChangelogPath });

      outputFileSync(legacyChangelogPath, '## Version `0.1.0`\n\n- old entry\n');
      addEntryWithoutComponent(changelogAPI);

      expect(changelogAPI.generate()).toBe(
        '# Changelog\n\n## Version `next`\n\n### Added\n- addition to no specific component'
          + '\n\n## Version `0.1.0`\n\n- old entry\n'
      );
    });
  });

  describe('with the version option', () => {
    it('renders only the section of that version, without header and legacy changelog', () => {
      const changelogAPI = setup({ legacyChangelog: legacyChangelogPath });

      outputFileSync(legacyChangelogPath, '### 0.1.0\n');
      addTestVersionsWithEntries(changelogAPI);

      expect(changelogAPI.generate({ version: '1.1.0' })).toBe(
        '### 1.1.0 (2017-06-25)\n* **comp1** change: comp1 change description\n'
      );
      expect(changelogAPI.generate({ version: 'next' })).toBe(
        '### next\n* **comp2** fix: comp2 fix description\n'
      );
    });

    it('renders the section in the default template', () => {
      const changelogAPI = setup({ template: 'default' });

      addTestVersionsWithEntries(changelogAPI);

      expect(changelogAPI.generate({ version: '1.0.0' })).toBe(
        '## Version `1.0.0`\n\n### Added\n- **Comp 1:** comp1 addition description'
      );
    });

    it('throws for an unknown version', () => {
      const changelogAPI = setup();

      expect(() => changelogAPI.generate({ version: '9.9.9' })).toThrow('Unknown version "9.9.9"');
    });
  });

  it('throws for an unknown template', () => {
    const changelogAPI = setup({ template: 'fancy' as ConfigType['template'] });

    expect(() => changelogAPI.generate()).toThrow('Unknown template "fancy"');
  });
  it('normalizes CRLF line endings of the legacy changelog', () => {
    outputFileSync(
      legacyChangelogPath,
      '# Changelog\r\n\r\n### 0.9.0 (2017-01-01)\r\n* **comp1** fix: old\r\n'
    );

    const changelogAPI = setup({ legacyChangelog: legacyChangelogPath });

    expect(changelogAPI.generate()).toBe(
      '# Changelog\n\n### 0.9.0 (2017-01-01)\n* **comp1** fix: old\n'
    );
  });

  it('throws a clear error for a missing legacy changelog', () => {
    const changelogAPI = setup({ legacyChangelog: joinPath(testPath, 'missing.md') });

    expect(() => changelogAPI.generate()).toThrow('legacyChangelog in .strangelogrc) not found');
  });

  it('inserts tickets into ticketUrl literally', () => {
    const changelogAPI = setup({ ticketUrl: 'https://example.com/{ticket}?q={ticket}&x=$&' });

    changelogAPI.addEntry({
      component: 'comp1',
      kind: 'fix',
      description: 'with a ticket',
      tickets: ['LUCA-1']
    });

    expect(changelogAPI.generate()).toMatch('([LUCA-1](https://example.com/LUCA-1?q=LUCA-1&x=$&))');
  });

  it('renders custom kinds with their name or kindLabels, after the built-in kinds', () => {
    const changelogAPI = setup({
      kinds: ['addition', 'fix', 'chore', 'perf'],
      kindLabels: { perf: 'performance' }
    });

    changelogAPI.addEntry({ component: 'comp1', kind: 'chore', description: 'chore entry' });
    changelogAPI.addEntry({ component: 'comp1', kind: 'perf', description: 'perf entry' });
    changelogAPI.addEntry({ component: 'comp2', kind: 'fix', description: 'fix entry' });

    expect(changelogAPI.generate()).toBe(
      [
        '# Changelog',
        '',
        '### next',
        '* **comp2** fix: fix entry',
        '* **comp1** chore: chore entry',
        '* **comp1** performance: perf entry',
        ''
      ].join('\n')
    );
  });
});
