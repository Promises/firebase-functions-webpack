import * as admin from 'firebase-admin'
import { makeUppercase } from './makeUppercase';
import addmsg, { addMessageTwo } from './message';

if (admin.apps.length === 0) admin.initializeApp();

export { addMessageTwo };

export { makeUppercase, addmsg };
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        interface Global {
            __rootdir__: string;
        }
    }
}

// eslint-disable-next-line no-underscore-dangle
global.__rootdir__ = __dirname || process.cwd();
