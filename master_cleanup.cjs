const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getFiles(filePath, fileList);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const allFiles = getFiles(srcDir);

allFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 1. Fix mangled React imports and Radix imports
    content = content.replace(/import \*;/g, 'import * as React from "react";');
    content = content.replace(/import \*(@radix-ui\/react-([\w-]+))";/g, (match, p1, p2) => {
        const name = p2.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
        return `import * as ${name}Primitive from "${p1}";`;
    });

    // 2. Remove interface definitions
    content = content.replace(/^export interface \w+[\s\S]*?\{[\s\S]*?\}\s*$/gm, '');
    content = content.replace(/^interface \w+[\s\S]*?\{[\s\S]*?\}\s*$/gm, '');

    // 3. Remove type definitions
    content = content.replace(/^export type \w+ = [\s\S]*?;/gm, '');
    content = content.replace(/^type \w+ = [\s\S]*?;/gm, '');

    // 4. Remove type imports
    content = content.replace(/import type \{[\s\S]*?\} from "[^"]+";\s*/g, '');
    content = content.replace(/,\s*type VariantProps/g, '');
    content = content.replace(/type VariantProps\s*,?/g, '');

    // 5. Remove prop types and variable types
    // Destructured props: ({ ... }: Type)
    content = content.replace(/(\}\s*):\s*[A-Z][\w<>"\[\]|& ]+(?=\s*\))/g, '$1');
    // Function args: (val: type)
    content = content.replace(/(\w+):\s*(?:string|number|boolean|any|void|object|unknown|never|React\.ReactNode|React\.ElementType|React\.FormEvent|React\.MouseEvent|React\.KeyboardEvent|React\.HTMLAttributes<[^>]+>|VariantProps<[^>]+>)(?=[,)])/g, '$1');
    // const/let typing
    content = content.replace(/const (\w+):\s*[A-Z][\w<>"\[\]|& ]+\s*=/g, 'const $1 =');
    content = content.replace(/let (\w+):\s*[A-Z][\w<>"\[\]|& ]+\s*=/g, 'let $1 =');

    // 6. Generic removals
    content = content.replace(/\.forwardRef<[\s\S]+?>\(/g, '.forwardRef(');
    content = content.replace(/useState<[^>]+>\(/g, 'useState(');
    content = content.replace(/useContext<[^>]+>\(/g, 'useContext(');
    content = content.replace(/useRef<[^>]+>\(/g, 'useRef(');
    content = content.replace(/createContext<[^>]+>\(/g, 'createContext(');

    // 7. Fix broken casts and complex types: const name, Type> =
    content = content.replace(/const\s+(\w+)\s*,\s*[\w<>"\[\]|& ]+>\s*=/g, 'const $1 =');
    content = content.replace(/,\s*"id">\s*\|\s*\w+/g, ''); // Specific for AddWorkoutDialog.jsx

    // 8. Remove 'as Type' and 'as const'
    content = content.replace(/\s+as\s+[A-Z][\w<>"\[\]|& ]+/g, '');
    content = content.replace(/\s+as\s+const/g, '');

    // 9. Fix potential import * issues from previous attempts
    content = content.replace(/import \* as LabelPrimitive from "@radix-ui\/react-label";/g, 'import * as LabelPrimitive from "@radix-ui/react-label";');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Master cleanup in: ${path.relative(srcDir, filePath)}`);
    }
});
