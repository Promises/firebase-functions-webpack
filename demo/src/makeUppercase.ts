import { FBFunction, functions } from './util';

export const makeUppercase = FBFunction.firestore.document('/messages/{documentId}').onCreate((snap, context) => {
    // Grab the current value of what was written to Firestore.
    const { original } = snap.data();

    // Access the parameter `{documentId}` with `context.params`
    functions.logger.log('Uppercasing the thingy', context.params.documentId, original);

    const uppercase = original.toUpperCase();

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    return snap.ref.set({ uppercase }, { merge: true });
});
