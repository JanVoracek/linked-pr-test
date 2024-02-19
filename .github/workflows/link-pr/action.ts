import github from 'npm:@actions/github@6.0.0';
import { IssuePullRequestLinker } from './issue-pull-request-linker.ts';

const pr = github.context.payload.pull_request!;
const changes = github.context.payload.changes;

// https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword
const linkingKeywords = [
  'close',
  'closes',
  'closed',
  'fix',
  'fixes',
  'fixed',
  'resolve',
  'resolves',
  'resolved',
  'issue', // Our Issue: #123
] as const;

// https://regex101.com/r/LLv7xP/1
const issueReferencePattern = new RegExp(`^(?:${linkingKeywords.join('|')}):? #(\\d+)\\s*$`, 'mi');

const issueNumber = parseInt(pr.body?.match(issueReferencePattern)?.[1]!, 10) || undefined;
const previousIssueNumber = parseInt(changes?.body?.from?.match(issueReferencePattern)?.[1]!, 10) || undefined;

if (!issueNumber && !previousIssueNumber) {
  console.log('Issue number not found in the pull request description.');
  Deno.exit(0);
}

if (issueNumber === previousIssueNumber) {
  console.log('Issue number did not change.');
  Deno.exit(0);
}

console.log(Deno.readTextFileSync('/home/runner/work/_temp/_github_workflow/event.json'));
const octokit = github.getOctokit(Deno.env.get('GITHUB_TOKEN')!);
const issuePrLinker = new IssuePullRequestLinker(octokit, github.context.repo);

if (previousIssueNumber) {
  await issuePrLinker.updateLinkedPullRequestsForIssue(previousIssueNumber, pr.number, 'delete');
}

if (issueNumber) {
  await issuePrLinker.updateLinkedPullRequestsForIssue(issueNumber, pr.number, 'add');
}
