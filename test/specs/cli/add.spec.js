// @flow

import { createTestProject } from '../../factories/testProject';
import type { ComponentsConfigType } from '../../../src/types';
import { readSingleYAMLFileFromGlob, runCLI, CLIButtons } from '../../utils';

describe('$ add', () => {

  jest.setTimeout(20000);

  function setup(customPath?: string, components?: ComponentsConfigType) {
    return createTestProject(customPath, components);
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

  describe('when .strangelogrc disables a component', () => {

    it('does not offer the disabled component', async () => {
      const testProject = setup('changelog', {
        comp1: {
          title: 'Comp 1',
          enabled: false
        },
        comp2: { title: 'Comp 2' }
      });

      await runCLI(
        testProject.rootPath,
        ['add'],
        [
          // Select first offered component
          CLIButtons.ENTER,

          // Select first change kind ("Addition")
          CLIButtons.ENTER,

          // Enter description and confirm
          'the description',
          CLIButtons.ENTER
        ]
      );

      const persistedEntry = readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml');

      expect(persistedEntry.component).toEqual('comp2');
      expect(persistedEntry.kind).toEqual('addition');
    });

  });

});