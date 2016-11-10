
const harImport = require('../importers/har');

describe('import()', () => {
    it('handles basic case', () => {
        const har = {
            log: {
                entries: [{
                    request: {
                        url: 'https://insomnia.rest'
                    }
                }]
            }
        };

        const expected = [{
            url: 'https://insomnia.rest'
        }];

        expect(harImport(har)).toEqual(expected);
    });
});
