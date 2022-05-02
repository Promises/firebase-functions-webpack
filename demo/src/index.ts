import * as admin from 'firebase-admin'
import { makeUppercase } from './makeUppercase';
import msg from './message';

if (admin.apps.length === 0) admin.initializeApp();

export { makeUppercase };

export {addMessageTwo, addMessage} from './message';
export {msg};

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
