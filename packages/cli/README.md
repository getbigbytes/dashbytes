## Clairdash CLI

Lightash CLI tool

## How to install

`npm i -g @clairdash/cli`

## Usage

```
Usage: clairdash [options] [command]

Options:
  -h, --help      display help for command

Commands:
  version         output the version number
  [dbt_command]   runs dbt
  help [command]  display help for command
```

eg: `ligthdash test` Runs `dbt test`

## Development

First build the package

```shell
yarn cli-build
```

Then run the cli commands with `node` and pointing to the `dist/index.js` file

### Examples from clairdash root folder

Clairdash login

```
node ./packages/cli/dist/index.js login http://localhost:3000
```

Dbt compile

```
dbt compile --project-dir ./examples/full-jaffle-shop-demo/dbt --profiles-dir ./examples/full-jaffle-shop-demo/profiles
```

Clairdash generate

```
node ./packages/cli/dist/index.js generate --project-dir ./examples/full-jaffle-shop-demo/dbt --profiles-dir ./examples/full-jaffle-shop-demo/profiles
```

Clairdash preview

```
node ./packages/cli/dist/index.js preview --project-dir ./examples/full-jaffle-shop-demo/dbt --profiles-dir ./examples/full-jaffle-shop-demo/profiles
```

Clairdash run

```
node ./packages/cli/dist/index.js dbt run --project-dir ./examples/full-jaffle-shop-demo/dbt --profiles-dir ./examples/full-jaffle-shop-demo/profiles -s
```

### Testing different dbt versions

If you want to test different dbt versions, you can replace the string `dbt` in the "execa" calls in the package with `dbt${YOUR_VERSION}`, eg: `dbt1.8`.
