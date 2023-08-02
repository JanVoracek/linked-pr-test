import core from '@actions/core';
import github from '@actions/github';
import fs from 'fs';

const eventPath = process.env.GITHUB_EVENT_PATH;
const prEvent = JSON.parse(fs.readFileSync(eventPath, 'utf8'));

console.log(prEvent);
