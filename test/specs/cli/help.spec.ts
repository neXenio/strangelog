import { createTestProject } from '../../factories/testProject';
import { runCLI } from '../../utils';

describe('$ (no command)', () => {

  jest.setTimeout(20000);

  it('prints the same usage help as --help', async () => {
    const testProject = createTestProject();

    const output = await runCLI(testProject.rootPath, [], []);
    const helpOutput = await runCLI(testProject.rootPath, ['--help'], []);

    expect(output).toMatch('Commands:');
    expect(output).toBe(helpOutput);
  });

});
