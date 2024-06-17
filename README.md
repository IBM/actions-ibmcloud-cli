# IBM Cloud CLI action

This action installs the IBM Cloud CLI and authenticates with IBM Cloud so you can run commands against it.

[![GitHub Release](https://img.shields.io/github/v/release/IBM/actions-ibmcloud-cli)](https://github.com/IBM/actions-ibmcloud-cli/releases)
[![Test](https://github.com/IBM/actions-ibmcloud-cli/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/IBM/actions-ibmcloud-cli/actions/workflows/test.yml?query=branch%3Amaster)

## Usage

### Example

```yaml
name: My workflow
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up ibmcloud CLI
      uses: IBM/actions-ibmcloud-cli@v0.1.0
      with:
        api_key: ${{ secrets.IBMCLOUD_API_KEY }}
        region: us-south
        group: default
        plugins: container-service, secrets-manager
    - run: ibmcloud --version
```

### Inputs

- `plugins`: (optional) A comma, space, or newline separated list of CLI plugins to be installed.

  The plugins can listed as `PLUGIN_NAME` (e.g. `container-service`) or `PLUGIN_NAME@VERSION` (e.g. `container-service@0.4.102`)

  For more information about plugins see https://cloud.ibm.com/docs/cli?topic=cli-plug-ins

  Examples:

  ```yaml
  plugins: container-service@0.4.102, secrets-manager
  ```
  ```yaml
  plugins: container-service@0.4.102 secrets-manager
  ```
  ```yaml
  plugins: |
    container-service@0.4.102
    secrets-manager
  ```

- `api`: (optional - default: `https://cloud.ibm.com`) API endpoint to IBM Cloud

- `api_key`: (optional) API Key to login to IBM Cloud

  If not provided, no attempt will be made to login in and you will need to login with the IBM Cloud CLI directly in a subsequent step.

- `region`: (optional - default: `us-south`) Region to access on IBM Cloud

- `group`: (optional - default: `default`) Resource group to access on IBM Cloud

### Outputs

- `version`: The version of the IBM Cloud CLI that was installed

  This can be accessed in a subsequent step by accessing the outputs as follows:

  ```yaml
  steps:
    - uses: actions/checkout@v4
    - name: Set up ibmcloud CLI
      id: ibmcloud
      uses: IBM/actions-ibmcloud-cli@v0.1.0
    - run: ibmcloud --version
           # => ibmcloud version 2.25.1+10e6a2e-2024-05-24T20:17:29+00:00
    - run: echo The version installed is ${{ steps.ibmcloud.outputs.version }}
           # => The version installed is 2.25.1
  ```

### Supported Platforms

The action works on these [GitHub-hosted runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources) images. Runner images not listed below are not supported yet.

| OS      | Supported        |
| ------- | ---------------- |
| Ubuntu  | `ubuntu-24.04`, `ubuntu-22.04` (`ubuntu-latest`), `ubuntu-20.04` |
| macOS   | `macos-14` (`macos-latest`), `macos-13`, `macos-12` |
| Windows | `windows-2022` (`windows-latest`), `windows-2019` |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

The gem is available as open source under the terms of the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).
