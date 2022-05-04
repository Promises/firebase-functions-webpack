import admin, { firestore } from 'firebase-admin';

export async function FirebaseCompare(
    hashes: Record<string, string>
): Promise<{ update: { hash: string; name: string }[]; deleted: string[] }> {
    const hashesSS = await admin.firestore().collection('firebase-functions-webpack').doc('hashes').get();
    const hashesData = hashesSS.data();
    const existingHashes: Record<string, { hash: string; last_deployed: firestore.Timestamp }> = hashesData
        ? hashesData.hashes
        : {};

    const toUpdate: { hash: string; name: string }[] = [];
    Object.entries(hashes).forEach(([name, hash]) => {
        const existingHash = existingHashes[name];
        if (existingHashes[name]) {
            delete existingHashes[name];
        }
        if (existingHash?.hash !== hash) {
            toUpdate.push({ name, hash });
        }
    });
    return { update: toUpdate, deleted: Object.keys(existingHashes) };
}
