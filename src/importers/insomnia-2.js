'use strict';

const utils = require('../utils');

module.exports.id = 'insomnia-2';
module.exports.name = 'Insomnia v2';
module.exports.description = 'Insomnia 3.0 format. This just returns itself';

module.exports.import = function (rawData) {
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    return null;
  }

  if (data.__export_format !== 2) {
    // Bail early if it's not the legacy format
    return null;
  }

  return data.resources;
};

