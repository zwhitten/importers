'use strict';

const program = require('commander');
const path = require('path');
const importers = require('./importers');
const fs = require('fs');
const {version} = require('../package.json');

module.exports.go = function () {

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
  // Configure the arguments parsing //
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

  program
    .version(version, '-v, --version')
    .usage('[options] <input>')
    .option('-o, --output <path>', 'output directory')
    .parse(process.argv);

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
  // Set up the directory to work on //
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

  const inputPath = program.args[0];
  const outputPath = program.output || program.args[1];

  if (!inputPath) {
    console.log('Input path not specified');
    process.exit(1);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~ //
  // Convert the input file //
  // ~~~~~~~~~~~~~~~~~~~~~~ //

  const fullInputPath = path.resolve(inputPath);
  const fileContents = fs.readFileSync(fullInputPath);

  const result = importers.import(fileContents);
  const exportContents = JSON.stringify(result, null, 2);

  // ~~~~~~~~~~~~~~~~ //
  // Write the output //
  // ~~~~~~~~~~~~~~~~ //

  if (outputPath) {
    const fullOutputPath = path.resolve(outputPath);
    fs.writeFileSync(fullOutputPath, exportContents);
  } else {
    console.log(exportContents);
  }
};
