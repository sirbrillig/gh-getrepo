#! /usr/bin/env node
const githubSearchRepos = require('github-search-repos')
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
  return `${item.name} ${item.url}`
}

function getItemJson (item) {
  return JSON.stringify(item)
}

function formatItemForOutput (item, format) {
  switch (format) {
    case 'json':
      return getItemJson(item)
    case 'default':
      return getItemString(item)
  }
  console.error(`Unrecognized format '${format}'`)
  process.exit(1)
}

function getOutputter (format) {
  return item => console.log(formatItemForOutput(item, format))
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
const outputItem = getOutputter(outputFormat)
githubSearchRepos(fullSearchTerm)
  .then(data => data.items.map(getItemData))
  .then(items => items.map(outputItem))
