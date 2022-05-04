#!/usr/bin/env node

import yargs from 'yargs';
import main from './index';

const options = yargs
    .usage('Usage: -d <name>')
    .option('d', { alias: 'dir', describe: 'Working Directory', type: 'string', demandOption: true })
    .option('p', {
        alias: 'publish',
        describe: 'Publish changes to firebase',
        type: 'boolean',
        boolean: true,
        default: false,
    }).argv;

if (!('d' in options)) {
    throw new Error('Args error');
}

main(options.d, options.p);
