#!/usr/bin/env node

const program = require('commander')
const express = require('express')
const chalk = require('chalk')
const exists = require('fs').existsSync
const { resolve, relative } = require('path')
const tildify = require('tildify')

program
  .usage('[project-name]')
  .option('-p, --port <n>', 'server port', parseInt, 8888)
  .option('-i, --index <html>', 'index html', h => h, 'index.html')
  .parse(process.argv)

const rawName = program.args[0] || '.'
const index = program.index
const destHtml = resolve(rawName, index)
const projectDir = resolve(rawName)
const projectName = relative('../', projectDir)

process.on('exit', function () {
  console.log()
})

if (exists(destHtml)) {
  serve()
} else {
  console.log(`
  ${chalk.red('error:')} ${destHtml} not found.
  `)
  process.exit(0)
}

function serve () {
  const app = express()
  const port = program.port

  app.use(express.static(rawName, { index }))
  app.use(function (err, req, res, next) {
    if (err) throw err
    next()
  })

  console.log('> Starting server...')
  app.listen(port, '0.0.0.0', function (err) {
    if (err) {
      throw err
    }
    console.log()
    console.log(
      `> Serving project ${chalk.blue(projectName)}(${tildify(projectDir)})`
    )
    console.log(`> Listening at http://localhost:${chalk.green(port)}`)
  })
}
