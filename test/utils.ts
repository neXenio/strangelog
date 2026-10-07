import { join as joinPath } from 'path';
import { spawn } from 'child_process';

import { globSync } from 'glob';
import { readFileSync, outputFileSync } from 'fs-extra';
import { dump, load } from 'js-yaml';

function readYAMLFileSync(filePath: string): { [key: string]: unknown } {
  return load(readFileSync(filePath).toString()) as { [key: string]: unknown };
}

export function readSingleYAMLFileFromGlob(
  ...fileGlobPathParts: string[]
): { [key: string]: unknown } {
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
  stdout: string,
  stderr: string,
  exitCode: number | null
};

export async function runCLI(
  cwd: string,
  command: string[],
  inputs: string[]
): Promise<string> {
  return (await runCLIWithResult(cwd, command, inputs)).stdout;
}

export function runCLIWithResult(
  cwd: string,
  command: string[],
  inputs: string[]
): Promise<CLIResultType> {
  const childProcess = spawn(
    process.execPath,
    [joinPath(__dirname, 'runSourceCLI.cjs'), ...command],
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
      childProcess.stdout.on('data', (chunk) => {
        console.log(`Received output from command "${command.join(' ')}":`, chunk.toString());
      });
    }

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    childProcess.stdout.on('data', (chunk) => {
      stdoutChunks.push(chunk);
    });
    childProcess.stderr.on('data', (chunk) => {
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