#! /usr/bin/env node
const githubSearchRepos = require('github-search-repos')
const chalk = require('chalk')
const yargs = require('yargs')
const options = yargs
  .alias('h', 'help')
  .usage('Usage: $0 [options] <search-term>')
  .alias('f', 'format')
  .describe('format', 'Output format (default, json)')
  .string('format')
  .describe('org', 'A org name to restrict the search')
  .string('org')
  .describe('user', 'A user name to restrict the search')
  .string('user')
  .describe('save-token', 'Prompt for a GitHub token')
  .boolean('save-token')
  .describe('delete-token', 'Delete any saved token')
  .boolean('delete-token')
  .argv

const searchString = options._
const searchAdditions = [
  options.user ? 'user:' + options.user : '',
  options.org ? 'org:' + options.org : ''
]
const outputFormat = options.format || 'default'
const inquirer = require('inquirer')
const Conf = require('conf')

const config = new Conf()

// ------

function getItemData (item) {
  const { full_name: name, html_url: url } = item
  return { name, url }
}

function getItemString (item) {
  return `${chalk.blue(item.name)} ${item.url}`
}

function getItemsForAlfred (items) {
  return items.map(item => {
    return {
      uid: item.url,
      title: item.name,
      subtitle: item.url,
      arg: item.url,
      autocomplete: item.name,
      text: item.url
    }
  })
}

function outputItemsForFormat (items, format) {
  switch (format) {
    case 'alfred':
      return console.log(JSON.stringify({items: getItemsForAlfred(items)}))
    case 'json':
      return console.log(JSON.stringify(items))
    case 'default':
      return items.map(item => console.log(getItemString(item)))
  }
  console.error(`Unrecognized format '${format}'`)
  process.exit(1)
}

function getOutputter (format) {
  return items => outputItemsForFormat(items, format)
}

function buildSearchPreamble (additions) {
  return additions.join('+') + '+'
}

function performSearch ({ searchString, searchAdditions }) {
  if (searchString.length < 1) {
    console.error('No search string provided.')
    process.exit(1)
  }
  const searchPreamble = searchAdditions.length > 0 ? buildSearchPreamble(searchAdditions) : ''
  const fullSearchTerm = searchPreamble + searchString
  const outputData = getOutputter(outputFormat)
  const token = process.env.GH_GETREPO_TOKEN || config.get('token') || null
  const searchOptions = { token }
  githubSearchRepos(fullSearchTerm, searchOptions)
    .then(data => data.items.map(getItemData))
    .then(outputData)
}

// ------

if (options.deleteToken) {
  config.delete('token')
  console.error(chalk.yellow('The token has been deleted.'))
  process.exit(0)
} else if (options.saveToken) {
  console.error(chalk.yellow('Please Generate a token at https://github.com/settings/tokens'))
  inquirer.prompt({type: 'password', name: 'token', message: 'Enter the GitHub token:'})
    .then(input => config.set('token', input.token))
    .then(() => console.error(chalk.green('The token was saved! If you ever need to delete it, just use the --delete-token option.')))
    .then(() => process.exit(0))
} else {
  performSearch({searchString, searchAdditions})
}
