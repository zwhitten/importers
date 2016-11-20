'use strict';

const {parse} = require('shell-quote');

let requestCount = 1;

module.exports.id = 'curl';
module.exports.name = 'cURL';
module.exports.description = 'cURL command line tool';

module.exports.import = function (rawData) {
  requestCount = 1;

  if (!rawData.match(/^\s*curl /)) {
    return null;
  }

  const requests = [];

  // Parse the whole thing into one big tokenized list
  const allArgs = parse(rawData);

  // ~~~~~~~~~~~~~~~~~~~~~~ //
  // Aggregate the commands //
  // ~~~~~~~~~~~~~~~~~~~~~~ //

  const commands = [];

  let currentCommand = [];
  for (const arg of allArgs) {
    if (typeof arg === 'object' && arg.op === ';') {
      commands.push(currentCommand);
      currentCommand = [];
    } else {
      currentCommand.push(arg);
    }
  }

  // Push the last unfinished command
  commands.push(currentCommand);

  for (const args of commands) {
    if (args[0] !== 'curl') {
      continue;
    }

    requests.push(importArgs(args));
  }

  return requests;
};

function importArgs (args) {

  // ~~~~~~~~~~~~~~~~~~~~~ //
  // Collect all the flags //
  // ~~~~~~~~~~~~~~~~~~~~~ //

  const pairs = {};
  const singletons = [];

  // Start at 1 so we can skip the ^curl part
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.match(/^-{1,2}[\w\-]+/)) {
      const name = arg.replace(/^-{1,2}/, '').toLowerCase();
      const value = args[i + 1];

      if (!pairs[name]) {
        pairs[name] = [value];
      } else {
        pairs[name].push(value);
      }

      i++; // Skip next one
    } else if (arg) {
      singletons.push(arg);
    }
  }

  // ~~~~~~~~~~~~~~~~~ //
  // Build the request //
  // ~~~~~~~~~~~~~~~~~ //

  // Basic properties
  const url = getPairValue(pairs, singletons[0] || '', 'url');
  const body = getPairValue(pairs, '', 'd', 'data', 'data-binary', 'data-ascii');

  // Authentication
  const [username, password] = getPairValue(pairs, '', 'u', 'user').split(':');
  const authentication = username ? {username, password} : {};

  // Cookies
  const cookieHeaders = [
    ...(pairs.cookie || []),
    ...(pairs.b || [])
  ].map(str => {
    const name = str.split('=', 1)[0];
    const value = str.replace(`${name}=`, '');
    return `Cookie: ${name}=${value}`;
  });

  // Headers
  const headers = [
    ...(pairs.header || []),
    ...(pairs.h || []),
    ...cookieHeaders
  ].map(str => {
    const [name, value] = str.split(/\s*:\s*/);
    return {name, value};
  });

  // Method
  let method = getPairValue(pairs, '__UNSET__', 'x', 'request').toUpperCase();
  if (method === '__UNSET__') {
    // Method is optional in cURL. It will default to POST if there is a body
    method = body.length ? 'POST' : 'GET';
  }

  const count = requestCount++;
  return {
    _id: `__REQ_${count}__`,
    _type: 'request',
    parentId: '__WORKSPACE_ID__',
    name: url || `cURL Import ${count}`,
    url,
    method,
    headers,
    authentication,
    body,
  };
}

function getPairValue (pairs, defaultValue, ...names) {
  for (const name of names) {
    if (pairs[name] && pairs[name].length) {
      return pairs[name][0];
    }
  }
  return defaultValue;
}
