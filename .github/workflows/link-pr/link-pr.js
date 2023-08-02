const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const eventPath = process.env.GITHUB_EVENT_PATH;
const prEvent = JSON.parse(fs.readFileSync(eventPath, 'utf8'));

console.log(prEvent);