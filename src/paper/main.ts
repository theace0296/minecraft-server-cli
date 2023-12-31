import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import inquirer from 'inquirer';
import { getPaperMCVersions, getPaperBuildsForVersion, downloadPaperBuild } from './utilities';
import type { MainFlags, Config, MainInstance } from '../main';

export default async function Paper(
  this: MainInstance,
  flags: MainFlags,
  updateConfig: (newConfig: Config | ((newConfig: Config) => Config)) => void,
) {
  let { version, build } = flags;
  const { interactive, paper, serverDirectory } = flags;
  if (!paper) return null;

  if (!version) {
    const paperMcVersions = await getPaperMCVersions.call(this);
    if (interactive) {
      const responses = await inquirer.prompt([
        {
          name: 'version',
          message: 'Select a Minecraft version',
          type: 'list',
          choices: paperMcVersions,
        },
      ]);
      version = responses.version;
    } else {
      version = paperMcVersions[0];
    }
    updateConfig(config => ({ ...config, version }));
  }
  if (build === 'latest') {
    const paperBuilds = await getPaperBuildsForVersion.call(this, version);
    build = paperBuilds[0].toString();
    updateConfig(config => ({ ...config, build }));
  }

  this.log('Checking for updates to Paper...');
  const downloadDirectory = path.resolve(serverDirectory, randomBytes(6).toString('hex'));
  const paperJarFile = await downloadPaperBuild.call(this, version, build, serverDirectory, downloadDirectory);

  // Move downloaded file to server directory and remove the temp dir
  const finalPaperJarFile = path.resolve(serverDirectory, path.basename(paperJarFile));
  await fs.promises.rename(paperJarFile, finalPaperJarFile);
  await fs.promises.rm(downloadDirectory, { recursive: true, force: true });

  // Remove any other paper*.jar files
  await Promise.all(
    (await fs.promises.readdir(path.resolve(serverDirectory))).map(async file => {
      if (path.resolve(serverDirectory, file) === finalPaperJarFile) return;
      const ext = path.extname(file);
      if (ext !== '.jar') return;
      if (path.basename(file, ext).toLowerCase().startsWith('paper')) {
        await fs.promises.rm(path.resolve(serverDirectory, file));
      }
    }),
  );

  return finalPaperJarFile;
}
