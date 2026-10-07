// @flow

import { join as joinPath } from 'path';

import { removeSync } from 'fs-extra';

import { connectChangelog } from '../../../src/api';
import type { EntryKindType } from '../../../src/types';
import { createTestProject } from '../../factories/testProject';

describe('getAutomaticNextVersion', () => {

  const realCWD = process.cwd();

  afterEach(() => {
    process.chdir(realCWD);
  });

  // package.json of the test project has version 1.0.0
  function setup(entryKinds: EntryKindType[]) {
    const testProject = createTestProject();
    const changelog = connectChangelog({
      path: testProject.changelogPath,
      components: {}
    });

    entryKinds.forEach((kind) => changelog.addEntry({
      component: null,
      kind,
      description: `some ${kind}`
    }));
    process.chdir(testProject.rootPath);

    return {
      changelog,
      testProject
    };
  }

  it('selects the next major version when there is a change', () => {
    const { changelog } = setup(['fix', 'addition', 'change']);

    expect(changelog.getAutomaticNextVersion()).toBe('2.0.0');
  });

  it('selects the next minor version when there is an addition but no change', () => {
    const { changelog } = setup(['fix', 'addition']);

    expect(changelog.getAutomaticNextVersion()).toBe('1.1.0');
  });

  it('selects the next patch version otherwise', () => {
    const { changelog } = setup(['fix', 'removal']);

    expect(changelog.getAutomaticNextVersion()).toBe('1.0.1');
  });

  it('returns null without package.json', () => {
    const { changelog, testProject } = setup(['fix']);

    removeSync(joinPath(testProject.rootPath, 'package.json'));

    expect(changelog.getAutomaticNextVersion()).toBe(null);
  });

});
