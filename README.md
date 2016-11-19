# Insomnia Importers [![](https://api.travis-ci.org/getinsomnia/importers.svg?branch=master)](https://travis-ci.org/getinsomnia/importers)

This repository contains converters to translate exports into Insomnia 
import format.

Supported Formats:

- Postman v2
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
