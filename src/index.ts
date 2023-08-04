import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PipelineSource, Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { ReadableStream as WebReadableStream } from 'node:stream/web';
import semver from 'semver';
import { Command, Flags } from '@oclif/core';
import inquirer from 'inquirer';

const sha256HashPipeline = async (source: PipelineSource<any>, destination: fs.WriteStream) => {
  const sha256Hash = crypto.createHash('sha256');
  const hashStream = new Transform({
    transform(chunk, encoding, callback) {
      sha256Hash.update(chunk, encoding);
      callback(undefined, chunk);
    },
  });
  await pipeline(source, hashStream, destination);
  return sha256Hash.digest('hex');
};

class FetchError extends Error {
  constructor(response: Response) {
    super(`${response.status} :: ${response.statusText}`);
  }
}

export default class Main extends Command {
  static description = 'Start minecraft server cli';

  static flags = {
    interactive: Flags.boolean({
      char: 'i',
      description: 'Run in interactive mode',
      default: true,
      allowNo: true,
    }),
    version: Flags.string({
      char: 'v',
      description: 'Minecraft Version',
      default: '1.20.1',
    }),
    paper: Flags.boolean({
      char: 'p',
      description: 'Using Paper',
      default: false,
      allowNo: false,
    }),
    build: Flags.string({
      char: 'b',
      description: 'Paper build to use',
      default: 'latest',
    }),
    downloadDirectory: Flags.directory({
      char: 'o',
      description: 'Directory to download updated server Java files',
      default: process.cwd(),
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Main);

    if (!flags.interactive) {
      this.log('Running in non-interactive mode...');
    }
    this.logJson(flags);
    if (flags.interactive && flags.paper && !flags.version) {
      const paperMcVersions = await this.getPaperMCVersions();
      const responses = await inquirer.prompt([
        {
          name: 'version',
          message: 'Select a Minecraft version',
          type: 'list',
          choices: paperMcVersions,
        },
      ]);
      flags.version = responses.version;
    }
    if (flags.paper && flags.build === 'latest') {
      const paperBuilds = await this.getPaperBuildsForVersion(flags.version);
      flags.build = paperBuilds[0].toString();
    }
    if (flags.paper) {
      const paperJarFile = await this.downloadPaperBuild(flags.version, flags.build, flags.downloadDirectory);
    }
  }

  async getPaperMCVersions() {
    const response = await fetch('https://api.papermc.io/v2/projects/paper');
    if (!response.ok) throw new FetchError(response);
    const { versions } = await response.json();
    return (versions as string[]).sort((a, b) => semver.coerce(b)?.compare(semver.coerce(a)!)!);
  }

  async getPaperBuildsForVersion(version: string) {
    const response = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}`);
    if (!response.ok) throw new FetchError(response);
    const { builds } = await response.json();
    return (builds as number[]).sort((a, b) => b - a);
  }

  async downloadPaperBuild(version: string, build: number | string, destDir: string) {
    const response = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}`);
    if (!response.ok) throw new FetchError(response);
    const { downloads } = await response.json();
    if (!downloads?.application?.sha256 || !downloads?.application?.name)
      throw new Error(`No suitable Paper download found for [[version: ${version}]] [[build: ${build}]]`);
    const { name, sha256 } = downloads.application;
    if (!fs.existsSync(path.resolve(destDir))) {
      await fs.promises.mkdir(path.resolve(destDir), { recursive: true });
    }
    const downloadResponse = await fetch(
      `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/${name}`,
    );
    if (!downloadResponse.ok) throw new FetchError(downloadResponse);
    if (downloadResponse.headers.get('Content-Type') !== 'application/java-archive')
      throw new Error('Download file was not of correct content type!');
    if (downloadResponse.body === null) throw new Error('Download file did not contain a response body!');
    const file = path.resolve(destDir, name);
    const stream = fs.createWriteStream(file, {
      flags: 'wx',
    });
    const hash = await sha256HashPipeline(Readable.fromWeb(downloadResponse.body as WebReadableStream<any>), stream);
    if (!hash === sha256) {
      fs.promises.rm(file, { force: true });
      throw new Error('Downloaded file did not match checksum!');
    }
    return file;
  }
}
