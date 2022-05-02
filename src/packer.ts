import path from 'path';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import webpack from 'webpack';

export function Packer(content: { name: string; template: string }[]): Promise<Record<string, string>> {
    const modules: Record<string, string> = {};
    const entries: Record<string, string> = {};
    content.forEach((func) => {
        modules[path.resolve(__dirname, '..', 'demo', 'src', `func${func.name}.ts`)] = func.template;
        entries[func.name] = path.resolve(__dirname, '..', 'demo', 'src', `func${func.name}.ts`);
    });
    const virtualModules = new VirtualModulesPlugin(modules);
    return new Promise((resolve, reject) => {
        webpack(
            {
                mode: 'production',
                context: path.resolve(__dirname, '..', 'demo'),
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
                    modules: [path.resolve(__dirname, '..', 'demo', 'node_modules'), 'node_modules'],
                },
                output: {
                    filename: '[name]/index.js',
                    path: path.resolve(__dirname, '..', 'demo', 'dist'),
                },
            },
            (err, stats) => {
                // [Stats Object](#stats-object)
                if (err || stats.hasErrors()) {
                    // [Handle errors here](#error-handling)
                    return reject(err || stats.compilation.errors);
                }
                // Done processing
                return resolve(entries);
            }
        );
    });
}
