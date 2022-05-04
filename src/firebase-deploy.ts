import client from 'firebase-tools';
import path from 'path';
import admin, { firestore } from 'firebase-admin';

export async function firebaseDeploy(changes: { update: { hash: string; name: string }[]; deleted: string[] }) {
    const hashesSS = await admin.firestore().collection('firebase-functions-webpack').doc('hashes').get();
    const hashesData = hashesSS.data();
    const existingHashes: Record<string, { hash: string; last_deployed: firestore.Timestamp }> = hashesData
        ? hashesData.hashes
        : {};

    for (const file of changes.update) {
        const config = {
            project: process.env.FIREBASE_PROJECT_ID,
            cwd: path.resolve(__dirname, '..', 'demo', 'dist', file.name),
            only: 'functions',
            token: process.env.FIREBASE_TOKEN,
        };
        console.log(`Deploying ${file.name}`);
        // eslint-disable-next-line no-await-in-loop
        await client
            .deploy(config)
            .then(async () => {
                console.log(`Successfully deployed: ${file.name}`);
                existingHashes[file.name] = {
                    hash: file.hash,
                    last_deployed: firestore.Timestamp.now(),
                };
                await hashesSS.ref.set({ hashes: existingHashes });
            })
            .catch((e) => console.error(`Error deploying: ${file.name}`, e));
    }
}
