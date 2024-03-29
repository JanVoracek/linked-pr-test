import type github from "npm:@actions/github@6.0.0";
import { RequestError } from "npm:@octokit/request-error@5.0.1";
import { parseIssueBody, formatIssueBody } from "./issue-body-parser.ts";

type Octokit = ReturnType<typeof github.getOctokit>;
type Repo = typeof github.context.repo;

export class IssuePullRequestLinker {
  constructor(private octokit: Octokit, private repo: Repo) {}

  async updateLinkedPullRequestsForIssue(
    issueNumber: number,
    prNumber: number,
    operation: "add" | "delete"
  ) {
    try {
      const response = await this.octokit.rest.issues.get({
        issue_number: issueNumber,
        owner: this.repo.owner,
        repo: this.repo.repo,
      });

      const issueBody = parseIssueBody(response.data.body ?? "");
      const lastModified = response.headers["last-modified"];

      issueBody.linkedPrs[operation](prNumber);

      await this.octokit.rest.issues.update({
        issue_number: issueNumber,
        owner: this.repo.owner,
        repo: this.repo.repo,
        headers: {
          "If-Unmodified-Since": lastModified,
        },
        body: formatIssueBody(issueBody),
      });
    } catch (error) {
      console.error(error);
      if (error instanceof RequestError) {
        console.error(error.response);
      }
      throw error;
    }
  }
}
