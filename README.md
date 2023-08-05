<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g minecraft-server-cli
$ minecraft-server-cli COMMAND
running command...
$ minecraft-server-cli (--version)
minecraft-server-cli/0.0.0 win32-x64 node-v18.16.0
$ minecraft-server-cli --help [COMMAND]
USAGE
  $ minecraft-server-cli COMMAND
...
```
<!-- usagestop -->

<!-- usagestop -->
# Commands
<!-- commands -->
* [`minecraft-server-cli`](#minecraft-server-cli)
* [`minecraft-server-cli help [COMMANDS]`](#minecraft-server-cli-help-commands)
* [`minecraft-server-cli plugins`](#minecraft-server-cli-plugins)
* [`minecraft-server-cli plugins:install PLUGIN...`](#minecraft-server-cli-pluginsinstall-plugin)
* [`minecraft-server-cli plugins:inspect PLUGIN...`](#minecraft-server-cli-pluginsinspect-plugin)
* [`minecraft-server-cli plugins:install PLUGIN...`](#minecraft-server-cli-pluginsinstall-plugin-1)
* [`minecraft-server-cli plugins:link PLUGIN`](#minecraft-server-cli-pluginslink-plugin)
* [`minecraft-server-cli plugins:uninstall PLUGIN...`](#minecraft-server-cli-pluginsuninstall-plugin)
* [`minecraft-server-cli plugins:uninstall PLUGIN...`](#minecraft-server-cli-pluginsuninstall-plugin-1)
* [`minecraft-server-cli plugins:uninstall PLUGIN...`](#minecraft-server-cli-pluginsuninstall-plugin-2)
* [`minecraft-server-cli plugins:update`](#minecraft-server-cli-pluginsupdate)

## `minecraft-server-cli`

Start minecraft server cli

```
USAGE
  $ minecraft-server-cli [-i] [-d <value>] [-w] [-v <value>] [-b <value> -p] [--updatePlugins ]

FLAGS
  -b, --build=<value>            [default: latest] Paper build to use
  -d, --serverDirectory=<value>  [default: D:\SOURCE\repos\minecraft-server-cli] Directory of the Minecraft Server
  -i, --[no-]interactive         Run in interactive mode
  -p, --paper                    Using Paper
  -v, --version=<value>          [default: 1.20.1] Minecraft Version
  -w, --[no-]writeConfig         Update Minecraft Server CLI config file.
  --updatePlugins                Update plugins

DESCRIPTION
  Start minecraft server cli
```

_See code: [dist/main/index.ts](https://github.com/TheAce0296/minecraft-server-cli/blob/v0.0.0/dist/main/index.ts)_

## `minecraft-server-cli help [COMMANDS]`

Display help for minecraft-server-cli.

```
USAGE
  $ minecraft-server-cli help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for minecraft-server-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.15/src/commands/help.ts)_

## `minecraft-server-cli plugins`

List installed plugins.

```
USAGE
  $ minecraft-server-cli plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ minecraft-server-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/index.ts)_

## `minecraft-server-cli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ minecraft-server-cli plugins:install PLUGIN...

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
  $ minecraft-server-cli plugins:add

EXAMPLES
  $ minecraft-server-cli plugins:install myplugin 

  $ minecraft-server-cli plugins:install https://github.com/someuser/someplugin

  $ minecraft-server-cli plugins:install someuser/someplugin
```

## `minecraft-server-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ minecraft-server-cli plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ minecraft-server-cli plugins:inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/inspect.ts)_

## `minecraft-server-cli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ minecraft-server-cli plugins:install PLUGIN...

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
  $ minecraft-server-cli plugins:add

EXAMPLES
  $ minecraft-server-cli plugins:install myplugin 

  $ minecraft-server-cli plugins:install https://github.com/someuser/someplugin

  $ minecraft-server-cli plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/install.ts)_

## `minecraft-server-cli plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ minecraft-server-cli plugins:link PLUGIN

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
  $ minecraft-server-cli plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/link.ts)_

## `minecraft-server-cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ minecraft-server-cli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ minecraft-server-cli plugins:unlink
  $ minecraft-server-cli plugins:remove
```

## `minecraft-server-cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ minecraft-server-cli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ minecraft-server-cli plugins:unlink
  $ minecraft-server-cli plugins:remove
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/uninstall.ts)_

## `minecraft-server-cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ minecraft-server-cli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ minecraft-server-cli plugins:unlink
  $ minecraft-server-cli plugins:remove
```

## `minecraft-server-cli plugins:update`

Update installed plugins.

```
USAGE
  $ minecraft-server-cli plugins:update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/update.ts)_
<!-- commandsstop -->

<!-- commandsstop -->
