import { createGzip } from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { createReadStream, createWriteStream } from 'fs';
const pipe = promisify(pipeline);

async function zipFile(input, output) {
  const gzip = createGzip();
  const source = createReadStream(input);
  const destination = createWriteStream(output);
  await pipe(source, gzip, destination);
}

zipFile('./public/data/openmoji.json', './public/data/openmoji.json.gz')
  .then(() => console.log('JSON-file compressed'))
  .catch((err) => {
    console.error('An error occurred:', err);
    process.exitCode = 1;
  });