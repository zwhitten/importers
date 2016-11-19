'use strict';

const utils = require('../utils');

let requestCount = 1;
let requestGroupCount = 1;

const FORMAT_MAP = {
  json: 'application/json',
  xml: 'application/xml',
  form: 'application/x-www-form-urlencoded',
  text: 'text/plain'
};

module.exports.id = 'insomnia-1';
module.exports.name = 'Insomnia v1';
module.exports.description = 'Legacy Insomnia format';

module.exports.import = function (rawData) {
  requestCount = 1;
  requestGroupCount = 1;

  let data;
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    return null;
  }

  if (data.__export_format !== 1) {
    // Bail early if it's not the legacy format
    return null;
  }

  return importItems(data.items, '__WORKSPACE_ID__');
};

function importItems (items, parentId) {
  let resources = [];

  for (const item of items) {
    if (item._type === 'request') {
      resources.push(importRequestItem(item, parentId))
    } else if (item._type === 'request_group') {
      const requestGroup = importRequestGroupItem(item, parentId);
      resources = [
        ...resources,
        requestGroup,
        ...item.requests.map(item => importRequestItem(item, requestGroup._id))
      ];
    }
  }

  return resources;
}

function importRequestGroupItem (item, parentId) {
  let environment = {};
  if (item.environments && item.environments.base) {
    environment = item.environments.base;
  }

  return {
    _type: 'request_group',
    _id: `__GRP_${requestGroupCount++}__`,
    parentId,
    environment,
    name: item.name,
  }
}

function importRequestItem (item, parentId) {
  let authentication = {};
  if (item.authentication) {
    authentication.username = item.authentication.username;
    authentication.password = item.authentication.password;
  }

  const headers = item.headers;
  if (item.__insomnia && item.__insomnia.format) {
    const contentType = FORMAT_MAP[item.__insomnia.format];
    if (contentType) {
      headers.push({name: 'Content-Type', value: contentType});
    }
  }

  return {
    _type: 'request',
    _id: `__REQ_${requestCount++}__`,
    parentId,
    name: item.name,
    url: item.url,
    method: item.method,
    body: item.body,
    parameters: item.params,
    headers,
    authentication,
  }
}
