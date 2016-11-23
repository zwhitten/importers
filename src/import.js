const utils = require('./utils');

const importers = [
  require('./importers/insomnia-1'),
  require('./importers/insomnia-2'),
  require('./importers/postman'),
  require('./importers/har'),
  require('./importers/curl'),
];

module.exports.import = function (contents) {
  for (const importer of importers) {
    const resources = importer.import(contents);

    if (resources) {
      return {
        _type: 'export',
        __export_format: 3,
        __export_date: utils.getDateString(),
        __export_source: 'insomnia.importers:v0.1.0',
        resources: resources.map(utils.setDefaults),
      }
    }
  }

  throw new Error('No importers found for file');
};
