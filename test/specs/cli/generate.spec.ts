import { describe, expect, it } from 'vitest';

import { createTestProject } from '#test/factories/testProject';
import { joinAndGlob, joinAndOutputYAMLFile, runCLI, runCLIWithResult } from '#test/utils';

describe('$ generate', { timeout: 20000 }, () => {
  function setup() {
    return createTestProject();
  }

  it('creates a file matching --outFile param', async () => {
    const testProject = setup();

    await runCLI(testProject.rootPath, ['generate', '--outFile', 'CHANGELOG.md'], []);

    const changelogFileMatch = joinAndGlob(testProject.rootPath, 'CHANGELOG.md');

    expect(changelogFileMatch.length).toBe(1);
  });

  it('prints only the section of --version to stdout with --outFile -', async () => {
    const testProject = setup();

    joinAndOutputYAMLFile([testProject.configFilePath], {
      path: 'changelog',
      components: { comp1: 'Comp 1' },
      template: 'compact'
    });
    joinAndOutputYAMLFile(
      [testProject.changelogPath, '1.0.0/2026-10-07T08-00-00.000Z_fix_comp1.yml'],
      {
        component: 'comp1',
        kind: 'fix',
        description: 'the description',
        tickets: ['LUCA-1']
      }
    );
    joinAndOutputYAMLFile([testProject.changelogPath, '1.0.0/.release.yml'], {
      date: '2026-10-07'
    });

    const { stdout, exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['generate', '--version', '1.0.0', '--outFile', '-'],
      []
    );

    expect(exitCode).toBe(0);
    expect(stdout).toBe('### 1.0.0 (2026-10-07)\n* **comp1** fix: the description (LUCA-1)\n');
    expect(joinAndGlob(testProject.rootPath, '-')).toEqual([]);
  });
  it('exits with code 2 and a one-line message for an unknown --version', async () => {
    const testProject = createTestProject();

    const { stderr, exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['generate', '--version', '9.9.9', '--outFile', '-'],
      []
    );

    expect(exitCode).toBe(2);
    expect(stderr.trim()).toBe('Unknown version "9.9.9"');
  });
});
