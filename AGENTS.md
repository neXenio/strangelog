# strangelog: instructions for AI coding agents

This file tells coding agents how to work with strangelog in a project that uses it. It ships with
the npm package (`node_modules/@nexenio/strangelog/AGENTS.md`). Working on strangelog itself? Read
`CONTRIBUTING.md` in the strangelog repository instead.

The project keeps its changelog with [strangelog](https://github.com/neXenio/strangelog). Every
change is one small YAML file in the changelog directory, so changelog edits never cause merge
conflicts. Follow these rules whenever you change code in this project.

## When to add an entry

Add exactly one entry per user-visible change in your branch:

- new feature or option: `addition`
- changed behaviour, renamed option, changed default: `change`
- bug fix: `fix`
- removed feature or option: `removal`
- feature or option that still works but will be removed: `deprecation`
- fixed vulnerability: `security`

No entry for refactors without behaviour change, tests, CI, formatting or internal tooling. If one
branch contains several independent user-visible changes, add one entry for each.

## How to add an entry

Run the non-interactive form. Never run `strangelog add` without flags: it opens interactive
prompts and waits for a terminal.

```sh
npx strangelog add --kind fix --component api --description "Login no longer fails for e-mail addresses with a plus sign"
```

- `--kind` (`-k`): one of `addition`, `change`, `fix`, `removal`, `deprecation`, `security`, or a
  custom kind the project lists in `kinds` in `.strangelogrc` (for example `chore`).
- `--component` (`-c`): a component ID from `components` in `.strangelogrc` in the project root.
  Use the ID (the key), not the title. Components with `enabled: false` are retired: do not use
  them. Leave out `--component` only if `.strangelogrc` defines no components.
- `--description` (`-d`): at least 10 characters. If it starts with `-`, write it as
  `--description="-..."` so it is not read as a flag.
- `--ticket` (`-t`), optional: a ticket ID such as `LUCA-123`. Repeat the flag or separate IDs
  with commas for several tickets. If `.strangelogrc` has a `ticketPattern`, the IDs must match it.

Read `.strangelogrc` before adding an entry: if it has a `kinds` list, only those kinds are
allowed (for example `addition`, `fix` and a custom `chore`). Pick the closest allowed kind; use a
custom kind such as `chore` only for the changes the project uses it for.

The command prints the path of the created file and exits with code 0. On invalid input it exits
with code 2 and prints the valid kinds and components; fix the flags and run it again.

Then commit the new file (it is in `<changelog path>/next/`, default `changelog/next/`) together
with your change.

## Writing the description

- Write for users of the project, not for its developers: describe the effect, not the code.
- One sentence, present tense, no trailing period needed: "Exports include the invoice number",
  not "Added invoiceNumber to ExportSerializer".
- Mention the user-facing names of options, commands or screens in backticks.
- Do not put ticket numbers in the description (use `--ticket`), and do not mention branch names
  or the fact that an agent made the change.

## What not to do

- Do not edit or delete entries in released version directories (`changelog/1.2.3/` and so on).
  You may fix an entry in `next/` that your own branch added.
- Do not run `strangelog bump` or change the project version unless you are explicitly asked to
  prepare a release.
- Do not edit a generated `CHANGELOG.md` by hand. If the project commits it, regenerate it with
  `npx strangelog generate --outFile CHANGELOG.md` only when asked.
- Do not create entry files by hand; the file name format is part of the tool's contract.

## Other commands

- `npx strangelog generate --outFile CHANGELOG.md`: render all entries to Markdown.
  `npx strangelog generate --version 1.2.3 --outFile -` prints the section of one version.
- `npx strangelog bump --auto`: release `next/` as the next SemVer version (major for any `change`,
  minor for any `addition`, patch otherwise), based on the `version` in `package.json`. Only when
  asked to release.
- `npx strangelog rename-component <from> <to>`: move all entries of a component to another one
  (`<to>` must exist in `.strangelogrc`). Only when asked to rename or merge components.
- `npx strangelog migrate`: update old changelog files after upgrading strangelog.
