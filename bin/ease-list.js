#!/usr/bin/env node

const logger = require('../lib/logger')
const request = require('request')
const chalk = require('chalk')

/**
 * Padding.
 */

console.log()
process.on('exit', function () {
  console.log()
})

/**
 * List repos.
 */

request({
  url: 'https://api.github.com/users/ease-templates/repos',
  headers: {
    'User-Agent': 'ease-cli'
  }
}, function (err, res, body) {
  if (err) logger.fatal(err)
  let requestBody = JSON.parse(body)
  if (Array.isArray(requestBody)) {
    console.log('  Available official templates:')
    console.log()
    requestBody.forEach(function (repo) {
      console.log(
        '  ' + chalk.yellow('★') +
        '  ' + chalk.blue(repo.name) +
        ' - ' + repo.description)
    })
  } else {
    console.error(requestBody.message)
  }
})
