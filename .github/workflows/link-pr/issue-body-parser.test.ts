import { describe, it } from 'https://deno.land/std@0.216.0/testing/bdd.ts';
import { assertEquals } from 'https://deno.land/std@0.216.0/assert/mod.ts';
import { IssueBody, formatIssueBody, parseIssueBody } from './issue-body-parser.ts';
import { stripIndent } from 'npm:common-tags@1.8.2';

export const issueDescription = (str: string) => stripIndent(str).replaceAll('\n', '\r\n');

describe('parseIssueBody', () => {
  it('issue without description', () => {
    const description = '';
    assertEquals(parseIssueBody(description), {
      description: { before: '', after: '' },
      linkedPrs: new Set(),
    });
  });

  it('issue without linked PRs', () => {
    const description = issueDescription(`
      Some multiline
      description`);

    assertEquals(parseIssueBody(description), {
      description: { before: description, after: '' },
      linkedPrs: new Set(),
    });
  });

  it('issue with single linked PR', () => {
    const description = issueDescription(`
      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      \`\`\``);

    assertEquals(parseIssueBody(description), {
      description: { before: '', after: '' },
      linkedPrs: new Set([123]),
    });
  });

  it('issue with multiple linked PRs', () => {
    const description = issueDescription(`
      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      - [x] #246
      - [x] #369
      \`\`\``);

    assertEquals(parseIssueBody(description), {
      description: { before: '', after: '' },
      linkedPrs: new Set([123, 246, 369]),
    });
  });

  it('issue with description before linked PRs', () => {
    const description = issueDescription(`
      Some multiline
      description

      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      - [x] #246
      - [x] #369
      \`\`\``);

    assertEquals(parseIssueBody(description), {
      description: { before: 'Some multiline\r\ndescription', after: '' },
      linkedPrs: new Set([123, 246, 369]),
    });
  });

  it('issue with description after linked PRs', () => {
    const description = issueDescription(`
      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      - [x] #246
      - [x] #369
      \`\`\`

      Some multiline
      description`);

    assertEquals(parseIssueBody(description), {
      description: { before: '', after: 'Some multiline\r\ndescription' },
      linkedPrs: new Set([123, 246, 369]),
    });
  });

  it('issue with description before and after linked PRs', () => {
    const description = issueDescription(`
      Some multiline
      description

      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      - [x] #246
      - [x] #369
      \`\`\`

      Another multiline
      description`);

    assertEquals(parseIssueBody(description), {
      description: { before: 'Some multiline\r\ndescription', after: 'Another multiline\r\ndescription' },
      linkedPrs: new Set([123, 246, 369]),
    });
  });
});

describe('formatIssueBody', () => {
  it('issue without description', () => {
    const issueBody: IssueBody = {
      description: { before: '', after: '' },
      linkedPrs: new Set(),
    };
    assertEquals(formatIssueBody(issueBody), '');
  });

  it('issue without linked PRs', () => {
    const description = issueDescription(`
      Some multiline
      description`);
    const issueBody: IssueBody = {
      description: { before: description, after: '' },
      linkedPrs: new Set(),
    };

    assertEquals(formatIssueBody(issueBody), description);
  });

  it('issue with single linked PR', () => {
    const description = issueDescription(`
      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      \`\`\``);
    const issueBody: IssueBody = {
      description: { before: '', after: '' },
      linkedPrs: new Set([123]),
    };

    assertEquals(formatIssueBody(issueBody), description);
  });

  it('issue with multiple linked PRs', () => {
    const description = issueDescription(`
      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      - [ ] #246
      - [ ] #369
      \`\`\``);
    const issueBody: IssueBody = {
      description: { before: '', after: '' },
      linkedPrs: new Set([123, 246, 369]),
    };

    assertEquals(formatIssueBody(issueBody), description);
  });

  it('issue with description before linked PRs', () => {
    const description = issueDescription(`
      Some multiline
      description

      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      - [ ] #246
      - [ ] #369
      \`\`\``);
    const issueBody: IssueBody = {
      description: { before: 'Some multiline\r\ndescription', after: '' },
      linkedPrs: new Set([123, 246, 369]),
    };

    assertEquals(formatIssueBody(issueBody), description);
  });

  it('issue with description after linked PRs', () => {
    const description = issueDescription(`
      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      - [ ] #246
      - [ ] #369
      \`\`\`

      Some multiline
      description`);
    const issueBody: IssueBody = {
      description: { before: '', after: 'Some multiline\r\ndescription' },
      linkedPrs: new Set([123, 246, 369]),
    };

    assertEquals(formatIssueBody(issueBody), description);
  });

  it('issue with description before and after linked PRs', () => {
    const description = issueDescription(`
      Some multiline
      description

      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      - [ ] #246
      - [ ] #369
      \`\`\`

      Another multiline
      description`);
    const issueBody: IssueBody = {
      description: { before: 'Some multiline\r\ndescription', after: 'Another multiline\r\ndescription' },
      linkedPrs: new Set([123, 246, 369]),
    };

    assertEquals(formatIssueBody(issueBody), description);
  });
});
