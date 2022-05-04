import 'dotenv/config';
import md5File from 'md5-file';
import path from 'path';
import admin from 'firebase-admin';
import { FirebaseCompare } from './firebase-compare';
import { TypescriptParse } from './typescript-parse';
import { Packer } from './packer';
import { firebaseDeploy } from './firebase-deploy';

admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(Buffer.from(process.env.SERVICE_ACCOUNT_KEY, 'base64').toString())),
    databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`,
    projectId: process.env.PROJECT_ID,
});

async function main(functions_dir: string, should_publish: boolean) {
    const FUNCTIONS_PATH: string = path.resolve('./', functions_dir);
    const seperatedFunctions = TypescriptParse('src/index.ts', FUNCTIONS_PATH);
    const createdFiles = await Packer(seperatedFunctions, FUNCTIONS_PATH);
    //
    const functionHashes: [string, string][] = Object.keys(createdFiles).map((name) => [
        name,
        md5File.sync(path.resolve(FUNCTIONS_PATH, 'dist', name, 'index.js')),
    ]);
    const changes = await FirebaseCompare(Object.fromEntries(functionHashes));
    if (should_publish) {
        await firebaseDeploy(changes);
    } else {
        console.log(JSON.stringify(changes));
    }
}

export default main;
