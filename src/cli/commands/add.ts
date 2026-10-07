import inquirer, { type DistinctQuestion } from 'inquirer';

import {
  getAllowedKinds,
  getComponentTitle,
  getCustomKindLabel,
  isComponentEnabled
} from '../../api/utils.ts';
import type { ChangelogAPIType, ConfigType, EntryKindType, EntryType } from '../../types.ts';
import type { CLIAddOptionsType } from '../types.ts';

// Exit code for invalid `add` flags, so that scripts and coding agents can tell it from failures
const INVALID_INPUT_EXIT_CODE = 2;
const MIN_DESCRIPTION_LENGTH = 10;

type PromptAnswersType = Omit<EntryType, 'tickets'> & {
  tickets: string;
};

export default async function runAdd(
  { addEntry, getConfig }: ChangelogAPIType,
  flags: CLIAddOptionsType
) {
  const { kind, component, description, ticket } = flags;
  const config = getConfig();
  const isInteractive = [kind, component, description, ticket].every(
    (flag) => typeof flag === 'undefined'
  );

  if (isInteractive) {
    const { tickets, ...entry } = await promptEntryInformation(config);

    addEntry({ ...entry, tickets: parseTickets(tickets) });

    return;
  }

  const errors = getInvalidFlagErrors(config, flags);

  if (errors.length > 0) {
    printInvalidFlags(config, errors);
    process.exitCode = INVALID_INPUT_EXIT_CODE;

    return;
  }

  const entryFilePath = addEntry({
    component: component || null,
    // validated by getInvalidFlagErrors()
    kind: kind as EntryKindType,
    description: (description || '').trim(),
    tickets: parseTickets(ticket)
  });

  console.log(`Added changelog entry ${entryFilePath}`);
}

// `--ticket` may be repeated and each value may be a comma separated list
function parseTickets(tickets: string | string[] | undefined): string[] {
  return [tickets || []]
    .flat()
    .flatMap((ticketList) => ticketList.split(','))
    .map((ticket) => ticket.trim())
    .filter((ticket) => ticket);
}

function getInvalidTickets({ ticketPattern }: ConfigType, tickets: string[]): string[] {
  if (!ticketPattern) {
    return [];
  }

  // Anchored, so that `LUCA-\d+` cannot match inside `XLUCA-1x`
  const ticketRegExp = toTicketRegExp(ticketPattern);

  return tickets.filter((ticket) => !ticketRegExp.test(ticket));
}

function toTicketRegExp(ticketPattern: string): RegExp {
  try {
    return new RegExp(`^(?:${ticketPattern})$`);
  } catch {
    throw new Error(`Invalid ticketPattern in .strangelogrc: ${ticketPattern}`);
  }
}

function getEnabledComponentIDs({ components }: ConfigType): string[] {
  return Object.keys(components).filter((componentName) =>
    isComponentEnabled(components[componentName])
  );
}

function getInvalidFlagErrors(config: ConfigType, flags: CLIAddOptionsType): string[] {
  // yargs turns a repeated flag into an array
  const repeatedFlagNames = (['kind', 'component', 'description'] as const).filter((flagName) =>
    Array.isArray(flags[flagName])
  );

  if (repeatedFlagNames.length > 0) {
    return repeatedFlagNames.map((flagName) => `--${flagName} is given more than once`);
  }

  const { kind, component, description, ticket } = flags;
  const componentsConfig = config.components;
  const errors: string[] = [];
  const enabledComponentIDs = getEnabledComponentIDs(config);

  if (!kind) {
    errors.push('--kind is missing');
  } else if (!(getAllowedKinds(config) as string[]).includes(kind)) {
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

  try {
    getInvalidTickets(config, parseTickets(ticket)).forEach((invalidTicket) => {
      errors.push(`--ticket "${invalidTicket}" does not match ${config.ticketPattern}`);
    });
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  return errors;
}

function printInvalidFlags(config: ConfigType, errors: string[]) {
  const enabledComponentIDs = getEnabledComponentIDs(config);

  console.error(
    [
      'Cannot add the changelog entry:',
      ...errors.map((error) => `  - ${error}`),
      `Valid kinds: ${getAllowedKinds(config).join(', ')}`,
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

const kindChoices = [
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
];

function promptEntryInformation(config: ConfigType): Promise<PromptAnswersType> {
  const componentsConfig = config.components;
  const componentKeys = getEnabledComponentIDs(config);
  const allowedKinds: string[] = getAllowedKinds(config);

  const componentQuestions: DistinctQuestion<PromptAnswersType>[] =
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

  const questions: DistinctQuestion<PromptAnswersType>[] = [
    ...componentQuestions,
    {
      name: 'kind',
      type: 'select',
      message: 'What kind of change are you documenting?',
      choices: allowedKinds.map(
        (kind) =>
          kindChoices.find(({ value }) => value === kind) || {
            name: getCustomKindLabel(config, kind),
            value: kind
          }
      )
    },
    {
      name: 'description',
      type: 'input',
      // `kind` is always answered, it is asked right before
      message: ({ kind }) =>
        descriptionQuestions[kind as keyof typeof descriptionQuestions] || 'What changed?',
      validate: (input: string) =>
        input.length < MIN_DESCRIPTION_LENGTH
          ? `Describe the change in at least ${MIN_DESCRIPTION_LENGTH} characters`
          : true
    },
    {
      name: 'tickets',
      type: 'input',
      message: 'Tickets (comma separated, optional)',
      validate: (input: string) => {
        const invalidTickets = getInvalidTickets(config, parseTickets(input));

        return invalidTickets.length > 0
          ? `${invalidTickets.join(', ')} does not match ${config.ticketPattern}`
          : true;
      }
    }
  ];

  return inquirer.prompt<PromptAnswersType>(questions);
}
