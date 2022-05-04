import path from 'path';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import webpack from 'webpack';

export function Packer(
    content: { name: string; template: string }[],
    baseDir: string
): Promise<Record<string, string>> {
    const modules: Record<string, string> = {};
    const entries: Record<string, string> = {};
    content.forEach((func) => {
        modules[path.resolve(baseDir, 'src', `func${func.name}.ts`)] = func.template;
        entries[func.name] = path.resolve(baseDir, 'src', `func${func.name}.ts`);
    });
    const virtualModules = new VirtualModulesPlugin(modules);
    return new Promise((resolve, reject) => {
        webpack(
            {
                mode: 'production',
                context: baseDir,
                entry: entries,
                module: {
                    rules: [
                        {
                            test: /\.tsx?$/,
                            use: 'ts-loader',
                            exclude: /node_modules/,
                        },
                    ],
                },
                plugins: [virtualModules],
                target: 'node',
                resolve: {
                    extensions: ['.tsx', '.ts', '.js'],
                    modules: [path.resolve(__dirname, '..', 'node_modules'), 'node_modules'],
                },
                output: {
                    filename: '[name]/index.js',
                    path: path.resolve(baseDir, 'dist'),
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
}
