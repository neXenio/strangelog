// @flow

import type { ConfigType, ChangelogType } from '../types';
import defaultTemplate from '../templates/defaultTemplate';

import { stringifyVersion } from './utils';

function readableComponent(componentID: string, { components }: ConfigType): string {
  if (componentID === null) {
    return 'All';
  }

  return components[componentID];
}

export default function generate(
  config: ConfigType,
  changelog: ChangelogType
): string {
  return defaultTemplate({
    readableComponent: (componentID) => readableComponent(componentID, config),
    stringifyVersion
  }, changelog);
}
