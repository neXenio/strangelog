// Jest globals used by this project's tests (flow-typed's jest libdef does not support Jest 30).

type JestMatchersType = {
  not: JestMatchersType,
  toBe(expected: unknown): void,
  toEqual(expected: unknown): void,
  toMatch(expected: string | RegExp): void,
  toMatchSnapshot(): void,
  toThrow(expected?: string | RegExp | Error | Class<Error>): void
};

declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void | Promise<void>, timeout?: number): void;
declare function test(name: string, fn: () => void | Promise<void>, timeout?: number): void;
declare function beforeEach(fn: () => void | Promise<void>, timeout?: number): void;
declare function afterEach(fn: () => void | Promise<void>, timeout?: number): void;
declare function expect(value: unknown): JestMatchersType;

declare var jest: {
  setTimeout(timeout: number): void,
  useFakeTimers(config?: { now?: number | Date }): void,
  useRealTimers(): void
};
