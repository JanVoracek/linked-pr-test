import github from '@actions/github';
import { stripIndent } from 'common-tags';

const pr = github.context.payload.pull_request!;
const changes = github.context.payload.changes;

const linkedPrsHeader = stripIndent`
    <!-- Do not edit manually after this comment -->
    ---

    **Linked PRs:**
`.replaceAll('\n', '\r\n');

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

type IssueBody = { description: string; linkedPrs: Set<number> };

function parseIssueBody(issueBody: string): IssueBody {
  const linkedPrsHeaderIndex = issueBody.lastIndexOf(linkedPrsHeader);

  if (linkedPrsHeaderIndex === -1) {
    return {
      description: issueBody,
      linkedPrs: new Set(),
    };
  }

  const description = issueBody.slice(0, linkedPrsHeaderIndex).trimEnd();
  const linkedPrsList = issueBody.slice(linkedPrsHeaderIndex + linkedPrsHeader.length);

  // https://regex101.com/r/QxqEIk/1
  const linkedPrs = [...linkedPrsList.matchAll(/^- PR #(\d+)/gm)].map(match => parseInt(match[1]!, 10));

  return {
    description,
    linkedPrs: new Set(linkedPrs),
  };
}

function formatIssueBody(issue: IssueBody): string {
  const sortedPrs = [...issue.linkedPrs].sort((a, b) => a - b);
  const linkedPrs = sortedPrs.map(pr => `- PR #${pr}`).join('\r\n');

  return `${issue.description}\r\n\r\n${linkedPrsHeader}\r\n\r\n${linkedPrs}`;
}

async function updateLinkedPrs(issueNumber: number, prNumber: number, operation: 'add' | 'delete') {
  const response = await octokit.rest.issues.get({
    issue_number: issueNumber,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });

  const issueBody = parseIssueBody(response.data.body!);
  issueBody.linkedPrs[operation](prNumber);

  await octokit.rest.issues.update({
    issue_number: issueNumber,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    body: formatIssueBody(issueBody),
  });
}

if (previousIssueNumber) {
  await updateLinkedPrs(previousIssueNumber, pr.number, 'delete');
}

if (issueNumber) {
  await updateLinkedPrs(issueNumber, pr.number, 'add');
}
