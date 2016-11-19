'use strict';

const utils = require('../utils');

let requestCount = 1;

module.exports.id = 'har';
module.exports.name = 'HAR 1.2';
module.exports.description = 'Importer for HTTP Archive 1.2';

module.exports.import = function (rawData) {
  requestCount = 1;

  let data;
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    return null;
  }

  const requests = extractRequests(data);
  if (!requests.length) {
    // Didn't find any, so it must not be HAR format
    return null;
  }

  return requests.map(importRequest);
};

function importRequest (request) {
  const id = requestCount++;
  return {
    _type: 'request',
    _id: `__REQ_${id}__`,
    name: request.comment || `HAR Request ${id}`,
    parentId: '__WORKSPACE_ID__',
    url: importUrl(request.url),
    method: importMethod(request.method),
    body: importPostData(request.postData),
    cookies: mapImporter(request.cookies, importCookie),
    headers: mapImporter(request.headers, importHeader),
    parameters: mapImporter(request.queryString, importQueryString),

    // Authentication isn't part of HAR, but we should be able to
    // sniff for things like Basic Authentication headers and pull
    // out the auth info
    authentication: {},
  };
}

function importUrl (url) {
  if (!url) {
    return '';
  } else {
    return url;
  }
}

function importMethod (method) {
  if (!method) {
    method = 'GET';
  }

  return method.toUpperCase();
}

function importCookie (obj) {
  return removeComment(obj);
}

function importHeader (obj) {
  return removeComment(obj);
}

function importQueryString (obj) {
  return removeComment(obj || {});
}

function importPostData (obj) {
  if (!obj) {
    return '';
  } else if (obj.params && obj.params.length) {
    return obj.params.map(({name, value}) => (
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
    )).join('&')
  } else if (obj.text) {
    return obj.text;
  } else {
    return '';
  }
}

function removeComment (obj) {
  const newObj = Object.assign({}, obj);
  delete newObj['comment'];
  return newObj;
}

function mapImporter (arr, importFn) {
  if (!arr) {
    return [];
  } else {
    return arr.map(importFn)
  }
}

function extractRequests (harRoot) {
  const requests = [];

  const log = harRoot.log;
  if (!log && harRoot.method && harRoot.url) {
    // If there is not "log" property, try to use the root object
    // if it looks like a request
    requests.push(harRoot);
    return requests;
  }

  if (!log) {
    return requests;
  }

  const entries = log.entries;
  if (!entries) {
    throw new Error('Missing "entries" property of "log"')
  }

  for (const entry of entries) {
    const request = entry.request;

    if (!request) {
      throw new Error('Missing "request" property in of "entries"')
    }

    requests.push(request);
  }

  return requests;
}
