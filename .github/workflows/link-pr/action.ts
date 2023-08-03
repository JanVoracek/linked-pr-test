import github from '@actions/github';
import { IssuePullRequestLinker } from './issue-pull-request-linker';

const pr = github.context.payload.pull_request!;
const changes = github.context.payload.changes;


// https://regex101.com/r/fecV0x/1
const issueReferencePattern = /^Issue: #(\d+)\s*$/m;
const issueNumber = parseInt(pr.body?.match(issueReferencePattern)?.[1]!, 10) || undefined;
const previousIssueNumber = parseInt(changes?.body?.from?.match(issueReferencePattern)?.[1]!, 10) || undefined;

if (!issueNumber && !previousIssueNumber) {
  console.log('Issue number not found in the pull request description.');
  process.exit(0);
}

if (issueNumber === previousIssueNumber) {
  console.log('Issue number did not change.');
  process.exit(0);
}

const octokit = github.getOctokit(process.env.GITHUB_TOKEN!);
const issuePrLinker = new IssuePullRequestLinker(octokit, github.context.repo);

if (previousIssueNumber) {
  await issuePrLinker.updateLinkedPullRequestsForIssue(previousIssueNumber, pr.number, 'delete');
}

if (issueNumber) {
  await issuePrLinker.updateLinkedPullRequestsForIssue(issueNumber, pr.number, 'add');
}
