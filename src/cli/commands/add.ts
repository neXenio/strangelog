import inquirer, { type DistinctQuestion } from 'inquirer';

import { ENTRY_KINDS, getComponentTitle, isComponentEnabled } from '../../api/utils';
import type { ChangelogAPIType, ComponentsConfigType, EntryKindType, EntryType } from '../../types';
import type { CLIAddOptionsType } from '../types';

// Exit code for invalid `add` flags, so that scripts and coding agents can tell it from failures
const INVALID_INPUT_EXIT_CODE = 2;
const MIN_DESCRIPTION_LENGTH = 10;

export default async function runAdd(
  { addEntry, getComponentsConfig }: ChangelogAPIType,
  flags: CLIAddOptionsType
) {
  const { kind, component, description } = flags;
  const componentsConfig = getComponentsConfig();
  const isInteractive = [kind, component, description].every((flag) => typeof flag === 'undefined');

  if (isInteractive) {
    addEntry(await promptEntryInformation(componentsConfig));

    return;
  }

  const errors = getInvalidFlagErrors(componentsConfig, flags);

  if (errors.length > 0) {
    printInvalidFlags(componentsConfig, errors);
    process.exitCode = INVALID_INPUT_EXIT_CODE;

    return;
  }

  const entryFilePath = addEntry({
    component: component || null,
    // validated by getInvalidFlagErrors()
    kind: kind as EntryKindType,
    description: (description || '').trim()
  });

  console.log(`Added changelog entry ${entryFilePath}`);
}

function getEnabledComponentIDs(componentsConfig: ComponentsConfigType): string[] {
  return Object.keys(componentsConfig).filter((componentName) =>
    isComponentEnabled(componentsConfig[componentName])
  );
}

function getInvalidFlagErrors(
  componentsConfig: ComponentsConfigType,
  flags: CLIAddOptionsType
): string[] {
  // yargs turns a repeated flag into an array
  const repeatedFlagNames = (['kind', 'component', 'description'] as const).filter((flagName) =>
    Array.isArray(flags[flagName])
  );

  if (repeatedFlagNames.length > 0) {
    return repeatedFlagNames.map((flagName) => `--${flagName} is given more than once`);
  }

  const { kind, component, description } = flags;
  const errors: string[] = [];
  const enabledComponentIDs = getEnabledComponentIDs(componentsConfig);

  if (!kind) {
    errors.push('--kind is missing');
  } else if (!(ENTRY_KINDS as string[]).includes(kind)) {
    errors.push(`--kind "${kind}" is not a valid kind`);
  }

  if (!component) {
    if (enabledComponentIDs.length > 0) {
      errors.push('--component is missing');
    }
  } else if (!Object.keys(componentsConfig).includes(component)) {
    errors.push(`--component "${component}" is not defined in .strangelogrc`);
  } else if (!enabledComponentIDs.includes(component)) {
    errors.push(`--component "${component}" is disabled in .strangelogrc`);
  }

  if (!description || description.trim().length < MIN_DESCRIPTION_LENGTH) {
    errors.push(`--description must have at least ${MIN_DESCRIPTION_LENGTH} characters`);
  }

  return errors;
}

function printInvalidFlags(componentsConfig: ComponentsConfigType, errors: string[]) {
  const enabledComponentIDs = getEnabledComponentIDs(componentsConfig);

  console.error(
    [
      'Cannot add the changelog entry:',
      ...errors.map((error) => `  - ${error}`),
      `Valid kinds: ${ENTRY_KINDS.join(', ')}`,
      enabledComponentIDs.length > 0
        ? `Valid components: ${enabledComponentIDs.join(', ')}`
        : 'No components are defined in .strangelogrc: leave out --component'
    ].join('\n')
  );
}

const descriptionQuestions = {
  addition: 'What is added?',
  change: 'What changes?',
  fix: 'What is fixed?',
  removal: 'What is removed?',
  deprecation: 'What is deprecated?',
  security: 'What is fixed?'
};

function promptEntryInformation(componentsConfig: ComponentsConfigType): Promise<EntryType> {
  const componentKeys = getEnabledComponentIDs(componentsConfig);

  const componentQuestions: DistinctQuestion<EntryType>[] =
    componentKeys.length === 0
      ? []
      : [
          {
            name: 'component',
            type: 'select',
            message: 'Which component is your change affecting?',
            choices: componentKeys.map((componentName) => ({
              name: getComponentTitle(componentsConfig[componentName]),
              value: componentName
            }))
          }
        ];

  const questions: DistinctQuestion<EntryType>[] = [
    ...componentQuestions,
    {
      name: 'kind',
      type: 'select',
      message: 'What kind of change are you documenting?',
      choices: [
        {
          name: 'Addition (e.g. new button, new behavior)',
          value: 'addition'
        },
        {
          name: 'Change (e.g. change of existing behavior)',
          value: 'change'
        },
        {
          name: 'Bug Fix',
          value: 'fix'
        },
        {
          name: 'Removal (e.g. removed feature or option)',
          value: 'removal'
        },
        {
          name: 'Deprecation (e.g. feature or option that will be removed)',
          value: 'deprecation'
        },
        {
          name: 'Security (e.g. fixed vulnerability)',
          value: 'security'
        }
      ]
    },
    {
      name: 'description',
      type: 'input',
      // `kind` is always answered, it is asked right before
      message: ({ kind }) => descriptionQuestions[kind as EntryKindType],
      validate: (input: string) =>
        input.length < MIN_DESCRIPTION_LENGTH
          ? `Describe the change in at least ${MIN_DESCRIPTION_LENGTH} characters`
          : true
    }
  ];

  return inquirer.prompt<EntryType>(questions);
}
