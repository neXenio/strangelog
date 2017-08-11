# Changelog

## Version `next`







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
- **API:** Adds a `migrate()`-function on the API to migrate files to the latest version
- **CLI:** New `migrate` command that uses the `migrate()`-API to simplify updating strangelog
- **All:** `.strangelogrc` is now optional (defaults to `changelog/` as path and just one "All" component)



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

