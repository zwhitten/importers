const utils = require('./utils');

const importers = [
  require('./importers/insomnia-1'),
  require('./importers/insomnia-2'),
  require('./importers/insomnia-3'),
  require('./importers/postman'),
  require('./importers/postman-env'),
  require('./importers/har'),
  require('./importers/curl'),
];

module.exports.convert = function (contents) {
  for (const importer of importers) {
    const resources = importer.convert(contents);

    if (resources) {
      return {
        type: {
          id: importer.id,
          name: importer.name,
          description: importer.description
        },
        data: {
          _type: 'export',
          __export_format: 3,
          __export_date: utils.getDateString(),
          __export_source: 'insomnia.importers:v0.1.0',
          resources: resources.map(utils.setDefaults),
        }
      }
    }
  }

  throw new Error('No importers found for file');
};
