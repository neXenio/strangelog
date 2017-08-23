// @flow

import { createTestProject } from '../../factories/testProject';
import { joinAndGlob, runCLI } from '../../utils';

describe('$ generate', () => {

  beforeEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000);
  afterEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000);

  function setup() {
    return createTestProject();
  }

  it('creates a file matching --outFile param', async () => {
    const testProject = setup();

    await runCLI(
      testProject.rootPath,
      ['generate', '--outFile', 'CHANGELOG.md'],
      []
    );

    const changelogFileMatch = joinAndGlob(testProject.rootPath, 'CHANGELOG.md');

    expect(changelogFileMatch.length).toBe(1);
  });

});