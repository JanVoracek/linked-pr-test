# @shoptet/action-link-pr

This code runs when a PR is opened or edited. It looks for linked issue - it can use

- our convention "Issue: #123", see the [pull request template](../../PULL_REQUEST_TEMPLATE.md)
- GitHub's keywords, e.g. "fixes", "resolves", etc.

If it finds such reference, it updates the description of the target issue like this:

```
Original issue description.

<!-- Do not edit manually after this comment -->
---

**Linked PRs:**

- #123

```
