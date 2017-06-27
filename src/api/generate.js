// @flow

import { join as joinPath } from 'path';

import { readFileSync } from 'fs-extra';
import { create as createHandlebars } from 'handlebars';

import type { ConfigType, ChangelogType } from '../types';

import { stringifyVersion } from './utils';

const handlebarsInstance = createHandlebars();

handlebarsInstance.registerHelper(
  'stringifyVersion',
  (version) => stringifyVersion(version)
);
handlebarsInstance.registerHelper(
  'readableComponent',
  (
    componentID: string,
    { data }
  ) => data.root.components[componentID]
);

export default function generate(
  { path, components }: ConfigType,
  changelog: ChangelogType
): string {
  const generateMarkdown = handlebarsInstance.compile(
    readFileSync(joinPath(__dirname, '../../templates/CHANGELOG.hbs')).toString()
  );

  return generateMarkdown({
    components,
    changelog
  });
}
