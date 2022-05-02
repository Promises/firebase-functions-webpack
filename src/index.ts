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
import * as fs from 'fs';

const node = createSourceFile('x.ts', fs.readFileSync('./demo/src/index.ts', 'utf-8'), ScriptTarget.Latest);

//
// console.log(node)
//
// console.log(ts.SyntaxKind[node.kind])
// node.forEachChild(child => console.log(ts.SyntaxKind[child.kind]))

const getNamedDefinitions = (imports?: NamedImportBindings | NamedExportBindings) => {
    if (!imports) {
        return '';
    }
    if (!('elements' in imports)) {
        return '';
    }
    const importNames: string[] = imports.elements.map((e) => e.name.text);

    return importNames ? `{ ${importNames.join(', ')} }` : '';
};
const getDefaultDefinition = (i?: Identifier) => {
    return i ? i.text : '';
};

/**
 * <importname, from>
 */
const imports: Record<string, { from: string; default: boolean }> = {};

node.forEachChild((child) => {
    // console.log(SyntaxKind[child.kind]);
    if (SyntaxKind[child.kind] === 'ExportDeclaration') {
        const decl: ExportDeclaration = child as ExportDeclaration;
        let module: StringLiteral | undefined = decl.moduleSpecifier as StringLiteral | undefined;
        const defaultExport: Identifier | undefined = 'name' in decl.exportClause ? decl.exportClause.name : undefined;
        const namedExports: NamedExportBindings | undefined = decl.exportClause;

        const cleanedExport = defaultExport
            ? `* as ${getDefaultDefinition(defaultExport)}`
            : getNamedDefinitions(namedExports);

        if (defaultExport && module) {
            console.log(`export ${cleanedExport} from '${module?.text}';`);
            return;
        }

        if (namedExports && 'elements' in namedExports) {
            namedExports.elements.forEach((e) => console.log(e.name.text, module ? module.text : imports[e.name.text]));
            return;
        }
        console.error('unknown data', cleanedExport, module);
    } else if (SyntaxKind[child.kind] === 'ImportDeclaration') {
        const decl: ImportDeclaration = child as ImportDeclaration;
        const defaultImport: Identifier | undefined = decl.importClause.name;
        const namedImports: NamedImportBindings | undefined = decl.importClause.namedBindings;
        const module: StringLiteral = decl.moduleSpecifier as StringLiteral;

        if (defaultImport) {
            imports[defaultImport.text] = { from: module.text, default: true };
        }

        if (namedImports && 'elements' in namedImports) {
            namedImports.elements.forEach((e) => (imports[e.name.text] = { from: module.text, default: false }));
        }
        // if (false) {
        //     console.log(
        //         `import ${[getDefaultDefinition(defaultImport), getNamedDefinitions(namedImports)]
        //             .filter((a) => !!a)
        //             .join(', ')} from '${module.text}';`
        //     );
        // }
    } else {
        const printer = createPrinter({ newLine: NewLineKind.LineFeed });
        if (false) {
            console.log(printer.printNode(EmitHint.Unspecified, child, node));
        }
    }
});
