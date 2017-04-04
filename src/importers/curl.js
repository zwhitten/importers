'use strict';

const {parse} = require('shell-quote');

let requestCount = 1;

module.exports.id = 'curl';
module.exports.name = 'cURL';
module.exports.description = 'cURL command line tool';

module.exports.convert = function (rawData) {
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
    } else if (typeof arg === 'object') {
      // Not sure what this could be, so just skip it
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
      const name = arg.replace(/^-{1,2}/, '');

      let value;
      if (args[i + 1] && args[i + 1].indexOf('-') !== 0) {
        // Next arg is not a flag, so assign it as the value
        value = args[i + 1];
        i++; // Skip next one
      } else {
        value = true;
      }

      if (!pairs[name]) {
        pairs[name] = [value];
      } else {
        pairs[name].push(value);
      }
    } else if (arg) {
      singletons.push(arg);
    }
  }

  // ~~~~~~~~~~~~~~~~~ //
  // Build the request //
  // ~~~~~~~~~~~~~~~~~ //

  // Url
  const url = getPairValue(pairs, singletons[0] || '', 'url');

  // Authentication
  const [username, password] = getPairValue(pairs, '', 'u', 'user').split(':');
  const authentication = username ? {username, password} : {};

  // Headers
  const headers = [
    ...(pairs['header'] || []),
    ...(pairs['H'] || [])
  ].map(str => {
    const [name, value] = str.split(/\s*:\s*/);
    return {name, value};
  });

  // Cookies
  const cookieHeaderValue = [
    ...(pairs.cookie || []),
    ...(pairs.b || [])
  ].map(str => {
    const name = str.split('=', 1)[0];
    const value = str.replace(`${name}=`, '');
    return `${name}=${value}`;
  }).join('; ');

  // Convert cookie value to header
  const existingCookieHeader = headers.find(h => h.name.toLowerCase() === 'cookie');
  if (cookieHeaderValue && existingCookieHeader) {
    // Has existing cookie header, so let's update it
    existingCookieHeader.value += `; ${cookieHeaderValue}`;
  } else if (cookieHeaderValue) {
    // No existing cookie header, so let's make a new one
    headers.push({name: 'Cookie', value: cookieHeaderValue});
  }

  // Body (Text or Blob)
  const textBody = getPairValue(
    pairs, null, 'd', 'data', 'data-raw', 'data-urlencode', 'data-binary', 'data-ascii');
  const contentTypeHeader = headers.find(h => h.name.toLowerCase() === 'content-type');
  const mimeType = contentTypeHeader ? contentTypeHeader.value.split(';')[0] : null;

  // Body (Multipart Form Data)
  const formDataParams = [
    ...(pairs['form'] || []),
    ...(pairs['F'] || [])
  ].map(str => {
    const [name, value] = str.split('=');
    const item = {name};

    if (value.indexOf('@') === 0) {
      item.fileName = value.slice(1);
      item.type = 'file';
    } else {
      item.value = value;
      item.type = 'text';
    }
    return item;
  });

  // Body
  let body = mimeType ? {mimeType: mimeType} : {};
  if (textBody && mimeType === 'application/x-www-form-urlencoded') {
    body.params = textBody.split('&').map(v => {
      const [name, value] = v.split('=');
      return {name: name || '', value: value || ''};
    })
  } else if (textBody) {
    body.text = textBody;
  } else if (formDataParams.length) {
    body.params = formDataParams;
    body.mimeType = mimeType || 'multipart/form-data';
  }

  // Method
  let method = getPairValue(pairs, '__UNSET__', 'X', 'request').toUpperCase();
  if (method === '__UNSET__') {
    method = (body.text || body.params) ? 'POST' : 'GET';
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
