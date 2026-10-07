# Changelog

## Version `3.2.1`

### Fixed
- **CLI:** `strangelog --version` prints the strangelog version instead of the version of the project it runs in

## Version `3.2.0`

### Added
- **All:** `kinds` in `.strangelogrc` may list custom kinds such as `chore`; they render with their name (or `kindLabels`) and count as patch changes for `bump --auto`

## Version `3.1.1`

### Fixed
- **CLI:** The `strangelog` command is installed again: 3.1.0 was published without it, because npm dropped the `./`-prefixed bin path

## Version `3.1.0`

### Added
- **All:** The `compact` template (`template: compact` in `.strangelogrc`) renders one line per entry in the form `* **component** feat: description (tickets)`, with `kindLabels` and `allComponentLabel` to adjust the labels
- **All:** The `kinds` list in `.strangelogrc` restricts the kinds that `strangelog add` and `addEntry()` accept
- **All:** Entries can link tickets: `strangelog add --ticket`, an optional prompt question, `ticketUrl` for links and `ticketPattern` to validate the IDs
- **All:** `strangelog bump` records the release date in `.release.yml`, which the `compact` template prints next to the version
- **All:** The `legacyChangelog` file in `.strangelogrc` is appended to the generated changelog, so an existing `CHANGELOG.md` can be kept
- **CLI:** `strangelog generate --version <version> --outFile -` prints the section of one version, e.g. for release notes

## Version `3.0.0`

### Added
- **All:** New `rename-component <from> <to>` command and `renameComponent()` API to rename or merge components in all existing entries
- **All:** `strangelog bump --auto` and `getAutomaticNextVersion()` derive the next SemVer version from the "next" entries
- **All:** The package ships `AGENTS.md` with instructions for AI coding agents
- **API:** TypeScript type declarations are included: TypeScript projects get types for connectChangelog, CURRENT_VERSION and the exported types such as ConfigType and EntryType
- **CLI:** Components configured with `enabled: false` in `.strangelogrc` are no longer offered by `strangelog add`
- **CLI:** `strangelog add` offers the removal, deprecation and security kinds
- **CLI:** `strangelog add --kind --component --description` adds an entry without prompts; invalid flags exit with code 2

### Changed
- **All:** Requires Node.js `^22.18.0` or `>=24.11.0`; all dependencies are updated to their latest major versions
- **All:** The package is published as `@nexenio/strangelog`; the `strangelog` command keeps its name
- **API:** `addEntry()` returns the path of the written entry file
- **CLI:** Interactive prompts are rendered by Inquirer 14
- **CLI:** `strangelog add` phrases the description question by kind of change (e.g. "What is fixed?")
- **CLI:** Running `strangelog` without a command prints the usage help

### Fixed
- **All:** Versions are sorted by SemVer, so 1.10.0 is listed above 1.9.0
- **All:** Generated changelogs no longer start with an empty `next` section right after a release
- **API:** `addEntry()` writes `info.yml` for new projects, so `migrate()` no longer reports version -1
- **CLI:** `strangelog bump` offers SemVer-compliant versions (from 1.2.3: 1.2.4, 1.3.0, 2.0.0)

## Version `2.0.1`

### Fixed
- **All:** Old projects (before `info.yml` and migrations were introduced) are now correctly migrated via `strangelog migrate`

## Version `2.0.0`

### Added
- **CLI:** Passing `--version [version]` or `-v [version]` to `$ bump` now allows for explicitly setting a next version (this bypasses the SemVer-compliancy checks)

### Changed
- **All:** Possible next versions are now based on the `version`-field in the current working directory's `package.json`
- **API:** `bumpNextVersion()` now takes a single string argument being the new version (before it was a `SemVer`-object). This allows to work with non-SemVer-versions
- **API:** `getPossibleNextVersions()` now offers SemVer-compliant bumps based on the current working directory's `package.json`-`version`-field (and not the "latest" version directory)
- **CLI:** Based on the API-change, `$ bump` now offers SemVer-compliant bumps based on the current working directory's `package.json`-`version`-field (and not the "latest" version directory)

## Version `1.3.0`

### Changed
- **CLI:** Inofficial `--directory`/`-d` option is no longer supported

### Fixed
- **All:** Previous changelog entry files contained the ISO-8601-formatted date time string which caused problems on Windows and other systems. This is no longer happening and running `strangelog migrate` will rename malformed entries
- **CLI:** `path` in `.strangelogrc` had no effect

## Version `1.2.0`

### Added
- **All:** New entry kinds "Security", "Removed" & "Deprecated" from [keepachangelog](http://keepachangelog.com/)

### Changed
- **All:** Entries are now sorted by component name

## Version `1.1.5`

### Fixed
- **All:** Broken addition of entries due to wrong negation on non-existent `.strangelogrc`

## Version `1.1.4`

### Fixed
- **All:** Missing `.strangelogrc` was also causing crash during `addEntry()`/`$ add` due to wrong `null` vs. `undefined` check

## Version `1.1.3`

### Fixed
- **CLI:** Missing `.strangelogrc` was still causing error because new `getProjectConfig()` was not used in CLI

## Version `1.1.2`

### Fixed
- **All:** Fixes broken changelog generation due to defect in version directory listing with `info.yml`
- **All:** Add missing dependency to `glob` causing crash on projects without it

## Version `1.1.1`

### Added
- **All:** `.strangelogrc` is now optional (defaults to `changelog/` as path and just one "All" component)
- **API:** Adds a `migrate()`-function on the API to migrate files to the latest version
- **CLI:** New `migrate` command that uses the `migrate()`-API to simplify updating strangelog

### Fixed
- **All:** `babel-polyfill` was missing before in `dependencies` causing strangelog not to work in projects without it

## Version `1.0.0`

### Changed
- **All:** Introduces patch version (this requires you to append a `.0` to all version directory names

## Version `0.5.0`

### Added
- **All:** Use strangelog itself to maintain changelog

### Changed
- **All:** Generated markdown now contains the readable component name per entry