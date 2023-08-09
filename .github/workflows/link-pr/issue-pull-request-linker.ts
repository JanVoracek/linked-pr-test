import { stripIndent } from 'common-tags';
import type github from '@actions/github';
import { retry, handleWhen } from 'cockatiel';
import { RequestError } from '@octokit/request-error';

export type IssueBody = { description: string; linkedPrs: Set<number> };

type Octokit = ReturnType<typeof github.getOctokit>;
type Repo = typeof github.context.repo;

const linkedPrsHeader = stripIndent`
    <!-- Do not edit manually after this comment -->
    ---

    **Linked PRs:**
`.replaceAll('\n', '\r\n');

const retryPolicy = retry(
  handleWhen(e => e instanceof RequestError),
  { maxAttempts: 3 }
);

export class IssuePullRequestLinker {
  constructor(private octokit: Octokit, private repo: Repo) {}

  async updateLinkedPullRequestsForIssue(issueNumber: number, prNumber: number, operation: 'add' | 'delete') {
    await retryPolicy.execute(async () => {
      const response = await this.octokit.rest.issues.get({
        issue_number: issueNumber,
        owner: this.repo.owner,
        repo: this.repo.repo,
      });

      const issueBody = parseIssueBody(response.data.body ?? '');
      const lastModified = response.headers['last-modified'];

      issueBody.linkedPrs[operation](prNumber);

      await this.octokit.rest.issues.update({
        issue_number: issueNumber,
        owner: this.repo.owner,
        repo: this.repo.repo,
        headers: {
          'If-Unmodified-Since': lastModified,
        },
        body: formatIssueBody(issueBody),
      });
    });
  }
}

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

  if (sortedPrs.length === 0) {
    return issue.description;
  }

  return `${issue.description}\r\n\r\n${linkedPrsHeader}\r\n\r\n${linkedPrs}`;
}
