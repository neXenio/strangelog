import { describe, expect, it } from 'vitest';

import { createTestProject } from '../../factories/testProject';
import { joinAndGlob, joinAndOutputYAMLFile, runCLI, CLIButtons } from '../../utils';

describe('$ bump', { timeout: 20000 }, () => {

  function setup() {
    return createTestProject();
  }

  it('moves all entries in "next"-directory to selected version directory', async () => {
    const testProject = setup();

    joinAndOutputYAMLFile([testProject.changelogPath, 'next/something.yml'], {});

    await runCLI(
      testProject.rootPath,
      ['bump'],
      // simply take the pre-selected option which is the incremented patch version
      [CLIButtons.ENTER]
    );

    const nextEntries = joinAndGlob(testProject.changelogPath, 'next/*.yml');
    const newVersionEntries = joinAndGlob(testProject.changelogPath, '1.0.1/*.yml');

    expect(nextEntries.length).toBe(0);
    expect(newVersionEntries.length).toBe(1);
  });

  it('creates version directory based on passed CLI parameter', async () => {
    const testProject = setup();

    joinAndOutputYAMLFile([testProject.changelogPath, 'next/something.yml'], {});

    await runCLI(
      testProject.rootPath,
      ['bump', '-v', '1.2.3.4'],
      []
    );

    const nextEntries = joinAndGlob(testProject.changelogPath, 'next/*.yml');
    const newVersionEntries = joinAndGlob(testProject.changelogPath, '1.2.3.4/*.yml');

    expect(nextEntries.length).toBe(0);
    expect(newVersionEntries.length).toBe(1);
  });

  it('derives the version from the entries with --auto', async () => {
    const testProject = setup();

    joinAndOutputYAMLFile([testProject.changelogPath, 'next/something.yml'], {
      component: null,
      kind: 'addition',
      description: 'something new'
    });

    const output = await runCLI(testProject.rootPath, ['bump', '--auto'], []);

    expect(output).toMatch('Automatically selected version 1.1.0');
    expect(joinAndGlob(testProject.changelogPath, 'next/*.yml').length).toBe(0);
    expect(joinAndGlob(testProject.changelogPath, '1.1.0/*.yml').length).toBe(1);
  });

});