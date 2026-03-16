const fs = require('fs');
const path = require('path');

const uiDir = path.join(process.cwd(), 'src', 'components', 'ui');

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

const allFiles = getFiles(uiDir);

allFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 1. Fix mangled React imports: import *; -> import * as React from "react";
    content = content.replace(/import \*;/g, 'import * as React from "react";');

    // 2. Fix mangled Radix imports: import *@radix-ui/react-X"; -> import * as XPrimitive from "@radix-ui/react-X";
    content = content.replace(/import \*(@radix-ui\/react-([\w-]+))"/g, (match, p1, p2) => {
        const name = p2.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
        return `import * as ${name}Primitive from "${p1}"`;
    });

    // 3. Fix cases where Primitive name is used but not defined (e.g. AccordionPrimitive)
    // Find pattern like "const Accordion = AccordionPrimitive.Root" and ensure AccordionPrimitive is imported
    const radixMatch = content.match(/const (\w+) = (\w+)Primitive\.Root/);
    if (radixMatch && !content.includes(`import * as ${radixMatch[2]}Primitive`)) {
        // This is tricky to fix automatically if the import.
    }

    // 4. Clean up leftover TypeScript artifacts that might have survived
    content = content.replace(/\.forwardRef<[\s\S]+?>\(/g, '.forwardRef(');
    content = content.replace(/(\}\s*):\s*[A-Z][\w<>"\[\]|& ]+(?=\s*\))/g, '$1');
    content = content.replace(/:\s*React\.(?:HTMLAttributes|ComponentProps)<[^>]+>/g, '');
    content = content.replace(/type VariantProps\s*,?/g, '');
    content = content.replace(/,\s*type VariantProps/g, '');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Cleaned: ${path.relative(uiDir, filePath)}`);
    }
});
