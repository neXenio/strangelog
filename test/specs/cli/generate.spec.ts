import { describe, expect, it } from 'vitest';

import { createTestProject } from '../../factories/testProject';
import { joinAndGlob, runCLI } from '../../utils';

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
});
