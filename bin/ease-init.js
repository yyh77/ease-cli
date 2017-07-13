#!/usr/bin/env node

const program = require('commander')
const download = require('download-git-repo')
const chalk = require('chalk')
const exists = require('fs').existsSync
const path = require('path')
const inquirer = require('inquirer')
const ora = require('ora')
const rm = require('rimraf').sync
const home = require('user-home')
const tildify = require('tildify')
const logger = require('../lib/logger')
const generate = require('../lib/generate')
const { isLocalPath, getTemplatePath } = require('../lib/local-path')

program
  .usage('<template-name> [project-name]')
  .option('-c, --clone', 'use git clone')
  .option('--offline', 'use cached template')

program.on('--help', function () {
  console.log(`
  Examples:

    ${chalk.gray('# create a new project from an offical template')}
    $ ease init sdk my-project

    ${chalk.gray('# create a new project from a github template')}
    $ ease init username/repo my-project

  `)
})

function helpIfNeed () {
  program.parse(process.argv)
  if (program.args.length < 1) return program.help()
}
helpIfNeed()

let [ template, rawName ] = program.args
const hasSlash = template.indexOf('/') > -1
const inPlace = !rawName || rawName === '.'
const name = inPlace ? path.relative('../', process.cwd()) : path.relative('../', rawName)
const to = path.resolve(rawName || '.')
const clone = program.clone || false

let tmp = path.join(home, '.ease-templates', template.replace(/\//g, '-'))
if (program.offline) {
  console.log(`> Use cached template at ${chalk.yellow(tildify(tmp))}`)
  template = tmp
}

console.log()
process.on('exit', function () {
  console.log()
})

if (exists(to)) {
  inquirer.prompt([{
    type: 'confirm',
    message: inPlace
      ? 'Generate project in current directory?'
      : 'Target directory exists. Continue?',
    name: 'ok'
  }], function (answers) {
    if (answers.ok) {
      run()
    }
  })
} else {
  run()
}

/**
 * Check, download and generate the project.
 */

function run () {
  // check if template is local
  if (isLocalPath(template)) {
    let templatePath = getTemplatePath(template)
    if (exists(templatePath)) {
      generate(name, templatePath, to, function (err) {
        if (err) logger.fatal(err)
        console.log()
        logger.success('Generated "%s".', name)
      })
    } else {
      logger.fatal('Local template "%s" not found.', template)
    }
  } else {
    if (!hasSlash) {
      // use official templates
      let officialTemplate = 'ease-templates/' + template
      downloadAndGenerate(officialTemplate)
    } else {
      downloadAndGenerate(template)
    }
  }
}

/**
 * Download and generate from a template repo.
 *
 * @param {String} template
 */

function downloadAndGenerate (template) {
  const spinner = ora('downloading template')
  spinner.start()
  // Remove if local template exists
  if (exists(tmp)) rm(tmp)
  download(template, tmp, { clone }, function (err) {
    spinner.stop()
    if (err) logger.fatal('Failed to download repo ' + template + ': ' + err.message.trim())
    generate(name, tmp, to, function (err) {
      if (err) logger.fatal(err)
      console.log()
      logger.success('Generated "%s".', name)
    })
  })
}
