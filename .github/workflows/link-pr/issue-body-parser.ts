export type IssueBody = { description: { before: string; after: string }; linkedPrs: Set<number> };

// Workaround for '\n'.length === 2 in Bun, see https://github.com/oven-sh/bun/issues/4217
const lengthOf = (str: string) => new TextEncoder().encode(str).length;

const linkedPrsHeader = '```[tasklist]\r\n### Linked PRs:';
const linkedPrsFooter = '```';

// https://regex101.com/r/sEIKiE/1
const crlf = (str: string) => str.replaceAll(/(?<!\r)\n/g, '\r\n');

export function parseIssueBody(issueBody: string): IssueBody {
  const linkedPrsBlockBeginIndex = issueBody.lastIndexOf(linkedPrsHeader);

  if (linkedPrsBlockBeginIndex === -1) {
    return {
      description: { before: issueBody, after: '' },
      linkedPrs: new Set(),
    };
  }

  const linkedPrsListBeginIndex = linkedPrsBlockBeginIndex + lengthOf(linkedPrsHeader);
  const linkedPrsListEndIndex = linkedPrsListBeginIndex + issueBody.slice(linkedPrsListBeginIndex).indexOf('```');
  const linkedPrsBlockEndIndex = linkedPrsListEndIndex + lengthOf(linkedPrsFooter);

  const description = {
    before: issueBody.slice(0, linkedPrsBlockBeginIndex).trim(),
    after: issueBody.slice(linkedPrsBlockEndIndex).trim(),
  };

  const linkedPrsList = issueBody.slice(linkedPrsListBeginIndex, linkedPrsListEndIndex);

  // https://regex101.com/r/aMT3Qk/1
  const linkedPrs = [...linkedPrsList.matchAll(/^- \[[ x]\] #(\d+)/gm)].map(match => parseInt(match[1]!, 10));

  return {
    description,
    linkedPrs: new Set(linkedPrs),
  };
}

export function formatIssueBody(issue: IssueBody): string {
  const sortedPrs = [...issue.linkedPrs].sort((a, b) => a - b);
  const linkedPrs = sortedPrs.map(pr => `- [ ] #${pr}`);

  const issueParts = [
    issue.description.before,
    ...(linkedPrs.length === 0 ? [] : ['', linkedPrsHeader, ...linkedPrs, linkedPrsFooter, '']),
    issue.description.after,
  ];

  return crlf(issueParts.join('\n')).trim();
}
