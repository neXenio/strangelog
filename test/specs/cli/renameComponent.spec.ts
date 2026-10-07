import { describe, expect, it } from 'vitest';

import { createTestProject } from '../../factories/testProject';
import { joinAndOutputYAMLFile, readSingleYAMLFileFromGlob, runCLI } from '../../utils';

describe('$ rename-component', { timeout: 20000 }, () => {
  it('moves the entries of <from> to <to>', async () => {
    const testProject = createTestProject();

    joinAndOutputYAMLFile([testProject.changelogPath, 'next/entry_fix_comp1.yml'], {
      component: 'comp1',
      kind: 'fix',
      description: 'the description'
    });

    const output = await runCLI(testProject.rootPath, ['rename-component', 'comp1', 'comp2'], []);

    expect(output).toMatch('Moved 1 entries from component "comp1" to "comp2"');
    expect(
      readSingleYAMLFileFromGlob(testProject.changelogPath, 'next/entry_fix_comp2.yml')
    ).toEqual({
      component: 'comp2',
      kind: 'fix',
      description: 'the description'
    });
  });
});
