// @flow

import { join as joinPath } from 'path';

import { sync as syncGlob } from 'glob';
import { moveSync } from 'fs-extra';

import type { ConfigType } from '../../types';

// Matches on a path like /path/to/changelog/[whatever]2017-08-23T12:19:14.980Z[whatever].yml
// - 0: matches the file name from the beginning of the ISO string up to the end (extension)
// - 1: matches the file name up to the beginning of the ISO date time string
// - 2: matches the ISO date time string
// - 3: matches the file name from the end of the ISO date time string up to the end (extension)
const ENTRY_FILE_PATH_ISO_DATE_MATCHER =
  /(.*)([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]+Z)([^/\\]*\.yml)$/;

export default function toSemVerDirectories(config: ConfigType) {
  syncGlob(joinPath(config.path, '*/*.yml'))
    .forEach((oldFileName) => {
      const dateMatches = oldFileName.match(ENTRY_FILE_PATH_ISO_DATE_MATCHER);

      if (!dateMatches) {
        return;
      }

      const [
        beforeDatePart,
        datePart,
        afterPart
      ] = dateMatches.slice(1);

      moveSync(oldFileName, `${beforeDatePart}${datePart.replace(/:/g, '-')}${afterPart}`);
    });
}