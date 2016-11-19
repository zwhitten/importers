'use strict';

const importers = require('../src/import');

describe('Import errors', () => {
  it('fail to find importer', () => {
    expect(() => importers.import('foo')).toThrowError('No importers found for file')
  })
});
