// @flow

import { createTestProject } from '../../factories/testProject';
import { readSingleYAMLFileFromGlob, runCLI, CLIButtons } from '../../utils';

describe('$ add', () => {

  jest.setTimeout(20000);

  function setup(customPath?: string) {
    return createTestProject(customPath);
  }

  it('adds a corresponding YAML file to the "next"-version', async () => {
    const testProject = setup();

    await runCLI(
      testProject.rootPath,
      ['add'],
      [
        // Select first offered component
        CLIButtons.ENTER,

        // Select second change kind ("Change")
        CLIButtons.ARROW_DOWN,
        CLIButtons.ENTER,

        // Enter description and confirm
        'the description',
        CLIButtons.ENTER
      ]
    );

    const persistedEntry = readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml');

    expect(persistedEntry.component).toEqual('comp1');
    expect(persistedEntry.kind).toEqual('change');
  });

  describe('when .strangelogrc contains "path"', () => {

    it('adds the YAML file in the correct path to the "next"-version', async () => {
      const testProject = setup('customChangelogPath');

      await runCLI(
        testProject.rootPath,
        ['add'],
        [
          // Select first offered component
          CLIButtons.ENTER,

          // Select second change kind ("Change")
          CLIButtons.ARROW_DOWN,
          CLIButtons.ENTER,

          // Enter description and confirm
          'the description',
          CLIButtons.ENTER
        ]);

      const persistedEntry = readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml');

      expect(persistedEntry.component).toEqual('comp1');
      expect(persistedEntry.kind).toEqual('change');
    });

  });

});