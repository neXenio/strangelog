import { spawn } from 'child_process';
import { readFileSync } from 'node:fs';
import { join as joinPath } from 'path';

import { globSync } from 'glob';
import { dump, load } from 'js-yaml';
import { expect } from 'vitest';

import { outputFileSync } from './fileSystem.ts';

function readYAMLFileSync(filePath: string): { [key: string]: unknown } {
  return load(readFileSync(filePath).toString()) as { [key: string]: unknown };
}

export function readSingleYAMLFileFromGlob(...fileGlobPathParts: string[]): {
  [key: string]: unknown;
} {
  const matchedFiles = joinAndGlob(...fileGlobPathParts);

  expect(matchedFiles.length).toBe(1);

  return readYAMLFileSync(matchedFiles[0]);
}

export function joinAndGlob(...fileGlobPathParts: string[]): string[] {
  return globSync(joinPath(...fileGlobPathParts));
}

export function joinAndOutputYAMLFile(pathParts: string[], json: unknown): void {
  return outputFileSync(joinPath(...pathParts), dump(json));
}

export const CLIButtons = {
  ARROW_DOWN: '\x1B\x5B\x42',
  ARROW_UP: '\x1B\x5B\x41',
  ENTER: '\x0D'
};

const INPUT_IDLE_DELAY = 500;

export type CLIResultType = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

export async function runCLI(cwd: string, command: string[], inputs: string[]): Promise<string> {
  return (await runCLIWithResult(cwd, command, inputs)).stdout;
}

export function runCLIWithResult(
  cwd: string,
  command: string[],
  inputs: string[]
): Promise<CLIResultType> {
  const childProcess = spawn(
    process.execPath,
    // Node strips the types of src/ itself; the warning is about running the .ts sources as ESM in
    // a package without "type": "module", which only happens when running from source
    [
      '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON',
      joinPath(__dirname, '..', 'src', 'cli', 'index.ts'),
      ...command
    ],
    {
      stdio: [null, null, null],
      cwd
    }
  );

  // Each input is sent once the prompt has rendered (stdout went quiet after new output), since
  // keystrokes that arrive before a prompt is ready get lost.
  const remainingInputs = [...inputs];
  let inputTimer: ReturnType<typeof setTimeout> | undefined;

  function sendNextInputWhenIdle() {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => {
      const nextInput = remainingInputs.shift();

      if (typeof nextInput === 'string') {
        childProcess.stdin.write(nextInput);
      }

      if (remainingInputs.length === 0) {
        childProcess.stdin.end();
      }
    }, INPUT_IDLE_DELAY);
  }

  if (remainingInputs.length === 0) {
    childProcess.stdin.end();
  } else {
    childProcess.stdout.on('data', sendNextInputWhenIdle);
  }

  return new Promise((resolve) => {
    if (process.env.DEBUG_CLI_TESTS) {
      childProcess.stdout.on('data', (chunk: Buffer) => {
        console.log(`Received output from command "${command.join(' ')}":`, chunk.toString());
      });
    }

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    childProcess.stdout.on('data', (chunk: Buffer) => {
      stdoutChunks.push(chunk);
    });
    childProcess.stderr.on('data', (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });
    childProcess.on('close', (exitCode) => {
      clearTimeout(inputTimer);
      resolve({
        stdout: Buffer.concat(stdoutChunks).toString(),
        stderr: Buffer.concat(stderrChunks).toString(),
        exitCode
      });
    });
  });
}
