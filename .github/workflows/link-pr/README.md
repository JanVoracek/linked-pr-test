# @shoptet/action-link-pr

This code runs when a PR is opened or edited. It looks for linked issue - it can use

- our convention "Issue: #123", see the [pull request template](../../PULL_REQUEST_TEMPLATE.md)
- GitHub's keywords, e.g. "fixes", "resolves", etc.

It uses a [tasklist](https://docs.github.com/en/issues/managing-your-tasks-with-tasklists/creating-a-tasklist#creating-tasklists-with-markdown) in the issue description to reference the related PRs.
