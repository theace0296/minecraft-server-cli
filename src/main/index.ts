import fs from 'node:fs';
import path from 'node:path';
import { Command, Flags, Interfaces } from '@oclif/core';
import Paper from '../paper/main';

const hasOwn = <O extends Record<PropertyKey, unknown>>(obj: O, key: PropertyKey): key is keyof O =>
  obj && Object.prototype.hasOwnProperty.call(obj, key);

const baseConfig = {
  serverDirectory: process.cwd(),
  version: '1.20.1',
  paper: false,
  build: 'latest',
  serverJar: 'minecraft_server.jar',
};

async function loadUserConfig(configFile: string, flags: MainFlags) {
  let userConfig: Config = {};
  if (fs.existsSync(configFile)) {
    userConfig = JSON.parse(await fs.promises.readFile(configFile, 'utf8'));
  }
  for (const key in flags) {
    if (flags.writeConfig && hasOwn(baseConfig, key) && hasOwn(flags, key)) {
      (userConfig[key] as any) = flags[key];
    } else if (hasOwn(userConfig, key) && hasOwn(flags, key)) {
      // eslint-disable-next-line no-param-reassign
      (flags[key] as any) = userConfig[key];
    }
  }

  const updateConfig = (newConfig: Config | ((newConfig: Config) => Config)) => {
    if (typeof newConfig === 'function') {
      userConfig = newConfig(userConfig);
    } else {
      userConfig = newConfig;
    }
  };
  const writeConfig = async () => {
    await fs.promises.writeFile(
      configFile,
      JSON.stringify(
        {
          ...userConfig,
          ...(userConfig.serverDirectory
            ? { serverDirectory: userConfig.serverDirectory.replace(/[\\/]+/g, '/') }
            : {}),
        },
        null,
        2,
      ),
      'utf8',
    );
  };
  return { updateConfig, writeConfig };
}

export type Config = Partial<typeof baseConfig>;
export type MainFlags = Interfaces.InferredFlags<(typeof Main)['flags']>;

export default class Main extends Command {
  static description = 'Start minecraft server cli';

  static flags = {
    interactive: Flags.boolean({
      char: 'i',
      description: 'Run in interactive mode',
      default: true,
      allowNo: true,
    }),
    serverDirectory: Flags.directory({
      char: 'd',
      description: 'Directory of the Minecraft Server',
      default: baseConfig.serverDirectory,
    }),
    version: Flags.string({
      char: 'v',
      description: 'Minecraft Version',
      default: baseConfig.version,
    }),
    paper: Flags.boolean({
      char: 'p',
      description: 'Using Paper',
      default: baseConfig.paper,
      allowNo: false,
    }),
    build: Flags.string({
      char: 'b',
      description: 'Paper build to use',
      default: baseConfig.build,
      dependsOn: ['paper'],
    }),
    writeConfig: Flags.boolean({
      char: 'w',
      description: 'Update Minecraft Server CLI config file.',
      default: true,
      allowNo: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Main);

    const configFile = path.resolve(flags.serverDirectory, 'minecraft-server-cli.json');
    const { updateConfig, writeConfig } = await loadUserConfig(configFile, flags);

    if (!flags.interactive) {
      this.log('Running in non-interactive mode...');
    }
    this.logJson(flags);
    if (flags.paper) {
      updateConfig(config => ({ ...config, paper: true }));
      const paperJar = await Paper(flags, updateConfig);
      if (paperJar) updateConfig(config => ({ ...config, serverJar: path.basename(paperJar) }));
    } else {
      updateConfig(config => ({ ...config, paper: false }));
    }

    if (flags.writeConfig) {
      await writeConfig();
    }
  }
}
