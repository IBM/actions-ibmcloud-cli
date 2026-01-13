# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [1.1.1] - 2026-01-13
### Fixed
- Add force flag to plugin install to handle when a plugin is already installed [[#62](https://github.com/IBM/actions-ibmcloud-cli/pull/62)]

## [1.1.0] - 2025-11-19
### Added
* Add support for ubuntu-24.04-ppc64le and ubuntu-24.04-s390x runners [[#50](https://github.com/IBM/actions-ibmcloud-cli/pull/50)]
* Add support for macos-26 runner [[#49](https://github.com/IBM/actions-ibmcloud-cli/pull/49)]

### Changed
* Update dependency @vercel/ncc to v0.38.4 [[#39](https://github.com/IBM/actions-ibmcloud-cli/pull/39)]
* Add detection of the default resource group [[#52](https://github.com/IBM/actions-ibmcloud-cli/pull/52)]

### Fixed
* Check if ibmcloud already exists before installing [[#47](https://github.com/IBM/actions-ibmcloud-cli/pull/47)]
* Fix issue with more than 2 plugins listed [[#51](https://github.com/IBM/actions-ibmcloud-cli/pull/51)]

### Removed
* Drop support for windows-2019 runner as it's no longer supported by GitHub [[#27](https://github.com/IBM/actions-ibmcloud-cli/pull/27)]
* Drop support for macos-13 runner [[#49](https://github.com/IBM/actions-ibmcloud-cli/pull/49)]

## [1.0.4] - 2025-05-16
### Removed
* Drop ubuntu-20.04 now that it's removed by GitHub [[#23](https://github.com/IBM/actions-ibmcloud-cli/pull/23)]

### Security
* Bump undici from 5.28.5 to 5.29.0 for [CVE-2025-47279](https://github.com/advisories/GHSA-cxrh-j4jr-qwg3) [[#24](https://github.com/IBM/actions-ibmcloud-cli/pull/24)]

## [1.0.3] - 2025-01-29
### Added
* Add windows-2025 runner support [[#16](https://github.com/IBM/actions-ibmcloud-cli/pull/16)]
* Add support for Linux ARM runners: ubuntu-24.04-arm, ubuntu-22.04-arm [[#17](https://github.com/IBM/actions-ibmcloud-cli/pull/17)]

### Changed
* Update support table now that ubuntu-latest is ubuntu-24.04 [[#14](https://github.com/IBM/actions-ibmcloud-cli/pull/14)]

### Security
* Bump undici from 5.28.4 to 5.28.5 for [CVE-2025-22150](https://github.com/advisories/GHSA-c76h-2ccp-4975) [[#15](https://github.com/IBM/actions-ibmcloud-cli/pull/15)]

## [1.0.2] - 2024-12-16
### Added
* Add macos-15 runner [[#9](https://github.com/IBM/actions-ibmcloud-cli/pull/9)]

### Changed
* Refactor run method into functions [[#12](https://github.com/IBM/actions-ibmcloud-cli/pull/12)]
* Update packages to latest [[#13](https://github.com/IBM/actions-ibmcloud-cli/pull/13)]

### Removed
* Remove macos-12 runner [[#9](https://github.com/IBM/actions-ibmcloud-cli/pull/9)]

## [1.0.1] - 2024-09-26
### Fixed
* Fix issue where version format changed in ibmcloud cli [[#8](https://github.com/IBM/actions-ibmcloud-cli/pull/8)]

## [1.0.0] - 2024-06-17
* **BREAKING**: Revamp as a Javascript based GitHub Action [[#2](https://github.com/IBM/actions-ibmcloud-cli/pull/2)], [[#3](https://github.com/IBM/actions-ibmcloud-cli/pull/3)], [[#4](https://github.com/IBM/actions-ibmcloud-cli/pull/4)], [[#5](https://github.com/IBM/actions-ibmcloud-cli/pull/5)], [[#6](https://github.com/IBM/actions-ibmcloud-cli/pull/6)]

[Unreleased]: https://github.com/IBM/actions-ibmcloud-cli/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/IBM/actions-ibmcloud-cli/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/IBM/actions-ibmcloud-cli/compare/v1.0.4...v1.1.0
[1.0.4]: https://github.com/IBM/actions-ibmcloud-cli/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/IBM/actions-ibmcloud-cli/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/IBM/actions-ibmcloud-cli/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/IBM/actions-ibmcloud-cli/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/IBM/actions-ibmcloud-cli/compare/v0.0.8...v1.0.0
