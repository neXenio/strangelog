import { describe, expect, it } from 'vitest';

import { createTestProject } from '#test/factories/testProject';
import {
  joinAndGlob,
  joinAndOutputYAMLFile,
  readSingleYAMLFileFromGlob,
  runCLIWithResult
} from '#test/utils';

describe('$ add --kind --component --description', { timeout: 20000 }, () => {
  it('adds the entry without prompting', async () => {
    const testProject = createTestProject();

    const { stdout, exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['add', '--kind', 'fix', '--component', 'comp2', '--description', 'the description'],
      []
    );

    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/Added changelog entry .*next\/.*_fix_comp2\.yml/);

    const persistedEntry = readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml');

    expect(persistedEntry.component).toEqual('comp2');
    expect(persistedEntry.kind).toEqual('fix');
    expect(persistedEntry.description).toEqual('the description');
  });

  it('accepts the short aliases', async () => {
    const testProject = createTestProject();

    const { exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['add', '-k', 'security', '-c', 'comp1', '-d', 'the description'],
      []
    );

    expect(exitCode).toBe(0);
    expect(readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml').kind).toEqual(
      'security'
    );
  });

  it('does not require --component when no components are defined', async () => {
    const testProject = createTestProject('changelog', {});

    const { exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['add', '--kind', 'addition', '--description', 'the description'],
      []
    );

    expect(exitCode).toBe(0);
    expect(readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml').component).toBe(
      null
    );
  });

  it('exits with code 2 and lists the valid values for invalid flags', async () => {
    const testProject = createTestProject('changelog', {
      comp1: 'Comp 1',
      comp2: {
        title: 'Comp 2',
        enabled: false
      }
    });

    const { stderr, exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['add', '--kind', 'feature', '--component', 'comp2', '--description', 'short'],
      []
    );

    expect(exitCode).toBe(2);
    expect(stderr).toMatch('--kind "feature" is not a valid kind');
    expect(stderr).toMatch('--component "comp2" is disabled in .strangelogrc');
    expect(stderr).toMatch('--description must have at least 10 characters');
    expect(stderr).toMatch('Valid kinds: addition, change, fix, removal, deprecation, security');
    expect(stderr).toMatch('Valid components: comp1');
    expect(joinAndGlob(testProject.changelogPath, 'next/*.yml')).toEqual([]);
  });

  it('exits with code 2 when a required flag is missing', async () => {
    const testProject = createTestProject();

    const { stderr, exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['add', '--description', 'the description'],
      []
    );

    expect(exitCode).toBe(2);
    expect(stderr).toMatch('--kind is missing');
    expect(stderr).toMatch('--component is missing');
  });

  it('exits with code 2 when a flag is given more than once', async () => {
    const testProject = createTestProject();

    const { stderr, exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['add', '-k', 'fix', '-c', 'comp1', '-d', 'the description', '-d', 'another description'],
      []
    );

    expect(exitCode).toBe(2);
    expect(stderr).toMatch('--description is given more than once');
    expect(joinAndGlob(testProject.changelogPath, 'next/*.yml')).toEqual([]);
  });

  it('exits with code 2 for --component when no components are defined', async () => {
    const testProject = createTestProject('changelog', {});

    const { stderr, exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['add', '-k', 'fix', '-c', 'comp1', '-d', 'the description'],
      []
    );

    expect(exitCode).toBe(2);
    expect(stderr).toMatch('--component "comp1" is not defined in .strangelogrc');
    expect(stderr).toMatch('No components are defined in .strangelogrc: leave out --component');
  });

  it('rejects whitespace-only descriptions and stores descriptions trimmed', async () => {
    const testProject = createTestProject();

    const invalidResult = await runCLIWithResult(
      testProject.rootPath,
      ['add', '-k', 'fix', '-c', 'comp1', '-d', '            '],
      []
    );

    expect(invalidResult.exitCode).toBe(2);

    const { exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['add', '-k', 'fix', '-c', 'comp1', '-d', '  the description  '],
      []
    );

    expect(exitCode).toBe(0);
    expect(readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml').description).toEqual(
      'the description'
    );
  });

  describe('--ticket', () => {
    it('is repeatable and accepts comma separated values', async () => {
      const testProject = createTestProject();

      const { exitCode } = await runCLIWithResult(
        testProject.rootPath,
        ['add', '-k', 'fix', '-c', 'comp1', '-d', 'the description'].concat([
          '--ticket',
          'LUCA-1',
          '-t',
          'LUCA-2, LUCA-3'
        ]),
        []
      );

      expect(exitCode).toBe(0);
      expect(readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml').tickets).toEqual([
        'LUCA-1',
        'LUCA-2',
        'LUCA-3'
      ]);
    });

    it('writes no tickets without --ticket', async () => {
      const testProject = createTestProject();

      await runCLIWithResult(
        testProject.rootPath,
        ['add', '-k', 'fix', '-c', 'comp1', '-d', 'the description'],
        []
      );

      expect(
        readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml')
      ).not.toHaveProperty('tickets');
    });

    it('exits with code 2 for tickets not matching ticketPattern', async () => {
      const testProject = createTestProject();

      joinAndOutputYAMLFile([testProject.configFilePath], {
        path: 'changelog',
        components: { comp1: 'Comp 1' },
        ticketPattern: '^LUCA-\\d+$'
      });

      const { stderr, exitCode } = await runCLIWithResult(
        testProject.rootPath,
        ['add', '-k', 'fix', '-c', 'comp1', '-d', 'the description', '-t', 'LUCA-1,JIRA-2'],
        []
      );

      expect(exitCode).toBe(2);
      expect(stderr).toMatch('--ticket "JIRA-2" does not match ^LUCA-\\d+$');
      expect(stderr).not.toMatch('"LUCA-1"');
      expect(joinAndGlob(testProject.changelogPath, 'next/*.yml')).toEqual([]);
    });
  });

  it('anchors ticketPattern and reports an invalid ticketPattern', async () => {
    const testProject = createTestProject();

    joinAndOutputYAMLFile([testProject.configFilePath], {
      path: 'changelog',
      components: { comp1: 'Comp 1' },
      ticketPattern: 'LUCA-\\d+'
    });

    const unanchored = await runCLIWithResult(
      testProject.rootPath,
      ['add', '-k', 'fix', '-c', 'comp1', '-d', 'the description', '-t', 'XLUCA-1x'],
      []
    );

    expect(unanchored.exitCode).toBe(2);
    expect(unanchored.stderr).toMatch('--ticket "XLUCA-1x" does not match');

    joinAndOutputYAMLFile([testProject.configFilePath], {
      path: 'changelog',
      components: { comp1: 'Comp 1' },
      ticketPattern: 'LUCA-('
    });

    const invalid = await runCLIWithResult(
      testProject.rootPath,
      ['add', '-k', 'fix', '-c', 'comp1', '-d', 'the description', '-t', 'LUCA-1'],
      []
    );

    expect(invalid.exitCode).toBe(2);
    expect(invalid.stderr).toMatch('Invalid ticketPattern in .strangelogrc: LUCA-(');
    expect(joinAndGlob(testProject.changelogPath, 'next/*.yml')).toEqual([]);
  });

  it('exits with code 2 for a kind that .strangelogrc does not allow', async () => {
    const testProject = createTestProject();

    joinAndOutputYAMLFile([testProject.configFilePath], {
      path: 'changelog',
      components: { comp1: 'Comp 1' },
      kinds: ['addition', 'fix']
    });

    const { stderr, exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['add', '-k', 'change', '-c', 'comp1', '-d', 'the description'],
      []
    );

    expect(exitCode).toBe(2);
    expect(stderr).toMatch('--kind "change" is not a valid kind');
    expect(stderr).toMatch('Valid kinds: addition, fix\n');
  });

  it('accepts a custom kind listed in kinds', async () => {
    const testProject = createTestProject();

    joinAndOutputYAMLFile([testProject.configFilePath], {
      path: 'changelog',
      components: { comp1: 'Comp 1' },
      kinds: ['addition', 'fix', 'chore']
    });

    const { exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['add', '-k', 'chore', '-c', 'comp1', '-d', 'Removed six unused texts'],
      []
    );

    expect(exitCode).toBe(0);
    expect(readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml').kind).toBe('chore');

    const rejected = await runCLIWithResult(
      testProject.rootPath,
      ['add', '-k', 'perf', '-c', 'comp1', '-d', 'the description'],
      []
    );

    expect(rejected.exitCode).toBe(2);
    expect(rejected.stderr).toMatch('Valid kinds: addition, fix, chore\n');
  });
});
