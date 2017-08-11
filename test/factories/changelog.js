// @flow

import type { ChangelogAPIType } from '../../src/types';

export function addTestVersionsWithEntries({ addEntry, bumpNextVersion }: ChangelogAPIType) {
  addEntry({
    component: 'comp1',
    kind: 'addition',
    description: 'comp1 addition description'
  });
  bumpNextVersion({
    major: 1,
    minor: 0,
    patch: 0
  });

  addEntry({
    component: 'comp1',
    kind: 'change',
    description: 'comp1 change description'
  });
  bumpNextVersion({
    major: 1,
    minor: 1,
    patch: 0
  });

  addEntry({
    component: 'comp2',
    kind: 'fix',
    description: 'comp2 fix description'
  });
}

export function addEntryWithoutComponent({ addEntry }: ChangelogAPIType) {
  addEntry({
    component: null,
    kind: 'addition',
    description: 'addition to no specific component'
  });
}