import fs from 'node:fs';
import path from 'node:path';
import { Command, Flags, Interfaces } from '@oclif/core';
import Paper from './paper/main';

const baseConfig = {
  serverDirectory: process.cwd(),
  version: '1.20.1',
  paper: false,
  build: 'latest',
  serverJar: 'minecraft_server.jar',
};

export type Config = Partial<typeof baseConfig>;

const hasOwn = <O extends Record<PropertyKey, unknown>>(obj: O, key: PropertyKey): key is keyof O =>
  obj && Object.prototype.hasOwnProperty.call(obj, key);

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
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Main);

    const configFile = path.resolve(flags.serverDirectory, 'config.json');
    let userConfig: Config = {};
    if (fs.existsSync(configFile)) {
      userConfig = JSON.parse(await fs.promises.readFile(configFile, 'utf8'));
      for (const key in flags) {
        if (hasOwn(userConfig, key)) {
          (flags[key] as any) = userConfig[key];
        }
      }
    }

    const updateConfig = (newConfig: Config | ((newConfig: Config) => Config)) => {
      if (typeof newConfig === 'function') {
        userConfig = newConfig(userConfig);
      } else {
        userConfig = newConfig;
      }
    };

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
  }
}

export type MainFlags = Interfaces.InferredFlags<(typeof Main)['flags']>;
