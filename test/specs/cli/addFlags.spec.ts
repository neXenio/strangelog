import { createTestProject } from '../../factories/testProject';
import { joinAndGlob, readSingleYAMLFileFromGlob, runCLIWithResult } from '../../utils';

describe('$ add --kind --component --description', () => {

  jest.setTimeout(20000);

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
    expect(readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml').kind)
      .toEqual('security');
  });

  it('does not require --component when no components are defined', async () => {
    const testProject = createTestProject('changelog', {});

    const { exitCode } = await runCLIWithResult(
      testProject.rootPath,
      ['add', '--kind', 'addition', '--description', 'the description'],
      []
    );

    expect(exitCode).toBe(0);
    expect(readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml').component)
      .toBe(null);
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
    expect(readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/*.yml').description)
      .toEqual('the description');
  });

});
