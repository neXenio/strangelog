// @flow

import { createTestProject } from '../../factories/testProject';
import { readSingleYAMLFileFromGlob, runCLI, CLIButtons } from '../../utils';

describe('$ add', () => {

  beforeEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000);
  afterEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000);

  function setup() {
    return createTestProject();
  }

  it('adds a corresponding YAML file to the "next"-version', async () => {
    const testProject = setup();

    await runCLI(
      testProject.rootPath,
      ['add'],
      [
        CLIButtons.ENTER,
        CLIButtons.ARROW_DOWN,
        CLIButtons.ENTER,
        'the description',
        CLIButtons.ENTER
      ]);

    const persistedEntry = readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml');

    expect(persistedEntry.component).toEqual('comp1');
    expect(persistedEntry.kind).toEqual('change');
  });

});