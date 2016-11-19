'use strict';

const utils = require('../src/utils');

describe('setDefaults()', () => {
  it('should leave non-objects alone', () => {
    expect(utils.setDefaults(null)).toBe(null)
  });

  it('should leave unrecognized types alone', () => {
    const obj = {_type: 'weird'};
    expect(utils.setDefaults(obj)).toBe(obj)
  });

  it('should set correct request defaults', () => {
    expect(utils.setDefaults({_type: 'request'})).toEqual({
      _type: 'request',
      name: 'Imported',
      url: '',
      body: '',
      method: 'GET',
      parameters: [],
      headers: [],
      authentication: {},
    })
  });

  it('should set correct request_group defaults', () => {
    expect(utils.setDefaults({_type: 'request_group'})).toEqual({
      _type: 'request_group',
      name: 'Imported',
      environment: {},
    })
  });
});
