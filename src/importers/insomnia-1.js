'use strict';

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

module.exports.convert = function (rawData) {
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
    const requestGroup = importRequestGroupItem(item, parentId);
    resources = [
      ...resources,
      requestGroup,
      ...item.requests.map(item => importRequestItem(item, requestGroup._id))
    ];
  }

  return resources;
}

function importRequestGroupItem (item, parentId) {
  let environment = {};
  if (item.environments && item.environments.base) {
    environment = item.environments.base;
  }

  const count = requestGroupCount++;
  return {
    _type: 'request_group',
    _id: `__GRP_${count}__`,
    parentId,
    environment,
    name: item.name || `Imported Folder ${count}`,
  }
}

function importRequestItem (item, parentId) {
  let authentication = {};
  if (item.authentication) {
    authentication.username = item.authentication.username;
    authentication.password = item.authentication.password;
  }

  const headers = item.headers || [];
  if (item.__insomnia && item.__insomnia.format) {
    const contentType = FORMAT_MAP[item.__insomnia.format];
    headers.push({name: 'Content-Type', value: contentType});
  }

  const count = requestCount++;
  return {
    _type: 'request',
    _id: `__REQ_${count}__`,
    parentId,
    name: item.name || `Imported HAR ${count}`,
    url: item.url || '',
    method: item.method || 'GET',
    body: {text: item.body || ''},
    parameters: item.params || [],
    headers,
    authentication,
  }
}
