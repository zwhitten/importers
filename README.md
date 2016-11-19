# Insomnia Importers

[![npm version](https://badge.fury.io/js/insomnia-importers.svg)](https://badge.fury.io/js/insomnia-importers)
[![license](https://img.shields.io/github/license/getinsomnia/importers.svg)]()
[![TravisCI](https://api.travis-ci.org/getinsomnia/importers.svg?branch=master)](https://travis-ci.org/getinsomnia/importers)
[![Coverage Status](https://coveralls.io/repos/github/getinsomnia/importers/badge.svg?branch=master)](https://coveralls.io/github/getinsomnia/importers?branch=master)

This repository contains converters to translate exports into Insomnia 
import format.

Simply feed a data file to it and it will try to convert it to Insomnia v2 export format.

## Supported Formats

These are the currently supported import formats.

- Insomnia v1
- Postman v2
- cURL
- HTTP Archive Format 1.2 (HAR)

## Command Line Usage

```shell
npm install -g insomnia-importers

insomnia-import /path/to/file > output.json
```

## Node Usage

```javascript
const importers = require('insomnia-importers')

const output = importers.import('...');
console.log(JSON.stringify(output, null, 2));
```
