import inquirer, { type DistinctQuestion } from 'inquirer';

import { getComponentTitle, isComponentEnabled } from '../../api/utils';
import type {
  ChangelogAPIType,
  ComponentsConfigType,
  EntryKindType,
  EntryType
} from '../../types';

export default async function runAdd(
  { addEntry, getComponentsConfig }: ChangelogAPIType
) {
  const answers = await promptEntryInformation(getComponentsConfig());

  addEntry(answers);
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
  const componentKeys = Object.keys(componentsConfig)
    .filter((componentName) => isComponentEnabled(componentsConfig[componentName]));

  const componentQuestions: DistinctQuestion<EntryType>[] = componentKeys.length === 0
    ? []
    : [{
      name: 'component',
      type: 'select',
      message: 'Which component is your change affecting?',
      choices: componentKeys.map((componentName) => ({
        name: getComponentTitle(componentsConfig[componentName]),
        value: componentName
      }))
    }];

  const questions: DistinctQuestion<EntryType>[] = [
    ...componentQuestions,
    {
      name: 'kind',
      type: 'select',
      message: 'What kind of change are you documenting?',
      choices: [{
        name: 'Addition (e.g. new button, new behavior)',
        value: 'addition'
      }, {
        name: 'Change (e.g. change of existing behavior)',
        value: 'change'
      }, {
        name: 'Bug Fix',
        value: 'fix'
      }, {
        name: 'Removal (e.g. removed feature or option)',
        value: 'removal'
      }, {
        name: 'Deprecation (e.g. feature or option that will be removed)',
        value: 'deprecation'
      }, {
        name: 'Security (e.g. fixed vulnerability)',
        value: 'security'
      }]
    }, {
      name: 'description',
      type: 'input',
      // `kind` is always answered, it is asked right before
      message: ({ kind }) => descriptionQuestions[kind as EntryKindType],
      validate: (input: string) => (input.length < 10)
        ? 'Describe the change in at least 10 characters'
        : true
    }
  ];

  return inquirer.prompt<EntryType>(questions);
}
