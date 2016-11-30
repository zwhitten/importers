'use strict';

const importers = require('../src/import');

describe('Import errors', () => {
  it('fail to find importer', () => {
    const fn = () => importers.convert('foo');
    expect(fn).toThrowError('No importers found for file')
  })
});
