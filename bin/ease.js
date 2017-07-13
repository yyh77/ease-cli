#!/usr/bin/env node

const program = require('commander')

program
  .version(require('../package').version)
  .usage('<command> [options]')
  .command('init', 'generate a new project from template')
  .command('list', 'list available official templates')
  .command('serve', 'start a static server for an existing project')
  .parse(process.argv)
