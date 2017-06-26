// @flow

export function getOwnTestPath(): string {
  const currentNanoSeconds = process.hrtime()[1];

  return `tmpTestChangelog_${currentNanoSeconds}_${Math.random()}`;
}
