import { readFileSync } from 'fs-extra';
import { describe, expect, it } from 'vitest';

import { createTestProject } from '../../factories/testProject';
import { runCLI } from '../../utils';

describe('$ --version', { timeout: 20000 }, () => {

  it('prints the strangelog version', async () => {
    const testProject = createTestProject();
    const { version } = JSON.parse(
      readFileSync(`${__dirname}/../../../package.json`).toString()
    ) as { version: string };

    const output = await runCLI(testProject.rootPath, ['--version'], []);

    expect(output.trim()).toBe(version);
  });

});
