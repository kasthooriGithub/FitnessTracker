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

    // 1. Fix mangled React imports: import *; -> import * as React from "react";
    content = content.replace(/import \*;/g, 'import * as React from "react";');

    // 2. Fix mangled Radix imports: import *@radix-ui/react-X"; -> import * as XPrimitive from "@radix-ui/react-X";
    content = content.replace(/import \*(@radix-ui\/react-([\w-]+))";/g, (match, p1, p2) => {
        const name = p2.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
        return `import * as ${name}Primitive from "${p1}";`;
    });

    // 3. Fix destructured prop typing: ({ ... }: Type) -> ({ ... })
    content = content.replace(/(\}\s*):\s*[A-Z]\w+(\s*\))/g, '$1$2');

    // 4. Fix mangled object typing: const name, Type> = -> const name =
    content = content.replace(/const\s+(\w+)\s*,\s*[\w<>"\[\]|& ]+>\s*=/g, 'const $1 =');

    // 5. Fix arrow function arg types: (val: type) =>
    content = content.replace(/\((\w+):\s*(?:string|number|boolean|any|void|object|unknown|never|React\.ReactNode|React\.ElementType)\)/g, '($1)');

    // 6. Fix specific sonner.jsx issues
    if (filePath.endsWith('sonner.jsx')) {
        content = content.replace(/import\s+\{\s*Toaster\s*,\s*toast\s*\}\s*from\s*"sonner";/, 'import { Toaster as Sonner, toast } from "sonner";');
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Surgery performed on: ${path.relative(srcDir, filePath)}`);
    }
});
