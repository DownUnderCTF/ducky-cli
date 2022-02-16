# ducky-cli

A helper tool for DownunderCTF challenge creation and management.

<!-- toc -->
* [ducky-cli](#ducky-cli)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage
<!-- usage -->
```sh-session
$ npm install -g ducky-cli
$ ducky COMMAND
running command...
$ ducky (--version)
ducky-cli/0.0.0 linux-x64 node-v17.3.0
$ ducky --help [COMMAND]
USAGE
  $ ducky COMMAND
...
```
<!-- usagestop -->

# Commands
<!-- commands -->
* [`ducky challenge init`](#ducky-challenge-init)
* [`ducky help [COMMAND]`](#ducky-help-command)
* [`ducky plugins`](#ducky-plugins)
* [`ducky plugins:inspect PLUGIN...`](#ducky-pluginsinspect-plugin)
* [`ducky plugins:install PLUGIN...`](#ducky-pluginsinstall-plugin)
* [`ducky plugins:link PLUGIN`](#ducky-pluginslink-plugin)
* [`ducky plugins:uninstall PLUGIN...`](#ducky-pluginsuninstall-plugin)
* [`ducky plugins update`](#ducky-plugins-update)

## `ducky challenge init`

Bootstrap and initialize a challenge

```
USAGE
  $ ducky challenge init [-c cloud|crypto|forensics|misc|osint|pwn|rev|web] [-n <value>] [-a <value>] [-d
    easy|medium|hard] [-t none|tcp|http] [-D <value>] [-T <value>]

FLAGS
  -D, --dir=<value>                                               [default: /home/ubuntu/contrib/ducky-cli/] Root
                                                                  challenge repository directory
  -T, --template=<value>                                          [default: /home/ubuntu/contrib/ducky-cli/.template]
                                                                  Directory to use as a template
  -a, --author=<value>                                            [default: anonymous] Handle or name of challenge
                                                                  author
  -c, --category=(cloud|crypto|forensics|misc|osint|pwn|rev|web)  Challenge category
  -d, --difficulty=(easy|medium|hard)                             Challenge difficulty
  -n, --name=<value>                                              Challenge name
  -t, --type=(none|tcp|http)                                      [default: http] Type of hosting required (none -
                                                                  description only, tcp, http)

DESCRIPTION
  Bootstrap and initialize a challenge
```

## `ducky help [COMMAND]`

Display help for ducky.

```
USAGE
  $ ducky help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for ducky.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.9/src/commands/help.ts)_

## `ducky plugins`

List installed plugins.

```
USAGE
  $ ducky plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ ducky plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `ducky plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ ducky plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ ducky plugins:inspect myplugin
```

## `ducky plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ ducky plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ ducky plugins add

EXAMPLES
  $ ducky plugins:install myplugin 

  $ ducky plugins:install https://github.com/someuser/someplugin

  $ ducky plugins:install someuser/someplugin
```

## `ducky plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ ducky plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ ducky plugins:link myplugin
```

## `ducky plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ ducky plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ducky plugins unlink
  $ ducky plugins remove
```

## `ducky plugins update`

Update installed plugins.

```
USAGE
  $ ducky plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
