// @flow

export function stringifyVersion(version: ?string): string {
  if (!version) {
    return 'next';
  }

  return version;
}

export function multiToSingleLineString(multiLineIndentedString: string): string {
  return multiLineIndentedString.replace(/\n[ \t]*/g, ' ').trim();
}
