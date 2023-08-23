/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';
import { IssueBody, formatIssueBody, parseIssueBody } from './issue-body-parser';
import { stripIndent } from 'common-tags';

export const issueDescription = (str: string) => stripIndent(str).replaceAll('\n', '\r\n');

describe('parseIssueBody', () => {
  test('issue without description', () => {
    const description = '';
    expect(parseIssueBody(description)).toEqual({
      description: { before: '', after: '' },
      linkedPrs: new Set(),
    });
  });

  test('issue without linked PRs', () => {
    const description = issueDescription(`
      Some multiline
      description`);

    expect(parseIssueBody(description)).toEqual({
      description: { before: description, after: '' },
      linkedPrs: new Set(),
    });
  });

  test('issue with single linked PR', () => {
    const description = issueDescription(`
      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      \`\`\``);

    expect(parseIssueBody(description)).toEqual({
      description: { before: '', after: '' },
      linkedPrs: new Set([123]),
    });
  });

  test('issue with multiple linked PRs', () => {
    const description = issueDescription(`
      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      - [x] #246
      - [x] #369
      \`\`\``);

    expect(parseIssueBody(description)).toEqual({
      description: { before: '', after: '' },
      linkedPrs: new Set([123, 246, 369]),
    });
  });

  test('issue with description before linked PRs', () => {
    const description = issueDescription(`
      Some multiline
      description

      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      - [x] #246
      - [x] #369
      \`\`\``);

    expect(parseIssueBody(description)).toEqual({
      description: { before: 'Some multiline\r\ndescription', after: '' },
      linkedPrs: new Set([123, 246, 369]),
    });
  });

  test('issue with description after linked PRs', () => {
    const description = issueDescription(`
      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      - [x] #246
      - [x] #369
      \`\`\`

      Some multiline
      description`);

    expect(parseIssueBody(description)).toEqual({
      description: { before: '', after: 'Some multiline\r\ndescription' },
      linkedPrs: new Set([123, 246, 369]),
    });
  });

  test('issue with description before and after linked PRs', () => {
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

    expect(parseIssueBody(description)).toEqual({
      description: { before: 'Some multiline\r\ndescription', after: 'Another multiline\r\ndescription' },
      linkedPrs: new Set([123, 246, 369]),
    });
  });
});

describe('formatIssueBody', () => {
  test('issue without description', () => {
    const issueBody: IssueBody = {
      description: { before: '', after: '' },
      linkedPrs: new Set(),
    };
    expect(formatIssueBody(issueBody)).toEqual('');
  });

  test('issue without linked PRs', () => {
    const description = issueDescription(`
      Some multiline
      description`);
    const issueBody: IssueBody = {
      description: { before: description, after: '' },
      linkedPrs: new Set(),
    };

    expect(formatIssueBody(issueBody)).toEqual(description);
  });

  test('issue with single linked PR', () => {
    const description = issueDescription(`
      \`\`\`[tasklist]
      ### Linked PRs:
      - [ ] #123
      \`\`\``);
    const issueBody: IssueBody = {
      description: { before: '', after: '' },
      linkedPrs: new Set([123]),
    };

    expect(formatIssueBody(issueBody)).toEqual(description);
  });

  test('issue with multiple linked PRs', () => {
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

    expect(formatIssueBody(issueBody)).toEqual(description);
  });

  test('issue with description before linked PRs', () => {
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

    expect(formatIssueBody(issueBody)).toEqual(description);
  });

  test('issue with description after linked PRs', () => {
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

    expect(formatIssueBody(issueBody)).toEqual(description);
  });

  test('issue with description before and after linked PRs', () => {
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

    expect(formatIssueBody(issueBody)).toEqual(description);
  });
});
