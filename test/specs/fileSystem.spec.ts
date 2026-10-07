import { existsSync, readFileSync } from 'node:fs';
import { join as joinPath } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { moveSync, outputFileSync } from '#src/fileSystem';
import { getOwnTestPath } from '#test/factories/fileSystem';
import { removeSync } from '#test/fileSystem';

const testPath = getOwnTestPath();

describe('fileSystem', () => {
  afterEach(() => {
    removeSync(testPath);
  });

  it('outputFileSync creates missing parent directories', () => {
    const filePath = joinPath(testPath, 'a', 'b', 'file.yml');

    outputFileSync(filePath, 'content');

    expect(readFileSync(filePath).toString()).toBe('content');
  });

  it('moveSync creates missing parent directories of the destination', () => {
    const sourcePath = joinPath(testPath, 'source.yml');
    const destinationPath = joinPath(testPath, 'new', 'destination.yml');

    outputFileSync(sourcePath, 'content');
    moveSync(sourcePath, destinationPath);

    expect(existsSync(sourcePath)).toBe(false);
    expect(readFileSync(destinationPath).toString()).toBe('content');
  });

  it('moveSync never overwrites an existing destination', () => {
    const sourcePath = joinPath(testPath, 'source.yml');
    const destinationPath = joinPath(testPath, 'destination.yml');

    outputFileSync(sourcePath, 'new');
    outputFileSync(destinationPath, 'existing');

    expect(() => moveSync(sourcePath, destinationPath)).toThrow('destination already exists');
    expect(readFileSync(destinationPath).toString()).toBe('existing');
    expect(existsSync(sourcePath)).toBe(true);
  });

  it('moveSync does nothing when source and destination are the same', () => {
    const filePath = joinPath(testPath, 'file.yml');

    outputFileSync(filePath, 'content');
    moveSync(filePath, filePath);

    expect(readFileSync(filePath).toString()).toBe('content');
  });
});
