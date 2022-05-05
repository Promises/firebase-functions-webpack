import path from 'path';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import webpack from 'webpack';
import md5File from 'md5-file';

export async function Packer(
    content: { name: string; template: string }[],
    baseDir: string
): Promise<[string, string][]> {
    const functionHashes: [string, string][] = [];
    while (content.length > 0) {
        const modules: Record<string, string> = {};
        const entries: Record<string, string> = {};

        for (let i = 0; i <= 10; i++) {
            if (i >= 10 || content.length === 0) {
                break;
            }
            const func = content.pop();
            modules[path.resolve(baseDir, 'src', `func${func.name}.ts`)] = func.template;
            entries[func.name] = path.resolve(baseDir, 'src', `func${func.name}.ts`);
        }
        const virtualModules = new VirtualModulesPlugin(modules);
        // eslint-disable-next-line no-await-in-loop
        const createdFiles = await new Promise((resolve, reject) => {
            webpack(
                {
                    mode: 'production',
                    context: baseDir,
                    entry: entries,
                    module: {
                        rules: [
                            {
                                test: /\.tsx?$/,
                                loader: 'ts-loader',
                                options: { allowTsInNodeModules: true },
                            },
                        ],
                    },
                    plugins: [virtualModules],
                    target: 'node',
                    resolve: {
                        extensions: ['.tsx', '.ts', '.js'],
                        modules: ['node_modules/firebase-functions-webpack/node_modules', 'node_modules'],
                    },
                    output: {
                        filename: '[name]/index.js',
                        path: path.resolve(baseDir, 'dist'),
                    },
                    externals: {
                        sharp: 'commonjs sharp',
                    },
                },
                (err, stats) => {
                    // [Stats Object](#stats-object)
                    if (err || stats.hasErrors()) {
                        // [Handle errors here](#error-handling)
                        console.error(err || stats.compilation.errors);
                        return reject(err || stats.compilation.errors);
                    }
                    // Done processing
                    return resolve(entries);
                }
            );
        });

        Object.keys(createdFiles).forEach((name) =>
            functionHashes.push([name, md5File.sync(path.resolve(baseDir, 'dist', name, 'index.js'))])
        );
    }
    return functionHashes;
}
