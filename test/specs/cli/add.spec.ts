import { describe, expect, it } from 'vitest';

import type { ComponentsConfigType } from '#src/types';
import { createTestProject } from '#test/factories/testProject';
import { joinAndOutputYAMLFile, readSingleYAMLFileFromGlob, runCLI, CLIButtons } from '#test/utils';

describe('$ add', { timeout: 20000 }, () => {
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
        CLIButtons.ENTER,

        // Skip the optional tickets
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
          CLIButtons.ENTER,

          // Skip the optional tickets
          CLIButtons.ENTER
        ]
      );

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
          CLIButtons.ENTER,

          // Skip the optional tickets
          CLIButtons.ENTER
        ]
      );

      const persistedEntry = readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml');

      expect(persistedEntry.component).toEqual('comp2');
      expect(persistedEntry.kind).toEqual('addition');
    });
  });

  it('asks for the description matching the selected kind', async () => {
    const testProject = setup();

    const output = await runCLI(
      testProject.rootPath,
      ['add'],
      [
        // Select first offered component
        CLIButtons.ENTER,

        // Select third change kind ("Bug Fix")
        CLIButtons.ARROW_DOWN,
        CLIButtons.ARROW_DOWN,
        CLIButtons.ENTER,

        // Enter description and confirm
        'the description',
        CLIButtons.ENTER,

        // Skip the optional tickets
        CLIButtons.ENTER
      ]
    );

    expect(output).toMatch('What is fixed?');
    expect(readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml').kind).toEqual('fix');
  });

  it('offers the removal, deprecation and security kinds', async () => {
    const testProject = setup();

    const output = await runCLI(
      testProject.rootPath,
      ['add'],
      [
        // Select first offered component
        CLIButtons.ENTER,

        // Select sixth change kind ("Security")
        CLIButtons.ARROW_DOWN,
        CLIButtons.ARROW_DOWN,
        CLIButtons.ARROW_DOWN,
        CLIButtons.ARROW_DOWN,
        CLIButtons.ARROW_DOWN,
        CLIButtons.ENTER,

        // Enter description and confirm
        'the description',
        CLIButtons.ENTER,

        // Skip the optional tickets
        CLIButtons.ENTER
      ]
    );

    expect(output).toMatch('Removal');
    expect(output).toMatch('Deprecation');
    expect(readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml').kind).toEqual(
      'security'
    );
  });

  it('asks for optional tickets and stores them', async () => {
    const testProject = setup();

    const output = await runCLI(
      testProject.rootPath,
      ['add'],
      [
        // Select first offered component
        CLIButtons.ENTER,

        // Select first change kind ("Addition")
        CLIButtons.ENTER,

        // Enter description and confirm
        'the description',
        CLIButtons.ENTER,

        // Enter tickets and confirm
        'LUCA-1, LUCA-2',
        CLIButtons.ENTER
      ]
    );

    expect(output).toMatch('Tickets (comma separated, optional)');
    expect(readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml').tickets).toEqual([
      'LUCA-1',
      'LUCA-2'
    ]);
  });

  describe('when .strangelogrc restricts the kinds', () => {
    it('offers only the allowed kinds', async () => {
      const testProject = setup();

      joinAndOutputYAMLFile([testProject.configFilePath], {
        path: 'changelog',
        components: { comp1: 'Comp 1' },
        kinds: ['addition', 'fix']
      });

      const output = await runCLI(
        testProject.rootPath,
        ['add'],
        [
          // Select the only component
          CLIButtons.ENTER,

          // Select second offered kind ("Bug Fix")
          CLIButtons.ARROW_DOWN,
          CLIButtons.ENTER,

          // Enter description and confirm
          'the description',
          CLIButtons.ENTER,

          // Skip the optional tickets
          CLIButtons.ENTER
        ]
      );

      expect(output).not.toMatch('Change (e.g. change of existing behavior)');
      expect(readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml').kind).toEqual(
        'fix'
      );
    });
  });
});
