//
// import webpack from 'webpack';
// import path from 'path';
// import VirtualModulesPlugin from "webpack-virtual-modules";

import md5File from 'md5-file';
import { TypescriptParse } from './typescript-parse';
import { Packer } from './packer';
import path from 'path';

async function main() {
    const seperatedFunctions = TypescriptParse('./demo/src/index.ts');
    const createdFiles = await Packer(seperatedFunctions);

    // console.log(createdFiles);
    Object.keys(createdFiles).forEach((name) =>
        console.log(name, md5File.sync(path.resolve(__dirname, '..', 'demo', 'dist', name, 'index.js')))
    );
}

main();

//
// console.log(node)
//
// console.log(ts.SyntaxKind[node.kind])
// node.forEachChild(child => console.log(ts.SyntaxKind[child.kind]))

// console.log(contants.join('\n'));
//
//
// const virtualModules = new VirtualModulesPlugin({
//     [path.resolve(__dirname, '..', 'demo', 'src','index3.ts')]: printer.printNode(EmitHint.Unspecified, node, node),
//     [path.resolve(__dirname, '..', 'demo', 'src','index4.ts')]: printer.printNode(EmitHint.Unspecified, node, node)
// });
// console.log(printer.printNode(EmitHint.Unspecified, node, node));
//
// webpack(
//     {
//         mode: 'production',
//         context: path.resolve(__dirname, '..', 'demo'),
//         entry: { testOne: './src/index.ts', testThree: './src/index4.ts', testFour: './src/index3.ts' },
//         module: {
//             rules: [
//                 {
//                     test: /\.tsx?$/,
//                     use: 'ts-loader',
//                     exclude: /node_modules/,
//                 },
//             ],
//         },
//         plugins: [
//             virtualModules
//         ],
//         target: 'node',
//         resolve: {
//             extensions: ['.tsx', '.ts', '.js'],
//             modules: [path.resolve(__dirname, '..', 'demo', 'node_modules'), 'node_modules'],
//         },
//         output: {
//             filename: '[name]/index.js',
//             path: path.resolve(__dirname, '..', 'demo', 'dist'),
//         },
//     },
//     (err, stats) => {
//         // [Stats Object](#stats-object)
//         if (err || stats.hasErrors()) {
//             // [Handle errors here](#error-handling)
//             // console.log('ERROR', err, stats.compilation.errors);
//         }
//         // Done processing
//         // console.log('might be done?');
//     }
// );
