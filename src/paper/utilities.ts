import fs from 'node:fs';
import path from 'node:path';
import crypto, { createHash } from 'node:crypto';
import { PipelineSource, Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { ReadableStream as WebReadableStream } from 'node:stream/web';
import semver from 'semver';
import type { MainInstance } from '../main';

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

export class FetchError extends Error {
  constructor(response: Response) {
    super(`${response.status} :: ${response.statusText}`);
  }
}

export async function getPaperMCVersions(this: MainInstance) {
  const response = await fetch('https://api.papermc.io/v2/projects/paper');
  if (!response.ok) throw new FetchError(response);
  const { versions } = await response.json();
  return (versions as string[]).sort((a, b) => semver.coerce(b)?.compare(semver.coerce(a)!)!);
}

export async function getPaperBuildsForVersion(this: MainInstance, version: string) {
  const response = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}`);
  if (!response.ok) throw new FetchError(response);
  const { builds } = await response.json();
  return (builds as number[]).sort((a, b) => b - a);
}

export async function downloadPaperBuild(
  this: MainInstance,
  version: string,
  build: number | string,
  serverDirectory: string,
  destDir: string,
) {
  const response = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}`);
  if (!response.ok) throw new FetchError(response);
  const { downloads } = await response.json();
  if (!downloads?.application?.sha256 || !downloads?.application?.name)
    throw new Error(`No suitable Paper download found for [[version: ${version}]] [[build: ${build}]]`);

  const { name, sha256 } = downloads.application;
  const serverJarFile = path.resolve(serverDirectory, name);
  if (fs.existsSync(serverJarFile)) {
    this.log('Paper is already up-to-date.');
    const hash = createHash('sha256');
    const stream = fs.createReadStream(serverJarFile, { flags: 'r' });
    await pipeline(stream, hash);
    if (hash.digest('hex') === sha256) return serverJarFile;
  }

  this.log(`Downloading Paper: [[version: ${version}]] [[build: ${build}]]`);
  const downloadResponse = await fetch(
    `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/${name}`,
  );
  if (!downloadResponse.ok) throw new FetchError(downloadResponse);
  if (downloadResponse.headers.get('Content-Type') !== 'application/java-archive')
    throw new Error('Download file was not of correct content type!');
  if (downloadResponse.body === null) throw new Error('Download file did not contain a response body!');

  if (!fs.existsSync(destDir)) {
    await fs.promises.mkdir(destDir, { recursive: true });
  }
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
