import { join as joinPath } from 'path';

import { afterEach, describe, expect, it } from 'vitest';

import getSortedChangelogVersions from '../../../src/api/getSortedChangelogVersions.ts';
import { getOwnTestPath } from '../../factories/fileSystem.ts';
import { mkdirsSync, removeSync } from '../../fileSystem.ts';

const testPath = getOwnTestPath();

describe('getSortedChangelogVersions', () => {
  afterEach(() => {
    removeSync(testPath);
  });

  function setup(versions: string[]) {
    versions.forEach((version) => mkdirsSync(joinPath(testPath, version)));

    return getSortedChangelogVersions({
      path: testPath,
      components: {}
    });
  }

  it('sorts SemVer versions numerically, newest first, without "next"', () => {
    expect(setup(['1.9.0', 'next', '1.10.0', '2.0.0', '1.0.0-beta.1', '1.0.0'])).toEqual([
      '2.0.0',
      '1.10.0',
      '1.9.0',
      '1.0.0',
      '1.0.0-beta.1'
    ]);
  });

  it('sorts non-SemVer versions numeric-aware, newest first', () => {
    expect(setup(['1.2.3.4', '1.2.3.10', '1.3.0.0'])).toEqual(['1.3.0.0', '1.2.3.10', '1.2.3.4']);
  });

  it('lists SemVer versions before other versions', () => {
    expect(setup(['1.0.0-', '1.0.0', '1.2.3.4', '1.0.0-beta'])).toEqual([
      '1.0.0',
      '1.0.0-beta',
      '1.2.3.4',
      '1.0.0-'
    ]);
  });
});
