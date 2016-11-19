
module.exports.setDefaults = function (obj) {
  if (!obj || !obj._type) {
    return obj;
  } else if (obj._type === 'request') {
    return module.exports.setDefaultsRequest(obj);
  } else if (obj._type === 'request_group') {
    return module.exports.setDefaultsRequestGroup(obj);
  }
};

module.exports.setDefaultsRequest = function (request) {
  request.method = (request.method || 'GET').toUpperCase();
  return Object.assign({
    name: '',
    url: '',
    body: '',
    method: 'GET',
    parameters: [],
    headers: [],
    cookies: [],
    authentication: {},
  }, request)
};

module.exports.setDefaultsRequestGroup = function (requestGroup) {
  return Object.assign({
    name: '',
    environment: {},
  }, requestGroup)
};

module.exports.getDateString = function () {
  return new Date().toISOString();
};
