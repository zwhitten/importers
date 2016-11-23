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
    const requests = extractRequests(data);
    return requests.map(importRequest);
  } catch (e) {
    return null;
  }
};

function importRequest (request) {
  const cookiesHeaders = mapImporter(request.cookies, importCookieToHeader);
  const regularHeaders = mapImporter(request.headers, importHeader);

  const id = requestCount++;

  return {
    _type: 'request',
    _id: `__REQ_${id}__`,
    name: request.comment || `HAR Request ${id}`,
    parentId: '__WORKSPACE_ID__',
    url: importUrl(request.url),
    method: importMethod(request.method),
    body: importPostData(request.postData),
    parameters: mapImporter(request.queryString, importQueryString),
    headers: [...regularHeaders, ...cookiesHeaders],

    // Authentication isn't part of HAR, but we should be able to
    // sniff for things like Basic Authentication headers and pull
    // out the auth info
    authentication: {},
  };
}

function importUrl (url) {
  return url;
}

function importMethod (method) {
  return method.toUpperCase();
}

function importCookieToHeader (obj) {
  return {
    name: 'Cookie',
    value: `${obj.name}=${obj.value}`
  };
}

function importHeader (obj) {
  return removeComment(obj);
}

function importQueryString (obj) {
  return removeComment(obj);
}

function importPostData (obj) {
  if (!obj) {
    return {};
  }

  if (obj.params && obj.params.length) {
    const params = obj.params.map(p => ({name: p.name, value: p.value}));
    return {
      params,
      mimeType: obj.mimeType || 'application/x-www-form-urlencoded'
    }
  } else {
    return {
      text: obj.text || ''
    };
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
  if (!log && harRoot.httpVersion && harRoot.method && harRoot.url) {
    // If there is not "log" property, try to use the root object
    // if it looks like a request
    requests.push(harRoot);
    return requests;
  }

  for (const entry of log.entries) {
    requests.push(entry.request);
  }

  return requests;
}
