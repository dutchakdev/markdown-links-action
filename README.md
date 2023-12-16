# Markdown Links Action
[![GitHub Super-Linter](https://github.com/dutchakdev/markdown-links-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/dutchakdev/markdown-links-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/dutchakdev/markdown-links-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/dutchakdev/markdown-links-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/dutchakdev/markdown-links-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/dutchakdev/markdown-links-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

The Markdown Links Action automates the process of validating links in Markdown 
files within a GitHub repository. It ensures all hyperlinks in your 
documentation are functional and up-to-date, maintaining the integrity and 
reliability of your project's documentation.

## Configuration Variables

Customize the action using these variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `use-verbose-mode` | Enable for detailed HTTP status of links. | `no` |
| `config-file` | Path to a [markdown-link-check config file](https://github.com/tcort/markdown-link-check#config-file-format). Customizes link check behavior. | `mlc_config.json` |
| `folder-path` | Specify directories to check. Use comma-separated paths for multiple directories. | `.` |
| `max-depth` | Max depth for directory checks. `-1` for unlimited depth. | `-1` |
| `check-modified-files-only` | Check only modified files in PRs. Uses `git` to identify changes. | `no` |
| `base-branch` | Base branch for comparing changes in PRs. | `master` |
| `file-extension` | File extension of Markdown files to check. | `.md` |
| `file-path` | Additional specific files to check. Use comma-separated paths. | - |
| `create-issue` | Enable to create issues for broken links. | `no` |
| `gh-assignees` | Assignees for created issues. Comma-separated GitHub usernames. | - |
| `gh-labels` | Labels for created issues. Comma-separated list. | - |

## Disabling Link Checks

Disable link checks in your Markdown files using HTML comments:

1. **Disable Link Checks in a Section:**
   Wrap the section with `<!-- markdown-link-check-disable -->` and `<!-- markdown-link-check-enable -->`.
   ```markdown
   <!-- markdown-link-check-disable -->
   Ignore this [Broken Link](https://example.com)
   <!-- markdown-link-check-enable -->
   ```

2. **Disable Link Checks for Next Line:**
   Place `<!-- markdown-link-check-disable-next-line -->` above the line.
   ```markdown
   <!-- markdown-link-check-disable-next-line -->
   This [Link](https://example.com) will be ignored.
   ```

3. **Disable Link Checks for Current Line:**
   Use `<!-- markdown-link-check-disable-line -->` in the same line.
   ```markdown
   This is a [Link](https://example.com) <!-- markdown-link-check-disable-line -->
   ```

## Example Workflows

### Checking Links in Modified Markdown Files

Use this workflow to check links in modified Markdown files in a pull request:

```yml
on: [pull_request]
name: Check Modified Markdown Links
jobs:
  markdown-link-check:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: dutchakdev/markdown-links-action@v1
      with:
        check-modified-files-only: 'yes'
```

### Checking Multiple Directories and Files

This workflow checks links in specific directories and files:

```yml
on: [push, pull_request]
name: Check Selected Markdown Links
jobs:
  markdown-link-check:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: dutchakdev/markdown-links-action@v1
      with:
        folder-path: 'docs'
        file-path: './README.md,./CONTRIBUTING.md'
```

## Tips and Notes

- **PR Comparisons:** For PRs, the action compares changes with the specified `base-branch`.
- **Custom Configurations:** Use the `config-file` to adjust link check behaviors, like ignoring certain links.
- **Issue Creation:** If `create-issue` is enabled, issues for broken links include detailed information for quick fixes.

## Contributions

Your feedback and contributions are welcome! Please create an issue or pull request in the repository for any feature requests or bug reports.

---

This documentation provides a clear and comprehensive guide to configuring and using your Markdown Links Action. Tailor the examples to fit the specifics of your action's capabilities and repository settings.

[Broken Link](https://examplewefl;qwkjnerfgnrefgweokgn.com)
