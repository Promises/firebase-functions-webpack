import md5File from 'md5-file';
import path from 'path';
import { TypescriptParse } from './typescript-parse';
import { Packer } from './packer';

async function main() {
    const seperatedFunctions = TypescriptParse('./demo/src/index.ts');
    const createdFiles = await Packer(seperatedFunctions);

    Object.keys(createdFiles).forEach((name) =>
        console.log(name, md5File.sync(path.resolve(__dirname, '..', 'demo', 'dist', name, 'index.js')))
    );
}

main();
