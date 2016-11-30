'use strict';

module.exports.id = 'postman';
module.exports.name = 'Postman';
module.exports.description = 'Importer for Postman exports';

let requestCount = 1;
let requestGroupCount = 1;

module.exports.convert = function (rawData) {
  requestCount = 1;
  requestGroupCount = 1;

  try {
    const data = JSON.parse(rawData);
    return importCollection(data);
  } catch (e) {
    return null;
  }
};

function importCollection (collection) {
  return importItem(collection.item)
}

function importItem (items, parentId = '__WORKSPACE_ID__') {
  let resources = [];

  for (const item of items) {
    if (item.hasOwnProperty('request')) {
      resources = [
        ...resources,
        importRequestItem(item, parentId)
      ];
    } else {
      const requestGroup = importFolderItem(item, parentId);
      resources = [
        ...resources,
        requestGroup,
        ...importItem(item.item, requestGroup._id)
      ];
    }
  }

  return resources;
}

function importFolderItem (item, parentId) {
  return {
    parentId,
    _id: `__GRP_${requestGroupCount++}__`,
    _type: `request_group`,
    name: item.name,
  }
}

function importRequestItem (item, parentId) {
  const {request} = item;
  return {
    parentId,
    _id: `__REQ_${requestCount++}__`,
    _type: 'request',
    name: item.name || '',
    url: request.url || '',
    method: request.method || 'GET',
    headers: mapImporter(request.header, importHeader),
    body: importBody(request.body),
  }
}

function importHeader (header) {
  return Object.assign({
    name: header.key,
    value: header.value,
  })
}

function importBody (body) {
  if (!body) {
    return {};
  } else if (body.mode === 'raw') {
    return importBodyRaw(body.raw)
  } else if (body.mode === 'urlencoded') {
    return importBodyFormUrlEncoded(body.urlencoded)
  } else if (body.mode === 'formdata') {
    // TODO: Handle this as properly as multipart/form-data
    return importBodyFormdata(body.formdata)
  } else {
    return {};
  }
}

function importBodyFormdata (formdata) {
  const params = formdata.map(({key, value, type, enabled}) => ({
    value,
    type,
    name: key,
    disabled: !enabled,
  }));

  return {
    params,
    mimeType: 'multipart/form-data',
  }
}

function importBodyFormUrlEncoded (urlEncoded) {
  const params = urlEncoded.map(({key, value, enabled}) => ({
    value,
    name: key,
    disabled: !enabled
  }));

  return {
    params,
    mimeType: 'application/x-www-form-urlencoded',
  }
}

function importBodyRaw (raw) {
  return {
    text: raw
  };
}

function mapImporter (arr, importFn) {
  if (!arr) {
    return [];
  } else {
    return arr.map(importFn)
  }
}
