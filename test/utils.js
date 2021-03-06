// @flow

import { join as joinPath } from 'path';
import { spawn } from 'child_process';

import concatStream from 'concat-stream';
import { sync as globSync } from 'glob';
import { readFileSync, outputFileSync } from 'fs-extra';
import jsYAML from 'js-yaml';

function readYAMLFileSync(filePath: string) {
  return jsYAML.safeLoad(readFileSync(filePath).toString());
}

export function readSingleYAMLFileFromGlob(...fileGlobPathParts: string[]) {
  const matchedFiles = joinAndGlob(...fileGlobPathParts);

  expect(matchedFiles.length).toBe(1);

  return readYAMLFileSync(matchedFiles[0]);
}

export function joinAndGlob(...fileGlobPathParts: string[]) {
  return globSync(joinPath(...fileGlobPathParts));
}

export function joinAndOutputYAMLFile(pathParts: string[], json: Object) {
  return outputFileSync(joinPath(...pathParts), jsYAML.safeDump(json));
}

export const CLIButtons = {
  ARROW_DOWN: '\x1B\x5B\x42',
  ARROW_UP: '\x1B\x5B\x41',
  ENTER: '\x0D'
};

export async function runCLI(
  cwd: string,
  command: string[],
  inputs: string[]
): Promise<string> {
  const childProcess = spawn(
    '../../node_modules/.bin/babel-node',
    ['../../src/cli/index.js', ...command],
    {
      stdio: [null, null, null],
      cwd
    }
  );

  // setEncoding exists, works and is documented
  // (see https://nodejs.org/api/stream.html#stream_readable_setencoding_encoding)
  // $FlowFixMe
  childProcess.stdin.setEncoding('utf-8');

  function processInputs(remainingInputs) {
    if (remainingInputs.length > 0) {
      setTimeout(() => {
        childProcess.stdin.write(remainingInputs[0]);
        processInputs(remainingInputs.slice(1));
      }, 2000);
    } else {
      childProcess.stdin.end();
    }
  }

  processInputs(inputs);

  return new Promise((resolve) => {
    if (process.env.DEBUG_CLI_TESTS) {
      childProcess.stdout.on('data', (chunk) => {
        console.log(`Received output from command "${command.join(' ')}":`, chunk.toString());
      });
    }

    childProcess.stdout.pipe(concatStream((result) => {
      resolve(result.toString());
    }));
  });
}