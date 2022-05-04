import fs from 'fs';
import {
    createPrinter,
    createSourceFile,
    EmitHint,
    ExportDeclaration,
    Identifier,
    ImportDeclaration,
    NamedExportBindings,
    NamedImportBindings,
    NewLineKind,
    ScriptTarget,
    StringLiteral,
    SyntaxKind,
} from 'typescript';
import path from 'path';

export function TypescriptParse(inputFile: string, baseDir: string) {
    const node = createSourceFile(
        'x.ts',
        fs.readFileSync(path.resolve(baseDir, inputFile), 'utf-8'),
        ScriptTarget.Latest
    );

    /**
     * <importname, from>
     */
    const imports: Record<string, { from: string; default: boolean; as: boolean }> = {};
    const functions: { funcName: string; default: boolean; importDefault: boolean; from: string }[] = [];

    const constants: string[] = [];
    const printer = createPrinter({ newLine: NewLineKind.LineFeed });

    node.forEachChild((child) => {
        if (SyntaxKind[child.kind] === 'ExportDeclaration') {
            const decl: ExportDeclaration = child as ExportDeclaration;
            const module: StringLiteral | undefined = decl.moduleSpecifier as StringLiteral | undefined;
            const defaultExport: Identifier | undefined =
                'name' in decl.exportClause ? decl.exportClause.name : undefined;
            const namedExports: NamedExportBindings | undefined = decl.exportClause;

            if (defaultExport && module) {
                functions.push({
                    default: true,
                    importDefault: false,
                    from: module.text,
                    funcName: defaultExport.text,
                });
                return;
            }

            if (namedExports && 'elements' in namedExports) {
                namedExports.elements.forEach((e) => {
                    const m = module
                        ? { from: module.text, default: false }
                        : (() => {
                              const im = imports[e.name.text];
                              delete imports[e.name.text];
                              return im;
                          })();
                    functions.push({ default: false, importDefault: m.default, from: m.from, funcName: e.name.text });
                });
            }
        } else if (SyntaxKind[child.kind] === 'ImportDeclaration') {
            const decl: ImportDeclaration = child as ImportDeclaration;
            const defaultImport: Identifier | undefined = decl.importClause.name;
            const namedImports: NamedImportBindings | undefined = decl.importClause.namedBindings;
            const module: StringLiteral = decl.moduleSpecifier as StringLiteral;

            if (defaultImport) {
                imports[defaultImport.text] = { from: module.text, default: true, as: false };
                return;
            }

            if (namedImports && 'elements' in namedImports) {
                namedImports.elements.forEach(
                    (e) => (imports[e.name.text] = { from: module.text, default: false, as: false })
                );
                return;
            }
            if (module && 'name' in namedImports) {
                imports[namedImports.name.text] = { from: module.text, default: false, as: true };
            }
        } else {
            constants.push(printer.printNode(EmitHint.Unspecified, child, node));
        }
    });

    return functions.map((func) => {
        let lines = [...constants];
        const endl = lines.pop();
        if (func.importDefault) {
            lines = [`import * as ${func.funcName} from '${func.from}';`, ...lines];
        }
        lines = [
            ...Object.entries(imports).map(([key, v]) => {
                const imp: string[] = [];
                if (v.as) {
                    imp.push(`* as ${key}`);
                } else if (v.default) {
                    imp.push(key);
                } else {
                    imp.push(`{ ${key} }`);
                }

                return `import ${imp.join(', ')} from '${v.from}';`;
            }),
            ...lines,
        ];
        if (func.default) {
            lines.push(`export * as ${func.funcName} from '${func.from}';`);
        } else if (func) {
            lines.push(`export { ${func.funcName} }${!func.importDefault ? ` from '${func.from}'` : ''};`);
        }
        lines.push(endl);
        return { name: func.funcName, template: lines.join('\n') };
    });
}
