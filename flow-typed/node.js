// Node.js globals used by this project. Flow no longer ships Node definitions and the flow-typed
// `node` environment does not parse with current Flow versions.

declare var __dirname: string;

declare var process: {
  argv: Array<string>,
  env: { [name: string]: ?string },
  execPath: string,
  cwd(): string,
  chdir(directory: string): void,
  hrtime(time?: [number, number]): [number, number]
};

declare class Buffer extends Uint8Array {
  static concat(list: $ReadOnlyArray<Buffer>, totalLength?: number): Buffer;
  toString(encoding?: string): string;
}

declare module 'path' {
  declare function basename(path: string, suffix?: string): string;
  declare function dirname(path: string): string;
  declare function join(...paths: Array<string>): string;
  declare function resolve(...paths: Array<string>): string;
}

declare module 'child_process' {
  declare class ChildProcess {
    stdin: { write(chunk: string): boolean, end(): void };
    stdout: { on(event: 'data', listener: (chunk: Buffer) => void): void };
    on(event: 'close', listener: () => void): void;
  }

  declare function spawn(
    command: string,
    args: Array<string>,
    options: { cwd: string, stdio: Array<null> }
  ): ChildProcess;
}
