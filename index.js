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
  .argv

const searchString = options._
const searchAdditions = [
  options.user ? 'user:' + options.user : '',
  options.org ? 'org:' + options.org : ''
]
const outputFormat = options.format || 'default'

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

// ------

if (searchString.length < 1) {
  console.error('No search string provided.')
  process.exit(1)
}
const searchPreamble = searchAdditions.length > 0 ? buildSearchPreamble(searchAdditions) : ''
const fullSearchTerm = searchPreamble + searchString
const outputData = getOutputter(outputFormat)
githubSearchRepos(fullSearchTerm)
  .then(data => data.items.map(getItemData))
  .then(outputData)
