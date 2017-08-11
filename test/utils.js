// @flow

import { sync as globSync } from 'glob';
import { readFileSync } from 'fs-extra';
import jsYAML from 'js-yaml';

function readYAMLFileSync(filePath: string) {
  return jsYAML.safeLoad(readFileSync(filePath).toString());
}

export function readSingleYAMLFileFromGlob(fileGlob: string) {
  const matchedFiles = globSync(fileGlob);

  expect(matchedFiles.length).toBe(1);

  return readYAMLFileSync(matchedFiles[0]);
}