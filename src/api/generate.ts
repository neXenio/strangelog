import type { ConfigType, ChangelogType } from '../types';
import defaultTemplate from '../templates/defaultTemplate';

import { getComponentTitle, stringifyVersion } from './utils';

function readableComponent(
  componentID: string | null | undefined,
  { components }: ConfigType
): string {
  if (componentID == null) {
    return 'All';
  }

  return getComponentTitle(components[componentID]);
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
