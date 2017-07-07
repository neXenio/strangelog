// @flow

export function getOwnTestPath(): string {
  const currentNanoSeconds = process.hrtime()[1];

  return `tmpTest/changelog_${currentNanoSeconds}_${Math.random()}`;
}
