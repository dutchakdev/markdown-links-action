[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://vshymanskyy.github.io/StandWithUkraine/)

  <h1 align="center">
    <br>
    <img src="./assets/octocat.png" alt="Markdown Links Action Logo" width="200">
    <br>
    Markdown Links Action
    <br>
  </h1>

  <h4 align="center">A GitHub Action for validating links in Markdown files.</h4>

  <p align="center">
    <a href="https://github.com/your_username/markdown-links-action/releases">
      <img src="https://img.shields.io/github/v/release/dutchakdev/markdown-links-action?style=flat-square">
    </a>
    <a href="https://github.com/your_username/markdown-links-action/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/dutchakdev/markdown-links-action?style=flat-square">
    </a>
    <a href="https://github.com/dutchakdev/markdown-links-action/actions/workflows/release.yml">
      <img src="https://github.com/dutchakdev/markdown-links-action/actions/workflows/release.yml/badge.svg?branch=main"/>
    </a>
    <a href="https://github.com/dutchakdev/markdown-links-action/actions/workflows/ci.yml">
      <img src="https://github.com/dutchakdev/markdown-links-action/actions/workflows/ci.yml/badge.svg?branch=main"/>
    </a>
  </p>

  <p align="center">
    <a href="#overview">Overview</a> •
    <a href="#features">Features</a> •
    <a href="#configuration">Configuration</a> •
    <a href="#usage-examples">Usage Examples</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license">License</a>
  </p>

  ---

  ## :clipboard: Overview

  The Markdown Links Action automates the process of validating links in Markdown files within a GitHub repository, ensuring all hyperlinks in your documentation are functional and up-to-date.

  ## :sparkles: Features

  - **Link Validation:** Checks hyperlinks in Markdown files for validity.
  - **Customizable Folder Paths:** Specify directories to check for Markdown files.
  - **PR Specific Checks:** Option to check only modified files in pull requests.
  - **Issue Creation:** Ability to create GitHub issues for broken links.
  - **Flexible Configuration:** Configure various aspects of the action according to your project's needs.

  ## :gear: Configuration

  Configure the action using these inputs:

  | Input                        | Description                                     | Required | Default Value       |
  |------------------------------|-------------------------------------------------|----------|---------------------|
  | `folder-path`                | Custom folder path for Markdown files.          | Yes      | `.`                 |
  | `max-depth`                  | Maximum depth for directory checks.             | Yes      | `-1`                |
  | `check-modified-files-only`  | Check only modified files if set to `yes`.      | Yes      | `no`                |
  | `base-branch`                | Base branch for comparing changes in PRs.       | Yes      | `main`              |
  | `file-extension`             | File extension of Markdown files to check.      | Yes      | `.md`               |
  | `file-path`                  | Additional specific files to check.             | Yes      |                     |
  | `create-issue`               | Create issue for broken links if set to `yes`.  | Yes      | `no`                |
  | `gh-assignees`               | Assignees for the created issues.               | No       |                     |
  | `gh-labels`                  | Labels for the created issues.                  | No       |                     |
  | `repo-token`                 | GitHub token for authentication.                | Yes      |                     |
  | `repository`                 | GitHub repository in the format `owner/repo`.   | Yes      |                     |

  ## :zap: Usage Examples

  ### Basic Usage

  Check links in all Markdown files in the repository:

  ```yml
  on: [push, pull_request]
  name: Markdown Link Check
  jobs:
    linkCheck:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - uses: your_username/markdown-links-action@v1
  ```

  ### Custom Folder Path

  Check links only in the `docs` directory:

  ```yml
  on: [push, pull_request]
  name: Check Docs Links
  jobs:
    linkCheck:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - uses: your_username/markdown-links-action@v1
          with:
            folder-path: 'docs'
  ```

  ### PR Specific Checks

  Check only modified files in a pull request:

  ```yml
  on: [pull_request]
  name: Check Modified Markdown Links
  jobs:
    linkCheck:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - uses: your_username/markdown-links-action@v1
          with:
            check-modified-files-only: 'yes'
  ```

  ## :heart: Contributing

  Interested in contributing? We welcome all contributions, big or small. Check out our [Contribution Guide](CONTRIBUTING.md) for details.

  ## :memo: License



  Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

  ---

  <h3 align="center">
    <br>
    Made with 🤙 by <a href="https://github.com/dutchakdev">Roman Dutchak</a>
    <br>
  </h3>