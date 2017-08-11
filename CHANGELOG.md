# Changelog

## Version `next`





### Fixed
- **All:** Fixes broken changelog generation due to defect in version directory listing with `info.yml`

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

