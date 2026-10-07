import { readFileSync } from 'fs-extra';

import { createTestProject } from '../../factories/testProject';
import { runCLI } from '../../utils';

describe('$ --version', () => {

  jest.setTimeout(20000);

  it('prints the strangelog version', async () => {
    const testProject = createTestProject();
    const { version } = JSON.parse(readFileSync(`${__dirname}/../../../package.json`).toString());

    const output = await runCLI(testProject.rootPath, ['--version'], []);

    expect(output.trim()).toBe(version);
  });

});
