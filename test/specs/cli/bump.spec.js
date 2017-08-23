// @flow

import { createTestProject } from '../../factories/testProject';
import { joinAndGlob, joinAndOutputYAMLFile, runCLI, CLIButtons } from '../../utils';

describe('$ bump', () => {

  beforeEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000);
  afterEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000);

  function setup() {
    return createTestProject();
  }

  it('moves all entries in "next"-directory to select version directory', async () => {
    const testProject = setup();

    joinAndOutputYAMLFile([testProject.changelogPath, 'next/something.yml'], {});

    await runCLI(
      testProject.rootPath,
      ['bump'],
      // simply take the pre-selected option which is the incremented patch version
      [CLIButtons.ENTER]
    );

    const nextEntries = joinAndGlob(testProject.changelogPath, 'next/*.yml');
    const newVersionEntries = joinAndGlob(testProject.changelogPath, '0.0.1/*.yml');

    expect(nextEntries.length).toBe(0);
    expect(newVersionEntries.length).toBe(1);
  });

});