'use strict';

const fs = require('fs');
const path = require('path');

const importers = require('../src/import');
const fixturesPath = path.join(__dirname, './fixtures');
const fixtures = fs.readdirSync(fixturesPath);


describe('Fixtures', () => {
  for (const name of fixtures) {
    it(`imports ${name}`, () => {
      const dir = path.join(fixturesPath, `./${name}`);

      const input = fs.readdirSync(dir).find(name => name.indexOf('input.') === 0);
      const output = fs.readdirSync(dir).find(name => name.indexOf('output.') === 0);

      expect(typeof input).toBe('string');
      expect(typeof output).toBe('string');

      const inputContents = fs.readFileSync(path.join(dir, input), 'utf8');
      const outputContents = fs.readFileSync(path.join(dir, output), 'utf8');

      expect(typeof inputContents).toBe('string');
      expect(typeof outputContents).toBe('string');

      const actual = importers.import(inputContents);
      const expected = JSON.parse(outputContents);

      expected.__export_date = actual.__export_date;

      expect(actual).toEqual(expected);
    })
  }
});
