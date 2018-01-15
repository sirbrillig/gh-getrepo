A cli tool to search for a github repository url

## Installation

```
npm install --global @sirbrillig/gh-getrepo
```


## Usage

The most common use is to search for repositories owned by a particular user or organization.

```
$ gh-getrepo --user=sirbrillig php
sirbrillig/spies https://github.com/sirbrillig/spies
sirbrillig/phpcs-variable-analysis https://github.com/sirbrillig/phpcs-variable-analysis
sirbrillig/phpunit-just-the-snaps https://github.com/sirbrillig/phpunit-just-the-snaps
```

Various output formats are available and can be activated by using the `--format` option.

- `default`: A newline-separated list in the format `NAME URL`.
- `json`: A JSON array of objects. Each object is of the form `{"name":"NAME","url":"URL"}`.
- `alfred`: A JSON array of data suitable for use by [Alfred Script Filters](https://www.alfredapp.com/help/workflows/inputs/script-filter/json/).

A full list of the available options is below.

```
Usage: gh-getrepo [options] <search-term>

Options:
  --version       Show version number                                  [boolean]
  --org           A org name to restrict the search                     [string]
  --user          A user name to restrict the search                    [string]
  --save-token    Prompt for a GitHub token                            [boolean]
  --delete-token  Delete any saved token                               [boolean]
  -h, --help      Show help                                            [boolean]
  -f, --format    Output format (default, json, alfred)                 [string]
```
