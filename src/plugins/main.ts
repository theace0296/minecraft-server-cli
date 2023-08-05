/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable import/no-extraneous-dependencies */
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { URLSearchParams } from 'node:url';
import inquirer from 'inquirer';
import AdmZip, { IZipEntry } from 'adm-zip';
import YAML from 'yaml';
import type { MainFlags, Config, MainInstance } from '../main';
import { FetchError } from '../paper/utilities';

type PluginYaml = {
  name: string;
  main: string;
  version: string;
  author?: string;
  authors?: string[];
};

type SpigetResourceData = {
  external: boolean;
  file: {
    type: string;
    size: number;
    sizeUnit: string;
    url: string;
    externalUrl: string;
  };
  testedVersions: string[];
  name: string;
  author: {
    id: number;
  };
  version: {
    id: number;
    uuid: string;
  };
  updateDate: number;
  premium: boolean;
  sourceCodeLink: string;
  id: number;
};

type SpigetAuthorData = {
  name: string;
  id: number;
};

type PluginData = {
  name: string;
  authors: string[];
  file: string;
  spigot_id?: number;
  bukkit_id?: number;
  github_repo?: string;
};

const getEntryData = (entry: IZipEntry) =>
  new Promise<Buffer>((res, rej) => {
    entry.getDataAsync((data, err) => (err ? rej(err) : res(data)));
  });

export default async function Plugins(
  this: MainInstance,
  flags: MainFlags,
  updateConfig: (newConfig: Config | ((newConfig: Config) => Config)) => void,
) {
  const { interactive, updatePlugins, serverDirectory, version } = flags;
  if (!updatePlugins) return null;

  const pluginsDirectory = path.resolve(serverDirectory, 'plugins');
  if (!fs.existsSync(pluginsDirectory)) return null;
  const pluginInfoArray = await Promise.all(
    (await fs.promises.readdir(pluginsDirectory)).map(async (file): Promise<PluginData | null> => {
      const ext = path.extname(file);
      if (ext !== '.jar') return null;
      let pluginData: PluginYaml;
      try {
        const zip = new AdmZip(path.resolve(pluginsDirectory, file), { fs });
        const pluginYaml = zip.getEntry('plugin.yml');
        if (pluginYaml === null || pluginYaml.isDirectory) return null;
        const contents = await getEntryData(pluginYaml);
        pluginData = YAML.parse(contents.toString());
        if (!pluginData.name) throw new Error('Failed to parse plugin name!');
      } catch (error) {
        this.logToStderr(`Failed to get plugin metadata for ${file}`, error);
        return null;
      }

      const info: PluginData = {
        name: pluginData.name,
        authors: pluginData.author ? [pluginData.author] : pluginData.authors ?? [],
        file,
        spigot_id: -1,
        bukkit_id: -1,
        github_repo: '',
      };

      if (!info.authors.length) {
        this.logToStderr(`Authors did not exist for plugin: ${info.name}, please enter data manually!`);
        return info;
      }

      const resourceResponse = await fetch(
        `https://api.spiget.org/v2/search/resources/${encodeURIComponent(info.name)}?${new URLSearchParams({
          field: 'name',
          size: '1',
          page: '0',
          fields: 'id,name,author,file,testedVersions,updateDate,external,premium,version,sourceCodeLink',
        })}`,
      );
      if (!resourceResponse.ok) throw new FetchError(resourceResponse);
      const resource = (await resourceResponse.json()) as SpigetResourceData;

      if (!resource.name.toLowerCase().includes(info.name.toLowerCase())) {
        this.logToStderr(`Failed to find matching plugin, please enter data manually!`);
        return info;
      }

      const authorResponse = await fetch(`https://api.spiget.org/v2/authors/${resource.author.id}`);
      if (!authorResponse.ok) throw new FetchError(authorResponse);
      const author = (await authorResponse.json()) as SpigetAuthorData;

      if (!info.authors.some(a => a.toLowerCase() === author.name.toLowerCase())) {
        this.logToStderr(`Failed to find matching plugin, please enter data manually!`);
        return info;
      }

      info.spigot_id = resource.id;
      if (resource.external) {
        // TODO add support for external downloads
      }

      return info;
    }),
  );
}
