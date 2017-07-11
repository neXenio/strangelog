// @flow

import inquirer from 'inquirer';

import type { ChangelogAPIType, ComponentsConfigType } from '../../types';

export default async function runAdd(
  { addEntry, getComponentsConfig }: ChangelogAPIType
) {
  const answers = await promptEntryInformation(getComponentsConfig());

  addEntry(answers);
}

function promptEntryInformation(componentsConfig: ComponentsConfigType) {
  return inquirer.prompt([{
    name: 'component',
    type: 'list',
    message: 'Which component is your change affecting?',
    choices: Object.keys(componentsConfig).map((componentName) => ({
      name: componentsConfig[componentName],
      value: componentName
    }))
  }, {
    name: 'kind',
    type: 'list',
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
    }]
  }, {
    name: 'description',
    type: 'input',
    message: 'What did change?',
    validate: (input) => (input.length < 10)
        ? 'Describe the change in at least 10 characters'
        : true
  }]);
}
