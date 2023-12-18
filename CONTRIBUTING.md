I understand your request now. You want the contribution section in your README.md to closely match the format and style of the example you provided. Here's the revised contribution section:

```markdown
# Contributing

Thank you for considering contributing to Markdown Link Checker! This document outlines how to submit changes to this repository and the conventions to follow. If you have any questions or uncertainties, please don't hesitate to reach out by submitting an issue here.

## Important

Our core maintainers prioritize pull requests (PRs) from within our organization. External contributions are regularly triaged but not at any fixed cadence. The review process may vary depending on the maintainers' workload. This applies to all types of PRs, so we kindly ask for your patience.

If you, as a community contributor, wish to work on more extensive features, please reach out to CODEOWNERS instead of directly submitting a PR with all the changes. This approach saves us both time, especially if the PR is not accepted (which will be the case if it does not align with our roadmap), and helps us effectively review and evaluate your contribution if it is accepted.

## Prerequisites

Before contributing, please ensure that you meet the following prerequisites:

- You're familiar with GitHub Issues and Pull Requests.
- You've read the documentation in this README.md thoroughly.
- You've set up a test project using `Markdown Link Checker`.

## Issues Before PRs

1. **Before you start working on a change,** please make sure that there is an issue for what you will be working on. You can either find an [existing issue](https://github.com/dutchakdev/markdown-link-action/issues) or [open a new issue](https://github.com/dutchakdev/markdown-link-action/issues/new) if none exists. This ensures that others can contribute with thoughts or suggest alternatives, ultimately making sure that we only add changes that make sense.

2. When you are ready to start working on a change, you should first fork the Markdown Link Checker repository and branch out from the `main` branch.

3. Make your changes.

4. Open a pull request towards the `main` branch in the Markdown Link Checker repository. Within a couple of days, a team member will review, comment, and eventually approve your PR.

## Workflow

### Branches

All changes should be part of a branch and submitted as a pull request. Your branches should be prefixed with one of:

- `fix/` for bug fixes
- `feat/` for features
- `docs/` for documentation changes

### Commits

Strive to keep your commits small and isolated. This helps the reviewer understand what is going on and makes it easier to process your requests.

### Pull Requests

Once your changes are ready, you must submit your branch as a pull request. Your pull request should be opened against the `main` branch in the Markdown Link Checker repository.

In your PR's description, you should follow this structure:

- **What:** What changes are in this PR
- **Why:** Why are these changes relevant
- **How:** How have the changes been implemented
- **Testing:** How have the changes been tested or how can the reviewer test the feature

We highly encourage that you do a self-review before requesting a review. To do a self-review, click the review button in the top right corner, go through your code, and annotate your changes. This makes it easier for the reviewer to process your PR.

### Merge Style

All pull requests are squashed and merged.

### Testing

All PRs should include tests for the changes that are included. We have two types of tests that must be written:

- **Unit tests** found under `packages/*/src/services/__tests__` and `packages/*/src/api/routes/*/__tests__`
- **Integration tests** found in `integration-tests/*/__tests__`

Check out our local development documentation to learn how to test your changes both in the Markdown Link Checker repository and on a local server.

### Documentation

- We generally encourage documenting your changes through comments in your code.
- If you alter user-facing behavior, you must provide documentation for such changes.
- All methods and endpoints should be documented using JSDoc and swagger-inline.

### Release

The Markdown Link Checker team will regularly create releases from the `main` branch.
```

This version aligns more closely with the example you provided, retaining its structure and style while adapting it to your project's specifics.
