import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { STRANGELOG_VERSION } from '#src/version';
import { createTestProject } from '#test/factories/testProject';
import { runCLI } from '#test/utils';

describe('$ --version', { timeout: 20000 }, () => {
  it('prints the strangelog version', async () => {
    const testProject = createTestProject();
    const { version } = JSON.parse(
      readFileSync(`${__dirname}/../../../package.json`).toString()
    ) as { version: string };

    const output = await runCLI(testProject.rootPath, ['--version'], []);

    expect(output.trim()).toBe(version);
  });

  it('prints the strangelog version, not the version of the project it runs in', async () => {
    const testProject = createTestProject();

    // The test project's package.json has version 1.0.0
    const output = await runCLI(testProject.rootPath, ['--version'], []);

    expect(output.trim()).not.toBe('1.0.0');
  });

  it('keeps src/version.ts in sync with package.json', () => {
    const { version } = JSON.parse(
      readFileSync(`${__dirname}/../../../package.json`).toString()
    ) as { version: string };

    expect(STRANGELOG_VERSION).toBe(version);
  });
});
